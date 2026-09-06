import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Analyze Issue endpoint with Strict Photo Evidence Validation (Hard Gate)
app.post("/api/ai/analyze-issue", async (req, res) => {
  try {
    const { description, category, imageBase64, imageMimeType, title } = req.body;

    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        is_valid: false,
        confidence: 0,
        detected_issue: "missing_description",
        matches_category: false,
        matches_description: false,
        reason: "Please provide a detailed description of the civic issue.",
      });
    }

    const hasImage = Boolean(imageBase64 && typeof imageBase64 === "string" && imageBase64.trim().length > 0);

    if (!hasImage) {
      return res.status(400).json({
        is_valid: false,
        confidence: 0,
        detected_issue: "none",
        matches_category: false,
        matches_description: false,
        reason: "Photo evidence is required. Please attach a photo of the reported civic issue.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set.");
      return res.json({
        is_valid: false,
        confidence: 0,
        detected_issue: "unverified",
        matches_category: false,
        matches_description: false,
        reason: "Evidence could not be verified. Please try another photo.",
      });
    }

    const ai = getGeminiClient();

    // Prepare image inline data
    let imageInlineData: { mimeType: string; data: string } | null = null;

    if (imageBase64.startsWith("http://") || imageBase64.startsWith("https://")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const fetchRes = await fetch(imageBase64, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (fetchRes.ok) {
          const buffer = await fetchRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const mime = fetchRes.headers.get("content-type") || "image/jpeg";
          imageInlineData = {
            mimeType: mime.split(";")[0],
            data: base64,
          };
        }
      } catch (fetchErr) {
        console.warn("Failed to fetch image URL for evidence analysis:", fetchErr);
        return res.json({
          is_valid: false,
          confidence: 0,
          detected_issue: "unverified",
          matches_category: false,
          matches_description: false,
          reason: "Evidence could not be verified. Please try another photo.",
        });
      }
    } else {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      imageInlineData = {
        mimeType: imageMimeType || "image/jpeg",
        data: cleanBase64,
      };
    }

    if (!imageInlineData || !imageInlineData.data) {
      return res.json({
        is_valid: false,
        confidence: 0,
        detected_issue: "unverified",
        matches_category: false,
        matches_description: false,
        reason: "Evidence could not be verified. Please try another photo.",
      });
    }

    const promptText = `You are the strict Photo Evidence Validation AI for NagarSetu civic problem reporting platform in India.
Your critical task is to perform strict and intelligent evidence verification by comparing THREE things together:
1. Uploaded Photo (attached)
2. Selected Issue Category: "${category || "General"}"
3. Citizen's Written Description: "${description.trim()}"
Claimed Title: "${title || "Not specified"}"

### ABSOLUTE VERIFICATION RULES (HARD GATE):
The evidence validation is a HARD SUBMISSION GATE. You must reject any report where the image does not provide genuine visual evidence supporting the specific claim.

1. ACCEPT / VALID (is_valid: true):
- The photo clearly provides visual evidence supporting the specific civic problem claimed in both the category and description.
  * Example: Category = "Damaged Roads & Potholes", Description = "There is a large pothole on the road.", Photo = clearly shows a pothole or asphalt crater on a road.
  * Example: Category = "Broken Streetlights", Description = "Streetlight outside park is broken", Photo = shows broken streetlight, damaged pole, or dark broken fixture.
  * Example: Category = "Garbage Accumulation", Description = "Rotting trash pile dumped on street", Photo = shows garbage/trash pile.
  * Example: Category = "Water Leakage", Description = "Pipeline burst leaking water", Photo = shows water pipe leak or flooding.
- Safeguard: Do NOT reject just because lighting is dim, photo is taken from an angle, or slightly blurred, as long as reasonable visual evidence of the claimed defect is present.
- Set is_valid = true, matches_category = true, matches_description = true, confidence (0.85-1.0), detected_issue to the specific defect, and reason describing the match.

2. REJECT / INVALID (is_valid: false):
You MUST strictly REJECT (is_valid: false) in all of these cases:
- UNRELATED / SPAM IMAGE: A selfie, portrait of a person, celebrity, animal, indoor room, food, vehicle without damage, meme, text, document, or random photo.
  * Set is_valid = false, matches_category = false, matches_description = false, detected_issue = "unrelated", reason = "The uploaded image does not show evidence of the reported civic issue. It appears to be an unrelated image."
- CIVIC CATEGORY MISMATCH: The photo shows a completely different civic issue than what was claimed.
  * Example: Photo shows garbage pile, but category is "Damaged Roads & Potholes" and description claims a pothole.
  * Set is_valid = false, matches_category = false, matches_description = false, detected_issue = the actual issue seen (e.g. "garbage pile"), reason = "The uploaded image does not provide visual evidence of the reported pothole. It depicts garbage accumulation instead."
- ABSENCE OF CLAIMED DEFECT / NORMAL SCENE: A photo of a normal, undamaged road or street with NO visible pothole when claiming a pothole, or a normal working light when claiming a broken light.
  * Set is_valid = false, matches_category = false, matches_description = false, detected_issue = "normal road", reason = "The uploaded image shows a normal road with no visible pothole or defect matching your claim."
- UNRELATED OR NONSENSE DESCRIPTION: If the text is unrelated nonsense or contradicts the photo.

3. CIVIC TRIAGE & SEVERITY ASSESSMENT:
Also return:
- summary: One clear, concise single-sentence summary of the civic problem in English.
- severity: Strictly "Low", "Medium", or "High":
  * "High": Immediate safety hazard, arterial road crater, open manhole, high water flooding.
  * "Medium": Standard pothole, garbage dump, broken residential streetlight, pipeline leak.
  * "Low": Minor cosmetic issue, faded paint, small litter.
- severityReason: One short sentence explaining why this severity level was assigned.
- suggestedTitle: Concise title for the issue (4-7 words).

Return strictly valid JSON adhering to the schema.`;

    const parts = [
      { inlineData: imageInlineData },
      { text: promptText },
    ];

    // Try gemini-3.1-flash-lite first (fast and reliable for image multimodal verification),
    // fallback to gemini-3.8-flash if needed.
    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let rawText: string | null = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                is_valid: {
                  type: Type.BOOLEAN,
                  description: "Whether the photo reasonably provides visual evidence supporting the category and description claim.",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence score between 0.00 and 1.00 regarding the evidence verification decision.",
                },
                detected_issue: {
                  type: Type.STRING,
                  description: "The primary civic issue or object detected in the image (e.g. 'pothole', 'broken streetlight', 'garbage pile', 'unrelated', 'normal road').",
                },
                matches_category: {
                  type: Type.BOOLEAN,
                  description: "Whether the photo visually matches the selected issue category.",
                },
                matches_description: {
                  type: Type.BOOLEAN,
                  description: "Whether the photo visually provides evidence supporting the specific claim in the user's description.",
                },
                reason: {
                  type: Type.STRING,
                  description: "Clear explanation of whether the image provides visual evidence of the specific reported issue or why it was rejected.",
                },
                summary: {
                  type: Type.STRING,
                  description: "One clear, concise sentence summarizing the civic issue in English.",
                },
                severity: {
                  type: Type.STRING,
                  description: "Must be strictly 'Low', 'Medium', or 'High'.",
                },
                severityReason: {
                  type: Type.STRING,
                  description: "One short sentence explaining why this severity level was assigned.",
                },
                suggestedTitle: {
                  type: Type.STRING,
                  description: "Concise title for the issue (4-7 words).",
                },
              },
              required: [
                "is_valid",
                "confidence",
                "detected_issue",
                "matches_category",
                "matches_description",
                "reason",
                "summary",
                "severity",
                "severityReason",
              ],
            },
          },
        });

        if (response.text) {
          rawText = response.text;
          break;
        }
      } catch (mErr: any) {
        lastError = mErr;
        console.warn(`Model ${modelName} failed with:`, mErr?.message || mErr);
      }
    }

    if (!rawText) {
      console.error("All Gemini verification models failed or returned empty response:", lastError);
      return res.json({
        is_valid: false,
        confidence: 0,
        detected_issue: "unverified",
        matches_category: false,
        matches_description: false,
        reason: "Evidence could not be verified. Please try another photo.",
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON response:", parseErr);
      return res.json({
        is_valid: false,
        confidence: 0,
        detected_issue: "unverified",
        matches_category: false,
        matches_description: false,
        reason: "Evidence could not be verified. Please try another photo.",
      });
    }

    const isValid = Boolean(parsed.is_valid && parsed.matches_category && parsed.matches_description);
    const validSeverities = ["Low", "Medium", "High"];
    const severity = validSeverities.includes(parsed.severity) ? parsed.severity : "Medium";

    return res.json({
      is_valid: isValid,
      confidence: typeof parsed.confidence === "number" ? Number(parsed.confidence.toFixed(2)) : (isValid ? 0.95 : 0.99),
      detected_issue: parsed.detected_issue || (isValid ? "verified civic defect" : "unrelated"),
      matches_category: Boolean(parsed.matches_category),
      matches_description: Boolean(parsed.matches_description),
      reason: parsed.reason || (isValid
        ? "The image provides visual evidence supporting the reported civic issue."
        : "The uploaded image does not show evidence of the reported civic issue."),
      summary: parsed.summary || `${category || "Civic"} issue reported.`,
      severity,
      severityReason: parsed.severityReason || "Assessed based on municipal safety impact.",
      suggestedTitle: parsed.suggestedTitle,
    });
  } catch (err: any) {
    console.error("Strict Gemini analysis error:", err?.message || err);
    // SAFE REJECTION: Do NOT auto-accept on errors
    return res.json({
      is_valid: false,
      confidence: 0,
      detected_issue: "unverified",
      matches_category: false,
      matches_description: false,
      reason: "Evidence could not be verified. Please try another photo.",
    });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Community Connect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

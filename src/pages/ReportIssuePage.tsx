import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Loader2,
  Camera,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  FileText,
  Layers,
  Search,
  Eye,
  RefreshCw,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IssueCategory, Issue } from '../types';
import { uploadIssuePhoto, createIssue } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';

interface ReportIssuePageProps {
  onIssueCreated: (newIssue: Issue) => void;
}

const CATEGORIES: {
  id: IssueCategory;
  name: string;
  description: string;
  badge: string;
}[] = [
  {
    id: 'Damaged Roads & Potholes',
    name: 'Roads & Potholes',
    description: 'Crater potholes, broken asphalt, dangerous speed bumps, cave-ins',
    badge: 'Roadways Dept',
  },
  {
    id: 'Broken Streetlights',
    name: 'Streetlights & Poles',
    description: 'Dark corridors, flickering fixtures, exposed cables, damaged poles',
    badge: 'Electrical Dept',
  },
  {
    id: 'Garbage Accumulation',
    name: 'Garbage & Waste',
    description: 'Open waste piles, overflowing municipal bins, hazardous litter',
    badge: 'Sanitation Dept',
  },
  {
    id: 'Water Leakage',
    name: 'Water Supply Leakage',
    description: 'Burst pipelines, contaminated water seepage, leaking public valves',
    badge: 'Jal Board',
  },
  {
    id: 'Drainage & Sewage',
    name: 'Drainage & Sewage',
    description: 'Choked storm drains, open manholes, overflowing toxic sewage lines',
    badge: 'Drainage Dept',
  },
  {
    id: 'Public Safety / Other',
    name: 'Public Safety & Other',
    description: 'Fallen trees, encroachments, missing signage, civic infrastructure hazards',
    badge: 'Civil Works',
  },
];

const INDIAN_CITIES = [
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
];

const SAMPLE_PHOTOS = [
  {
    label: 'Pothole Road',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Water Pipeline',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Waste Garbage',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Broken Streetlight',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
  },
];

const STEPS = [
  { step: 1, label: 'Category', short: 'Category' },
  { step: 2, label: 'Evidence Photo', short: 'Photo' },
  { step: 3, label: 'Description', short: 'Details' },
  { step: 4, label: 'Location', short: 'Map Pin' },
  { step: 5, label: 'Verification', short: 'Verify' },
  { step: 6, label: 'Review & Submit', short: 'Submit' },
];

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onIssueCreated }) => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<IssueCategory>('Damaged Roads & Potholes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.2090,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingEvidence, setIsValidatingEvidence] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Evidence validation states
  const [validationRejection, setValidationRejection] = useState<{
    reason: string;
    confidence?: number;
    detected_issue?: string;
    matches_category?: boolean;
    matches_description?: boolean;
  } | null>(null);

  const [validatedEvidence, setValidatedEvidence] = useState<{
    confidence: number;
    detected_issue: string;
    reason: string;
  } | null>(null);

  const clearValidationState = () => {
    setValidationRejection(null);
    setValidatedEvidence(null);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
    clearValidationState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setPreviewUrl(sampleUrl);
    setSelectedFile(null);
    setErrorMessage(null);
    clearValidationState();
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          });
          setErrorMessage(null);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setErrorMessage('Could not fetch GPS coordinates. Please click on the map to set your location.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
    }
  };

  // AI Verification trigger
  const handleVerifyEvidence = async () => {
    if (!previewUrl) {
      setErrorMessage('Please attach a photo first.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a description first so the system can compare the photo against your claim.');
      return;
    }
    setIsValidatingEvidence(true);
    setErrorMessage(null);
    clearValidationState();

    try {
      const response = await fetch('/api/ai/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          imageBase64: previewUrl,
          imageMimeType: selectedFile?.type || 'image/jpeg',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.is_valid !== true) {
          const reason = data.reason || 'Evidence could not be verified. Please try another photo.';
          setValidationRejection({
            reason,
            confidence: data.confidence,
            detected_issue: data.detected_issue,
            matches_category: data.matches_category,
            matches_description: data.matches_description,
          });
          setErrorMessage(reason.includes('could not be verified') ? reason : "Evidence doesn't match your report.");
        } else {
          setValidatedEvidence({
            confidence: data.confidence,
            detected_issue: data.detected_issue,
            reason: data.reason,
          });
          if (!title.trim() && data.suggestedTitle) {
            setTitle(data.suggestedTitle);
          }
        }
      } else {
        setValidationRejection({
          reason: 'Evidence could not be verified. Please try another photo.',
          confidence: 0,
          detected_issue: 'unverified',
          matches_category: false,
          matches_description: false,
        });
        setErrorMessage('Evidence could not be verified. Please try another photo.');
      }
    } catch (err) {
      console.warn('Evidence verification check error:', err);
      setValidationRejection({
        reason: 'Evidence could not be verified. Please try another photo.',
        confidence: 0,
        detected_issue: 'unverified',
        matches_category: false,
        matches_description: false,
      });
      setErrorMessage('Evidence could not be verified. Please try another photo.');
    } finally {
      setIsValidatingEvidence(false);
    }
  };

  // Step validation before proceeding
  const canProceedFromCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return !!category;
      case 2:
        return !!previewUrl;
      case 3:
        return description.trim().length >= 5;
      case 4:
        return !!location.lat && !!location.lng;
      case 5:
        // On step 5, if rejected, cannot proceed to step 6 until replaced/fixed
        return !validationRejection;
      default:
        return true;
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 2 && !previewUrl) {
      setErrorMessage('Please attach a photo evidence to continue.');
      return;
    }
    if (currentStep === 3 && description.trim().length < 5) {
      setErrorMessage('Please enter at least a brief 1-sentence description of the problem.');
      return;
    }
    if (currentStep === 4) {
      // Moving to AI verification step: automatically run validation if not yet verified
      setCurrentStep(5);
      if (!validatedEvidence && !isValidatingEvidence) {
        handleVerifyEvidence();
      }
      return;
    }
    if (currentStep === 5 && validationRejection) {
      setErrorMessage("Evidence doesn't match your report. Please replace the photo or adjust description before proceeding.");
      return;
    }

    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(prev + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full final submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!previewUrl) {
      setErrorMessage('Photo evidence is required to report an issue. Please attach a photo.');
      setCurrentStep(2);
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please describe the problem.');
      setCurrentStep(3);
      return;
    }

    if (validationRejection) {
      setErrorMessage("Evidence doesn't match your report. Please replace the photo to submit.");
      setCurrentStep(5);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setValidationRejection(null);

    let uploadedImageUrl: string | null = previewUrl;
    let aiSummary: string | null = null;
    let aiSeverity: 'Low' | 'Medium' | 'High' | null = null;
    let aiSeverityReason: string | null = null;
    let aiEvidenceVerified = false;
    let aiDetectedIssue = 'none';

    try {
      // 1. HARD SUBMISSION GATE: Strict Photo Evidence Validation
      setSubmitStep('Verifying photo evidence against category & description...');
      let aiData: any = null;

      try {
        const response = await fetch('/api/ai/analyze-issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category,
            imageBase64: previewUrl,
            imageMimeType: selectedFile?.type || 'image/jpeg',
          }),
        });

        if (response.ok) {
          aiData = await response.json();
        } else {
          let errJson = null;
          try { errJson = await response.json(); } catch (_) {}
          aiData = errJson || {
            is_valid: false,
            reason: 'Evidence could not be verified. Please try another photo.',
          };
        }
      } catch (aiErr) {
        console.warn('AI validation network/server error:', aiErr);
        aiData = {
          is_valid: false,
          reason: 'Evidence could not be verified. Please try another photo.',
        };
      }

      // CRITICAL GATE: If Gemini returns is_valid = false
      if (!aiData || aiData.is_valid !== true) {
        setIsSubmitting(false);
        const rejectionReason =
          aiData?.reason || 'Evidence could not be verified. Please try another photo.';

        setValidationRejection({
          reason: rejectionReason,
          confidence: aiData?.confidence ?? 0,
          detected_issue: aiData?.detected_issue ?? 'unverified',
          matches_category: Boolean(aiData?.matches_category),
          matches_description: Boolean(aiData?.matches_description),
        });

        setErrorMessage(
          rejectionReason.includes('could not be verified')
            ? rejectionReason
            : "Evidence doesn't match your report."
        );
        setCurrentStep(5);
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }

      // If valid, set verified metadata
      aiSummary = aiData.summary || null;
      aiSeverity = aiData.severity || 'Medium';
      aiSeverityReason = aiData.severityReason || null;
      aiEvidenceVerified = true;
      aiDetectedIssue = aiData.detected_issue || category;
      setValidatedEvidence({
        confidence: aiData.confidence ?? 0.95,
        detected_issue: aiData.detected_issue || category,
        reason: aiData.reason || 'Evidence verified successfully.',
      });

      if (!title.trim() && aiData.suggestedTitle) {
        setTitle(aiData.suggestedTitle);
      }

      // 2. Upload Photo to storage if user provided an actual local file
      if (selectedFile) {
        setSubmitStep('Evidence verified! Uploading photo to storage...');
        try {
          uploadedImageUrl = await uploadIssuePhoto(selectedFile);
        } catch (uploadErr) {
          console.warn('Photo storage upload notice, using image data URL:', uploadErr);
          uploadedImageUrl = previewUrl;
        }
      }

      // 3. Save Issue to Database / Persistent Store
      setSubmitStep('Submitting civic report to database...');
      const finalTitle =
        title.trim() ||
        `${category} Problem reported at ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;

      const created = await createIssue(
        {
          title: finalTitle,
          description: description.trim(),
          category,
          latitude: location.lat,
          longitude: location.lng,
          image_url: uploadedImageUrl,
          ai_summary: aiSummary,
          ai_severity: aiSeverity,
          ai_severity_reason: aiSeverityReason,
          ai_evidence_verified: aiEvidenceVerified,
          ai_detected_issue: aiDetectedIssue,
          status: 'Reported',
        },
        profile
      );

      setSubmitStep('Complete! Redirecting to report details...');
      setTimeout(() => {
        onIssueCreated(created);
      }, 400);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      {/* Top Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Interactive 6-Step Guided Civic Filing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          File a Verified Civic Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Follow our guided flow to upload visual evidence, pin the exact hazard coordinates, and verify evidence before dispatching to municipal authorities.
        </p>
      </div>

      {/* Animated Multi-Step Progress Indicator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Bar */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
          {/* Active progress fill */}
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 -z-0"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />

          {STEPS.map((s) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <button
                key={s.step}
                onClick={() => {
                  // Allow clicking back to earlier steps
                  if (s.step <= currentStep) {
                    setCurrentStep(s.step);
                  }
                }}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all ${
                  s.step <= currentStep ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-4 ring-blue-500/20 scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-white" /> : s.step}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start justify-between gap-3 text-xs shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Guided Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-md">
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Category */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Step 1 of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  Select the Civic Issue Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose the category that accurately matches the municipal infrastructure defect.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        clearValidationState();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {cat.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {cat.description}
                      </p>

                      <div className="pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                          {cat.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Upload Evidence Photo */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Step 2 of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  Upload Photo Evidence
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Genuine photo evidence is required for hazard triage and municipal dispatch.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer overflow-hidden ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                    : previewUrl
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/40 dark:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                      <img
                        src={previewUrl}
                        alt="Evidence Preview"
                        className="w-full h-56 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          setSelectedFile(null);
                          clearValidationState();
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
                        <span>Photo Attached</span>
                        <span>Click to replace</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Drag &amp; drop evidence photo, or <span className="text-blue-600 underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        High resolution JPG, PNG, or WEBP supported (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Photo Presets for Quick Demo / Hackathon evaluation */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  Or Test with Verified Public Evidence Samples:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleSelectSample(sample.url)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-500 flex items-center gap-2 text-left transition-all cursor-pointer"
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {sample.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Describe Problem */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Step 3 of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  Describe the Civic Problem
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Be descriptive about the hazard. The system will cross-reference this text with your uploaded photo.
                </p>
              </div>

              {/* Title (Optional / Auto-fill) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Report Title (Optional)
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Auto-generated if left empty
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Deep pothole causing skidding near Metro Pillar 142"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Detailed Problem Description *
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {description.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearValidationState();
                  }}
                  placeholder="Describe the issue in detail (e.g. Large pothole spanning 1.5 meters across left lane, causing two-wheelers to swerve dangerously during evening rush hour)."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Citizen Identity Badge */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {(profile?.full_name || 'C').charAt(0)}
                  </div>
                  <span>Filing as <strong>{profile?.full_name || 'Anonymous Citizen'}</strong></span>
                </div>
                <span className="text-[10px] text-slate-400">No account required</span>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Choose Location */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Step 4 of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  Pin Geolocation on Map
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Click anywhere on the map or pick a city shortcut to set the exact coordinates.
                </p>
              </div>

              {/* Quick City Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick City Shortcuts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {INDIAN_CITIES.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => setLocation({ lat: city.lat, lng: city.lng })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {city.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Locate Me (GPS)</span>
                  </button>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
                <MapComponent
                  issues={[]}
                  center={[location.lat, location.lng]}
                  zoom={14}
                  isPickerMode={true}
                  pickerLocation={location}
                  onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                  className="h-72 w-full"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-mono z-10 border border-white/10 shadow-xs">
                  {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI Verification */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Step 5 of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  Evidence Verification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Our automated verification engine audits your photo against category &amp; description to eliminate spam and triage severity.
                </p>
              </div>

              {/* Processing Spinner State */}
              {isValidatingEvidence && (
                <div className="p-10 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center space-y-3">
                  <div className="relative w-12 h-12 mx-auto">
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                    <Sparkles className="w-5 h-5 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Analyzing Visual Evidence...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Checking pixel authenticity, comparing against &quot;{category}&quot;, and computing severity index.
                  </p>
                </div>
              )}

              {/* Verified Success Card */}
              {validatedEvidence && !isValidatingEvidence && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-400/60 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 space-y-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200 font-display">
                        ✓ Evidence Verified
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Visual features confirmed matching category and municipal standards.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Detected Hazard
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {validatedEvidence.detected_issue}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Verification Confidence
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round(validatedEvidence.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleVerifyEvidence}
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-run validation
                    </button>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      Ready to Submit →
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Rejection Error Card */}
              {validationRejection && !isValidatingEvidence && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 space-y-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-rose-900 dark:text-rose-100">
                        Evidence doesn't match your report.
                      </h3>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                        {validationRejection.reason}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-rose-200/80 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p><strong>What to do:</strong></p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Go back to Step 2 and upload a clearer photo of the actual civic issue.</li>
                      <li>Or select one of our verified public evidence samples.</li>
                      <li>Ensure your description in Step 3 accurately describes what is visible in the photo.</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Replace Photo in Step 2
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyEvidence}
                      className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer"
                    >
                      Retry Verification
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Trigger button if not yet run */}
              {!validatedEvidence && !validationRejection && !isValidatingEvidence && (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Ready to verify incident evidence
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click below to trigger instant validation of your photo and problem description.
                  </p>
                  <button
                    type="button"
                    onClick={handleVerifyEvidence}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
                  >
                    Verify Evidence Now
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 6: Review and Submit */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Step 6 of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  Review &amp; Submit Civic Report
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Double check your submission details before dispatching to the public city ledger.
                </p>
              </div>

              {/* Review Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Evidence"
                      className="w-full sm:w-36 h-28 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                        {category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Evidence Verified
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {title.trim() || `${category} Hazard`}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                  </span>
                  <span>Reporting as <strong>{profile?.full_name || 'Citizen'}</strong></span>
                </div>
              </div>

              {/* Submitting Progress Spinner */}
              {isSubmitting && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  <span>{submitStep || 'Submitting report to municipal registry...'}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Navigation Controls Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentStep === 1 || isSubmitting
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 6 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNextStep}
                disabled={!canProceedFromCurrentStep() || isValidatingEvidence}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  !canProceedFromCurrentStep() || isValidatingEvidence
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isSubmitting
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Verified Report</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

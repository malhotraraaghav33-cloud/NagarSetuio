export type UserRole = 'citizen' | 'authority';

export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved';

export type IssueSeverity = 'Low' | 'Medium' | 'High';

export type IssueCategory =
  | 'Damaged Roads & Potholes'
  | 'Broken Streetlights'
  | 'Garbage Accumulation'
  | 'Water Leakage'
  | 'Drainage & Sewage'
  | 'Public Safety / Other';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  email?: string;
}

export interface PhotoEvidenceValidationResult {
  is_valid: boolean;
  confidence: number;
  detected_issue: string;
  matches_category: boolean;
  matches_description: boolean;
  reason: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory | string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  ai_summary: string | null;
  ai_severity: IssueSeverity | null;
  ai_severity_reason: string | null;
  ai_evidence_verified?: boolean;
  ai_detected_issue?: string;
  status: IssueStatus;
  upvote_count: number;
  reporter_id: string;
  reporter_name?: string;
  created_at: string;
}

export interface Vote {
  id: string;
  issue_id: string;
  user_id: string;
  created_at: string;
}

export interface AIAnalysisResult {
  is_valid: boolean;
  confidence: number;
  detected_issue: string;
  matches_category: boolean;
  matches_description: boolean;
  reason: string;
  summary: string;
  severity: IssueSeverity;
  severityReason: string;
  suggestedTitle?: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: IssueCategory | string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  ai_summary: string | null;
  ai_severity: IssueSeverity | null;
  ai_severity_reason: string | null;
  ai_evidence_verified?: boolean;
  ai_detected_issue?: string;
  status?: IssueStatus;
}

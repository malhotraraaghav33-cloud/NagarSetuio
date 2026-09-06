import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Issue, Profile, Vote, IssueStatus } from '../types';
import { INITIAL_ISSUES } from './initialData';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-public-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// LOCAL PERSISTENT STORE (For Live Preview / Demo Mode)
// ==========================================
const LOCAL_STORAGE_ISSUES_KEY = 'community_connect_issues_v2';
const LOCAL_STORAGE_VOTES_KEY = 'community_connect_votes_v2';

function getLocalIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ISSUES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ISSUES_KEY, JSON.stringify(INITIAL_ISSUES));
      return INITIAL_ISSUES;
    }
    const parsed: Issue[] = JSON.parse(raw);
    // Explicitly purge any test issue containing "vyfyfyf" (case-insensitive)
    const filtered = parsed.filter((i) => {
      const title = (i.title || '').toLowerCase();
      const desc = (i.description || '').toLowerCase();
      const id = (i.id || '').toLowerCase();
      return !title.includes('vyfyfyf') && !desc.includes('vyfyfyf') && !id.includes('vyfyfyf');
    });
    if (filtered.length !== parsed.length) {
      saveLocalIssues(filtered);
    }
    return filtered;
  } catch {
    return INITIAL_ISSUES;
  }
}

function saveLocalIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ISSUES_KEY, JSON.stringify(issues));
  } catch (err) {
    console.error('Failed to save issues to localStorage:', err);
  }
}

function getLocalVotes(): Vote[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VOTES_KEY);
    if (!raw) {
      // Verified initial votes strictly matching INITIAL_ISSUES upvote_count
      const defaultVotes: Vote[] = [
        // iss-101 (2 votes)
        { id: 'v-101-1', issue_id: 'iss-101', user_id: 'user-demo-other-1', created_at: new Date().toISOString() },
        { id: 'v-101-2', issue_id: 'iss-101', user_id: 'user-demo-other-2', created_at: new Date().toISOString() },
        // iss-102 (3 votes)
        { id: 'v-102-1', issue_id: 'iss-102', user_id: 'user-demo-citizen', created_at: new Date().toISOString() },
        { id: 'v-102-2', issue_id: 'iss-102', user_id: 'user-demo-other-1', created_at: new Date().toISOString() },
        { id: 'v-102-3', issue_id: 'iss-102', user_id: 'user-demo-other-3', created_at: new Date().toISOString() },
        // iss-103 (1 vote)
        { id: 'v-103-1', issue_id: 'iss-103', user_id: 'user-demo-other-4', created_at: new Date().toISOString() },
        // iss-104 (2 votes)
        { id: 'v-104-1', issue_id: 'iss-104', user_id: 'user-demo-other-2', created_at: new Date().toISOString() },
        { id: 'v-104-2', issue_id: 'iss-104', user_id: 'user-demo-other-5', created_at: new Date().toISOString() },
        // iss-105 (4 votes)
        { id: 'v-105-1', issue_id: 'iss-105', user_id: 'user-demo-other-1', created_at: new Date().toISOString() },
        { id: 'v-105-2', issue_id: 'iss-105', user_id: 'user-demo-other-3', created_at: new Date().toISOString() },
        { id: 'v-105-3', issue_id: 'iss-105', user_id: 'user-demo-other-4', created_at: new Date().toISOString() },
        { id: 'v-105-4', issue_id: 'iss-105', user_id: 'user-demo-other-6', created_at: new Date().toISOString() },
        // iss-106 (2 votes)
        { id: 'v-106-1', issue_id: 'iss-106', user_id: 'user-demo-other-5', created_at: new Date().toISOString() },
        { id: 'v-106-2', issue_id: 'iss-106', user_id: 'user-demo-other-6', created_at: new Date().toISOString() },
      ];
      localStorage.setItem(LOCAL_STORAGE_VOTES_KEY, JSON.stringify(defaultVotes));
      return defaultVotes;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalVotes(votes: Vote[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_VOTES_KEY, JSON.stringify(votes));
  } catch (err) {
    console.error('Failed to save votes to localStorage:', err);
  }
}

// ==========================================
// UNIFIED DATA SERVICE APIS
// ==========================================

export async function fetchIssues(): Promise<Issue[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*, profiles:reporter_id(full_name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchIssues error, falling back to local store:', error.message);
        return getLocalIssues();
      }

      if (data && data.length > 0) {
        return data.map((item: any) => ({
          ...item,
          reporter_name: item.profiles?.full_name || 'Community Member',
        }));
      }
      return getLocalIssues();
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
      return getLocalIssues();
    }
  }

  return getLocalIssues();
}

export async function fetchIssueById(id: string): Promise<Issue | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*, profiles:reporter_id(full_name)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          ...data,
          reporter_name: data.profiles?.full_name || 'Community Member',
        };
      }
    } catch (e) {
      console.warn('Supabase fetchIssueById failed:', e);
    }
  }

  const issues = getLocalIssues();
  return issues.find((i) => i.id === id) || null;
}

export async function createIssue(
  issueData: Omit<Issue, 'id' | 'created_at' | 'upvote_count' | 'reporter_id'>,
  userProfile: Profile
): Promise<Issue> {
  // HARD SUBMISSION GATE: Evidence validation must be verified before database insertion
  if (!issueData.image_url) {
    throw new Error('Evidence validation failed: Photo evidence is strictly required to submit a report.');
  }

  if (issueData.ai_evidence_verified !== true) {
    throw new Error('Evidence validation failed: The report cannot be created because the photo did not pass evidence verification.');
  }

  const newIssue: Issue = {
    ...issueData,
    id: 'iss-' + Math.random().toString(36).substring(2, 9),
    upvote_count: 0,
    reporter_id: userProfile.id,
    reporter_name: userProfile.full_name,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          latitude: issueData.latitude,
          longitude: issueData.longitude,
          image_url: issueData.image_url,
          ai_summary: issueData.ai_summary,
          ai_severity: issueData.ai_severity,
          ai_severity_reason: issueData.ai_severity_reason,
          status: issueData.status || 'Reported',
          reporter_id: userProfile.id,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          ...data,
          reporter_name: userProfile.full_name,
        };
      } else if (error) {
        console.warn('Supabase createIssue error, writing to local store:', error.message);
      }
    } catch (e) {
      console.warn('Supabase createIssue failed, falling back:', e);
    }
  }

  // Fallback to local store
  const issues = getLocalIssues();
  const updated = [newIssue, ...issues];
  saveLocalIssues(updated);
  return newIssue;
}

export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  userProfile?: Profile | null
): Promise<boolean> {
  if (userProfile && userProfile.role !== 'authority') {
    throw new Error('Access denied: Only municipal authorities can update issue status.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (!error) {
        // Also sync local cache
        const issues = getLocalIssues();
        saveLocalIssues(
          issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
        );
        return true;
      }
      console.warn('Supabase update status error:', error.message);
    } catch (e) {
      console.warn('Supabase updateIssueStatus failed:', e);
    }
  }

  // Local store update
  const issues = getLocalIssues();
  const updated = issues.map((i) =>
    i.id === issueId ? { ...i, status: newStatus } : i
  );
  saveLocalIssues(updated);
  return true;
}

export async function getUserVotes(userId: string): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('issue_id')
        .eq('user_id', userId);

      if (!error && data) {
        return data.map((v: any) => v.issue_id);
      }
    } catch (e) {
      console.warn('Supabase getUserVotes failed:', e);
    }
  }

  const votes = getLocalVotes();
  return votes.filter((v) => v.user_id === userId).map((v) => v.issue_id);
}

export const getUserVotedIssueIds = getUserVotes;

export async function toggleVote(
  issueId: string,
  userId: string
): Promise<{ success: boolean; hasVoted: boolean; newCount: number }> {
  return toggleUpvote(issueId, { id: userId, full_name: '', role: 'citizen', created_at: '' });
}

export async function toggleUpvote(
  issueId: string,
  userProfile: Profile
): Promise<{ success: boolean; hasVoted: boolean; newCount: number }> {
  const userId = userProfile.id;

  if (isSupabaseConfigured && supabase) {
    try {
      // Check if voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('issue_id', issueId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingVote) {
        // Remove vote
        await supabase.from('votes').delete().eq('id', existingVote.id);
        const { data: updatedIssue } = await supabase
          .from('issues')
          .select('upvote_count')
          .eq('id', issueId)
          .single();
        return {
          success: true,
          hasVoted: false,
          newCount: updatedIssue?.upvote_count ?? 0,
        };
      } else {
        // Insert vote
        await supabase.from('votes').insert({ issue_id: issueId, user_id: userId });
        const { data: updatedIssue } = await supabase
          .from('issues')
          .select('upvote_count')
          .eq('id', issueId)
          .single();
        return {
          success: true,
          hasVoted: true,
          newCount: updatedIssue?.upvote_count ?? 1,
        };
      }
    } catch (e) {
      console.warn('Supabase toggleUpvote failed, using local store:', e);
    }
  }

  // Local fallback
  const votes = getLocalVotes();
  const issues = getLocalIssues();
  const existingVoteIndex = votes.findIndex(
    (v) => v.issue_id === issueId && v.user_id === userId
  );

  let hasVoted = false;
  let newVotes = [...votes];
  const targetIssue = issues.find((i) => i.id === issueId);
  let newCount = targetIssue ? targetIssue.upvote_count : 0;

  if (existingVoteIndex >= 0) {
    // Already voted -> remove vote
    newVotes.splice(existingVoteIndex, 1);
    newCount = Math.max(0, newCount - 1);
    hasVoted = false;
  } else {
    // Add vote
    newVotes.push({
      id: 'vote-' + Math.random().toString(36).substring(2, 9),
      issue_id: issueId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    newCount = newCount + 1;
    hasVoted = true;
  }

  saveLocalVotes(newVotes);
  saveLocalIssues(
    issues.map((i) => (i.id === issueId ? { ...i, upvote_count: newCount } : i))
  );

  return { success: true, hasVoted, newCount };
}

export async function uploadIssuePhoto(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('issue-photos').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload failed:', err);
    }
  }

  // Return base64 data URL as seamless fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

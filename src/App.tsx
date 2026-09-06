import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar, AppPage } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { IssueMapPage } from './pages/IssueMapPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { AuthorityDashboardPage } from './pages/AuthorityDashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SetupGuideModal } from './components/SetupGuideModal';
import { Issue, IssueStatus } from './types';
import {
  fetchIssues,
  toggleVote,
  getUserVotedIssueIds,
  updateIssueStatus,
} from './lib/supabase';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [userVotedIds, setUserVotedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Load issues
  const loadIssues = useCallback(async () => {
    try {
      const data = await fetchIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load votes for active user
  const loadUserVotes = useCallback(async () => {
    if (!profile) {
      setUserVotedIds([]);
      return;
    }
    try {
      const voted = await getUserVotedIssueIds(profile.id);
      setUserVotedIds(voted);
    } catch (err) {
      console.error('Failed to load votes:', err);
    }
  }, [profile]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    loadUserVotes();
  }, [loadUserVotes]);

  const handleNavigate = (page: AppPage, issueId?: string) => {
    if (issueId) {
      setSelectedIssueId(issueId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIssueCreated = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    setCurrentPage('details');
  };

  const handleToggleVote = async (issueId: string) => {
    const voterId = profile?.id || 'citizen-user-01';
    const isCurrentlyVoted = userVotedIds.includes(issueId);

    // Optimistic UI update
    setUserVotedIds((prev) =>
      isCurrentlyVoted ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              upvote_count: Math.max(0, i.upvote_count + (isCurrentlyVoted ? -1 : 1)),
            }
          : i
      )
    );

    try {
      await toggleVote(issueId, voterId);
    } catch (err: any) {
      console.error('Vote failed:', err);
      // Revert on failure
      loadIssues();
      loadUserVotes();
    }
  };

  const handleUpdateStatus = async (issueId: string, status: IssueStatus) => {
    // Optimistic UI update
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status } : i))
    );
    await updateIssueStatus(issueId, status);
  };

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSetup={() => setSetupModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Connecting to community network...</p>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                issues={issues}
                userVotedIds={userVotedIds}
                onNavigate={handleNavigate}
                onToggleVote={handleToggleVote}
              />
            )}

            {currentPage === 'report' && (
              <ReportIssuePage
                onIssueCreated={handleIssueCreated}
              />
            )}

            {currentPage === 'map' && (
              <IssueMapPage
                issues={issues}
                userVotedIds={userVotedIds}
                onNavigate={handleNavigate}
                onToggleVote={handleToggleVote}
              />
            )}

            {currentPage === 'details' && (
              <IssueDetailsPage
                issue={selectedIssue}
                userVotedIds={userVotedIds}
                onNavigate={handleNavigate}
                onToggleVote={handleToggleVote}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {currentPage === 'my-reports' && (
              <MyReportsPage
                issues={issues}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'authority' && (
              <AuthorityDashboardPage
                issues={issues}
                onNavigate={handleNavigate}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {currentPage === 'analytics' && (
              <AnalyticsPage issues={issues} onNavigate={handleNavigate} />
            )}
          </>
        )}
      </main>

      {/* Global Setup Guide Modal */}
      <SetupGuideModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-100">NagarSetu</span> &bull; Civic problem reporting platform for Indian citizens with Leaflet &amp; OpenStreetMap.
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              Civic Resolution Network &bull; Verified Public Records
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

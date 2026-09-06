import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  ThumbsUp,
  Sparkles,
  Calendar,
  User,
  ShieldCheck,
  Share2,
  Check,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  Activity,
  Flame,
  FileText,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue, IssueStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { MapComponent } from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';
import { AppPage } from '../components/Navbar';

interface IssueDetailsPageProps {
  issue: Issue | null;
  userVotedIds: string[];
  onNavigate: (page: AppPage, issueId?: string) => void;
  onToggleVote: (issueId: string) => void;
  onUpdateStatus: (issueId: string, status: IssueStatus) => Promise<void>;
}

export const IssueDetailsPage: React.FC<IssueDetailsPageProps> = ({
  issue,
  userVotedIds,
  onNavigate,
  onToggleVote,
  onUpdateStatus,
}) => {
  const { profile, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  if (!issue) {
    return (
      <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display">
          Civic Record Not Found
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
          The requested problem report does not exist or has been removed from the municipal registry.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Home Feed
        </button>
      </div>
    );
  }

  const isReporter = profile?.id === issue.reporter_id;
  const hasVoted = userVotedIds.includes(issue.id);
  const isAuthority = profile?.role === 'authority';
  const canUpvote = isAuthenticated && !isReporter && !hasVoted;

  // Dynamic Civic Impact Score
  const severityWeight = issue.ai_severity === 'High' ? 45 : issue.ai_severity === 'Medium' ? 25 : 10;
  const impactScore = Math.min(100, severityWeight + issue.upvote_count * 5 + (issue.ai_evidence_verified ? 15 : 0));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!isAuthority) return;
    setStatusLoading(true);
    try {
      await onUpdateStatus(issue.id, newStatus);
      setStatusSuccess(`Municipal dispatch updated status to ${newStatus}`);
      setTimeout(() => setStatusSuccess(null), 3000);
    } catch (err: any) {
      console.error(err.message || 'Failed to update status');
    }
    setStatusLoading(false);
  };

  const timelineSteps = [
    {
      id: 'reported',
      label: 'Reported',
      sub: 'Incident Logged',
      desc: 'Resident filed photographic evidence & coordinates',
    },
    {
      id: 'verified',
      label: 'Verified',
      sub: 'Diagnostic Triage',
      desc: 'Validated hazard severity, priority & evidence fidelity',
    },
    {
      id: 'assigned',
      label: 'Assigned',
      sub: 'Dept Dispatch',
      desc: 'Routed to Municipal Public Works command queue',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      sub: 'Field Execution',
      desc: 'Crew mobilized with active on-site telemetry',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      sub: 'Audited Closeout',
      desc: 'Repair validated & written to municipal ledger',
    },
  ];

  const currentStatusIndex =
    issue.status === 'Resolved'
      ? 4
      : issue.status === 'In Progress'
      ? 3
      : issue.ai_evidence_verified
      ? 1
      : 0;

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Link Copied!' : 'Share Case'}</span>
          </button>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-lg space-y-0">
        {/* High-Impact Hero Visual */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-950 overflow-hidden">
          {issue.image_url ? (
            <img
              src={issue.image_url}
              alt={issue.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-gradient-to-br from-slate-900 to-slate-950">
              <MapPin className="w-16 h-16 opacity-30 mb-2" />
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Civic Location Pinned
              </span>
            </div>
          )}

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-xs">
                {issue.category}
              </span>
              <StatusBadge status={issue.status} size="md" />
              {issue.ai_severity && (
                <SeverityBadge severity={issue.ai_severity} size="md" />
              )}
            </div>

            {issue.ai_evidence_verified && (
              <div className="px-3 py-1 rounded-xl bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evidence Verified</span>
              </div>
            )}
          </div>

          {/* Bottom Bar overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs pointer-events-none">
            <span className="font-mono bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {issue.latitude.toFixed(4)}° N, {issue.longitude.toFixed(4)}° E
            </span>
            <span className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-bold text-cyan-300">
              ID: {issue.id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Headline & Reporter Info */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-display leading-tight tracking-tight">
              {issue.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {(issue.reporter_name || 'C').charAt(0).toUpperCase()}
                </div>
                <span>
                  Reported by <strong>{issue.reporter_name || 'Citizen'}</strong>
                </span>
                {isReporter && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
                    You
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(issue.created_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline Visual Flow */}
          <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Municipal Resolution Progression</span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 font-mono">
                Stage {currentStatusIndex + 1} of 5
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 relative">
              {timelineSteps.map((step, idx) => {
                const isPassed = idx < currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-cyan-500 ring-2 ring-blue-500/20 dark:ring-cyan-500/20 shadow-md'
                        : isPassed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/80'
                        : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          0{idx + 1}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-xs animate-pulse'
                              : 'border border-slate-300 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {isPassed ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        {step.label}
                      </h4>
                      <p className="text-[10px] font-medium text-blue-600 dark:text-cyan-400 mt-0.5">
                        {step.sub}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Evidence Assessment & Civic Impact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* AI Diagnostics */}
            <div className="md:col-span-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent border border-blue-200/80 dark:border-blue-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Automated Triage Assessment</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Multimodal
                </span>
              </div>

              {issue.ai_summary && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Diagnostic Summary
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    &quot;{issue.ai_summary}&quot;
                  </p>
                </div>
              )}

              {issue.ai_severity && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Dispatch Priority
                    </span>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={issue.ai_severity} size="sm" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Level
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Evidence Verification
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>
                        {issue.ai_evidence_verified ? 'Verified Hazard' : 'Attached'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {issue.ai_severity_reason && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <strong>Assessment Logic:</strong> {issue.ai_severity_reason}
                </div>
              )}
            </div>

            {/* Civic Impact Score Card */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Civic Impact Score</span>
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-display">
                    {impactScore}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ 100 Index</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${impactScore}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Routine</span>
                  <span>Critical Action</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Derived from hazard severity ({issue.ai_severity || 'Normal'}), photo verification, and {issue.upvote_count} resident endorsements.
              </div>
            </div>
          </div>

          {/* Full Problem Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Resident Problem Report
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {issue.description}
            </p>
          </div>

          {/* Community Endorsement / Upvote Bar */}
          <div className="p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Community Priority Endorsements
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {issue.upvote_count} verified citizen {issue.upvote_count === 1 ? 'upvote' : 'upvotes'} logged on city ledger.
              </p>
            </div>

            <div>
              {isReporter ? (
                <div className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-not-allowed">
                  Cannot upvote own report
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onToggleVote(issue.id)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    hasVoted
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-white' : ''}`} />
                  <span>{hasVoted ? 'You Endorsed This Issue' : 'Upvote Issue Priority'}</span>
                  <span className="font-mono px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px]">
                    {issue.upvote_count}
                  </span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Municipal Authority Resolution Controls (Official Command) */}
          {isAuthority && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-sm text-white font-display">
                    Municipal Authority Resolution Controls
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Command Center
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                As an authorized municipal supervisor, update the status of this ticket. Citizens tracking this report receive immediate updates on the public ledger.
              </p>

              {statusSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-xl">
                  {statusSuccess}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {(['Reported', 'In Progress', 'Resolved'] as IssueStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={statusLoading || issue.status === st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      issue.status === st
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {issue.status === st ? `Active: ${st}` : `Dispatch: ${st}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Precise Geographic Location Map */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Exact Incident Coordinates on Indian Map</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {issue.latitude.toFixed(5)}° N, {issue.longitude.toFixed(5)}° E
              </span>
            </div>

            <MapComponent
              issues={[issue]}
              selectedIssueId={issue.id}
              center={[issue.latitude, issue.longitude]}
              zoom={15}
              className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  FileText,
  FilePlus,
  Calendar,
  ThumbsUp,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { AppPage } from '../components/Navbar';

interface MyReportsPageProps {
  issues: Issue[];
  onNavigate: (page: AppPage, issueId?: string) => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({ issues, onNavigate }) => {
  const { profile } = useAuth();

  const myIssues = issues.filter((i) => i.reporter_id === profile?.id);
  const resolvedCount = myIssues.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = myIssues.filter((i) => i.status === 'In Progress').length;
  const reportedCount = myIssues.filter((i) => i.status === 'Reported').length;

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                My Civic Reports
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Resolution timeline &amp; audit history for reports filed by {profile.full_name || 'Citizen'}
              </p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('report')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>Report New Problem</span>
        </motion.button>
      </div>

      {/* Mini Status Breakdown */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Under Review</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {reportedCount}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center justify-between">
            <span>In Field Repair</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {inProgressCount}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Verified Fixed</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Reports List */}
      {myIssues.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
            No Reports Filed Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven&apos;t reported any civic problems yet. Help improve your community by reporting broken streetlights, potholes, water leaks, or waste heaps.
          </p>
          <button
            onClick={() => onNavigate('report')}
            className="mt-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 cursor-pointer"
          >
            File Your First Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myIssues.map((issue, idx) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              onClick={() => onNavigate('details', issue.id)}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {issue.image_url ? (
                  <img
                    src={issue.image_url}
                    alt={issue.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      {issue.category}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                    {issue.ai_severity && (
                      <SeverityBadge severity={issue.ai_severity} size="sm" />
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-1 font-display">
                    {issue.title}
                  </h3>

                  {issue.ai_summary ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                      &quot;{issue.ai_summary}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {issue.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(issue.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <ThumbsUp className="w-3 h-3 text-blue-500" />
                      {issue.upvote_count} endorsements
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform self-end sm:self-center shrink-0">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

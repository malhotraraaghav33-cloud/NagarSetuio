import React from 'react';
import {
  MapPin,
  ThumbsUp,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Issue } from '../types';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';

interface IssueCardProps {
  issue: Issue;
  hasVoted: boolean;
  onNavigateToDetails: (id: string) => void;
  onToggleVote: (id: string) => void;
  index?: number;
  featured?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  hasVoted,
  onNavigateToDetails,
  onToggleVote,
  index = 0,
  featured = false,
}) => {
  const isHighSeverity = issue.ai_severity === 'High';
  const isResolved = issue.status === 'Resolved';
  const isInProgress = issue.status === 'In Progress';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900/90 border transition-all duration-300 shadow-xs hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-cyan-500/10 overflow-hidden ${
        isHighSeverity
          ? 'border-rose-500/30 dark:border-rose-500/40 ring-1 ring-rose-500/20'
          : isResolved
          ? 'border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-500/40'
      } ${featured ? 'md:col-span-2' : ''}`}
    >
      {/* Top Media Container */}
      <div className="relative overflow-hidden bg-slate-950 h-48 sm:h-52 w-full">
        {issue.image_url ? (
          <img
            src={issue.image_url}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-950">
            <MapPin className="w-10 h-10 mb-2 text-cyan-400 opacity-60 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">Spatial Node Pinned</span>
          </div>
        )}

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Floating Top Header Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={issue.status} size="sm" />
            {issue.ai_severity && <SeverityBadge severity={issue.ai_severity} size="sm" />}
          </div>

          {issue.ai_evidence_verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-500/40 shadow-xs">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Bottom Bar on Image (Category & Geo Coordinates) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md font-bold text-slate-200 border border-slate-700/60 shadow-xs truncate max-w-[170px]">
            {issue.category}
          </span>
          <span className="px-2 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-cyan-300 font-mono text-[10px] border border-cyan-500/30 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{issue.latitude.toFixed(2)}°, {issue.longitude.toFixed(2)}°</span>
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3
            onClick={() => onNavigateToDetails(issue.id)}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer leading-snug font-display"
          >
            {issue.title}
          </h3>

          {/* AI Summary Pill or Description */}
          {issue.ai_summary ? (
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-slate-950/70 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
              <p className="line-clamp-2 italic font-normal">{issue.ai_summary}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          )}
        </div>

        {/* Reporter, Verification Tag and Date Stamp */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              {(issue.reporter_name || 'C').charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-slate-600 dark:text-slate-300 font-medium">
              {issue.reporter_name || 'Citizen'}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
            <Calendar className="w-3 h-3 text-slate-400" />
            {new Date(issue.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {/* Animated Upvote Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVote(issue.id);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            hasVoted
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <motion.div
            animate={hasVoted ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
          </motion.div>
          <span>{issue.upvote_count}</span>
          <span className="font-normal text-[11px] hidden sm:inline">
            {hasVoted ? 'Endorsed' : 'Upvote'}
          </span>
        </motion.button>

        {/* View Details CTA */}
        <button
          onClick={() => onNavigateToDetails(issue.id)}
          className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <span>Inspect Record</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

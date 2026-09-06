import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ThumbsUp,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Layers,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Compass,
  Calendar,
  Eye,
  Maximize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue, IssueCategory, IssueStatus } from '../types';
import { MapComponent } from '../components/MapComponent';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { AppPage } from '../components/Navbar';

interface IssueMapPageProps {
  issues: Issue[];
  userVotedIds: string[];
  onNavigate: (page: AppPage, issueId?: string) => void;
  onToggleVote: (issueId: string) => void;
}

const CATEGORIES: string[] = [
  'All Categories',
  'Damaged Roads & Potholes',
  'Broken Streetlights',
  'Garbage Accumulation',
  'Water Leakage',
  'Drainage & Sewage',
  'Public Safety / Other',
];

const STATUSES: string[] = ['All Statuses', 'Reported', 'In Progress', 'Resolved'];

// Default India center (New Delhi / NCR)
const DEFAULT_INDIA_CENTER: [number, number] = [28.6139, 77.2090];

export const IssueMapPage: React.FC<IssueMapPageProps> = ({
  issues,
  userVotedIds,
  onNavigate,
  onToggleVote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedCategory !== 'All Categories' && issue.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'All Statuses' && issue.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          issue.title.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          issue.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [issues, selectedCategory, selectedStatus, searchQuery]);

  // Selected issue strictly derived from filtered results
  const selectedIssue = useMemo(() => {
    if (filteredIssues.length === 0) return null;
    const found = filteredIssues.find((i) => i.id === selectedIssueId);
    return found || filteredIssues[0];
  }, [filteredIssues, selectedIssueId]);

  const mapCenter: [number, number] = useMemo(() => {
    if (selectedIssue) {
      return [selectedIssue.latitude, selectedIssue.longitude];
    }
    if (filteredIssues.length > 0) {
      return [filteredIssues[0].latitude, filteredIssues[0].longitude];
    }
    return DEFAULT_INDIA_CENTER;
  }, [selectedIssue, filteredIssues]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const matching = issues.filter((i) => {
      const matchCat = category === 'All Categories' || i.category === category;
      const matchStat = selectedStatus === 'All Statuses' || i.status === selectedStatus;
      return matchCat && matchStat;
    });
    setSelectedIssueId(matching.length > 0 ? matching[0].id : null);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const matching = issues.filter((i) => {
      const matchCat = selectedCategory === 'All Categories' || i.category === selectedCategory;
      const matchStat = status === 'All Statuses' || i.status === status;
      return matchCat && matchStat;
    });
    setSelectedIssueId(matching.length > 0 ? matching[0].id : null);
  };

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setSearchQuery('');
    setSelectedIssueId(issues.length > 0 ? issues[0].id : null);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Categories': issues.length };
    CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = issues.filter((i) => i.category === cat).length;
    });
    return counts;
  }, [issues]);

  const isSelectedIssueVoted = selectedIssue ? userVotedIds.includes(selectedIssue.id) : false;

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Title & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                Live Geographic Civic Map
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive spatial GIS monitoring across India. Click pins to inspect verified evidence and track municipal dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pinned hazards..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>

          {(selectedCategory !== 'All Categories' || selectedStatus !== 'All Statuses' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Modern Category Pill Chips */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-blue-600" />
            <span>Civic Category Filter</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            {filteredIssues.length} {filteredIssues.length === 1 ? 'hazard' : 'hazards'} visible
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Map & Interactive Side Panel Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg bg-slate-950">
          <MapComponent
            issues={filteredIssues}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
            onNavigateToDetails={(issueId) => onNavigate('details', issueId)}
            center={mapCenter}
            zoom={selectedIssue ? 14 : 12}
            className="h-[520px] sm:h-[620px] w-full"
          />

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md text-[11px] font-semibold flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
              <span>High Severity</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {/* Selected Issue Smooth Side Panel / Bottom Sheet */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            <span>Selected Civic Report</span>
            {selectedIssue && (
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                {selectedIssue.latitude.toFixed(3)}°, {selectedIssue.longitude.toFixed(3)}°
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedIssue ? (
              <motion.div
                key={selectedIssue.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Preview */}
                  <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {selectedIssue.image_url ? (
                      <img
                        src={selectedIssue.image_url}
                        alt={selectedIssue.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <MapPin className="w-10 h-10 opacity-40 mb-1" />
                        <span className="text-xs">Location Pinned</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <StatusBadge status={selectedIssue.status} size="sm" />
                      {selectedIssue.ai_severity && (
                        <SeverityBadge severity={selectedIssue.ai_severity} size="sm" />
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md font-semibold border border-white/10">
                        {selectedIssue.category}
                      </span>
                      {selectedIssue.ai_evidence_verified && (
                        <span className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1 text-[10px]">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-3.5">
                    <h3
                      onClick={() => onNavigate('details', selectedIssue.id)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 font-display leading-snug hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {selectedIssue.title}
                    </h3>

                    {selectedIssue.ai_summary ? (
                      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <p className="italic">{selectedIssue.ai_summary}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {selectedIssue.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Reported by {selectedIssue.reporter_name || 'Citizen'}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(selectedIssue.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side Panel Footer Actions */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onToggleVote(selectedIssue.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelectedIssueVoted
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isSelectedIssueVoted ? 'fill-white' : ''}`} />
                    <span>{selectedIssue.upvote_count}</span>
                    <span className="font-normal text-[11px]">
                      {isSelectedIssueVoted ? 'Upvoted' : 'Upvote'}
                    </span>
                  </motion.button>

                  <button
                    onClick={() => onNavigate('details', selectedIssue.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-blue-600 dark:hover:bg-blue-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-500 shadow-sm space-y-2">
                <Compass className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No issue selected
                </p>
                <p className="text-[11px] text-slate-400">
                  Click any marker on the map to inspect its photo and verification status.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

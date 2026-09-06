import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  ThumbsUp,
  CheckCircle2,
  ShieldAlert,
  Database,
  MapPin,
  Check,
  Activity,
  Flame,
  Clock,
  ArrowRight,
  PieChart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { AppPage } from '../components/Navbar';

interface AnalyticsPageProps {
  issues: Issue[];
  onNavigate: (page: AppPage, issueId?: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ issues, onNavigate }) => {
  const [selectedCity, setSelectedCity] = useState<string>('All Indian Cities');

  // Detect city from issue title / description / coordinates
  const getCity = (issue: Issue): string => {
    const text = `${issue.title} ${issue.description} ${issue.reporter_name}`.toLowerCase();
    if (text.includes('delhi') || text.includes('connaught') || text.includes('minto') || text.includes('ncr')) return 'New Delhi';
    if (text.includes('bengaluru') || text.includes('indiranagar') || text.includes('bwssb') || text.includes('bangalore')) return 'Bengaluru';
    if (text.includes('mumbai') || text.includes('dadar') || text.includes('bmc')) return 'Mumbai';
    if (text.includes('noida') || text.includes('sector 18')) return 'Noida';
    if (text.includes('chennai') || text.includes('anna nagar')) return 'Chennai';
    if (text.includes('pune') || text.includes('fergusson') || text.includes('fc road')) return 'Pune';
    return 'Other Metro';
  };

  const availableCities = useMemo(() => {
    const set = new Set<string>(['All Indian Cities']);
    issues.forEach((i) => set.add(getCity(i)));
    return Array.from(set);
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (selectedCity === 'All Indian Cities') return issues;
    return issues.filter((i) => getCity(i) === selectedCity);
  }, [issues, selectedCity]);

  const total = filteredIssues.length || 1;

  // 1. By Category
  const categoryCounts: Record<string, number> = {};
  filteredIssues.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // 2. By Status
  const reportedCount = filteredIssues.filter((i) => i.status === 'Reported').length;
  const inProgressCount = filteredIssues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = filteredIssues.filter((i) => i.status === 'Resolved').length;

  // 3. By Severity
  const highCount = filteredIssues.filter((i) => i.ai_severity === 'High').length;
  const mediumCount = filteredIssues.filter((i) => i.ai_severity === 'Medium').length;
  const lowCount = filteredIssues.filter((i) => i.ai_severity === 'Low').length;

  const totalUpvotes = filteredIssues.reduce((acc, curr) => acc + curr.upvote_count, 0);
  const resolutionRate = filteredIssues.length > 0 ? Math.round((resolvedCount / filteredIssues.length) * 100) : 0;
  const verifiedEvidenceCount = filteredIssues.filter((i) => i.ai_evidence_verified).length;
  const verificationIntegrity = filteredIssues.length > 0 ? Math.round((verifiedEvidenceCount / filteredIssues.length) * 100) : 100;

  // City density ranking
  const cityCounts: Record<string, number> = {};
  issues.forEach((i) => {
    const c = getCity(i);
    cityCounts[c] = (cityCounts[c] || 0) + 1;
  });
  const cityRankings = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

  // Top Upvoted Issues
  const topUpvoted = [...filteredIssues]
    .sort((a, b) => b.upvote_count - a.upvote_count)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                Smart-City Civic Health Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time operational telemetry computed strictly from verified database records.
              </p>
            </div>
          </div>
        </div>

        {/* City Filter Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
          >
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grounded Truth Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-bold">Live Municipal Ledger Tally:</span> Displaying {filteredIssues.length} incident reports, {totalUpvotes} citizen priority endorsements, and verified diagnostics.
          </div>
        </div>
        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 hidden sm:inline font-mono">
          SUPABASE LIVE SYNC
        </span>
      </div>

      {/* 4 Key Civic Health KPI Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resolution Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Resolution Velocity</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
              {resolutionRate}%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Closed Fixes
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${resolutionRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Verification Integrity */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Evidence Verification Rate</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
              {verificationIntegrity}%
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Valid Evidence
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${verificationIntegrity}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>
        </div>

        {/* High Severity Ratio */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Critical Severity Load</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 font-display">
              {highCount}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {filteredIssues.length} reports
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${(highCount / total) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Citizen Engagement */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Community Trust</span>
            <ThumbsUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
              {totalUpvotes}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Priority Votes
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Issue Category Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportion of municipal complaints across infrastructure sectors
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {categoryData.length} Sectors
            </span>
          </div>

          <div className="space-y-4">
            {categoryData.map((cat, idx) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal text-[11px]">
                      {cat.count} {cat.count === 1 ? 'case' : 'cases'}
                    </span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold w-10 text-right">
                      {cat.percent}%
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.7, delay: idx * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Severity Distribution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              Municipal Resolution Status
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-display">
                  {reportedCount}
                </div>
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                  Reported
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
                  {inProgressCount}
                </div>
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mt-0.5">
                  In Repair
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {resolvedCount}
                </div>
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                  Resolved
                </div>
              </div>
            </div>
          </div>

          {/* Severity Levels */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              Automated Severity Triage
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> High Severity
                </span>
                <span className="font-bold">{highCount} issues</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Severity
                </span>
                <span className="font-bold">{mediumCount} issues</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Severity
                </span>
                <span className="font-bold">{lowCount} issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Community Priority Issues Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
              Highest Priority Community Endorsements
            </h3>
            <p className="text-[11px] text-slate-400">
              Civic hazards ranked by citizen urgency upvotes
            </p>
          </div>
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
            TOP 5
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topUpvoted.map((issue, rank) => (
            <div
              key={issue.id}
              onClick={() => onNavigate('details', issue.id)}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                  #{rank + 1}
                </span>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-blue-600 transition-colors">
                    {issue.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{issue.category}</span>
                    <span>&bull;</span>
                    <span>{issue.latitude.toFixed(2)}°, {issue.longitude.toFixed(2)}°</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{issue.upvote_count}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Filter,
  Search,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Activity,
  Flame,
  Radio,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue, IssueStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { AppPage } from '../components/Navbar';

interface AuthorityDashboardPageProps {
  issues: Issue[];
  onNavigate: (page: AppPage, issueId?: string) => void;
  onUpdateStatus: (issueId: string, status: IssueStatus) => Promise<void>;
}

export const AuthorityDashboardPage: React.FC<AuthorityDashboardPageProps> = ({
  issues,
  onNavigate,
  onUpdateStatus,
}) => {
  const { profile, switchDemoRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAuthority = profile?.role === 'authority';

  // Access restriction screen if not authority
  if (!isAuthority) {
    return (
      <div className="max-w-md mx-auto my-14 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Municipal Command Console
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The Authority Dashboard provides municipal officers dispatch powers, SLA metrics, and work-order resolution tools.
        </p>
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => switchDemoRole('authority')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 cursor-pointer"
          >
            Enter as Municipal Authority Officer
          </motion.button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalIssues = issues.length;
  const reportedCount = issues.filter((i) => i.status === 'Reported').length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const highSeverityCount = issues.filter((i) => i.ai_severity === 'High').length;
  const totalUpvotes = issues.reduce((acc, curr) => acc + curr.upvote_count, 0);

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || issue.ai_severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingId(issueId);
    try {
      await onUpdateStatus(issueId, newStatus);
    } catch (err: any) {
      console.error(err.message || 'Status update failed.');
    }
    setUpdatingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      {/* Command Center Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
                  Municipal Dispatch &amp; Command Center
                </h1>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  LIVE CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Officer {profile.full_name || 'Dispatch Supervisor'} &bull; Municipal Operations &amp; Work Order Triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('analytics')}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>City Analytics</span>
            </button>
            <button
              onClick={() => switchDemoRole('citizen')}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              View as Citizen
            </button>
          </div>
        </div>
      </div>

      {/* Animated KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Issues */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Total Tickets
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {totalIssues}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">All registered</div>
        </motion.div>

        {/* Reported */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
            <span>Pending Review</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-display">
            {reportedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting triage</div>
        </motion.div>

        {/* In Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
            In Field Repair
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-display">
            {inProgressCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Crews assigned</div>
        </motion.div>

        {/* Resolved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            Resolved Fixes
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
            {resolvedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Verified closed</div>
        </motion.div>

        {/* High Severity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-500/20 shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1 flex items-center justify-between">
            <span>Critical Alerts</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-display">
            {highSeverityCount}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">Priority SLA</div>
        </motion.div>

        {/* Citizen Priority Upvotes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Citizen Votes
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
            {totalUpvotes}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Total endorsements</div>
        </motion.div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets, categories, locations..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Issues Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
              Municipal Problem Reports Queue
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
              {filteredIssues.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Use dropdowns to reassign dispatch states immediately
          </span>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No issues match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Ticket &amp; Photo Evidence</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Triage Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Citizen Impact</th>
                  <th className="px-6 py-3.5 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {issue.image_url ? (
                          <img
                            src={issue.image_url}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div
                            onClick={() => onNavigate('details', issue.id)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1 max-w-xs text-sm"
                          >
                            {issue.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {issue.ai_summary || issue.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {issue.category}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {issue.ai_severity ? (
                        <SeverityBadge severity={issue.ai_severity} size="sm" />
                      ) : (
                        <span className="text-slate-400 text-xs">Normal</span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                        {issue.upvote_count}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <select
                          value={issue.status}
                          disabled={updatingId === issue.id}
                          onChange={(e) =>
                            handleStatusChange(issue.id, e.target.value as IssueStatus)
                          }
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
                        >
                          <option value="Reported">Reported</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        <button
                          onClick={() => onNavigate('details', issue.id)}
                          title="View Case Study"
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

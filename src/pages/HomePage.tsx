import React, { useState } from 'react';
import {
  FilePlus,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  ThumbsUp,
  Sparkles,
  Filter,
  ShieldCheck,
  Flame,
  Search,
  Eye,
  Activity,
  Layers,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Issue } from '../types';
import { IssueCard } from '../components/IssueCard';
import { AppPage } from '../components/Navbar';

interface HomePageProps {
  issues: Issue[];
  userVotedIds: string[];
  onNavigate: (page: AppPage, issueId?: string) => void;
  onToggleVote: (issueId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  issues,
  userVotedIds,
  onNavigate,
  onToggleVote,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'high-severity' | 'in-progress' | 'resolved'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const totalCount = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const highSeverityCount = issues.filter((i) => i.ai_severity === 'High').length;
  const aiVerifiedCount = issues.filter((i) => i.ai_evidence_verified).length;
  const totalVotes = issues.reduce((acc, curr) => acc + curr.upvote_count, 0);

  const filteredIssues = issues.filter((issue) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        issue.title.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeTab === 'high-severity') return issue.ai_severity === 'High';
    if (activeTab === 'in-progress') return issue.status === 'In Progress';
    if (activeTab === 'resolved') return issue.status === 'Resolved';
    return true; // 'recent'
  });

  const networkNodes = [
    {
      id: 'city',
      name: 'City Sensor Grid',
      desc: 'Geolocation & Indian GIS',
      icon: MapPin,
      badge: 'Spatial',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      id: 'citizen',
      name: 'Citizen Reports',
      desc: 'Verified photo evidence',
      icon: FilePlus,
      badge: 'Mobile First',
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    },
    {
      id: 'ai',
      name: 'Smart Evidence Gate',
      desc: 'Automated hazard triage',
      icon: Sparkles,
      badge: 'Core Engine',
      color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    },
    {
      id: 'authority',
      name: 'Municipal Dispatch',
      desc: 'Automated work orders',
      icon: ShieldAlert,
      badge: 'Routing',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      id: 'resolution',
      name: 'Verified Resolution',
      desc: 'Public audit trail',
      icon: CheckCircle2,
      badge: 'Immutable',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  // Floating sample issue for Hero visual
  const heroSample = issues[0] || {
    id: 'sample-01',
    title: 'Hazardous Road Pothole near MG Road Flyover',
    category: 'Damaged Roads & Potholes',
    status: 'In Progress',
    ai_severity: 'High',
    upvote_count: 34,
    latitude: 28.6139,
    longitude: 77.2090,
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800/80 shadow-2xl p-6 sm:p-10 lg:p-14 bg-grid-tech">
        {/* Futuristic Ambient Glow Backgrounds */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[550px] h-[550px] bg-gradient-to-br from-blue-600/25 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-32 w-[420px] h-[420px] bg-gradient-to-tr from-cyan-500/20 via-violet-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-mesh-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="tracking-wide">Next-Gen Civic Infrastructure OS</span>
              <span className="text-slate-500 font-normal">&bull;</span>
              <span className="text-cyan-300 font-mono text-[11px] font-bold">Bharat Telemetry</span>
            </motion.div>

            {/* Headline as requested: "Your City. Your Voice. Your Impact." */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display leading-[1.06]">
                Your City.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400">
                  Your Voice.
                </span>{' '}
                <br className="hidden sm:inline" />
                Your Impact.
              </h1>
            </motion.div>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal"
            >
              NagarSetu bridges citizens and municipal authorities with an authenticated civic ledger.
              Report potholes, dark corridors, sewage overflows, and broken water pipes—validated
              with precision GIS dispatch and transparent public resolution.
            </motion.p>

            {/* HERO CTA BUTTONS - REPORT AN ISSUE AS THE STRONGEST CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px -5px rgba(37,99,235,0.6)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('report')}
                className="group relative flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-blue-500/35 transition-all cursor-pointer border border-cyan-400/30"
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <FilePlus className="w-4 h-4 text-white" />
                </div>
                <span className="tracking-wide">Report an Issue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('map')}
                className="flex items-center gap-2.5 px-6 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-2xl text-sm border border-slate-700/80 backdrop-blur-md transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Explore Live Map</span>
              </motion.button>
            </motion.div>

            {/* Quick trust metrics */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Smart Evidence Gate</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">OpenStreetMap Spatial GIS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                <span className="text-slate-300">Transparent Civic Audit</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Civic Network Visual Matrix */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-slate-700/70 p-6 shadow-2xl backdrop-blur-xl overflow-hidden"
            >
              {/* Radar Scanner Overlay Simulation */}
              <div className="absolute -top-16 -right-16 w-56 h-56 border border-cyan-500/20 rounded-full animate-radar pointer-events-none">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/20 to-transparent" />
              </div>

              {/* Network Terminal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="font-mono uppercase tracking-wider text-[11px]">Live Civic Telemetry</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-700/50 text-blue-300 font-mono text-[10px]">
                  {issues.length} Active Nodes
                </span>
              </div>

              {/* Dynamic Network Composition Visual: City -> Citizen -> AI -> Authority -> Resolution */}
              <div className="my-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  <span>Network Pipeline</span>
                  <span className="text-cyan-400 font-mono">Real-Time</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                  {networkNodes.map((node, i) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.id}
                        className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center mb-1.5 ${node.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-white truncate max-w-full">
                          {node.name.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 mt-0.5">
                          0{i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Radar Mini-Map Preview */}
              <div
                onClick={() => onNavigate('map')}
                className="relative my-3 h-36 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer group"
              >
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px] opacity-25" />

                {/* Animated Simulated Nodes */}
                <div className="absolute top-1/4 left-1/3 flex flex-col items-center animate-bounce">
                  <div className="px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[8px] font-bold shadow-md backdrop-blur-xs">
                    NCR &bull; Pothole
                  </div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full border border-white shadow-xs" />
                </div>

                <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[8px] font-bold shadow-md backdrop-blur-xs">
                    Bengaluru &bull; Streetlight
                  </div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full border border-white shadow-xs" />
                </div>

                <div className="absolute top-1/2 right-1/3 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[8px] font-bold shadow-md backdrop-blur-xs">
                    Mumbai &bull; Resolved
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full border border-white shadow-xs" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3 justify-between">
                  <span className="text-[11px] text-cyan-300 font-semibold group-hover:underline flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Explore Geographic GIS</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Floating Featured Civic Ticket */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => onNavigate('details', heroSample.id)}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-800/60">
                    High Priority Incident
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {heroSample.upvote_count} Citizen Endorsements
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {heroSample.title}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-slate-300 truncate max-w-[180px]">{heroSample.category}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    Inspect <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LIVE CIVIC INTELLIGENCE TELEMETRY STATS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
              Live Civic Network Telemetry
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
            {aiVerifiedCount} Verified Evidence Records
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Issues */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Active Reports
              </span>
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <FilePlus className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
                {totalCount}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Logged
              </span>
            </div>
          </motion.div>

          {/* Verified Evidence Gate */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Verified Evidence Gate
              </span>
              <span className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
                {aiVerifiedCount}
              </span>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                Authentic
              </span>
            </div>
          </motion.div>

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Municipal Action
              </span>
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
                {inProgressCount}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                In Progress
              </span>
            </div>
          </motion.div>

          {/* Resolved Rate */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Resolved Fixed
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
                {resolvedCount}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% Closed
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SMART EVIDENCE GATE ARCHITECTURE CARD */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-950 text-white border border-slate-800/90 shadow-xl space-y-6 relative overflow-hidden bg-grid-tech">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-blue-500/10 via-violet-500/5 to-transparent blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Core Civic Verification Technology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display">
              Smart Evidence Gate
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Filtering spam, verifying true civic hazards with computer vision, and routing work orders directly to municipal departments.
          </p>
        </div>

        {/* Connected Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 relative z-10">
          {networkNodes.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {s.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Issues Feed Section */}
      <section className="space-y-6">
        {/* Header with Search and Category Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display tracking-tight">
                Live Community Feed
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold">
                {filteredIssues.length} Listed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time civic hazard reports submitted by verified students and citizens across India
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues, roads, cities..."
                className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs w-full sm:w-56 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'recent'
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Recent
              </button>
              <button
                onClick={() => setActiveTab('high-severity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'high-severity'
                    ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                High Severity
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'in-progress'
                    ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                In Progress
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'resolved'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Issue Cards Grid */}
        {filteredIssues.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-500 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              Looks quiet around here.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No civic issues match your current filter or search criteria. Be the first to file a problem in your neighbourhood!
            </p>
            <button
              onClick={() => onNavigate('report')}
              className="mt-3 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all cursor-pointer"
            >
              + Submit New Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue, idx) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                hasVoted={userVotedIds.includes(issue.id)}
                onNavigateToDetails={(id) => onNavigate('details', id)}
                onToggleVote={onToggleVote}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

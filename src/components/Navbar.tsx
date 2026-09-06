import React, { useState } from 'react';
import {
  MapPin,
  FilePlus,
  Compass,
  FileText,
  ShieldAlert,
  BarChart3,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export type AppPage = 'home' | 'report' | 'map' | 'details' | 'my-reports' | 'authority' | 'analytics';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage, issueId?: string) => void;
  onOpenSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { profile, switchDemoRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAuthority = profile?.role === 'authority';

  const navItems = [
    { id: 'home' as AppPage, label: 'Explore', icon: Compass },
    { id: 'map' as AppPage, label: 'Live Map', icon: MapPin },
    { id: 'my-reports' as AppPage, label: 'My Reports', icon: FileText },
    ...(isAuthority
      ? [{ id: 'authority' as AppPage, label: 'Authority Desk', icon: ShieldAlert, badge: 'Official' }]
      : []),
    { id: 'analytics' as AppPage, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand Identity */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all group-hover:scale-102">
                  <span>N</span>
                </div>
                {/* Micro beacon */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight font-display">
                    NagarSetu
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/70 dark:to-indigo-950/70 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                    <span>v2.5</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold tracking-wider uppercase">
                  Civic Resolution Network
                </p>
              </div>
            </div>

            {/* Desktop Navigation Items */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/80"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-blue-600 text-white rounded-md uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Primary Report CTA Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('report')}
                className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4 text-white" />
                <span>Report Issue</span>
              </motion.button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-2xs cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 -rotate-12 transition-transform" />
                )}
              </button>

              {/* Role Switcher Pill */}
              {profile && (
                <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs">
                  <button
                    onClick={() => switchDemoRole('citizen')}
                    title="Switch to Citizen View"
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      profile.role === 'citizen'
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    onClick={() => switchDemoRole('authority')}
                    title="Switch to Municipal Authority View"
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      profile.role === 'authority'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Authority
                  </button>
                </div>
              )}

              {/* Profile Menu Trigger */}
              {profile && (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {profile.full_name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{profile.full_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.email || 'Citizen Profile'}</p>
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                            <UserCheck className="w-3 h-3" />
                            <span>{profile.role === 'authority' ? 'Municipal Officer' : 'Active Citizen'}</span>
                          </div>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('my-reports');
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-blue-500" /> My Reports
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('authority');
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4 text-indigo-500" /> Authority Portal
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu & Theme Toggles */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => onNavigate('report')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                + Report
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Role Toggle in Mobile */}
              {profile && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Switch Mode</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {profile.role === 'authority' ? 'Authority View' : 'Citizen View'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole(profile.role === 'citizen' ? 'authority' : 'citizen');
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-xs"
                  >
                    Switch to {profile.role === 'citizen' ? 'Authority' : 'Citizen'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modern Compact Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            currentPage === 'home' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            currentPage === 'map' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span>Map</span>
        </button>

        {/* Center Floating Action Button for Report */}
        <button
          onClick={() => onNavigate('report')}
          className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/40 border-2 border-white dark:border-slate-950 transition-transform active:scale-95"
        >
          <FilePlus className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('my-reports')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            currentPage === 'my-reports' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => onNavigate(isAuthority ? 'authority' : 'analytics')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            currentPage === 'authority' || currentPage === 'analytics'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {isAuthority ? <ShieldAlert className="w-4 h-4 mb-0.5" /> : <BarChart3 className="w-4 h-4 mb-0.5" />}
          <span>{isAuthority ? 'Authority' : 'Analytics'}</span>
        </button>
      </div>
    </>
  );
};

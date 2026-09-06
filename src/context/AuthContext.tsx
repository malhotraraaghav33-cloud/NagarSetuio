import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  profile: Profile;
  user: { id: string; email?: string; full_name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => Promise<void>;
  updateProfileName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_PROFILE_KEY = 'nagarsetu_active_profile_v1';

const DEFAULT_CITIZEN_PROFILE: Profile = {
  id: 'citizen-user-01',
  full_name: 'Priya Sharma (Citizen)',
  email: 'citizen@nagarsetu.org',
  role: 'citizen',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load profile from storage:', e);
    }
    return DEFAULT_CITIZEN_PROFILE;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }, [profile]);

  // Direct role switcher between Citizen and Municipal Authority without any login/registration
  const switchDemoRole = async (newRole: UserRole) => {
    const isAuth = newRole === 'authority';
    const baseName = profile.full_name
      .replace(' (Municipal Officer)', '')
      .replace(' (Citizen)', '');

    const updated: Profile = {
      ...profile,
      role: newRole,
      full_name: isAuth ? `${baseName} (Municipal Officer)` : `${baseName} (Citizen)`,
    };

    setProfile(updated);
  };

  const updateProfileName = (name: string) => {
    if (!name.trim()) return;
    setProfile((prev) => ({
      ...prev,
      full_name: name.trim(),
    }));
  };

  // No-op stubs for compatibility
  const signIn = async () => ({ success: true });
  const signUp = async () => ({ success: true });
  const signOut = async () => {
    // Reset to default citizen role
    setProfile(DEFAULT_CITIZEN_PROFILE);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        user: { id: profile.id, email: profile.email, full_name: profile.full_name },
        isAuthenticated: true, // Always active, no sign in or register required
        isLoading,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

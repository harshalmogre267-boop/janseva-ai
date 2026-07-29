'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '@/lib/mock-data';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (phone: string) => void;
  updateProfile: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const activePhone = localStorage.getItem('janseva_active_phone');
      if (activePhone) {
        const storedProfile = localStorage.getItem(`janseva_profile_${activePhone}`);
        if (storedProfile) {
          return JSON.parse(storedProfile);
        }
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    }
    return null;
  });
  const [loading] = useState(false);

  const login = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    
    localStorage.setItem('janseva_active_phone', cleanPhone);

    const storedProfile = localStorage.getItem(`janseva_profile_${cleanPhone}`);
    if (storedProfile) {
      setUser(JSON.parse(storedProfile));
    } else {
      // Brand new user — create fresh empty profile
      const newProfile: UserProfile = {
        id: Math.random().toString(36).substring(2, 9),
        phone: formattedPhone,
        name: '',
        email: '',
        dateOfBirth: '1995-01-01',
        gender: 'male',
        category: 'general',
        state: '',
        district: '',
        annualIncome: 0,
        occupation: '',
        educationLevel: 'secondary',
        isDisabled: false,
        isMinority: false,
        isBpl: false,
        isFarmer: false,
        isStudent: false,
        preferredLanguage: 'en',
      };

      localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(newProfile));
      setUser(newProfile);
    }
  };

  const updateProfile = (profile: UserProfile) => {
    const cleanPhone = profile.phone.replace(/\D/g, '').slice(-10);
    localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('janseva_active_phone');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

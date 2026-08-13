'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/lib/mock-data';
import { auth, db, isConfigValid } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (phone: string) => void;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void> | void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and Sync Auth State
  useEffect(() => {
    // ── CASE A: FIREBASE IS CONFIGURED ──
    if (isConfigValid && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch profile data from Firestore
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setUser(docSnap.data() as UserProfile);
            } else {
              // Create default profile if not found in Firestore
              const cleanPhone = firebaseUser.phoneNumber 
                ? firebaseUser.phoneNumber.replace(/\D/g, '').slice(-10) 
                : '9999999999';
              const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
              
              const newProfile: UserProfile = {
                id: firebaseUser.uid,
                phone: formattedPhone,
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
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
              
              await setDoc(docRef, newProfile);
              setUser(newProfile);
            }
          } catch (err) {
            console.error('Error fetching user profile from Firestore:', err);
          }
        } else {
          // Check if there is a local phone-based fallback session active
          const activePhone = localStorage.getItem('janseva_active_phone');
          if (activePhone) {
            const storedProfile = localStorage.getItem(`janseva_profile_${activePhone}`);
            if (storedProfile) {
              setUser(JSON.parse(storedProfile));
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } 
    
    // ── CASE B: FALLBACK DEMO MODE (LOCALSTORAGE ONLY) ──
    try {
      const activePhone = localStorage.getItem('janseva_active_phone');
      if (activePhone) {
        const storedProfile = localStorage.getItem(`janseva_profile_${activePhone}`);
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        }
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    }
    setLoading(false);
  }, []);

  // OTP Mobile Sign-in (Unified for local storage, and optionally syncs to Firestore if connected)
  const login = async (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
    
    localStorage.setItem('janseva_active_phone', cleanPhone);

    // If Firebase is active, we can look up/store profiles in Firestore to persist online
    if (isConfigValid && db) {
      try {
        const docRef = doc(db, 'users', `phone_${cleanPhone}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(profile));
          setUser(profile);
          return;
        }
      } catch (err) {
        console.error('Firestore phone check error, using local storage fallback:', err);
      }
    }

    const storedProfile = localStorage.getItem(`janseva_profile_${cleanPhone}`);
    if (storedProfile) {
      setUser(JSON.parse(storedProfile));
    } else {
      const newProfile: UserProfile = {
        id: `phone_${cleanPhone}`,
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
      
      if (isConfigValid && db) {
        try {
          await setDoc(doc(db, 'users', `phone_${cleanPhone}`), newProfile);
        } catch (err) {
          console.error('Firestore save failed during phone sign up:', err);
        }
      }
      
      setUser(newProfile);
    }
  };

  // Register with Credentials (Email + Password)
  const register = async (name: string, email: string, password?: string) => {
    // ── CASE A: FIREBASE REGISTRATION ──
    if (isConfigValid && auth && db) {
      if (!password) {
        throw new Error('Password is required for registration.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const mockPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const formattedPhone = `+91 ${mockPhone.slice(0, 5)} ${mockPhone.slice(5)}`;

      const newProfile: UserProfile = {
        id: firebaseUser.uid,
        phone: formattedPhone,
        name: name,
        email: email,
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

      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
      setUser(newProfile);
      return;
    }

    // ── CASE B: FALLBACK LOCALSTORAGE REGISTRATION ──
    const mockPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const formattedPhone = `+91 ${mockPhone.slice(0, 5)} ${mockPhone.slice(5)}`;
    
    localStorage.setItem('janseva_active_phone', mockPhone);
    
    const newProfile: UserProfile = {
      id: `local_${mockPhone}`,
      phone: formattedPhone,
      name: name,
      email: email,
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
    
    localStorage.setItem(`janseva_profile_${mockPhone}`, JSON.stringify(newProfile));
    setUser(newProfile);
  };

  // Login with Credentials (Email + Password)
  const loginWithEmail = async (email: string, password?: string) => {
    // ── CASE A: FIREBASE SIGN IN ──
    if (isConfigValid && auth) {
      if (!password) {
        throw new Error('Password is required.');
      }
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }

    // ── CASE B: FALLBACK LOCALSTORAGE SIGN IN ──
    const defaultPhone = '9999999999';
    login(defaultPhone);
    
    const cleanPhone = defaultPhone.replace(/\D/g, '').slice(-10);
    const activeProfile = localStorage.getItem(`janseva_profile_${cleanPhone}`);
    if (activeProfile) {
      const parsed = JSON.parse(activeProfile);
      parsed.name = email.split('@')[0];
      parsed.email = email;
      localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(parsed));
      setUser(parsed);
    }
  };

  // Update Profile Data
  const updateProfile = async (profile: UserProfile) => {
    setUser(profile);

    // If it's a local storage user or in demo mode
    const cleanPhone = profile.phone.replace(/\D/g, '').slice(-10);
    localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(profile));

    // If Firebase is active, persist changes online
    if (isConfigValid && db) {
      try {
        await setDoc(doc(db, 'users', profile.id), profile);
      } catch (err) {
        console.error('Failed to sync profile update to Firestore:', err);
      }
    }
  };

  // Logout Session
  const logout = async () => {
    localStorage.removeItem('janseva_active_phone');
    
    // Clear Firebase session if active
    if (isConfigValid && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('Firebase sign out failed:', err);
      }
    }
    
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, register, updateProfile, logout }}>
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

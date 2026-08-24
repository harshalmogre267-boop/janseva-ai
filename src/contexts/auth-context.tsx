'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/lib/mock-data';
import { auth, db, isConfigValid } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (phone: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void> | void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_DEFAULTS = {
  dateOfBirth: '1995-01-01',
  gender: 'male' as const,
  category: 'general' as const,
  state: '',
  district: '',
  annualIncome: 0,
  occupation: '',
  educationLevel: 'secondary' as const,
  isDisabled: false,
  isMinority: false,
  isBpl: false,
  isFarmer: false,
  isStudent: false,
  preferredLanguage: 'en',
  bookmarks: [] as string[],
  reminders: [] as any[],
};

function buildProfile(
  data: Record<string, any>,
  overrides: Partial<UserProfile> = {}
): UserProfile {
  return {
    ...USER_DEFAULTS,
    ...data,
    ...overrides,
  } as UserProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const activeUser = localStorage.getItem('janseva_active_user');
        if (activeUser) return JSON.parse(activeUser);
      } catch (e) {
        console.error('Failed to load session from localStorage:', e);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('janseva_active_user');
    }
    return true;
  });

  // ─────────────────────────────────────────────────────────────────
  // AUTH STATE LISTENER (handles page refreshes and session restore)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigValid || !auth || !db) {
      // Demo mode: restore from localStorage
      try {
        const activePhone = localStorage.getItem('janseva_active_phone');
        if (activePhone) {
          const storedProfile = localStorage.getItem(`janseva_profile_${activePhone}`);
          if (storedProfile) setUser(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.error('Error loading session from localStorage:', e);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem('janseva_active_user');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        if (!db || !auth) {
          setLoading(false);
          return;
        }

        // Profiles are keyed by Firebase Auth UID to satisfy the Firestore
        // owner rule: request.auth.uid == userId.
        const docRef = doc(db, 'users', firebaseUser.uid);
        const activePhone = localStorage.getItem('janseva_active_phone');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const profile: UserProfile = buildProfile(data, {
            id: firebaseUser.uid,
            phone: data.phone || '',
            email: data.email || firebaseUser.email || '',
          });

          // Backfill missing fields
          const needsBackfill =
            !data.bookmarks ||
            !data.reminders ||
            data.name === undefined ||
            data.isFarmer === undefined;

          if (needsBackfill) {
            await setDoc(docRef, profile, { merge: true });
          }

          localStorage.setItem('janseva_active_user', JSON.stringify(profile));
          setUser(profile);
        } else {
          let newProfile: UserProfile;

          if (firebaseUser.isAnonymous) {
            // Phone user — create default profile
            const formattedPhone = activePhone
              ? `+91 ${activePhone.slice(0, 5)} ${activePhone.slice(5)}`
              : '';

            newProfile = {
              id: firebaseUser.uid,
              phone: formattedPhone,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              ...USER_DEFAULTS,
            };
          } else {
            // Email user without Firestore profile — create profile on login/restore session
            const mockPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const formattedPhone = `+91 ${mockPhone.slice(0, 5)} ${mockPhone.slice(5)}`;

            newProfile = {
              id: firebaseUser.uid,
              phone: formattedPhone,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              ...USER_DEFAULTS,
            };
          }

          await setDoc(docRef, newProfile);
          localStorage.setItem('janseva_active_user', JSON.stringify(newProfile));
          setUser(newProfile);
        }
      } catch (err) {
        console.error('Error fetching user profile from Firestore:', err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // OTP / PHONE SIGN-IN
  // ─────────────────────────────────────────────────────────────────
  const login = async (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;

    localStorage.setItem('janseva_active_phone', cleanPhone);

    if (isConfigValid && auth && db) {
      try {
        // signInAnonymously returns a user, so the UID is guaranteed here.
        const firebaseUser = auth.currentUser ?? (await signInAnonymously(auth)).user;
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        const profile: UserProfile = docSnap.exists()
          ? buildProfile(docSnap.data(), {
              id: firebaseUser.uid,
              phone: docSnap.data().phone || formattedPhone,
              email: docSnap.data().email || '',
            })
          : {
              id: firebaseUser.uid,
              phone: formattedPhone,
              name: '',
              email: '',
              ...USER_DEFAULTS,
            };

        await setDoc(docRef, profile, { merge: true });
        localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(profile));
        localStorage.setItem('janseva_active_user', JSON.stringify(profile));
        setUser(profile);
        return;
      } catch (err) {
        console.error('Firestore phone login failed, using local storage fallback:', err);
      }
    }

    const storedProfile = localStorage.getItem(`janseva_profile_${cleanPhone}`);
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      localStorage.setItem('janseva_active_user', JSON.stringify(profile));
      setUser(profile);
      return;
    }

    const newProfile: UserProfile = {
      id: `local_${cleanPhone}`,
      phone: formattedPhone,
      name: '',
      email: '',
      ...USER_DEFAULTS,
    };

    localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(newProfile));
    localStorage.setItem('janseva_active_user', JSON.stringify(newProfile));
    setUser(newProfile);
  };
  // EMAIL / PASSWORD REGISTRATION
  // ─────────────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    if (!isConfigValid || !auth || !db) {
      // Fallback: localStorage only
      const mockPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const formattedPhone = `+91 ${mockPhone.slice(0, 5)} ${mockPhone.slice(5)}`;

      const newProfile: UserProfile = {
        id: `local_${mockPhone}`,
        phone: formattedPhone,
        name,
        email,
        ...USER_DEFAULTS,
      };

      localStorage.setItem('janseva_active_phone', mockPhone);
      localStorage.setItem(`janseva_profile_${mockPhone}`, JSON.stringify(newProfile));
      localStorage.setItem('janseva_active_user', JSON.stringify(newProfile));
      setUser(newProfile);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const mockPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const formattedPhone = `+91 ${mockPhone.slice(0, 5)} ${mockPhone.slice(5)}`;

    const newProfile: UserProfile = {
      id: firebaseUser.uid,
      phone: formattedPhone,
      name,
      email,
      ...USER_DEFAULTS,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
    localStorage.setItem('janseva_active_user', JSON.stringify(newProfile));
    setUser(newProfile);
  };

  // ─────────────────────────────────────────────────────────────────
  // EMAIL / PASSWORD LOGIN  (with Firestore verification)
  // ─────────────────────────────────────────────────────────────────
  const loginWithEmail = async (email: string, password: string) => {
    if (!isConfigValid || !auth || !db) {
      throw new Error('Firebase is not configured.');
    }

    // Step 1: Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 2: Verify user profile exists in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let profile: UserProfile;

    if (!userDocSnap.exists()) {
      // Create user profile in Firestore if it doesn't exist upon login
      const mockPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const formattedPhone = `+91 ${mockPhone.slice(0, 5)} ${mockPhone.slice(5)}`;

      profile = {
        id: firebaseUser.uid,
        phone: formattedPhone,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || email,
        ...USER_DEFAULTS,
      };

      await setDoc(userDocRef, profile);
    } else {
      // Step 3: Load profile from Firestore
      const data = userDocSnap.data();
      profile = buildProfile(data, {
        id: firebaseUser.uid,
        phone: data.phone || '',
        email: data.email || firebaseUser.email || '',
      });

      // Step 4: Backfill any missing fields
      const needsBackfill =
        !data.bookmarks ||
        !data.reminders ||
        data.name === undefined ||
        data.isFarmer === undefined;

      if (needsBackfill) {
        await setDoc(userDocRef, profile, { merge: true });
      }
    }

    // Step 5: Set session
    localStorage.setItem('janseva_active_user', JSON.stringify(profile));
    setUser(profile);
  };

  // ─────────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ─────────────────────────────────────────────────────────────────
  const updateProfile = async (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('janseva_active_user', JSON.stringify(profile));

    const cleanPhone = profile.phone.replace(/\D/g, '').slice(-10);
    localStorage.setItem(`janseva_profile_${cleanPhone}`, JSON.stringify(profile));

    if (isConfigValid && db) {
      try {
        await setDoc(doc(db, 'users', profile.id), profile);
      } catch (err) {
        console.error('Failed to sync profile update to Firestore:', err);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    localStorage.removeItem('janseva_active_phone');
    localStorage.removeItem('janseva_active_user');

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

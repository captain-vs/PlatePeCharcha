'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword as fbUpdatePassword,
  deleteUser as fbDeleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserAccount, UserRole } from '@/types';

const SESSION_CACHE_KEY = 'platepecharcha_fb_user_cache';

// Only maps email -> role on initial database seed (NO passwords stored in frontend code!)
const STAFF_ROLE_MAP: Record<string, { role: UserRole; name: string }> = {
  'kitchen@canteen.edu': {
    role: 'KITCHEN_ADMIN',
    name: 'Kitchen Head Chef',
  },
  'admin@canteen.edu': {
    role: 'SUPER_ADMIN',
    name: 'Canteen Manager',
  },
};

export function getHomeRouteForRole(role: UserRole): string {
  if (role === 'CUSTOMER') return '/order';
  if (role === 'KITCHEN_ADMIN') return '/kitchen';
  return '/admin/menu';
}

export function useAuth() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    }

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!fbUser) {
        setUser(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(SESSION_CACHE_KEY);
        }
        setHydrated(true);
        return;
      }

      const userDocRef = doc(db, 'users', fbUser.uid);

      unsubscribeSnapshot = onSnapshot(
        userDocRef,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserAccount;
            setUser(data);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
            }
          } else {
            const lowerEmail = (fbUser.email || '').toLowerCase();
            const staffInfo = STAFF_ROLE_MAP[lowerEmail];
            const fallbackProfile: UserAccount = {
              id: fbUser.uid,
              name: staffInfo ? staffInfo.name : fbUser.displayName || 'Student',
              email: lowerEmail,
              password: '',
              role: staffInfo ? staffInfo.role : 'CUSTOMER',
              rollNumber: staffInfo ? 'STAFF-ID' : 'MCA-06',
              phone: staffInfo ? '+91 00000 00000' : '+91 98765 43210',
              dietaryPreference: 'Veg',
            };
            await setDoc(userDocRef, fallbackProfile);
            setUser(fallbackProfile);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(fallbackProfile));
            }
          }
          setHydrated(true);
        },
        () => {
          setHydrated(true);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Unified Login: Works for Customer, Kitchen KDS, and Canteen Manager automatically
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);

      let profile: UserAccount;
      if (snap.exists()) {
        profile = snap.data() as UserAccount;
      } else {
        const staffInfo = STAFF_ROLE_MAP[cleanEmail];
        profile = {
          id: uid,
          name: staffInfo ? staffInfo.name : cleanEmail.split('@')[0],
          email: cleanEmail,
          password: '',
          role: staffInfo ? staffInfo.role : 'CUSTOMER',
          rollNumber: staffInfo ? 'STAFF-ID' : 'MCA-06',
          phone: staffInfo ? '+91 00000 00000' : '+91 98765 43210',
          dietaryPreference: 'Veg',
        };
        await setDoc(userDocRef, profile);
      }

      setUser(profile);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(profile));
      }
      return { success: true, user: profile };
    } catch (err: any) {
      let msg = 'Invalid email or password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please Sign Up first.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Account temporarily locked for security.';
      }
      return { success: false, error: msg };
    }
  };

  // Sign Up: Strictly creates CUSTOMER accounts only
  const signup = async (
    name: string,
    email: string,
    password: string,
    rollNumber?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (STAFF_ROLE_MAP[cleanEmail]) {
      return {
        success: false,
        error: 'This email address is restricted and cannot be registered.',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newUser: UserAccount = {
        id: cred.user.uid,
        name: name.trim(),
        email: cleanEmail,
        password: '',
        role: 'CUSTOMER',
        rollNumber: rollNumber?.trim() || 'MCA-06',
        phone: phone?.trim() || '+91 98765 43210',
        dietaryPreference: 'Veg',
      };

      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      setUser(newUser);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(newUser));
      }

      return { success: true, user: newUser };
    } catch (err: any) {
      let msg = 'Could not create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (updates: {
    name: string;
    rollNumber?: string;
    phone?: string;
    dietaryPreference?: 'Veg' | 'Non-Veg' | 'Jain';
  }): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser || !user) {
      return { success: false, message: 'You must be logged in.' };
    }

    try {
      const updatedFields = {
        name: updates.name.trim() || user.name,
        rollNumber: updates.rollNumber?.trim() || user.rollNumber || 'MCA-06',
        phone: updates.phone?.trim() || user.phone || '',
        dietaryPreference: updates.dietaryPreference || user.dietaryPreference || 'Veg',
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedFields);
      return { success: true, message: 'Profile saved to Cloud Firestore!' };
    } catch {
      return { success: false, message: 'Failed to update profile in Firestore.' };
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const fbUser = auth.currentUser;
    if (!fbUser || !fbUser.email) {
      return { success: false, message: 'Not logged in.' };
    }
    if (newPassword.trim().length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters.',
      };
    }

    try {
      const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, credential);
      await fbUpdatePassword(fbUser, newPassword);
      return { success: true, message: 'Password updated successfully!' };
    } catch {
      return {
        success: false,
        message: 'Current password is incorrect or session expired.',
      };
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    const fbUser = auth.currentUser;
    if (!fbUser) return false;

    try {
      await deleteDoc(doc(db, 'users', fbUser.uid));
      await fbDeleteUser(fbUser);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
      }
      setUser(null);
      return true;
    } catch {
      alert('For security, please log out and log back in right before deleting your account.');
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    }
    setUser(null);
  };

  return {
    user,
    hydrated,
    login,
    signup,
    updateProfile,
    updatePassword,
    deleteAccount,
    logout,
  };
}
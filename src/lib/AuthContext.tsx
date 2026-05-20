import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { EcoUser, UserRole } from '../types';

interface AuthContextType {
  user: EcoUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<EcoUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser({ ...auth.currentUser });
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  useEffect(() => {
    let unsubscribeUser: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      if (fUser) {
        // First check if doc exists to determine if we need to create it
        const userDocRef = doc(db, 'users', fUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const preferredRole = (localStorage.getItem('preferred_role') as UserRole) || 'user';
          const newUser: EcoUser = {
            uid: fUser.uid,
            name: fUser.displayName || 'Eco Warrior',
            email: fUser.email || '',
            role: preferredRole,
            points: 0,
            createdAt: new Date().toISOString(),
            isProfileComplete: false,
          };
          await setDoc(userDocRef, newUser);
          localStorage.removeItem('preferred_role');
        }

        // Set up real-time listener for the user profile
        unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUser(doc.data() as EcoUser);
            setLoading(false);
          }
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const signOut = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut, refreshUser, sendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

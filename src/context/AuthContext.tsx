import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, logOut } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOutUser: async () => {},
  authError: null,
  clearAuthError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : 'unknown';
      console.error('Firebase authentication failed:', error);
      const messages: Record<string, string> = {
        'auth/unauthorized-domain': 'এই ওয়েবসাইটের domain Firebase Authentication-এ অনুমোদিত নয়। Firebase Console → Authentication → Settings → Authorized domains-এ domain যোগ করুন।',
        'auth/operation-not-allowed': 'Firebase Console-এ Google sign-in provider চালু করা নেই।',
        'auth/popup-blocked': 'ব্রাউজার sign-in popup আটকে দিয়েছে। Popup অনুমতি দিয়ে আবার চেষ্টা করুন।',
        'auth/popup-closed-by-user': 'Sign-in popup বন্ধ করা হয়েছে। আবার চেষ্টা করুন।',
        'auth/network-request-failed': 'নেটওয়ার্ক সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
        'auth/invalid-api-key': 'Firebase API key সঠিক নয়। Firebase configuration পরীক্ষা করুন।',
        'auth/invalid-oauth-client-id': 'Google OAuth client configuration সঠিক নয়।',
      };
      const detail = error instanceof Error ? error.message : String(error);
      const friendly = messages[code] || 'Google sign-in ব্যর্থ হয়েছে। Firebase Android configuration, SHA-1 এবং Google provider পরীক্ষা করুন।';
      setAuthError(friendly + ' [Code: ' + code + '] ' + detail);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOutUser: handleSignOut,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

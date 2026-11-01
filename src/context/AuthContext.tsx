import React, { createContext, useContext } from 'react';

/** Authentication is intentionally disabled. All personal data stays on this device. */
interface AuthContextType {
  user: null;
  loading: false;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => {},
  signOutUser: async () => {},
  authError: null,
  clearAuthError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <AuthContext.Provider value={{
  user: null, loading: false, signIn: async () => {}, signOutUser: async () => {}, authError: null, clearAuthError: () => {},
}}>{children}</AuthContext.Provider>;

export function useAuth() { return useContext(AuthContext); }

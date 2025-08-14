import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthState = {
  token: string | null;
  sessionId: string | null;
};

export type AuthContextType = AuthState & {
  isAuthenticated: boolean;
  setAuth: (state: Partial<AuthState>) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const SESSION_KEY = 'session_id';

function readInitialAuth(): AuthState {
  if (typeof window === 'undefined') return { token: null, sessionId: null };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const sessionId = localStorage.getItem(SESSION_KEY);
    return { token, sessionId };
  } catch {
    return { token: null, sessionId: null };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuthState] = useState<AuthState>(() => readInitialAuth());

  const setAuth = useCallback((state: Partial<AuthState>) => {
    setAuthState((prev) => {
      const next = { ...prev, ...state };
      try {
        if (state.token !== undefined) {
          if (state.token) localStorage.setItem(TOKEN_KEY, state.token);
          else localStorage.removeItem(TOKEN_KEY);
        }
        if (state.sessionId !== undefined) {
          if (state.sessionId) localStorage.setItem(SESSION_KEY, state.sessionId);
          else localStorage.removeItem(SESSION_KEY);
        }
      } catch {}
      return next;
    });
  }, []);

  const clearAuth = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setAuthState({ token: null, sessionId: null });
  }, []);

  // Keep state in sync if localStorage changes in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (e.key === TOKEN_KEY || e.key === SESSION_KEY) {
        setAuthState(readInitialAuth());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);


  const value = useMemo<AuthContextType>(() => ({
    token: auth.token,
    sessionId: auth.sessionId,
    isAuthenticated: !!auth.token,
    setAuth,
    clearAuth,
  }), [auth, setAuth, clearAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

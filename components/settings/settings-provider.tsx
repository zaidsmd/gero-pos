import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../../stores/settings-store';

// Context type mirrors the full Zustand store state returned by useSettingsStore()
type SettingsContextType = ReturnType<typeof useSettingsStore>;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Subscribe to the whole store for context consumers
  const fullState = useSettingsStore();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  // Fetch remote settings once on mount
  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  // Memoize to avoid unnecessary renders of context consumers
  const value = useMemo<SettingsContextType>(() => fullState, [fullState]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the type for our settings state
interface SettingsState {
  // Feature flags
  features: {
    ticketPrinting: boolean;
    autoTicketPrinting: boolean;
  };

  // Actions
  toggleFeature: (featureName: keyof SettingsState['features']) => void;
  setFeature: (featureName: keyof SettingsState['features'], value: boolean) => void;
}

// Create the settings store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      features: {
        ticketPrinting: true, // Default to enabled
        autoTicketPrinting: true, // Default to enabled
      },

      // Toggle a feature flag
      toggleFeature: (featureName) => 
        set((state) => ({
          features: {
            ...state.features,
            [featureName]: !state.features[featureName],
          }
        })),

      // Set a feature flag to a specific value
      setFeature: (featureName, value) => 
        set((state) => ({
          features: {
            ...state.features,
            [featureName]: value,
          }
        })),
    }),
    {
      name: 'gero-pos-settings', // Name for localStorage
    }
  )
);

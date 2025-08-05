import { create } from "zustand";
import { endpoints } from "../services/api";

interface ConnectionState {
  isOnline: boolean;
  isServerConnected: boolean;
  lastChecked: Date | null;
  errorMessage: string | null;
  showToast: boolean;

  // Methods
  setIsOnline: (isOnline: boolean) => void;
  setIsServerConnected: (isServerConnected: boolean) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  showConnectionToast: (message: string) => void;
  hideConnectionToast: () => void;
  checkConnection: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  isOnline: navigator.onLine, // Initial state based on browser's online status
  isServerConnected: true, // Assume server is connected initially
  lastChecked: null,
  errorMessage: null,
  showToast: false,

  setIsOnline: (isOnline) => set({ isOnline }),

  setIsServerConnected: (isServerConnected) => set({ isServerConnected }),

  setErrorMessage: (errorMessage) => set({ errorMessage }),

  showConnectionToast: (message) => set({ 
    showToast: true, 
    errorMessage: message 
  }),

  hideConnectionToast: () => set({ 
    showToast: false 
  }),

  checkConnection: async () => {
    const state = get();

    // First check if browser reports as online
    const isOnline = navigator.onLine;
    set({ isOnline });

    if (!isOnline) {
      set({ 
        isServerConnected: false,
        errorMessage: "Pas de connexion Internet",
        showToast: true,
        lastChecked: new Date()
      });
      return;
    }

    // Then try to ping the server using our API service
    try {
      const isServerConnected = await endpoints.system.healthCheck().then(() => true).catch(() => false);

      if (isServerConnected) {
        set({ 
          isServerConnected: true,
          errorMessage: null,
          showToast: false,
          lastChecked: new Date()
        });
      } else {
        set({ 
          isServerConnected: false,
          errorMessage: "Problème de connexion au serveur",
          showToast: true,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      set({ 
        isServerConnected: false,
        errorMessage: "Impossible de se connecter au serveur",
        showToast: true,
        lastChecked: new Date()
      });
    }
  }
}));

// Set up event listeners for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const store = useConnectionStore.getState();
    store.setIsOnline(true);
    store.checkConnection();
  });

  window.addEventListener('offline', () => {
    const store = useConnectionStore.getState();
    store.setIsOnline(false);
    store.showConnectionToast("Pas de connexion Internet");
  });
}

import { create } from 'zustand';
import { endpoints } from '../services/api';

// Define the types for our store
export interface DepenseCategory {
  value: number;
  label: string;
}

export interface DepenseData {
  beneficiaire: string;
  category_id: number;
  description?: string;
  montant: number;
  nom: string;
}

interface DepenseState {
  categories: DepenseCategory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createDepense: (data: DepenseData) => Promise<any>;
}

// Helper for handling async operations
const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  set: (state: Partial<DepenseState>) => void,
  errorMessage: string
): Promise<T> => {
  set({ isLoading: true, error: null });
  try {
    const result = await operation();
    return result;
  } catch (error) {
    set({ error: errorMessage, isLoading: false });
    throw error;
  }
};

// Create the store
export const useDepenseStore = create<DepenseState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    await handleAsyncOperation(async () => {
      const response = await endpoints.depenses.getCategories();
      set({
        categories: response.data,
        isLoading: false
      });
    }, set, 'Failed to fetch depense categories');
  },

  createDepense: async (data: DepenseData) => {
    return await handleAsyncOperation(async () => {
      const response = await endpoints.depenses.create(data);
      set({ isLoading: false });
      return response;
    }, set, 'Failed to create depense');
  }
}));
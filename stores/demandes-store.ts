import { create } from "zustand";
import { endpoints } from '../services/api';

// Product type from POS store
export interface Product {
  id: string;
  designation: string;
  prix: number;
  quantity: number;
  reference: string;
  image?: string;
  tax: number;
  unit: string;
}

// Pagination metadata interface
interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  nextPageUrl: string | null;
}

// Cart item for demande creation
interface DemandeCartItem {
  product: Product;
  quantity: number;
  quantite_actuelle: number;
}

// Demande row interface
export interface DemandeRow {
  id: number;
  article: string;
  quantite_demande: number;
  quantite_livre: number;
  quantite_stock: number;
  article_reference: string;
}

// Demande interface
export interface Demande {
  id: number;
  reference: string;
  lignes: DemandeRow[];
  statut: string;
  magasin_entree: string;
  magasin_sortie: string;
}

// Data for creating a demande row
interface DemandeRowData {
  id: string;
  quantity: number;
}

// Data for creating a demande
export interface DemandeData {
  lignes: DemandeRowData[];
  magasin_sortie: { value: string };
}

// State interface for the demandes store
interface DemandesState {
  // State
  isLoading: boolean;
  error: string | null;
  demandesIntern: Demande[];
  demandesExtern: Demande[];
  products: Product[];
  demandeCart: DemandeCartItem[];
  pagination: PaginationMeta;
  isLoadingMore: boolean;
  showCreateModal: boolean;
  fetching: boolean;

  // Demande operations
  fetchDemandesIntern: () => Promise<void>;
  fetchDemandesExtern: () => Promise<void>;
  createDemande: (data: DemandeData) => Promise<any>;
  cancelDemande: (id: number) => Promise<any>;
  acceptDemande: (id: number) => Promise<any>;
  printDemande: (id: number) => Promise<any>;
  livrerDemande: (id: number, data: Demande) => Promise<any>;
  
  // Product and cart management
  fetchProducts: (page?: number) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  addToDemandeCart: (product: Product) => void;
  removeFromDemandeCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearDemandeCart: () => void;
  setShowCreateModal: (show: boolean) => void;
}

/**
 * Helper function to handle async operations with consistent error handling
 * @param operation The async operation to perform
 * @param set The set function from zustand
 * @param errorMessage The error message to display if the operation fails
 * @returns The result of the operation
 */
const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  set: (state: Partial<DemandesState>) => void,
  errorMessage: string
): Promise<T> => {
  set({ isLoading: true, error: null });
  try {
    const result = await operation();
    set({ isLoading: false });
    return result;
  } catch (error) {
    set({ error: errorMessage, isLoading: false });
    throw error;
  }
};

/**
 * Zustand store for managing demandes (demands/requests)
 */
export const useDemandesStore = create<DemandesState>((set, get) => ({
  // Initial state
  demandesIntern: [],
  demandesExtern: [],
  products: [],
  demandeCart: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    nextPageUrl: null
  },
  isLoadingMore: false,
  showCreateModal: false,
  fetching: false,

  // Fetch internal demandes
  fetchDemandesIntern: async () => {
    await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.getIntern();
      set({
        demandesIntern: response.data
      });
      return response;
    }, set, 'Failed to fetch internal demandes');
  },

  // Fetch external demandes
  fetchDemandesExtern: async () => {
    await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.getExtern();
      set({
        demandesExtern: response.data
      });
      return response;
    }, set, 'Failed to fetch external demandes');
  },

  // Create a new demande
  createDemande: async (data: DemandeData) => {
    return await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.create(data);
      return response;
    }, set, 'Failed to create demande');
  },

  // Cancel a demande
  cancelDemande: async (id: number) => {
    return await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.cancel(id);
      return response;
    }, set, 'Failed to cancel demande');
  },

  // Accept a demande
  acceptDemande: async (id: number) => {
    return await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.accept(id);
      return response;
    }, set, 'Failed to accept demande');
  },

  // Print a demande
  printDemande: async (id: number) => {
    return await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.print(id);
      return response;
    }, set, 'Failed to print demande');
  },

  // Deliver a demande
  livrerDemande: async (id: number, data: Demande) => {
    return await handleAsyncOperation(async () => {
      const response = await endpoints.demandes.livrer(id, data);
      return response;
    }, set, 'Failed to deliver demande');
  },

  // Fetch products with pagination
  fetchProducts: async (page = 1) => {
    await handleAsyncOperation(async () => {
      const response = await endpoints.products.getAll(page);
      const { data, meta } = response.data;
      
      set({
        products: page === 1 ? data : [...get().products, ...data],
        pagination: {
          currentPage: meta.current_page,
          lastPage: meta.last_page,
          hasNextPage: meta.current_page < meta.last_page,
          nextPageUrl: meta.next_page_url
        }
      });
      return response;
    }, set, 'Failed to fetch products');
  },

  // Fetch the next page of products
  fetchNextPage: async () => {
    const { pagination, isLoadingMore } = get();
    
    if (isLoadingMore || !pagination.hasNextPage) return;
    
    set({ isLoadingMore: true });
    
    try {
      await get().fetchProducts(pagination.currentPage + 1);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  // Add a product to the demande cart
  addToDemandeCart: (product: Product) => {
    const { demandeCart } = get();
    const existingItem = demandeCart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      set({
        demandeCart: demandeCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      });
    } else {
      set({
        demandeCart: [...demandeCart, { 
          product, 
          quantity: 1,
          quantite_actuelle: product.quantity
        }]
      });
    }
  },

  // Remove a product from the demande cart
  removeFromDemandeCart: (productId: string) => {
    const { demandeCart } = get();
    set({
      demandeCart: demandeCart.filter(item => item.product.id !== productId)
    });
  },

  // Update the quantity of a product in the demande cart
  updateQuantity: (productId: string, quantity: number) => {
    const { demandeCart } = get();
    set({
      demandeCart: demandeCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    });
  },

  // Clear the demande cart
  clearDemandeCart: () => {
    set({ demandeCart: [] });
  },

  // Set whether to show the create modal
  setShowCreateModal: (show: boolean) => {
    set({ showCreateModal: show });
  }
}));
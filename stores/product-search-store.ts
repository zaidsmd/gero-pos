import { create } from 'zustand';
// @ts-ignore
import { debounce } from 'lodash';
import { usePOSStore, type Product } from "~/pos/pos-store";
import {toast} from "react-toastify";

interface ProductSearchState {
  // state
  searchTerm: string;
  searchResults: Product[];
  loading: boolean;
  isOpen: boolean;
  isFocused: boolean;

  // actions
  setSearchTerm: (val: string | ((prev: string) => string),search?:boolean) => void;
  setSearchResults: (val: Product[]) => void;
  setLoading: (val: boolean) => void;
  setIsOpen: (val: boolean) => void;
  setIsFocused: (val: boolean) => void;
  clearSearch: () => void;
  selectProduct: (product: Product) => void;
}

export const useProductSearchStore = create<ProductSearchState>()((set, get) => ({
  // initial state
  searchTerm: '',
  searchResults: [],
  loading: false,
  isOpen: false,
  isFocused: false,

  // actions
  setSearchTerm: (val: string | ((prev: string) => string),search=true) => {
    const prev = get().searchTerm;
    const next = typeof val === 'function' ? (val as (p: string) => string)(prev) : val;
    set({ searchTerm: next });
    if(search)
    debouncedSearch(next);
  },
  setSearchResults: (val: Product[]) => set({ searchResults: val }),
  setLoading: (val: boolean) => set({ loading: val }),
  setIsOpen: (val: boolean) => set({ isOpen: val }),
  setIsFocused: (val: boolean) => set({ isFocused: val }),
  clearSearch: () => set({ searchTerm: '', searchResults: [], isOpen: false }),
  selectProduct: (product: Product) => {
    const { addToCart } = usePOSStore.getState();
    addToCart(product);
    // Reset search
    // Using setState directly to avoid triggering another debounced search
    useProductSearchStore.setState({ searchTerm: '', isOpen: false });
  },
}));

// Lightweight error tone (no external file) for "not found" cases
const playNotFoundSound = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // start A4

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    // quick descending blip
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.stop(ctx.currentTime + 0.2);

    // Clean up context shortly after
    setTimeout(() => {
      try { ctx.close(); } catch {}
    }, 300);
  } catch (e) {
    // no-op: sound is non-critical
  }
};

// Debounced search runner living at module scope so it persists between component mounts
const debouncedSearch = debounce((search: string) => {
  const {
    setLoading,
    setIsOpen,
    setSearchResults,
  } = useProductSearchStore.getState();

  if (!search.trim()) {
    setSearchResults([]);
    setIsOpen(false);
    return;
  }

  setLoading(true);

  const { products, addToCart } = usePOSStore.getState();
  const searchLower = search.toLowerCase();
  const results = products.filter((product) =>
    product.reference.toLowerCase().includes(searchLower) ||
    product.designation.toLowerCase().includes(searchLower)
  );

  setSearchResults(results);
  setIsOpen(results.length > 0);
  setLoading(false);

  if (results.length === 1) {
    // Auto add single result
    addToCart(results[0]);
    useProductSearchStore.setState({ searchTerm: '', isOpen: false });
  }
  if (results.length === 0) {
      playNotFoundSound();
      toast.warning("Aucun produit trouvé. Veuillez réessayer avec une autre référence ou désignation.")
  }
}, 300);

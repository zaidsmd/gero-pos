import { useRef, useEffect, type RefObject } from 'react';
import { useDemandesStore, type Product } from '../../stores/demandes-store';
import { useDemandeProductSearchStore } from '../../stores/demande-product-search-store';

export interface UseDemandeProductSearchApi {
  // state
  searchTerm: string;
  setSearchTerm: (val: string | ((prev: string) => string), search?: boolean) => void;
  searchResults: Product[];
  setSearchResults: (val: Product[]) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;

  // refs
  containerRef: RefObject<HTMLDivElement | null>;

  // handlers
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectProduct: (product: Product) => void;
  handleClearSearch: () => void;
  handleFocus: () => void;
  handleBlur: () => void;

  // data access
  products: Product[];
}

export const useDemandeProductSearch = (): UseDemandeProductSearchApi => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Demandes store for products
  const { products, fetchProducts } = useDemandesStore();

  // Ensure products loaded
  useEffect(() => {
    if (!products.length) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  // Demande product search store
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    loading,
    setLoading,
    isOpen,
    setIsOpen,
    isFocused,
    setIsFocused,
    clearSearch,
    selectProduct,
  } = useDemandeProductSearchStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleSelectProduct = (selectedProduct: Product) => {
    selectProduct(selectedProduct);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchTerm.trim() && searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return {
    // state
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    loading,
    setLoading,
    isOpen,
    setIsOpen,
    isFocused,
    setIsFocused,

    // refs
    containerRef,

    // handlers
    handleSearch,
    handleSelectProduct,
    handleClearSearch,
    handleFocus,
    handleBlur,

    // data access
    products,
  };
};

export default useDemandeProductSearch;

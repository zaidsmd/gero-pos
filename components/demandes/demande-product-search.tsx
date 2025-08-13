import React from 'react';
import { type Product } from '../../stores/demandes-store';
import useDemandeProductSearch from './useDemandeProductSearch';

const DemandeProductSearch: React.FC = () => {
    const {
        // state
        searchTerm,
        searchResults,
        loading,
        isOpen,
        isFocused,
        // refs
        containerRef,
        // handlers
        handleSearch,
        handleSelectProduct,
        handleClearSearch,
        handleFocus,
        handleBlur,
    } = useDemandeProductSearch();

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher un produit</label>
            <div className={`flex space-x-2 rounded-md overflow-hidden border ${isFocused ? 'border-primary ring-2 ring-blue-100' : 'border-gray-300'} `}>
                <div className={`relative flex-1 flex items-center transition-all duration-150`}>
                    <input
                        type="text"
                        className="w-full py-2 px-3 outline-none bg-white rounded-md"
                        placeholder="Rechercher un produit"
                        value={searchTerm}
                        onChange={handleSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    <div className="absolute right-0 flex items-center pr-2 h-full">
                        {searchTerm && (
                            <button 
                                type="button" 
                                onClick={handleClearSearch}
                                className="text-gray-400 hover:text-gray-600 mr-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <span className="text-gray-400 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-gray-500">
                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    )}

                    {!loading && searchResults.length === 0 && searchTerm && (
                        <div className="p-4 text-gray-500 text-center">Aucun produit trouvé</div>
                    )}

                    {searchResults.length > 0 && (
                        <ul className="max-h-60 overflow-y-auto py-1">
                            {searchResults.map((product) => (
                                <li
                                    key={product.id}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <div className="flex justify-between">
                                        <span className="font-medium">{product.designation}</span>
                                        <span className="text-gray-500">{product.reference}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Prix: {product.prix} - Stock: {product.quantity} {product.unit}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default DemandeProductSearch;
import React, { useEffect, useRef, useCallback } from 'react';
import { useDemandesStore } from '../../stores/demandes-store';
import { formatNumber } from '../../utils/formats';

const DemandeArticles = () => {
    const { products, fetchProducts, fetchNextPage, addToDemandeCart, isLoadingMore, pagination } = useDemandesStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!products.length) fetchProducts();
    }, [products.length, fetchProducts]);
    
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current || isLoadingMore || !pagination.hasNextPage) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        
        // Check if scrolled to bottom (with a threshold of 100px)
        if (scrollHeight - scrollTop - clientHeight < 100) {
            fetchNextPage();
        }
    }, [fetchNextPage, isLoadingMore, pagination.hasNextPage]);
    
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);
    
    return (
        <>
            <div className="px-4 py-3 border-b border-gray-100">
                <h5 className="text-[#3b5461] font-medium">Articles</h5>
            </div>
            <div className="p-4 flex flex-col overflow-hidden">
                <div 
                    ref={scrollContainerRef}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-2"
                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                    {products.map(product => (
                        <div className="flex" key={product.id}>
                            <div 
                                className="rounded-lg shadow-sm overflow-hidden flex flex-col h-full w-full bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer" 
                                onClick={() => addToDemandeCart(product)}
                            >
                                <div className="max-h-32 md:max-h-20 overflow-hidden bg-gray-50">
                                    <img src={product.image} className="w-full h-full object-cover" alt={product.designation}/>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                    <h5 className="font-medium text-[#3b5461]">{product.designation}</h5>
                                    <p className="text-gray-400 text-xs">{product.reference} - {product.quantity}{product.unit}</p>
                                    <h6 className="text-[#3b5461] mt-auto font-bold">{formatNumber(product.prix, true)}</h6>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoadingMore && (
                        <div className="col-span-full flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DemandeArticles;
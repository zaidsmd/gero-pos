import React, {useEffect, useRef, useCallback} from 'react';
import {usePOSStore} from "~/pos/pos-store";
import ProductCard from "./card";

const Articles = () => {
    const {products, fetchProducts, fetchNextPage, addToCart, isLoadingMore, pagination} = usePOSStore();
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
                  <h5 className="text-[#3b5461] font-medium">Products</h5>
              </div>
              <div className="p-4 flex flex-col overflow-hidden">
                  <div 
                      ref={scrollContainerRef}
                      className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-auto pb-2"
                      style={{ maxHeight: 'calc(100vh - 200px)' }}
                  >
                      {products.map(product => (
                          <ProductCard key={product.id} product={product} onClick={addToCart} />
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

export default Articles;
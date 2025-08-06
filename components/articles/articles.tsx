import React, {useEffect} from 'react';
import {usePOSStore} from "~/pos/pos-store";
import {formatNumber} from "../../utils/formats";
import ProductCard from "./card";

const Articles = () => {
    const {products, fetchProducts,addToCart} = usePOSStore();
    useEffect(() => {
        if (!products.length) fetchProducts();
    }, [products, fetchProducts]);
    return (
          <>
              <div className="px-4 py-3 border-b border-gray-100">
                  <h5 className="text-[#3b5461] font-medium">Products</h5>
              </div>
              <div className="p-4 flex flex-col  overflow-hidden  ">
                  <div className="grid grid-cols-2 lg:grid-cols-3  gap-4 overflow-auto pb-2">
                      {
                          products.map(product => (
                              <ProductCard product={product}  onClick={addToCart} />
                          ))
                      }
                  </div>
              </div>
          </>
    );
};

export default Articles;
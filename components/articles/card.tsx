import React from 'react';
import type {Product} from "~/pos/pos-store";
import {formatNumber} from "../../utils/formats";

interface ProductCardProps {
    product: Product;
    onClick?: (product:Product) => void;
}
const ProductCard = ({product,onClick}:ProductCardProps) => {
    return (
        <div className="flex">
            <div className={`rounded-lg shadow-sm overflow-hidden flex flex-col h-full w-full bg-white hover:shadow-md transition-shadow duration-200 ${onClick ? 'cursor-pointer' :null}` } onClick={() => onClick && onClick(product)} >
                <div className="max-h-32 md:max-h-20 overflow-hidden bg-gray-50">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.designation}/>
                </div>
                <div className="p-3 flex flex-col flex-grow">
                    <h5 className="font-medium text-[#3b5461]">{product.designation}</h5>
                    <p className="text-gray-400 text-xs">{product.reference} - {product.quantity}{product.unit}</p>
                    <h6 className="text-[#3b5461] mt-auto font-bold">{formatNumber(product.prix,true)}</h6>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
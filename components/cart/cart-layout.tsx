import React from 'react';
import CartContent from "./cart-content";
import ClientSelect from "../client-select";
import ProductSearch from "../product-search";

const CartLayout = () => {
    return (
        <div className="rounded-lg flex flex-col w-full">
            <div className="flex p-4 gap-4">
                <div className="w-1/2">
                    <ClientSelect />
                </div>
                <div className="w-1/2">
                    <ProductSearch />
                </div>
            </div>
            <CartContent/>
        </div>
    );
};

export default CartLayout;
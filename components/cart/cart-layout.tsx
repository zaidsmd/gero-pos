import React from 'react';
import CartContent from "./cart-content";
import ClientSelect from "../client-select";

const CartLayout = () => {
    return (
        <div className="rounded-lg flex flex-col w-full">
            <div className="flex p-4">
                <div className="w-1/2">
                    <ClientSelect />
                </div>
            </div>
            <CartContent/>
        </div>
    );
};

export default CartLayout;
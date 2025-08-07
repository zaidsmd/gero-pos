import React from 'react';
import { useDemandesStore } from '../../stores/demandes-store';

const DemandeCartTable = () => {
    const { demandeCart, updateQuantity, removeFromDemandeCart } = useDemandesStore();

    const handleQuantityChange = (productId: string, value: string) => {
        // Remove leading zeros
        const cleanValue = value.replace(/^0+/, '');
        const newQuantity = parseInt(cleanValue || '0');
        if (!isNaN(newQuantity) && newQuantity > 0) {
            updateQuantity(productId, newQuantity);
        }
    };

    return (
        <div className="flex flex-col max-h-full">
            <div className="flex bg-primary p-3">
                <div className="w-6/12">
                    <h5 className="font-medium text-white">
                        Produit
                    </h5>
                </div>
                <div className="w-3/12">
                    <h5 className="font-medium text-white">
                        Quantité
                    </h5>
                </div>
                <div className="w-3/12">
                    <h5 className="font-medium text-white">
                        Quantité actuelle
                    </h5>
                </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 330px)' }}>
                {
                    demandeCart.length > 0 ? demandeCart.map((item) => (
                        <div className="flex p-3" key={item.product.reference}>
                            <div className="w-6/12 flex items-center gap-2">
                                <img src={item.product.image} className="w-10 h-10 object-cover rounded"
                                    alt={item.product.designation} />
                                <div className="">
                                    <h5 className="font-medium text-primary ">
                                        {item.product.designation}
                                    </h5>
                                    <p className="text-gray-400 m-0 text-xs">{item.product.reference}</p>
                                </div>
                            </div>
                            <div className="w-3/12 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {item.quantity === 1 ? (
                                        <button
                                            className="border border-red-300 rounded-full text-red-500 text-center w-8 h-8"
                                            onClick={() => removeFromDemandeCart(item.product.id)}>-</button>
                                    ) : (
                                        <button
                                            className="border border-gray-200 rounded-full text-center w-8 h-8 cursor-pointer"
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                                    )}
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity.toString().replace(/^0+/, '')}
                                        onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                                        className="w-16 text-center outline-none rounded-md"
                                    />
                                    <button
                                        className="bg-primary rounded-full text-white text-center w-8 h-8 cursor-pointer"
                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+
                                    </button>
                                </div>
                            </div>
                            <div className="w-3/12 flex items-center">
                                <span className="text-gray-700">{item.quantite_actuelle} {item.product.unit}</span>
                            </div>
                        </div>
                    )) :
                    (
                        <div className="w-full p-3">
                            <h5 className="text-center text-gray-400">
                                Aucun produit dans la demande
                            </h5>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default DemandeCartTable;
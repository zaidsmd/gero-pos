import {formatNumber} from "../../utils/formats";
import React, {type RefObject} from "react";
import {usePOSStore} from "~/pos/pos-store";
import {useSettingsStore} from "../../stores/settings-store";

const CartTable = ({bottom}:{bottom:RefObject<HTMLDivElement|null>}) => {
    const { features } = useSettingsStore();
    const handleQuantityChange = (productId: string, value: string) => {
        // Remove leading zeros
        const cleanValue = value.replace(/^0+/, '');
        const newQuantity = parseInt(cleanValue || '0');
        if (!isNaN(newQuantity) && newQuantity > 0) {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleReductionChange = (productId: string, value: string, type: 'pourcentage' | 'fixe') => {
        // Remove leading zeros while preserving decimal part
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        const reduction = parseFloat(cleanValue || '0');
        if (!isNaN(reduction)) {
            if (type === 'pourcentage') {
                // Ensure pourcentage reduction is between 0 and 100
                const validReduction = Math.min(Math.max(0, reduction), 100);
                updateReduction(productId, validReduction, type);
            } else { // fixed type
                // For fixed type, ensure it's not negative
                const validReduction = Math.max(0, reduction);
                // Get the item's unit price to ensure reduction doesn't exceed it
                const item = cart.find(item => item.product.id === productId);
                if (item) {
                    const maxReduction = item.unit_price * item.quantity;
                    updateReduction(productId, Math.min(validReduction, maxReduction), type);
                }
            }
        } else {
            updateReduction(productId, 0, type);
        }
    };


    const handlePriceChange = (productId: string, value: string) => {
        // Remove leading zeros while preserving decimal part
        const cleanValue = value.replace(/^0+(?=\d)/, '');
        const newPrice = parseFloat(cleanValue || '0');
        if (!isNaN(newPrice) && newPrice >= 0) {
            updatePrice(productId, newPrice);
        } else {
            updatePrice(productId, 0);
        }
    }
    const {
        cart,
        removeFromCart,
        updateQuantity,
        updatePrice,
        updateReduction,
        globalReduction
    } = usePOSStore();

    const style = `calc(100vh - ${(bottom?.current?.clientHeight ?? 0) + 330}px)`
    return (
        <div className="flex flex-col max-h-full">
            <div className="flex bg-primary p-3">
                <div className="w-4/12">
                    <h5 className="font-medium text-white">
                        Produit
                    </h5>
                </div>
                <div className="w-2/12">
                    <h5 className="font-medium text-white">
                        Quantité
                    </h5>
                </div>
                <div className="w-2/12">
                    <h5 className="font-medium text-white">
                        Prix
                    </h5>
                </div>
                {features.reductionEnabled && (
                    <div className="w-2/12">
                        <h5 className="font-medium text-white">
                            Réduction
                        </h5>
                    </div>
                )}
                <div className="w-2/12">
                    <h5 className="font-medium text-white ">
                        Total
                    </h5>
                </div>
            </div>
           <div className="overflow-y-auto" style={{maxHeight:  style }}  >
               {
                   cart.length > 0 ? cart.map((item) => (
                           <div className="flex  p-3" key={item.product.reference}>
                               <div className="w-4/12 flex items-center gap-2">
                                   <img src={item.product.image} className="w-10 h-10 object-cover rounded"
                                        alt={item.product.designation}/>
                                   <div className="">
                                       <h5 className="font-medium text-primary ">
                                           {item.product.designation}
                                       </h5>
                                       <p className="text-gray-400 m-0 text-xs">{item.product.reference}</p>
                                   </div>
                               </div>
                               <div className="w-2/12 flex items-center gap-2">
                                   <div className="flex items-center gap-1">
                                       {item.quantity === 1 ? (
                                           <button
                                               className="border border-red-300 rounded-full text-red-500 text-center w-8 h-8"
                                               onClick={() => removeFromCart(item.product.id)}>-</button>
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
                               <div className="w-2/12 flex items-center">
                                   <input
                                       type="text"
                                       min="1"
                                       value={item.unit_price.toString().replace(/^0+(?=\d)/, '')}
                                       onChange={(e) => handlePriceChange(item.product.id, e.target.value)}
                                       className="w-full  outline-none rounded-md"
                                       disabled={!features.priceEditing}
                                   />
                               </div>
                               {features.reductionEnabled && (
                                   <div className="w-2/12 flex items-center gap-1 pe-4">
                                       <input
                                           type="text"
                                           min="0"
                                           step="0.01"
                                           value={(item.reduction ? item.reduction.toString().replace(/^0+(?=\d)/, '') : '')}
                                           onChange={(e) => handleReductionChange(
                                               item.product.id,
                                               e.target.value,
                                               item.reductionType || 'fixe'
                                           )}
                                           className="w-3/4 outline-none rounded-md "
                                           placeholder="0.00"
                                           disabled={(globalReduction ?? 0) > 0}
                                       />
                                       <select
                                           value={item.reductionType || 'fixe'}
                                           onChange={(e) => handleReductionChange(
                                               item.product.id,
                                               item.reduction?.toString() || '0',
                                               e.target.value as 'pourcentage' | 'fixe'
                                           )}
                                           className="w-1/4 outline-none rounded-md  appearance-none   "
                                           disabled={(globalReduction ?? 0) > 0}
                                       >
                                           <option value="fixe">MAD</option>
                                           <option value="pourcentage">%</option>
                                       </select>
                                   </div>
                               )}
                               <div className="w-2/12 flex items-center ">
                                   <h5 className="font-medium text-primary ">
                                       {formatNumber(item.finalPrice, true)}
                                   </h5>
                               </div>
                           </div>
                       )) :
                       (
                           <div className="w-full p-3">
                               <h5 className="text-center text-gray-400">
                                   Aucun produit dans le panier
                               </h5>
                           </div>
                       )
               }
           </div>
        </div>

    );
};

export default CartTable;

import {create} from 'zustand';
import {api, endpoints} from '../../services/api';
import type {AxiosResponse} from "axios";
import type {PaymentData} from "../../components/cart/payment-modal";
import {playSound} from '../../utils/sound';

// Define the types for our store
export interface Product {
    id: string;
    designation: string;
    prix: number;
    quantity: number;
    reference: string;
    image?: string;
    tax: number;
    unit: string;
}

export interface Client {
    id: number;
    nom: string;
}

interface CartItem {
    product: Product;
    quantity: number;
    reduction?: number;
    reductionType?: 'percentage' | 'fixed';
    finalPrice: number;
    unit_price: number;
}

// Pagination metadata interface
interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    nextPageUrl: string | null;
}

interface POSState {
    products: Product[];
    cart: CartItem[];
    cartTotal: number;
    client: Client | null;
    isLoading: boolean;
    error: string | null;
    lastOrderId: string | null;
    lastOrderTotal: number | null;
    lastOrderPaid: number | null;
    orderType: 'vente' | 'retour'; // 'vente' for sale, 'retour' for return
    pagination: PaginationMeta;
    isLoadingMore: boolean;

    // Global reduction (applies to whole cart)
    globalReduction?: number;

    // Actions
    fetchProducts: (page?: number) => Promise<void>;
    fetchNextPage: () => Promise<void>;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updatePrice: (productId: string, price: number) => void;
    updateReduction: (productId: string, reduction: number, reductionType: 'percentage' | 'fixed') => void;
    // Global reduction actions
    setGlobalReduction: (reduction: number) => void;

    clearCart: () => void;
    toggleOrderType: () => void; // Toggle between 'vente' (sale) and 'retour' (return)
    setOrderType: (type: 'vente' | 'retour') => void; // Set order type directly
    checkout: (payment?:PaymentData) => Promise<AxiosResponse<{
        message: string;
        template: string;
        vente_id?: string;
        total?: number;
        paid?: number;
    }, any>>;
    addPaymentToOrder: (orderId: string, paymentData: PaymentData) => Promise<AxiosResponse<any>>;
    setClient: (client: Client) => void;
    clearClient: () => void;
    clearLastOrderInfo: () => void;
    isPaymentComplete: () => boolean;
}

// Calculate final price using the same logic as the backend
// Backend PHP code:
// $ht = $ligne['prix'] ?? 0;
// $reduction = 0;
// $taxe = $ligne['taxe'] ?? (Article::find($ligne['id'])->taxe ?? 0);
// $quantite = $ligne['quantity'] ?? 0;
// $htReduit = $ht - $reduction;
// $ttc = round(($htReduit * (1 + $taxe / 100)) * $quantite, 2);
const calculateFinalPrice = (
    unitPrice: number, 
    quantity: number, 
    reduction?: number, 
    reductionType?: 'percentage' | 'fixed',
    tax?: number
): number => {
    // Apply reduction to unit price (before quantity)
    let htReduit = unitPrice;
    
    if (reduction !== undefined && reductionType !== undefined) {
        if (reductionType === 'percentage') {
            htReduit = unitPrice * (1 - reduction / 100);
        } else {
            htReduit = Math.max(0, unitPrice - reduction);
        }
    }
    
    // Round HT after reduction (first rounding step in backend)
    htReduit = roundToTwoDecimals(htReduit);
    
    // Apply tax and round before multiplying by quantity (second rounding step in backend)
    const ttcUnit = roundToTwoDecimals(htReduit * (1 + (tax || 0) / 100));
    
    // Multiply by quantity and round final result (third rounding step in backend)
    const ttc = roundToTwoDecimals(ttcUnit * quantity);
    
    // Ensure price doesn't go negative
    return Math.max(0, ttc);
};

const updateCartItem = (
    cart: CartItem[], 
    productId: string, 
    updateFn: (item: CartItem) => CartItem
): CartItem[] => {
    return cart.map(item => 
        item.product.id === productId ? updateFn(item) : item
    );
};

// Helper function to round monetary values to 2 decimal places (0.01)
const roundToTwoDecimals = (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

// Helper function to calculate the total price of all items in the cart (subtotal before global reduction)
const calculateCartTotal = (cart: CartItem[]): number => {
    const total = cart.reduce((sum, item) => sum + item.finalPrice, 0);
    return roundToTwoDecimals(total);
};

// Apply a global reduction on the cart subtotal
const applyGlobalReduction = (
    subtotal: number,
    reduction?: number
): number => {
    // Always treat global reduction as percentage per requirements
    if (reduction === undefined || reduction === null || reduction === 0) {
        return roundToTwoDecimals(subtotal);
    }

    const clamped = Math.min(Math.max(reduction, 0), 100);
    const total = subtotal * (1 - clamped / 100);
    return roundToTwoDecimals(total);
};

// Helper for handling async operations
const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    set: (state: Partial<POSState>) => void,
    errorMessage: string
): Promise<T> => {
    set({isLoading: true, error: null});
    try {
        const result = await operation();
        return result;
    } catch (error) {
        set({error: errorMessage, isLoading: false});
        throw error;
    }
};

// Create the store
export const usePOSStore = create<POSState>((set, get) => ({
    products: [],
    cart: [],
    cartTotal: 0,
    client: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    lastOrderId: null,
    lastOrderTotal: null,
    lastOrderPaid: null,
    orderType: 'vente', // Default to 'vente' (sale)
    pagination: {
        currentPage: 1,
        lastPage: 1,
        hasNextPage: false,
        nextPageUrl: null
    },

    // Global reduction defaults
    globalReduction: 0,

    fetchProducts: async (page = 1) => {
        await handleAsyncOperation(async () => {
            const response = await endpoints.products.getAll(page);
            const { data, links, meta } = response.data;
            
            // If it's the first page, replace products; otherwise append
            const newProducts = page === 1 ? data : [...get().products, ...data];
            
            set({
                products: newProducts,
                isLoading: false,
                pagination: {
                    currentPage: meta.current_page,
                    lastPage: meta.last_page,
                    hasNextPage: !!links.next,
                    nextPageUrl: links.next
                }
            });
        }, set, 'Failed to fetch products');
    },
    
    fetchNextPage: async () => {
        const { pagination, isLoadingMore } = get();
        
        // Don't fetch if already loading or no next page
        if (isLoadingMore || !pagination.hasNextPage) return;
        
        set({ isLoadingMore: true });
        
        try {
            await get().fetchProducts(pagination.currentPage + 1);
        } finally {
            set({ isLoadingMore: false });
        }
    },

    addToCart: (product: Product) => {
        const {cart, lastOrderId} = get();
        
        // Clear last order information if it exists and cart is empty
        // This ensures we don't mix previous order with a new one
        if (lastOrderId && cart.length === 0) {
            get().clearLastOrderInfo();
        }
        
        const existingItem = cart.find(item => item.product.id === product.id);

        if (existingItem) {
            // Calculate with the new quantity (current + 1)
            const newQuantity = existingItem.quantity + 1;
            const finalPrice = calculateFinalPrice(
                existingItem.unit_price, 
                newQuantity, 
                existingItem.reduction, 
                existingItem.reductionType,
                existingItem.product.tax
            );

            const updatedCart = updateCartItem(cart, product.id, item => ({
                ...item, 
                quantity: newQuantity, 
                finalPrice
            }));

            const newCartTotal = calculateCartTotal(updatedCart);
            const grandTotal = applyGlobalReduction(newCartTotal, get().globalReduction);
            set({cart: updatedCart, cartTotal: grandTotal});
        } else {
            const finalPrice = calculateFinalPrice(
                product.prix,
                1,
                undefined,
                undefined,
                product.tax
            );

            const newCart = [...cart, {
                product, 
                quantity: 1, 
                unit_price: product.prix, 
                finalPrice: finalPrice
            }];
            const newCartTotal = calculateCartTotal(newCart);
            const grandTotal = applyGlobalReduction(newCartTotal, get().globalReduction);
            set({cart: newCart, cartTotal: grandTotal});
        }
        
        // Play barcode sound when item is added to cart
        playSound('barcode-sound.mp3',0.2);
    },

    removeFromCart: (productId: string) => {
        const {cart} = get();
        const newCart = cart.filter(item => item.product.id !== productId);
        const newCartTotal = calculateCartTotal(newCart);
        const grandTotal = applyGlobalReduction(newCartTotal, get().globalReduction);
        set({cart: newCart, cartTotal: grandTotal});
    },

    updateQuantity: (productId: string, quantity: number) => {
        const {cart} = get();
        const safeQuantity = Math.max(1, quantity);

        const updatedCart = updateCartItem(cart, productId, item => {
            const finalPrice = calculateFinalPrice(
                item.unit_price,
                safeQuantity,
                item.reduction,
                item.reductionType,
                item.product.tax
            );

            return {
                ...item,
                quantity: safeQuantity,
                finalPrice
            };
        });

        const newCartTotal = calculateCartTotal(updatedCart);
        const grandTotal = applyGlobalReduction(newCartTotal, get().globalReduction);
        set({cart: updatedCart, cartTotal: grandTotal});
    },

    updateReduction: (productId: string, reduction: number, reductionType: 'percentage' | 'fixed') => {
        const {cart} = get();

        const updatedCart = updateCartItem(cart, productId, item => {
            const finalPrice = calculateFinalPrice(
                item.unit_price,
                item.quantity,
                reduction,
                reductionType,
                item.product.tax
            );

            return {
                ...item,
                reduction,
                reductionType,
                finalPrice
            };
        });

        const newCartTotal = calculateCartTotal(updatedCart);
        const grandTotal = applyGlobalReduction(newCartTotal, get().globalReduction);
        set({cart: updatedCart, cartTotal: grandTotal});
    },

    updatePrice: (productId: string, price: number) => {
        const {cart} = get();
        const safePrice = Math.max(0, price);

        const updatedCart = updateCartItem(cart, productId, item => {
            const finalPrice = calculateFinalPrice(
                safePrice,
                item.quantity,
                item.reduction,
                item.reductionType,
                item.product.tax
            );

            return {
                ...item,
                unit_price: safePrice,
                finalPrice
            };
        });

        const newCartTotal = calculateCartTotal(updatedCart);
        const grandTotal = applyGlobalReduction(newCartTotal, get().globalReduction);
        set({cart: updatedCart, cartTotal: grandTotal});
    },

    // Set global reduction value and recompute total
    setGlobalReduction: (reduction: number) => {
        // Always percentage: clamp 0..100
        let value = Math.max(0, reduction);
        value = Math.min(100, value);
        const subtotal = calculateCartTotal(get().cart);
        const grandTotal = applyGlobalReduction(subtotal, value);
        set({ globalReduction: value, cartTotal: grandTotal });
    },

    clearCart: () => {
        set({cart: [], cartTotal: 0, globalReduction: 0});
    },

    checkout: async (paymentData?: PaymentData) => {
          return  await handleAsyncOperation(async () => {
            const { cart, client, orderType } = get();

            if (!client) {
                throw new Error("Client is required for checkout");
            }

            // Prepare order data
            const grValue = Math.min(100, Math.max(0, get().globalReduction ?? 0));
            const orderData: any = {
                type: orderType, // Use the selected order type ('vente' for sale, 'retour' for return)
                client: client.id,
                lignes : cart.map(item => ({
                    id: item.product.id,
                    name: item.product.designation,
                    quantity: item.quantity,
                    prix: item.unit_price,
                    reduction: item.reduction || 0,
                    reduction_type: item.reductionType || 'fixed',
                    final_price: item.finalPrice
                })),
                // Global reduction applied to the whole order (always percentage)
                global_reduction: grValue,
                exercice: 2025,
                session_id:"1",
            };

            // Use the cartTotal property from the store
            const { cartTotal } = get();

            // Add payment data if provided
            if (paymentData) {
                if (!paymentData.credit){
                    orderData.paiement = {
                        i_montant: roundToTwoDecimals(paymentData.amount),
                        i_compte_id: paymentData.accountId,
                        i_method_key: paymentData.paymentMethodId,
                        i_note: paymentData.note,
                        i_reference:paymentData.checkReference ?? null,
                        i_date:paymentData.expectedDate ?? null,
                    };

                }else {
                    orderData.credit = true;
                }

            }

            try {
                const response = await endpoints.orders.create(orderData);
                
                // Store order information
                const vente_id = response.data.vente_id || null;
                const total = roundToTwoDecimals(response.data.total || cartTotal);
                const paid = roundToTwoDecimals(paymentData ? paymentData.amount : total); // If no payment data, assume full payment (cash)
                
                set({
                    cart: [], 
                    isLoading: false,
                    lastOrderId: vente_id,
                    lastOrderTotal: total,
                    lastOrderPaid: paid
                });

                return response;
            } catch (error) {
                throw error;
            }
        }, set, 'checkout failed');
    },
    
    addPaymentToOrder: async (orderId: string, paymentData: PaymentData) => {
        return await handleAsyncOperation(async () => {
            const paymentInfo = {
                vente_id: orderId,
                paiement: {
                    i_montant: roundToTwoDecimals(paymentData.amount),
                    i_compte_id: paymentData.accountId,
                    i_method_key: paymentData.paymentMethodId,
                    i_note: paymentData.note,
                    i_reference: paymentData.checkReference ?? null,
                    i_date: paymentData.expectedDate ?? null,
                },
                session_id: "1",
            };

            
            const response = await endpoints.orders.addPayment(paymentInfo);
            
            // Update the paid amount and round to 2 decimal places
            const { lastOrderPaid } = get();
            set({ 
                lastOrderPaid: roundToTwoDecimals((lastOrderPaid || 0) + paymentData.amount),
                isLoading: false
            });
            
            return response;
        }, set, 'add payment failed');
    },
    
    clearLastOrderInfo: () => {
        set({ 
            lastOrderId: null,
            lastOrderTotal: null,
            lastOrderPaid: null
        });
    },
    
    isPaymentComplete: () => {
        const { lastOrderTotal, lastOrderPaid } = get();
        if (lastOrderTotal === null || lastOrderPaid === null) return true;
        
        // Consider payment complete if paid amount is equal or greater than total
        return lastOrderPaid >= lastOrderTotal;
    },

    setClient: (client: Client) => {
        set({ client });
    },

    clearClient: () => {
        set({ client: null });
    },
    
    toggleOrderType: () => {
        const { orderType } = get();
        // Toggle between 'vente' (sale) and 'retour' (return)
        set({ orderType: orderType === 'vente' ? 'retour' : 'vente' });
    },
    
    setOrderType: (type: 'vente' | 'retour') => {
        set({ orderType: type });
    },
}));

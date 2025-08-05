import {create} from 'zustand';
import {api, endpoints} from '../../services/api';
import type {AxiosResponse} from "axios";
import type {PaymentData} from "../../components/cart/payment-modal";

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

interface POSState {
    products: Product[];
    cart: CartItem[];
    client: Client | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProducts: () => Promise<void>;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updatePrice: (productId: string, price: number) => void;
    updateReduction: (productId: string, reduction: number, reductionType: 'percentage' | 'fixed') => void;
    clearCart: () => void;
    checkout: (payment?:PaymentData) => Promise<AxiosResponse<{
        message: string;
        template: string;
    }, any>>;
    setClient: (client: Client) => void;
    clearClient: () => void;
}

const calculateFinalPrice = (
    unitPrice: number, 
    quantity: number, 
    reduction?: number, 
    reductionType?: 'percentage' | 'fixed',
    tax?: number
): number => {
    if (reduction === undefined || reductionType === undefined) {
        const basePrice = unitPrice * quantity;
        return tax ? basePrice * (1 + tax / 100) : basePrice;
    }

    const basePrice = unitPrice * quantity;
    let finalPrice: number;

    if (reductionType === 'percentage') {
        finalPrice = basePrice * (1 - reduction / 100);
        if (tax) {
            finalPrice = finalPrice * (1 + tax / 100);
        }
    } else {
        if (tax) {
            finalPrice = (basePrice * (1 + tax / 100)) - reduction;
        } else {
            finalPrice = basePrice - reduction;
        }
    }

    return Math.max(0, finalPrice); // Ensure price doesn't go negative
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
    client: null,
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        await handleAsyncOperation(async () => {
            const response = await endpoints.products.getAll();
            set({products: response.data.data, isLoading: false});
        }, set, 'Failed to fetch products');
    },

    addToCart: (product: Product) => {
        const {cart} = get();
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

            set({cart: updatedCart});
        } else {
            const finalPrice = calculateFinalPrice(
                product.prix,
                1,
                undefined,
                undefined,
                product.tax
            );

            set({cart: [...cart, {
                product, 
                quantity: 1, 
                unit_price: product.prix, 
                finalPrice: finalPrice
            }]});
        }
    },

    removeFromCart: (productId: string) => {
        const {cart} = get();
        set({cart: cart.filter(item => item.product.id !== productId)});
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

        set({cart: updatedCart});
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

        set({cart: updatedCart});
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

        set({cart: updatedCart});
    },

    clearCart: () => {
        set({cart: []});
    },

    checkout: async (paymentData?: PaymentData) => {
          return  await handleAsyncOperation(async () => {
            const { cart, client } = get();

            if (!client) {
                throw new Error("Client is required for checkout");
            }

            // Prepare order data
            const orderData: any = {
                type:'bc',
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
                exercice: 2025,
                session_id:"1",
            };

            // Add payment data if provided
            if (paymentData) {
                orderData.paiement = {
                    i_montant: paymentData.amount,
                    i_compte_id: paymentData.accountId,
                    i_method_key: paymentData.paymentMethodId,
                    i_note: paymentData.note,
                    i_reference:paymentData.checkReference ?? null,
                    i_date:paymentData.expectedDate ?? null,
                };
            }

            try {
                const response:AxiosResponse<{message:string,template:string}> = await endpoints.orders.create(orderData);
                set({cart: [], isLoading: false});

                return response;
            } catch (error) {
                console.error('Checkout error:', error);
                throw error; // Re-throw to be caught by handleAsyncOperation
            }
        }, set, 'Checkout failed');
    },

    setClient: (client: Client) => {
        set({ client });
    },

    clearClient: () => {
        set({ client: null });
    },
}));

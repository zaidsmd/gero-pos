import {create} from 'zustand';
import axios from "axios";

// Define the types for our store
export interface Product {
    id: string;
    designation: string;
    prix: number;
    quantity: number;
    reference: string;
    image?: string;
    tva: number;
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
    checkout: () => Promise<void>;
    setClient: (client: Client) => void;
    clearClient: () => void;
}

// Helper functions to reduce code duplication
const calculateFinalPrice = (
    unitPrice: number, 
    quantity: number, 
    reduction?: number, 
    reductionType?: 'percentage' | 'fixed'
): number => {
    if (reduction === undefined || reductionType === undefined) {
        return unitPrice * quantity;
    }

    const basePrice = unitPrice * quantity;
    let finalPrice: number;
    
    if (reductionType === 'percentage') {
        finalPrice = basePrice * (1 - reduction / 100);
    } else { // fixed
        finalPrice = basePrice - reduction;
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
const handleAsyncOperation = async (
    operation: () => Promise<void>,
    set: (state: Partial<POSState>) => void,
    errorMessage: string
) => {
    set({isLoading: true, error: null});
    try {
        await operation();
    } catch (error) {
        set({error: errorMessage, isLoading: false});
    }
};

// Create the store
export const usePOSStore = create<POSState>((set, get) => ({
    products: [],
    cart: [],
    client: null,
    isLoading: false,
    error: null,

    // Mock data for demonstration
    fetchProducts: async () => {
        await handleAsyncOperation(async () => {
            // Simulate API call
            const response = await axios.get('http://wwsl.gero.test/api/v-classic/articles-all', {
                headers: {
                    'Authorization': 'Bearer 73|BN3psKqCvGLuaaiBDzc41QLWFCjaPoqTnqtFtHdr804977d1',
                }
            });
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
                existingItem.reductionType
            );
            
            const updatedCart = updateCartItem(cart, product.id, item => ({
                ...item, 
                quantity: newQuantity, 
                finalPrice
            }));
            
            set({cart: updatedCart});
        } else {
            set({cart: [...cart, {
                product, 
                quantity: 1, 
                unit_price: product.prix, 
                finalPrice: product.prix
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
                item.reductionType
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
                reductionType
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
                item.reductionType
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

    checkout: async () => {
        await handleAsyncOperation(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, you would send the cart and client data to your backend
            const { cart, client } = get();
            
            if (!client) {
                throw new Error("Client is required for checkout");
            }
            
            console.log("Processing checkout for client:", client.nom, "with", cart.length, "items");
            // In a real implementation, you would call your API:
            // await api.checkout({ cart, client });
            
            // For demonstration purposes, log the checkout data
            console.log("Checkout data:", {
                client: client,
                items: cart.map(item => ({
                    product: item.product.designation,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    reduction: item.reduction,
                    reductionType: item.reductionType,
                    finalPrice: item.finalPrice
                })),
                total: cart.reduce((sum, item) => sum + item.finalPrice, 0)
            });

            // Clear cart and client after successful checkout
            set({cart: [], client: null, isLoading: false});
            
            alert(`Commande traitée avec succès pour le client: ${client.nom}`);
            
            // and handle payment processing, inventory updates, etc.
        }, set, 'Checkout failed');
    },

    setClient: (client: Client) => {
        set({ client });
    },

    clearClient: () => {
        set({ client: null });
    },
}));
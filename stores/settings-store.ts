import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {endpoints} from "../services/api";

export interface SettingsApiResponse {
    features: {
        ticketPrinting: boolean;
        autoTicketPrinting: boolean;
        priceEditing: boolean;
        reductionEnabled: boolean;
        globalReductionEnabled: boolean;
        demandes: boolean;
    };
    url: string;
    apiUrl: string;
    defaultClient: {value:number,label:string} | null;
    rapports: {
        stock:boolean;
        saleByProductAndCLient:boolean;
        productBySupplier:boolean;
        paymentsAndCredit:boolean;
        treasury:boolean;
        daily:boolean;
    }
}

interface SettingsState {
    features: {
        ticketPrinting: boolean;
        autoTicketPrinting: boolean;
        priceEditing: boolean;
        reductionEnabled: boolean;
        globalReductionEnabled: boolean;
        demandes: boolean;
        history:boolean;
        depense:boolean;
    };
    
    posType: "parfums" | "classic"|"caisse";

    rapports: {
        stock:boolean;
        saleByProductAndCLient:boolean;
        productBySupplier:boolean;
        paymentsAndCredit:boolean;
        treasury:boolean;
        daily:boolean;
    }

    defaultClient: {value:number,label:string} | null;
    url:string;
    apiUrl:string;

    // Actions
    toggleFeature: (featureName: keyof SettingsState['features']) => void;
    setFeature: (featureName: keyof SettingsState['features'], value: boolean) => void;
    fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
    (set) => ({
        // Initial state
        features: {
            ticketPrinting: false,
            autoTicketPrinting: false,
            priceEditing: false,
            reductionEnabled: false,
            globalReductionEnabled: false,
            demandes: false,
            history:false,
            depense:false,
        },
        posType: "caisse",
        rapports: {
            stock:false,
            saleByProductAndCLient:false,
            productBySupplier:false,
            paymentsAndCredit:false,
            treasury:false,
            daily:false,
        },
        defaultClient: null,
        apiUrl:"",
        url:"",

        // Toggle a feature flag
        toggleFeature: (featureName) =>
            set((state) => ({
                features: {
                    ...state.features,
                    [featureName]: !state.features[featureName],
                }
            })),

        // Set a feature flag to a specific value
        setFeature: (featureName, value) =>
            set((state) => ({
                features: {
                    ...state.features,
                    [featureName]: value,
                }
            })),

        fetchSettings: async () => {
            try {
                const resp = await endpoints.system.getSettings();
                const data = (resp as any)?.data ?? resp;
                if (!data) return;
                set((state) => ({
                    features: {
                        ...state.features,
                        ...(data.features ?? {}),
                    },
                    defaultClient: data.defaultClient ?? state.defaultClient,
                    rapports: {
                        ...(state.rapports ?? {}),
                        ...(data.rapports ?? {}),
                    },
                    url: data.url ?? state.url,
                    apiUrl: data.apiUrl ?? state.apiUrl,
                    posType: data.posType ?? state.posType,
                }));
            } catch (e) {
                console.warn('Failed to fetch settings:', e);
            }
        }
    })
);

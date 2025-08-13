import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface SettingsState {
    features: {
        ticketPrinting: boolean;
        autoTicketPrinting: boolean;
        priceEditing: boolean;
        reductionEnabled: boolean;
        globalReductionEnabled: boolean;
        demandes: boolean;
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

    // Actions
    toggleFeature: (featureName: keyof SettingsState['features']) => void;
    setFeature: (featureName: keyof SettingsState['features'], value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Initial state
            features: {
                ticketPrinting: true,
                autoTicketPrinting: true,
                priceEditing: false,
                reductionEnabled: true,
                globalReductionEnabled: true,
                demandes: true,
            },
            posType: "parfums",
            rapports: {
                stock:true,
                saleByProductAndCLient:true,
                productBySupplier:true,
                paymentsAndCredit:true,
                treasury:true,
                daily:true,
            },

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
        }),
        {
            name: 'gero-pos-settings',
            version: 2,
            migrate: (persistedState: any, version: number) => {
                const state = persistedState || {};
                const features = state.features || {};
                return {
                    ...state,
                    features: {
                        ticketPrinting: features.ticketPrinting ?? true,
                        autoTicketPrinting: features.autoTicketPrinting ?? true,
                        priceEditing: features.priceEditing ?? true,
                        reductionEnabled: features.reductionEnabled ?? true,
                        globalReductionEnabled: features.globalReductionEnabled ?? true,
                        demandes: features.demandes ?? true,
                    },
                    rapports: {
                        stock:features.stock ?? true,
                        saleByProductAndCLient:features.saleByProductAndCLient ?? true,
                        productBySupplier:features.productBySupplier ?? true,
                        paymentsAndCredit:features.paymentsAndCredit ?? true,
                        treasury:features.treasury ?? true,
                        daily:features.daily ?? true,
                    },
                } as SettingsState;
            }
        }
    )
);

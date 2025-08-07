import React, { useEffect, useState } from 'react';
import DemandeCartTable from './demande-cart-table';
import { useDemandesStore } from '../../stores/demandes-store';
import { endpoints } from '../../services/api';
import {toast} from "react-toastify";
import axios, {type AxiosError} from "axios";
import DemandeProductSearch from './demande-product-search';

const DemandeCartLayout = () => {
    const {
        demandeCart,
        clearDemandeCart,
        createDemande,
        fetchDemandesIntern,
        fetchDemandesExtern,
        setShowCreateModal
    } = useDemandesStore();
    const [magasinSortie, setMagasinSortie] = useState('');
    const [magasinOptions, setMagasinOptions] = useState<{id: string, nom: string}[]>([]);
    const [isLoadingMagasins, setIsLoadingMagasins] = useState(false);
    
    useEffect(() => {
        const fetchMagasins = async () => {
            setIsLoadingMagasins(true);
            try {
                const response = await endpoints.demandes.getMagasins();
                setMagasinOptions(response.data);
            } catch (error) {
                console.error('Error fetching magasins:', error);
            } finally {
                setIsLoadingMagasins(false);
            }
        };
        
        fetchMagasins();
    }, []);

    const handleCreateDemande = async () => {
        if (demandeCart.length === 0) {
            toast.warning("Aucun produit selectionné")
            return;
        }

        if (!magasinSortie) {
            toast.warning("Magasin de sortie est obligatoire")
            return;
        }

        const demandeData = {
            magasin_sortie: { value :magasinSortie},
            lignes: demandeCart.map(item => ({
                id: item.product.id,
                quantity: item.quantity,
            }))
        };

        try {
           const response = await createDemande(demandeData);
            clearDemandeCart();
            setMagasinSortie('');
            setShowCreateModal(false);
            fetchDemandesIntern();
            fetchDemandesExtern();
            toast.success(response.data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {  // Type guard
                if (error.response?.status === 422) {
                    const errors :string[][] = error.response.data.errors;
                    const errorMessages = Object.values(errors).map((error:string[] )=> error[0]);
                    toast.error(errorMessages.join(', '));
                } else {
                    console.log(error.response)
                    if (error.response?.data.message) {
                        toast.error(error.response.data.message);
                    }
                }
            }else {
                toast.error('une erreur s\'est produite lors de la création de la demande, veuillez réessayer plus tard');
            }
        }
    };

    return (
        <div className="rounded-lg flex flex-col w-full">
            <div className="flex p-4 gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Magasin de sortie</label>
                    {isLoadingMagasins ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span className="text-sm text-gray-500">Chargement des magasins...</span>
                        </div>
                    ) : (
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={magasinSortie}
                            onChange={(e) => setMagasinSortie(e.target.value)}
                        >
                            <option value="">Sélectionnez un magasin</option>
                            {magasinOptions.map((magasin) => (
                                <option key={magasin.id} value={magasin.id}>
                                    {magasin.nom}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="w-1/2">
                    <DemandeProductSearch />
                </div>
            </div>
            <DemandeCartTable/>
            <div className="p-4 mt-auto border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 justify-between items-center">
                    <button
                        onClick={() => {
                            clearDemandeCart();
                            setShowCreateModal(false);
                        }}
                        disabled={demandeCart.length === 0}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium cursor-pointer ${
                            demandeCart.length === 0 || !magasinSortie
                                ? 'bg-red-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >

                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 mb-0" width="2em"
                             height="2em" viewBox="0 0 24 24">
                            <path fill="currentColor" fillRule="evenodd"
                                  d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 0 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06"
                                  clipRule="evenodd"/>
                        </svg>
                        Annuler
                    </button>
                    <button
                        className={`py-3 px-4  text-white rounded-md  transition-colors ${
                            demandeCart.length === 0 || !magasinSortie ? 'cursor-not-allowed bg-green-400' : 'bg-green-500 hover:bg-green-600'
                        }`}
                        onClick={handleCreateDemande}
                        disabled={demandeCart.length === 0 || !magasinSortie}
                    >
                        <svg className="inline-block mr-2" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 512 512"><path fill="currentColor" d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05"/></svg>
                        Demander
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemandeCartLayout;
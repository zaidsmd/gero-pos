import React, { useState } from "react";
import { type Demande, useDemandesStore } from "../../stores/demandes-store";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {formatNumber} from "../../utils/formats";

interface MaDemandeProps {
    demande: Demande;
    setDemandeShow: () => void;
}

export const MaDemande: React.FC<MaDemandeProps> = ({ demande, setDemandeShow }) => {
    const { cancelDemande, acceptDemande, fetchDemandesIntern } = useDemandesStore();
    const [fetching, setFetching] = useState(false);

    const demandeLignes = () => {
        if (demande.lignes !== undefined) {
            return demande.lignes.map((ligne, index) => (
                <tr key={ligne.id + '-' + demande.id + '+' + index}>
                    <td className="p-3 border-b border-gray-100">{ligne.article} ({ligne.article_reference})</td>
                    <td className="p-3 border-b border-gray-100">{formatNumber(ligne.quantite_demande)}</td>
                    <td className="p-3 border-b border-gray-100">{formatNumber(ligne.quantite_livre)}</td>
                    <td className="p-3 border-b border-gray-100">{formatNumber(ligne.quantite_stock)}</td>
                </tr>
            ));
        }
        return null;
    };

    const handleCancelDemande = async (id: number) => {
        setFetching(true);
        try {
            const response = await cancelDemande(id);
            toast.success("Demande annulée");
            setDemandeShow();
            fetchDemandesIntern();
        } catch (error) {
            setDemandeShow();
            Swal.fire({
                icon: "error",
                title: "Erreur !",
                text: "Vuillez ressayer plus tard",
                confirmButtonText: "Ok !",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-lg btn-soft-danger mx-2",
                },
            });
        } finally {
            setFetching(false);
        }
    };

    const handleAcceptDemande = async (id: number) => {
        setFetching(true);
        try {
            const response = await acceptDemande(id);
            toast.success("Demande acceptée");
            setDemandeShow();
            fetchDemandesIntern();
        } catch (error) {
            setDemandeShow();
            Swal.fire({
                icon: "error",
                title: "Erreur !",
                text: "Vuillez ressayer plus tard",
                confirmButtonText: "Ok !",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-lg btn-soft-danger mx-2",
                },
            });
        } finally {
            setFetching(false);
        }
    };

    return (
        <>
            {fetching ? (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <div className="flex items-center">
                        <button 
                            className="text-primary"
                            onClick={() => setDemandeShow()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 12l6-6m-6 6l6 6m-6-6h10.5m5.5 0h-2.5"/>
                            </svg>
                        </button>
                        <h5 className="ml-2 mb-0 text-xl font-semibold">{demande.reference}</h5>
                    </div>
                    <hr className="my-4 border-gray-200"/>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="rounded p-3 bg-white w-full flex items-center shadow-sm">
                                <div className="rounded bg-blue-100 p-2 flex items-center justify-center w-12 h-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-500">Demandé à</span>
                                    <p className="mb-0 text-lg font-semibold text-gray-800 capitalize">{demande.magasin_sortie}</p>
                                </div>
                            </div>
                            <div className="rounded p-3 bg-white w-full flex items-center shadow-sm">
                                <div className="rounded bg-yellow-100 p-2 flex items-center justify-center w-12 h-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-500">Statut</span>
                                    <p className="mb-0 text-lg font-semibold text-gray-800 capitalize">{demande.statut}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-primary">
                                        <th className="p-3 text-left text-white font-medium">Produit</th>
                                        <th className="p-3 text-left text-white font-medium">Quantité demandée</th>
                                        <th className="p-3 text-left text-white font-medium">Quantité livrée</th>
                                        <th className="p-3 text-left text-white font-medium">Quantité actuelle de stock</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {demandeLignes()}
                                </tbody>
                            </table>
                        </div>
                        {demande.statut === 'Livrée' && (
                            <div className="flex items-center gap-2 mt-4">
                                <button 
                                    onClick={() => handleCancelDemande(demande.id)} 
                                    className="flex-1 py-2 px-4 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Annuler
                                </button>
                                <button 
                                    onClick={() => handleAcceptDemande(demande.id)} 
                                    className="flex-1 py-2 px-4 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Accepter
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default MaDemande;
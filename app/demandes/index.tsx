import React, { useEffect, useState } from "react";
import { type Demande, useDemandesStore } from "../../stores/demandes-store";
import DemandeCartLayout from "../../components/demandes/demande-cart-layout";
import DemandeArticles from "../../components/demandes/demande-articles";
import DemandeKeyboard from "../../components/keyboard/demande-keyboard";
import MaDemande from "../../components/demandes/ma-demande";
import DemandesExterne from "../../components/demandes/DemandesExterne";
import {Link, Navigate} from "react-router";
import {useSettingsStore} from "../../stores/settings-store";

const Demandes = () => {
    const {
        demandesExtern, 
        demandesIntern, 
        fetchDemandesExtern, 
        fetchDemandesIntern, 
        isLoading,
        showCreateModal,
        setShowCreateModal
    } = useDemandesStore();
    const [demandeIntern, setDemandeIntern] = useState<Demande>();
    const { features,posType } = useSettingsStore();

    useEffect(() => {
        fetchDemandesIntern();
        fetchDemandesExtern();
    }, []);

    if (!features.demandes) {
        return <Navigate to="/pos" replace />;
    }

    return (
        <div className="h-full w-full p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3" >
                    <Link to="/pos" className=" text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 12l6-6m-6 6l6 6m-6-6h10.5m5.5 0h-2.5"/></svg>
                    </Link>
                    <h1 className="text-2xl font-semibold text-[#3b5461]">Demandes</h1>
                </div>
            </div>
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden pb-3">
                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm flex ">
                    <div className="flex flex-col w-full">
                        <div className="p-4">
                            <div className="flex items-center justify-between w-full">
                                <h3 className="text-xl font-semibold text-gray-700 ">
                                    Mes demandes
                                </h3>
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"/></svg>
                                </button>
                            </div>
                            <hr className="border my-3 border-gray-200"/>
                        </div>
                        <div className="flex flex-col max-h-full">
                            <div className="flex bg-primary p-3">
                                <div className="w-4/12">
                                    <h5 className="font-medium text-white">
                                        Référence
                                    </h5>
                                </div>
                                <div className="w-3/12">
                                    <h5 className="font-medium text-white">
                                        Demandé à
                                    </h5>
                                </div>
                                <div className="w-3/12">
                                    <h5 className="font-medium text-white">
                                        Status
                                    </h5>
                                </div>
                                <div className="w-2/12">
                                    <h5 className="font-medium text-white">
                                        Action
                                    </h5>
                                </div>
                            </div>
                            {demandesIntern.map((item) => (
                                <div className="flex items-center bg-white p-3" key={item.id}>
                                    <div className="w-4/12">
                                            {item.reference}
                                    </div>
                                    <div className="w-3/12">
                                        {item.magasin_sortie}
                                    </div>
                                    <div className="w-3/12">
                                        {item.statut}
                                    </div>
                                    <div className="">
                                        <button className="p-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors" onClick={()=>setDemandeIntern(item)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm flex">
                    <div className="flex flex-col w-full">
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-700">
                                Demandes externe
                            </h3>
                            <hr className="border my-3 border-gray-200"/>
                        </div>
                        <div className="px-4 pb-4">
                            <DemandesExterne refresh={false} />
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Create Demande Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-white z-50">
                    <div className="h-full w-full p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <button 
                                    className="text-primary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 12l6-6m-6 6l6 6m-6-6h10.5m5.5 0h-2.5"/></svg>
                                </button>
                                <h1 className="text-2xl font-semibold text-[#3b5461]">Nouvelle demande</h1>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden pb-3">
                            <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm flex">
                                <DemandeCartLayout />
                            </div>

                            <div className="w-full md:w-1/3 overflow-hidden flex flex-col gap-4">
                                <div className="bg-white rounded-lg shadow-sm w-full flex-grow flex flex-col overflow-hidden">
                                    {posType === "classic" && <DemandeArticles/>}
                                    {posType === "parfums" && <DemandeKeyboard/>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Show Demande Intern Modal */}
            {demandeIntern && (
                <div className="fixed inset-0 bg-white z-50">
                    <div className="h-full w-full p-4 flex flex-col">
                        <MaDemande 
                            demande={demandeIntern} 
                            setDemandeShow={() => setDemandeIntern(undefined)} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Demandes;
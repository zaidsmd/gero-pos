
import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
// @ts-ignore
import { debounce } from 'lodash';
import {type Client, usePOSStore} from '~/pos/pos-store';
import QuickAddClientModal from './quick-add-client-modal';

const ClientSelect: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Use the POS store
    const { client, setClient, clearClient } = usePOSStore();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Update search term when client changes
    useEffect(() => {
        if (client) {
            setSearchTerm(client.nom);
        }
    }, [client]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (search: string) => {
            if (!search.trim()) {
                setClients([]);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get<Client[]>(`http://classic.gero.test/api/v-classic/clients-liste?search=${encodeURIComponent(search)}`,{
                    headers:{
                        'Authorization': 'Bearer 7|wPQwGop9W0oDH1LRiw2QYb4dooXIgavMDnOGvPEI432172e0',
                    }
                });
                setClients(response.data);
                setIsOpen(true);
            } catch (error) {
                console.error('Error fetching clients:', error);
                setClients([]);
            } finally {
                setLoading(false);
            }
        }, 300), // 300ms delay
        []
    );

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (client) {
            clearClient();
        }
        debouncedSearch(value);
    };

    const handleSelectClient = (selectedClient: Client) => {
        setClient(selectedClient);
        setSearchTerm(selectedClient.nom);
        setIsOpen(false);
    };

    const handleClearSelection = () => {
        clearClient();
        setSearchTerm('');
        setClients([]);
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (searchTerm.trim() && clients.length > 0) {
            setIsOpen(true);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
    };
    
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleClientAdded = (newClient: Client) => {
        setClient(newClient);
        setSearchTerm(newClient.nom);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className={`flex space-x-2 mb-2 rounded-md overflow-hidden border ${isFocused ? 'border-primary ring-2 ring-blue-100' : 'border-gray-300'} `}>
                <div className={`relative flex-1 flex items-center   transition-all duration-150`}>
                    <input
                        type="text"
                        className="w-full py-2 px-3 outline-none bg-white rounded-md"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={handleSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    <div className="absolute right-0 flex items-center pr-2 h-full">
                        {searchTerm && (
                            <button 
                                type="button" 
                                onClick={handleClearSelection}
                                className="text-gray-400 hover:text-gray-600 mr-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <span className="text-gray-400 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleOpenModal}
                    className="p-2 bg-primary text-white transition-all duration-150 flex items-center justify-center shadow-md hover:shadow-lg"
                    aria-label="Ajouter un client"
                    title="Ajouter un client"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-gray-500">
                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    )}

                    {!loading && clients.length === 0 && searchTerm && (
                        <div className="p-4 text-gray-500 text-center">Aucun client trouvé</div>
                    )}

                    {clients.length > 0 && (
                        <ul className="max-h-60 overflow-y-auto py-1">
                            {clients.map((client) => (
                                <li
                                    key={client.id}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                    onClick={() => handleSelectClient(client)}
                                >
                                    {client.nom}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <QuickAddClientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onClientAdded={handleClientAdded}
            />
        </div>
    );
};

export default ClientSelect;
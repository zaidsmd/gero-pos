import React, { useState, useEffect } from 'react';
import { useDepenseStore, type DepenseData, type DepenseCategory } from '../../stores/depense-store';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { formatNumber } from '../../utils/formats';

// Helper function to round monetary values to 2 decimal places (0.01)
const roundToTwoDecimals = (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

interface DepenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (text:string) => void;
    serverErrors?: Record<string, string> | null;
}

const DepenseModal: React.FC<DepenseModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    serverErrors 
}) => {
    const { categories, fetchCategories, createDepense, isLoading, error } = useDepenseStore();
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset,
        setError
    } = useForm<DepenseData>({
        defaultValues: {
            beneficiaire: '',
            category_id: 0,
            description: '',
            montant: 0,
            nom: ''
        }
    });
    
    useEffect(() => {
        if (isOpen) {
            // Fetch categories when modal opens
            fetchCategories();
            
            // Reset form and errors when modal opens
            reset();
            setGeneralError(null);
            setSuccessMessage(null);
        }
    }, [isOpen, fetchCategories, reset]);
    
    // Apply server errors if provided
    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            Object.entries(serverErrors).forEach(([field, message]) => {
                setError(field as any, { 
                    type: 'server', 
                    message: Array.isArray(message) ? message[0] : message 
                });
            });
        }
    }, [serverErrors, setError]);

    const onFormSubmit: SubmitHandler<DepenseData> = async (data) => {
        // Round the amount to 2 decimal places
        data.montant = roundToTwoDecimals(data.montant);
        // Validation for amount
        if (data.montant <= 0) {
            setError('montant', { 
                type: 'manual', 
                message: 'Le montant doit être supérieur à 0'
            });
            return;
        }
        
        try {
            // Submit depense data
            const response = await createDepense(data);
            setSuccessMessage(response.data);
            reset();
            
            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess(response.data);
            }
            
            // Close modal after a short delay
            setTimeout(() => {
                onClose();
                setSuccessMessage(null);
            }, 1500);
        } catch (err) {
            setGeneralError('Erreur lors de la création de la dépense');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Nouvelle Dépense
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {generalError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {generalError}
                    </div>
                )}


                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {isLoading && !categories.length ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                        <div className="mb-4">
                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom
                            </label>
                            <input
                                id="nom"
                                type="text"
                                {...register('nom', {
                                    required: 'Le nom est requis'
                                })}
                                className={`w-full px-3 py-2 border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="Nom de la dépense"
                            />
                            {errors.nom && (
                                <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="beneficiaire" className="block text-sm font-medium text-gray-700 mb-1">
                                Bénéficiaire
                            </label>
                            <input
                                id="beneficiaire"
                                type="text"
                                {...register('beneficiaire', {
                                    required: 'Le bénéficiaire est requis'
                                })}
                                className={`w-full px-3 py-2 border ${errors.beneficiaire ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="Nom du bénéficiaire"
                            />
                            {errors.beneficiaire && (
                                <p className="text-red-500 text-xs mt-1">{errors.beneficiaire.message}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Catégorie
                            </label>
                            <select
                                id="category_id"
                                {...register('category_id', { 
                                    required: 'Veuillez sélectionner une catégorie',
                                    valueAsNumber: true
                                })}
                                className={`w-full px-3 py-2 border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categories.map((category: DepenseCategory) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1">
                                Montant
                            </label>
                            <input
                                id="montant"
                                type="text"
                                {...register('montant', {
                                    required: 'Le montant est requis',
                                    validate: {
                                        isNumber: value => !isNaN(Number(value)) || 'Le montant doit être un nombre',
                                        isPositive: value => Number(value) > 0 || 'Le montant doit être supérieur à 0'
                                    },
                                    setValueAs: value => Number(value)
                                })}
                                className={`w-full px-3 py-2 border ${errors.montant ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="0.00"
                            />
                            {errors.montant && (
                                <p className="text-red-500 text-xs mt-1">{errors.montant.message}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                {...register('description')}
                                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                rows={3}
                                placeholder="Description (optionnel)"
                            ></textarea>
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                {isLoading ? 'Création...' : 'Créer'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DepenseModal;
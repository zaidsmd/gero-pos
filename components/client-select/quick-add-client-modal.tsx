import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type Client, usePOSStore } from '~/pos/pos-store';
import {endpoints} from "../../services/api";

interface QuickAddClientFormData {
  denomination: string;
  telephone: string;
  ville: string;
}

interface QuickAddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: Client) => void;
}

const QuickAddClientModal: React.FC<QuickAddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<QuickAddClientFormData>();

  const onSubmit = async (data: QuickAddClientFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // API call to create a new client
      const response = await endpoints.clients.create( {
        nom: data.denomination,
        telephone: data.telephone,
        ville: data.ville
      }
      );
      
      // Call the callback with the newly created client
      onClientAdded(response.data);
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100 transform transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ajouter un client</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="denomination" className="block text-sm font-medium text-gray-700 mb-1">
              Dénomination
            </label>
            <input
              id="denomination"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${errors.denomination ? 'border-red-500' : 'border-gray-300'}`}
              {...register('denomination', { required: 'Ce champ est obligatoire' })}
            />
            {errors.denomination && (
              <p className="mt-1 text-sm text-red-600">{errors.denomination.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              id="telephone"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${errors.telephone ? 'border-red-500' : 'border-gray-300'}`}
              {...register('telephone', { required: 'Ce champ est obligatoire' })}
            />
            {errors.telephone && (
              <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              id="ville"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${errors.ville ? 'border-red-500' : 'border-gray-300'}`}
              {...register('ville', { required: 'Ce champ est obligatoire' })}
            />
            {errors.ville && (
              <p className="mt-1 text-sm text-red-600">{errors.ville.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddClientModal;
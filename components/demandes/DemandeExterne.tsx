import { useState } from "react";
import {type Demande, useDemandesStore } from "../../stores/demandes-store";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// Props for the DemandeExterne component
interface DemandeExterneProps {
  demande: Demande;
  setDemandeShow: (demande: Demande | null) => void;
}

// Props for the QuantityAdjuster component
interface QuantityAdjusterProps {
  ligne: any; // Using any temporarily, should be properly typed
  onQuantityChange: (ligneId: number, newQuantity: number) => void;
  disabled?: boolean;
}

// Component for adjusting quantity
const QuantityAdjuster: React.FC<QuantityAdjusterProps> = ({ 
  ligne, 
  onQuantityChange, 
  disabled = false 
}) => {
  if (disabled) {
    return <>{+ligne.quantite_livre}</>;
  }

  return (
    <div className="flex items-center">
      <button
        className="p-2 bg-red-100 text-red-600 rounded-l-md hover:bg-red-200 transition-colors"
        onClick={() => onQuantityChange(ligne.id, +ligne.quantite_livre - 1)}
        disabled={+ligne.quantite_livre <= 0}
        aria-label="Diminuer la quantité"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <input
        min={0}
        max={+ligne.quantite_stock}
        type="number"
        value={+ligne.quantite_livre}
        onChange={(event) => onQuantityChange(ligne.id, +event.target.value)}
        className="w-16 px-2 py-1 border border-gray-300 text-center"
        aria-label="Quantité à livrer"
      />
      <button
        className="p-2 bg-green-100 text-green-600 rounded-r-md hover:bg-green-200 transition-colors"
        onClick={() => onQuantityChange(ligne.id, +ligne.quantite_livre + 1)}
        disabled={+ligne.quantite_livre >= +ligne.quantite_stock}
        aria-label="Augmenter la quantité"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Loading indicator component
const LoadingIndicator: React.FC = () => (
  <div className="flex justify-center items-center h-[300px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Main component
export const DemandeExterne: React.FC<DemandeExterneProps> = ({ demande, setDemandeShow }) => {
  const { printDemande, livrerDemande, fetchDemandesExtern, cancelDemande } = useDemandesStore();
  const [fetching, setFetching] = useState(false);
  const [demandeData, setDemandeData] = useState<Demande>(demande);

  // Handle printing a demand
  const handlePrint = async (id: number): Promise<void> => {
    setFetching(true);
    try {
      const response = await printDemande(id);
      
      // Remove existing iframe if it exists
      const existingIframe = document.getElementById("iframe");
      if (existingIframe) {
        existingIframe.remove();
      }
      
      // Create and configure the iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.id = "iframe";
      iframe.srcdoc = response.data;
      document.body.appendChild(iframe);
      
      // Focus and print
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (error) {
      console.error("Error printing demand:", error);
    } finally {
      setFetching(false);
    }
  };

  // Handle updating quantity for a line item
  const handleQuantityChange = (ligneId: number, newQuantity: number): void => {
    setDemandeData({
      ...demandeData,
      lignes: demandeData.lignes.map(ligne => 
        ligne.id === ligneId 
          ? { ...ligne, quantite_livre: newQuantity } 
          : ligne
      ),
    });
  };

  // Render demand line items
  const renderDemandeLignes = () => {
    if (!demandeData.lignes || demandeData.lignes.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="text-center p-3">Aucun article</td>
        </tr>
      );
    }

    return demandeData.lignes.map((ligne, index) => (
      <tr key={`${ligne.id}-${demande.id}-${index}`}>
        <td className="p-3 border-b border-gray-100">{ligne.article} ({ligne.article_reference})</td>
        <td className="p-3 border-b border-gray-100">{+ligne.quantite_demande}</td>
        <td className="p-3 border-b border-gray-100">
          <QuantityAdjuster 
            ligne={ligne} 
            onQuantityChange={handleQuantityChange}
            disabled={demande.statut !== 'Nouvelle'}
          />
        </td>
        <td className="p-3 border-b border-gray-100">{+ligne.quantite_stock}</td>
      </tr>
    ));
  };

  // Handle refusing a demand
  const handleRefuseDemande = async (id: number): Promise<void> => {
    setFetching(true);
    try {
      await cancelDemande(id);
      toast.success("Demande refusée");
      setDemandeShow(null);
      fetchDemandesExtern();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur !",
        text: "Veuillez réessayer plus tard",
        confirmButtonText: "Ok !",
        buttonsStyling: false,
        customClass: {
          confirmButton: "bg-red-500 text-white px-4 py-2 rounded-md mx-2",
        },
      });
    } finally {
      setFetching(false);
    }
  };

  // Handle delivering a demand
  const handleLivrerDemande = async (id: number): Promise<void> => {
    setFetching(true);
    try {
      const response = await livrerDemande(id, demandeData);
      setDemandeShow(null);
      toast.success(response.data);
      fetchDemandesExtern();
    } catch (error) {
      toast.error("Veuillez réessayer plus tard");
    } finally {
      setFetching(false);
    }
  };

  if (fetching) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="text-primary"
            onClick={() => setDemandeShow(null)}
            aria-label="Retour"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 12l6-6m-6 6l6 6m-6-6h10.5m5.5 0h-2.5"/>
            </svg>
          </button>
          <h5 className="ml-2 mb-0 text-xl font-semibold">{demande.reference}</h5>
        </div>
        <button 
          className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
          onClick={() => handlePrint(demandeData.id)}
          aria-label="Imprimer la demande"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
        </button>
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
              <span className="text-sm font-medium text-gray-500">Demandé par</span>
              <p className="mb-0 text-lg font-semibold text-gray-800 capitalize">{demande.magasin_entree}</p>
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
              {renderDemandeLignes()}
            </tbody>
          </table>
        </div>
        {demande.statut === 'Nouvelle' && (
          <div className="flex items-center gap-2 mt-4">
            <button 
              onClick={() => handleRefuseDemande(demandeData.id)} 
              className="flex-1 py-2 px-4 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors font-medium"
              aria-label="Refuser la demande"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Refuser
            </button>
            <button 
              onClick={() => handleLivrerDemande(demandeData.id)} 
              className="flex-1 py-2 px-4 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors font-medium"
              aria-label="Livrer la demande"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Livrer
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DemandeExterne;
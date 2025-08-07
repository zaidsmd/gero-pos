import { useEffect, useState, lazy, Suspense } from "react";
import {type Demande, useDemandesStore } from "../../stores/demandes-store";
import { endpoints } from "../../services/api";

// Lazy load DemandeExterne component to avoid circular dependency
const DemandeExterne = lazy(() => import("./DemandeExterne"));

// Component for displaying a single external demand in the table
interface DemandeRowProps {
  demande: Demande;
  onViewDemande: (demande: Demande) => void;
  onPrintDemande: (id: number) => void;
}

const DemandeRow: React.FC<DemandeRowProps> = ({ demande, onViewDemande, onPrintDemande }) => {
  return (
    <tr>
      <td className="p-3 border-b border-gray-100">{demande.reference}</td>
      <td className="p-3 border-b border-gray-100">{demande.magasin_entree}</td>
      <td className="p-3 border-b border-gray-100">{demande.statut}</td>
      <td className="p-3 border-b border-gray-100">
        <button 
          className="p-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors mr-2" 
          onClick={() => onViewDemande(demande)}
          aria-label="Voir la demande"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
          </svg>
        </button>
        {demande.statut === 'Livrée' && (
          <button 
            onClick={() => onPrintDemande(demande.id)} 
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            aria-label="Imprimer la demande"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18 7H6V3h12v4Zm0 5.5q.425 0 .713-.288T19 11.5q0-.425-.288-.713T18 10.5q-.425 0-.713.288T17 11.5q0 .425.288.713T18 12.5ZM16 19v-4H8v4h8Zm2 2H6v-4H2v-6q0-1.275.875-2.138T5 8h14q1.275 0 2.138.863T22 11v6h-4v4Z"/>
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
};

// Loading indicator component
const LoadingIndicator: React.FC = () => (
  <tr>
    <td colSpan={100} className="text-center p-3">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    </td>
  </tr>
);

// Empty state component
const EmptyState: React.FC = () => (
  <tr>
    <td colSpan={100} className="text-center p-3">Aucune demande</td>
  </tr>
);

// Props for the DemandesExterne component
interface DemandesExterneProps {
  refresh?: boolean;
}

export const DemandesExterne: React.FC<DemandesExterneProps> = ({ refresh }) => {
  const { demandesExtern, fetchDemandesExtern } = useDemandesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);

  // Function to print a demand
  const printDemande = async (id: number): Promise<void> => {
    try {
      const response = await endpoints.demandes.print(id);
      
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
    }
  };

  // Fetch external demands when the component mounts or when dependencies change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchDemandesExtern();
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!selectedDemande) {
      loadData();
    }
  }, [selectedDemande, refresh, fetchDemandesExtern]);

  return (
    <>
      {selectedDemande ? (
        <div className="fixed inset-0 bg-white z-50">
          <div className="h-full w-full p-4 flex flex-col">
            <Suspense fallback={
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              <DemandeExterne 
                demande={selectedDemande} 
                setDemandeShow={() => setSelectedDemande(null)} 
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-primary">
              <th className="p-3 text-left text-white font-medium">Référence</th>
              <th className="p-3 text-left text-white font-medium">Demandé par</th>
              <th className="p-3 text-left text-white font-medium">Statut</th>
              <th className="p-3 text-left text-white font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <LoadingIndicator />
            ) : demandesExtern.length > 0 ? (
              demandesExtern.map((demande) => (
                <DemandeRow 
                  key={`demande-externe-${demande.id}`}
                  demande={demande} 
                  onViewDemande={setSelectedDemande}
                  onPrintDemande={printDemande}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      )}
    </>
  );
};

export default DemandesExterne;
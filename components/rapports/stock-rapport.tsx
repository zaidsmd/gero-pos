import { useRapportsStore } from "../../stores/rapports-store";
import { useEffect } from "react";

const StockRapport = () => {
  const { stock, getStock, isLoading, isError, error } = useRapportsStore();

  useEffect(() => {
    getStock();
  }, [getStock]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h2 className="text-lg font-medium mb-3">Rapport de Stock</h2>

      {isLoading && <p className="text-sm text-gray-500">Chargement...</p>}
      {isError && <p className="text-sm text-red-600">{error || "Erreur lors du chargement"}</p>}

      {!isLoading && !isError && stock.length === 0 && (
        <p className="text-sm text-gray-500">Aucune donnée de stock pour le moment.</p>
      )}

      {stock.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Référence</th>
                <th className="py-2 pr-4">Désignation</th>
                <th className="py-2 pr-4">Stock</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{row.reference}</td>
                  <td className="py-2 pr-4">{row.designation}</td>
                  <td className="py-2 pr-4">{row.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockRapport;

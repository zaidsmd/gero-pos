import { useRapportsStore } from "../../stores/rapports-store";
import { useEffect, useMemo } from "react";
import { formatNumber } from "../../utils/formats";

export default function SaleByProductClientPage() {
  const {
    saleByProductAndCLient,
    getSaleByProductAndClient,
    isLoading,
    isError,
    error,
  } = useRapportsStore();

  useEffect(() => {
    getSaleByProductAndClient();
  }, []);



  const grandTotals = useMemo(() => {
    const totals = { total_ttc: 0, total_paye: 0 };
    const ct = saleByProductAndCLient?.client_totals || {};
    Object.values(ct).forEach((v: any) => {
      totals.total_ttc += Number(v?.total_ttc || 0);
      totals.total_paye += Number(v?.total_paye || 0);
    });
    return totals;
  }, [saleByProductAndCLient?.client_totals]);


  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-fadeIn">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="text-lg font-medium">Ventes par produit & client</h2>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          onClick={() => getSaleByProductAndClient()}
        >
          Actualiser
        </button>
      </div>

      {isError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-800" role="alert">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">Erreur</div>
              <div className="text-sm">{error || "Une erreur est survenue."}</div>
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={() => getSaleByProductAndClient()}
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto" id="rapport-table-container-ac" aria-live="polite">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ) : (
          <table className="min-w-max w-full text-sm text-gray-700 border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-gray-50 text-left font-medium text-gray-700 px-3 py-2 border border-gray-200">
                  Clients/Articles
                </th>
                {saleByProductAndCLient.articles?.map((article, index) => (
                  <th key={index} className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border border-gray-200 text-center font-medium text-gray-700">
                    {article}
                  </th>
                ))}
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border border-gray-200 text-center font-medium text-gray-700">Chiffre d'affaire</th>
                <th className="sticky top-0 z-10 bg-gray-50 px-3 py-2 border border-gray-200 text-center font-medium text-gray-700">Montant Payé</th>
              </tr>
            </thead>
            <tbody>
              {saleByProductAndCLient.clients?.map((client, clientIndex) => (
                <tr key={clientIndex} className="odd:bg-white even:bg-gray-50/50 hover:bg-gray-50">
                  <th className="sticky left-0 z-10 bg-white px-3 py-2 border border-gray-200 text-sm font-medium text-gray-700 align-middle">{client}</th>
                  {saleByProductAndCLient.articles?.map((article, articleIndex) => (
                    <td key={articleIndex} className="px-3 py-2 border border-gray-200 text-center align-middle">
                      {saleByProductAndCLient.data[client]?.[article] && (
                        <div className="cell-content">
                          <div className="quantity">
                            {saleByProductAndCLient.data[client][article].quantite > 0
                              ? saleByProductAndCLient.data[client][article].quantite
                              : ""}
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 border border-gray-200 text-center font-semibold">
                    {formatNumber(
                      saleByProductAndCLient.client_totals?.[client]?.total_ttc || 0,
                      true
                    )}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-center font-semibold">
                    {formatNumber(
                      saleByProductAndCLient.client_totals?.[client]?.total_paye || 0,
                      true
                    )}
                  </td>
                </tr>
              ))}
              {!(saleByProductAndCLient.clients?.length > 0) && (
                <tr>
                  <td colSpan={200} className="text-center text-gray-500 py-6">
                    Aucune donnée trouvée
                  </td>
                </tr>
              )}
            </tbody>
            {(saleByProductAndCLient.clients?.length || 0) > 0 && (
              <tfoot>
                <tr>
                  <th
                    className="sticky left-0 z-10 bg-gray-50 text-right px-3 py-2 border border-gray-200 font-semibold"
                    colSpan={1 + (saleByProductAndCLient.articles?.length || 0)}
                  >
                    Totaux
                  </th>
                  <td className="px-3 py-2 border border-gray-200 text-center font-bold">
                    {formatNumber(grandTotals.total_ttc || 0, true)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-center font-bold">
                    {formatNumber(grandTotals.total_paye || 0, true)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">Astuce: faites défiler horizontalement pour voir toutes les colonnes.</p>
    </div>
  );
}

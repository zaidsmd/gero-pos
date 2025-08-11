import { useRapportsStore } from "../../stores/rapports-store";
import {useEffect, useRef, useCallback, type RefObject} from "react";
import {printReport} from "../../utils/helpers";

const StockRapport = () => {
  const { stock, getStock, isLoading, isError, error } = useRapportsStore();
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStock();
  }, [getStock]);

  const handlePrint = useCallback(()=> printReport(tableRef,"Rapport de Stock"),[])
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium ">Rapport de Stock</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
            onClick={() => getStock()}
            disabled={isLoading}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 0-1.06 1.06l.72.72H9a7.75 7.75 0 1 0 0 15.5h.5a.75.75 0 0 0 0-1.5H9a6.25 6.25 0 0 1 0-12.5h2a.75.75 0 0 0 .53-1.28z" clipRule="evenodd"/><path fill="currentColor" d="M14.5 4.25a.75.75 0 0 0 0 1.5h.5a6.25 6.25 0 1 1 0 12.5h-2a.75.75 0 0 0-.53 1.28l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H15a7.75 7.75 0 0 0 0-15.5z" opacity="0.5"/></svg>
            Actualiser
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
            onClick={handlePrint}
            disabled={isLoading || stock.length === 0}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17.121 2.879C16.242 2 14.828 2 12 2s-4.243 0-5.122.879c-.492.492-.708 1.153-.804 2.136C6.634 5 7.252 5 7.93 5h8.142c.677 0 1.295 0 1.854.015c-.095-.983-.312-1.644-.804-2.136"></path><path fill="currentColor" fill-rule="evenodd" d="M18 14.5c0 2.828 0 5.743-.879 6.621C16.243 22 14.828 22 12 22s-4.243 0-5.121-.879C6 20.243 6 17.328 6 14.5zm-2.25 2.25a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 16h6a.75.75 0 0 1 .75.75m-2 3a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 19h4a.75.75 0 0 1 .75.75" clip-rule="evenodd"></path><path fill="currentColor" d="M15 17.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5zm-2 3a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5z" opacity="0.5"></path><path fill="currentColor" d="M16 6H8c-2.828 0-4.243 0-5.121.879C2 7.757 2 9.172 2 12s0 4.243.879 5.121c.494.495 1.158.711 2.149.806C5 17.204 5 15.352 5 14.5a.5.5 0 0 1 0-1h14a.5.5 0 0 1 0 1c0 .852 0 2.704-.028 3.427c.99-.095 1.655-.311 2.15-.806C22 16.243 22 14.828 22 12s0-4.243-.879-5.121C20.243 6 18.828 6 16 6" opacity="0.5"></path><path fill="currentColor" d="M9 10.75a.75.75 0 0 0 0-1.5H6a.75.75 0 0 0 0 1.5zm9-.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0"></path></svg>
            Imprimer
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Chargement...</p>}
      {isError && <p className="text-sm text-red-600">{error || "Erreur lors du chargement"}</p>}

      {!isLoading && !isError && stock.length === 0 && (
        <p className="text-sm text-gray-500">Aucune donnée de stock pour le moment.</p>
      )}

      {stock.length > 0 && (
        <div ref={tableRef} id="rapport-table-container" className="overflow-auto rounded-lg border border-gray-200 mt-5">
          <table className="min-w-full table-fixed text-sm text-gray-700">
            <thead>
              <tr className="bg-primary text-left text-white sticky top-0 z-10 shadow-sm">
                <th className="px-4 py-3 font-semibold tracking-wide rounded-tl-lg">Référence</th>
                <th className="px-4 py-3 font-semibold tracking-wide">Désignation</th>
                <th className="px-4 py-3 font-semibold tracking-wide text-right rounded-tr-lg">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stock.map((row) => (
                <tr key={row.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-3 align-middle whitespace-nowrap max-w-[14rem] truncate text-gray-900" title={row.reference}>{row.reference}</td>
                  <td className="px-4 py-3 align-middle max-w-[28rem] truncate" title={row.designation}>{row.designation}</td>
                  <td className="px-4 py-3 align-middle text-right tabular-nums font-semibold text-gray-900 w-24">{row.stock}</td>
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

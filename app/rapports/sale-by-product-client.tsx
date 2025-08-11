import {useRapportsStore} from "../../stores/rapports-store";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {formatNumber} from "../../utils/formats";
import {printReport} from "../../utils/helpers";

export default function SaleByProductClientPage() {
    const {
        saleByProductAndCLient,
        getSaleByProductAndClient,
        isLoading,
        isError,
        error,
    } = useRapportsStore();
    const tableRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        getSaleByProductAndClient();
    }, []);

    const handlePrint = useCallback(()=> printReport(tableRef,"Ventes par produit & client"),[])


    const grandTotals = useMemo(() => {
        const totals = {total_ttc: 0, total_paye: 0};
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
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
                        onClick={() => getSaleByProductAndClient()}
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 0-1.06 1.06l.72.72H9a7.75 7.75 0 1 0 0 15.5h.5a.75.75 0 0 0 0-1.5H9a6.25 6.25 0 0 1 0-12.5h2a.75.75 0 0 0 .53-1.28z" clipRule="evenodd"/><path fill="currentColor" d="M14.5 4.25a.75.75 0 0 0 0 1.5h.5a6.25 6.25 0 1 1 0 12.5h-2a.75.75 0 0 0-.53 1.28l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H15a7.75 7.75 0 0 0 0-15.5z" opacity="0.5"/></svg>
                        Actualiser
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
                        onClick={handlePrint}
                        disabled={isLoading || !((saleByProductAndCLient.clients?.length || 0) > 0)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17.121 2.879C16.242 2 14.828 2 12 2s-4.243 0-5.122.879c-.492.492-.708 1.153-.804 2.136C6.634 5 7.252 5 7.93 5h8.142c.677 0 1.295 0 1.854.015c-.095-.983-.312-1.644-.804-2.136"></path><path fill="currentColor" fill-rule="evenodd" d="M18 14.5c0 2.828 0 5.743-.879 6.621C16.243 22 14.828 22 12 22s-4.243 0-5.121-.879C6 20.243 6 17.328 6 14.5zm-2.25 2.25a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 16h6a.75.75 0 0 1 .75.75m-2 3a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 19h4a.75.75 0 0 1 .75.75" clip-rule="evenodd"></path><path fill="currentColor" d="M15 17.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5zm-2 3a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5z" opacity="0.5"></path><path fill="currentColor" d="M16 6H8c-2.828 0-4.243 0-5.121.879C2 7.757 2 9.172 2 12s0 4.243.879 5.121c.494.495 1.158.711 2.149.806C5 17.204 5 15.352 5 14.5a.5.5 0 0 1 0-1h14a.5.5 0 0 1 0 1c0 .852 0 2.704-.028 3.427c.99-.095 1.655-.311 2.15-.806C22 16.243 22 14.828 22 12s0-4.243-.879-5.121C20.243 6 18.828 6 16 6" opacity="0.5"></path><path fill="currentColor" d="M9 10.75a.75.75 0 0 0 0-1.5H6a.75.75 0 0 0 0 1.5zm9-.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0"></path></svg>
                        Imprimer
                    </button>
                </div>
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

            <div className="overflow-auto rounded-lg border border-gray-200 mt-5"
                 ref={tableRef}
                 aria-live="polite">
                {isLoading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/3"/>
                            <div className="h-4 bg-gray-200 rounded w-1/2"/>
                            <div className="h-4 bg-gray-200 rounded w-full"/>
                            <div className="h-4 bg-gray-200 rounded w-5/6"/>
                            <div className="h-4 bg-gray-200 rounded w-4/6"/>
                        </div>
                    </div>
                ) : (
                    <table className="min-w-full table-fixed text-sm text-gray-700" >
                        <thead>
                        <tr className="bg-primary text-left text-white sticky top-0 z-10 shadow-sm">
                            <th className="px-4 py-3 font-semibold tracking-wide rounded-tl-lg">Clients/Articles</th>
                            {saleByProductAndCLient.articles?.map((article, index) => (
                                <th key={index} className="px-4 py-3 font-semibold tracking-wide text-center">
                                    {article}
                                </th>
                            ))}
                            <th className="px-4 py-3 font-semibold tracking-wide text-right">Chiffre d'affaire</th>
                            <th className="px-4 py-3 font-semibold tracking-wide text-right rounded-tr-lg">Montant
                                Payé
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {saleByProductAndCLient.clients?.map((client, clientIndex) => (
                            <tr key={clientIndex}
                                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                                <td className="px-4 py-3 align-middle whitespace-nowrap max-w-[18rem] truncate text-gray-900 font-medium">{client}</td>
                                {saleByProductAndCLient.articles?.map((article, articleIndex) => (
                                    <td key={articleIndex} className="px-4 py-3 align-middle text-center">
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
                                <td className="px-4 py-3 align-middle text-right tabular-nums font-semibold text-gray-900">
                                    {formatNumber(
                                        saleByProductAndCLient.client_totals?.[client]?.total_ttc || 0,
                                        true
                                    )}
                                </td>
                                <td className="px-4 py-3 align-middle text-right tabular-nums font-semibold text-gray-900">
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
                                    className="text-right px-4 py-3 font-semibold"
                                    colSpan={1 + (saleByProductAndCLient.articles?.length || 0)}
                                >
                                    Totaux
                                </th>
                                <td className="px-4 py-3 text-right tabular-nums font-bold text-gray-900">
                                    {formatNumber(grandTotals.total_ttc || 0, true)}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums font-bold text-gray-900">
                                    {formatNumber(grandTotals.total_paye || 0, true)}
                                </td>
                            </tr>
                            </tfoot>
                        )}
                    </table>
                )}
            </div>
        </div>
    );
}

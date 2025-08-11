import { useRapportsStore } from "../../stores/rapports-store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { printReport } from "../../utils/helpers";
import { formatNumber } from "../../utils/formats";

export default function TreasuryPage() {
  const { isLoading, treasury, getTreasury, error, isError } = useRapportsStore();
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTreasury();
  }, []);

  const canPrint = useMemo(() => {
    const values = Object.values(treasury || {});
    return values.some((v) => Number(v || 0) > 0);
  }, [treasury]);

  const handlePrint = useCallback(() => printReport(tableRef, "Rapport de Trésorerie"), []);

  const cards = useMemo(() => ([
    {
      key: "total_vente",
      label: "Chiffre d'affaires",
      value: treasury.total_vente,
      accent: "from-emerald-50 to-emerald-100 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M5 3a2 2 0 0 0-2 2v1h18V5a2 2 0 0 0-2-2z"/>
          <path fill="currentColor" d="M21 8H3v9a2 2 0 0 0 2 2h8.5a5.5 5.5 0 0 1 7.5-7.5z" opacity=".5"/>
          <path fill="currentColor" d="M23 17.5A3.5 3.5 0 1 1 19.5 14A3.5 3.5 0 0 1 23 17.5m-3.25-1.75a.75.75 0 0 0-1.5 0v1.75a.75.75 0 0 0 .75.75h1.75a.75.75 0 0 0 0-1.5H19.75z"/>
        </svg>
      )
    },
    {
      key: "total_espece",
      label: "Espèces",
      value: treasury.total_espece,
      accent: "from-sky-50 to-sky-100 border-sky-200",
      iconBg: "bg-sky-100 text-sky-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21 5H3a2 2 0 0 0-2 2v5h22V7a2 2 0 0 0-2-2"/><path fill="currentColor" d="M1 12v5a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-5zm11 3.5A2.5 2.5 0 1 1 14.5 13A2.5 2.5 0 0 1 12 15.5" opacity=".5"/></svg>
      )
    },
    {
      key: "total_cheque",
      label: "Chèques",
      value: treasury.total_cheque,
      accent: "from-indigo-50 to-indigo-100 border-indigo-200",
      iconBg: "bg-indigo-100 text-indigo-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6a2 2 0 0 0-2 2v8h22V8a2 2 0 0 0-2-2z"/><path fill="currentColor" d="M3 18h18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" opacity=".5"/></svg>
      )
    },
    {
      key: "total_lcn",
      label: "LCN",
      value: treasury.total_lcn,
      accent: "from-violet-50 to-violet-100 border-violet-200",
      iconBg: "bg-violet-100 text-violet-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 4h18v8H3z"/><path fill="currentColor" d="M3 12h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" opacity=".5"/></svg>
      )
    },
    {
      key: "total_depenses",
      label: "Dépenses",
      value: treasury.total_depenses,
      accent: "from-rose-50 to-rose-100 border-rose-200",
      iconBg: "bg-rose-100 text-rose-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7z"/><path fill="currentColor" d="M13 3v7.586l2.707 2.707l1.414-1.414L15 9.586V3z" opacity=".5"/></svg>
      )
    },
    {
      key: "reste_en_caisse",
      label: "Reste en caisse",
      value: treasury.reste_en_caisse,
      accent: "from-teal-50 to-teal-100 border-teal-200",
      iconBg: "bg-teal-100 text-teal-700",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10H12z"/><path fill="currentColor" d="M12 2v10h10A10 10 0 0 0 12 2" opacity=".5"/></svg>
      )
    }
  ]), [treasury]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-fadeIn">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-lg font-medium">Trésorerie</h2>
          <p className="text-xs text-gray-500">Aperçu des montants par moyen de paiement</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
            onClick={() => getTreasury()}
            disabled={isLoading}
            aria-label="Actualiser les données de trésorerie"
            title="Actualiser"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="1.5em" height="1.5em" viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 0-1.06 1.06l.72.72H9a7.75 7.75 0 1 0 0 15.5h.5a.75.75 0 0 0 0-1.5H9a6.25 6.25 0 0 1 0-12.5h2a.75.75 0 0 0 .53-1.28z" clipRule="evenodd"/>
              <path fill="currentColor" d="M14.5 4.25a.75.75 0 0 0 0 1.5h.5a6.25 6.25 0 1 1 0 12.5h-2a.75.75 0 0 0-.53 1.28l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H15a7.75 7.75 0 0 0 0-15.5z" opacity="0.5"/>
            </svg>
            Actualiser
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
            onClick={handlePrint}
            disabled={isLoading || !canPrint}
            aria-label="Imprimer le rapport de trésorerie"
            title={canPrint ? "Imprimer" : "Aucune donnée à imprimer"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17.121 2.879C16.242 2 14.828 2 12 2s-4.243 0-5.122.879c-.492.492-.708 1.153-.804 2.136C6.634 5 7.252 5 7.93 5h8.142c.677 0 1.295 0 1.854.015c-.095-.983-.312-1.644-.804-2.136"></path>
              <path fill="currentColor" fillRule="evenodd" d="M18 14.5c0 2.828 0 5.743-.879 6.621C16.243 22 14.828 22 12 22s-4.243 0-5.121-.879C6 20.243 6 17.328 6 14.5zm-2.25 2.25a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 16h6a.75.75 0 0 1 .75.75m-2 3a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 19h4a.75.75 0 0 1 .75.75" clipRule="evenodd"></path>
              <path fill="currentColor" d="M15 17.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5zm-2 3a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5z" opacity="0.5"></path>
              <path fill="currentColor" d="M16 6H8c-2.828 0-4.243 0-5.121.879C2 7.757 2 9.172 2 12s0 4.243.879 5.121c.494.495 1.158.711 2.149.806C5 17.204 5 15.352 5 14.5a.5.5 0 0 1 0-1h14a.5.5 0 0 1 0 1c0 .852 0 2.704-.028 3.427c.99-.095 1.655-.311 2.15-.806C22 16.243 22 14.828 22 12s0-4.243-.879-5.121C20.243 6 18.828 6 16 6" opacity="0.5"></path>
              <path fill="currentColor" d="M9 10.75a.75.75 0 0 0 0-1.5H6a.75.75 0 0 0 0 1.5zm9-.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0"></path>
            </svg>
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
              onClick={() => getTreasury()}
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      <div className="mt-5" ref={tableRef} aria-live="polite">
        {isLoading ? (
          <div className="p-6 rounded-lg border border-gray-200">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded"/>
              <div className="h-24 bg-gray-200 rounded"/>
              <div className="h-24 bg-gray-200 rounded"/>
              <div className="h-24 bg-gray-200 rounded"/>
              <div className="h-24 bg-gray-200 rounded"/>
              <div className="h-24 bg-gray-200 rounded"/>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div key={card.key} className="rounded-lg border border-gray-200 p-4 bg-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                  <span className="inline-flex items-center justify-center h-4 w-4" aria-hidden>
                    {card.icon}
                  </span>
                  <span>{card.label}</span>
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
                  {formatNumber(Number(card.value || 0), true)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

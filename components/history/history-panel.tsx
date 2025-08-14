import React, {useEffect, useMemo, useState} from 'react';
import {endpoints} from '../../services/api';
import {formatNumber} from "../../utils/formats";
import { useAuth } from '../auth/auth-provider';

// Print a block of HTML without opening a new window by using a hidden iframe
const printHtmlInHiddenIframe = async (html: string): Promise<void> => {
    return new Promise((resolve) => {
        try {
            const finalHtml = /<html[\s\S]*<\/html>/i.test(html)
                ? html
                : `<!doctype html><html><head><meta charset=\"utf-8\"/><title>Ticket</title></head><body>${html}</body></html>`;

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (!doc) {
                document.body.removeChild(iframe);
                resolve();
                return;
            }
            doc.open();
            doc.write(finalHtml);
            doc.close();

            const triggerPrint = () => {
                try {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                } catch {}
                // cleanup a bit later to allow print dialog to spawn
                setTimeout(() => {
                    try { document.body.removeChild(iframe); } catch {}
                    resolve();
                }, 1000);
            };

            // Ensure styles and content are loaded
            if ((iframe as any).onload !== undefined) {
                iframe.onload = triggerPrint;
            } else {
                // Fallback if onload isn't reliable
                setTimeout(triggerPrint, 300);
            }
        } catch {
            resolve();
        }
    });
};

type HistoryResponse = {
    depenses: any[];
    ventes: Vente[];
    retours: Vente[];
};

type Vente = {
    id: number,
    reference: string,
    statut: string,
    time: string,
    total_ttc: number,
    total: string,
    type: string,
    client_nom: string,
    lignes: VenteItem[],
}

type VenteItem = {
    article:string,
    article_reference:string,
    price:string,
    quantity:number,
    total_ttc:string,
    unite:string,
}

type TabKey = 'ventes' | 'retours' | 'depenses';


const ItemRow: React.FC<{ item: any; onClick?: () => void; onPrint?: () => void; printing?: boolean }> = ({item, onClick, onPrint, printing}) => {
    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between py-2 border-b border-gray-100 text-sm hover:bg-gray-50 rounded-md px-2 cursor-pointer"
        >
            <div className="flex flex-col">
                <span className="font-medium text-[#3b5461]">{item.reference ?? '—'}</span>
                <span className="text-gray-500">{item.time}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right font-semibold">{formatNumber(item.total_ttc, true)}</div>
                <button
                    type="button"
                    title="Imprimer le ticket"
                    onClick={(e) => { e.stopPropagation(); onPrint && onPrint(); }}
                    disabled={printing}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${printing ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-[#3b5461] hover:bg-gray-200'}`}
                >
                    {printing ? (
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2v4a1 1 0 0 1-2 0V2a1 1 0 1 1 2 0m0 16v4a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0M4.222 4.222l2.828 2.829A1 1 0 0 1 5.636 8L2.808 5.172a1 1 0 0 1 1.414-1.414M18.364 16a1 1 0 0 1 1.414 0l2.828 2.829a1 1 0 0 1-1.414 1.414L18.364 17.414A1 1 0 0 1 18.364 16M2 12h4a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2m16 0h4a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2M4.222 19.778A1 1 0 0 1 2.808 18.364l2.828-2.828A1 1 0 0 1 7.05 16.95l-2.828 2.828a1 1 0 0 1-1.414 0M18.364 8a1 1 0 0 1 0-1.414l2.828-2.829a1 1 0 1 1 1.414 1.414L19.778 8A1 1 0 0 1 18.364 8"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17.121 2.879C16.242 2 14.828 2 12 2s-4.243 0-5.122.879c-.492.492-.708 1.153-.804 2.136C6.634 5 7.252 5 7.93 5h8.142c.677 0 1.295 0 1.854.015c-.095-.983-.312-1.644-.804-2.136"/><path fill="currentColor" fillRule="evenodd" d="M18 14.5c0 2.828 0 5.743-.879 6.621C16.243 22 14.828 22 12 22s-4.243 0-5.121-.879C6 20.243 6 17.328 6 14.5zm-2.25 2.25a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 16h6a.75.75 0 0 1 .75.75m-2 3a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 19h4a.75.75 0 0 1 .75.75" clipRule="evenodd"/><path fill="currentColor" d="M15 17.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5zm-2 3a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5z" opacity="0.5"/><path fill="currentColor" d="M16 6H8c-2.828 0-4.243 0-5.121.879C2 7.757 2 9.172 2 12s0 4.243.879 5.121c.494.495 1.158.711 2.149.806C5 17.204 5 15.352 5 14.5a.5.5 0 0 1 0-1h14a.5.5 0 0 1 0 1c0 .852 0 2.704-.028 3.427c.99-.095 1.655-.311 2.15-.806C22 16.243 22 14.828 22 12s0-4.243-.879-5.121C20.243 6 18.828 6 16 6" opacity="0.5"/><path fill="currentColor" d="M9 10.75a.75.75 0 0 0 0-1.5H6a.75.75 0 0 0 0 1.5zm9-.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0"/></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

// Specialized card for Depense items (improved UI)
const DepenseCard: React.FC<{ item: any }> = ({item}) => {
    const reference = item?.reference ?? item?.numero ?? item?.code ?? item?.id ?? '—';
    const date = item?.date ?? item?.created_at ?? item?.createdAt ?? item?.datetime ?? '';
    const nom = item?.nom ?? '—';
    const beneficiaire = item?.beneficiaire ?? '—';
    const category = item?.category ?? item?.categorie ?? '—';
    const totalRaw = item?.total ?? item?.total_ttc ?? item?.montant ?? item?.montant_ttc ?? null;
    const totalFmt = totalRaw != null ? formatNumber(totalRaw, true) : '';

    return (
        <div
            className="rounded-xl border border-gray-200 bg-white p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Header: Ref and Date chips */}
            <div className="flex items-center justify-between mb-3">
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#3b5461]/10 text-[#3b5461]">
          {reference}
        </span>
                {date && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs text-gray-600 bg-gray-100">
            {String(date)}
          </span>
                )}
            </div>

            {/* Body rows */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Dépense</span>
                    <span className="text-gray-900 font-medium text-sm">{nom}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Bénéficiaire</span>
                    <span className="text-gray-900 font-medium text-sm">{beneficiaire}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Catégorie</span>
                    <span className="text-gray-900 font-medium text-sm">{category}</span>
                </div>
                <div className="h-px bg-gray-100 my-2"/>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Montant TTC</span>
                    <span className="text-emerald-600 font-semibold text-base">{totalFmt}</span>
                </div>
            </div>
        </div>
    );
};

// Modal to show Vente/Retour details (improved UI)
const VenteDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; item: Vente | null }> = ({
                                                                                                     isOpen,
                                                                                                     onClose,
                                                                                                     item
                                                                                                 }) => {
    if (!isOpen || !item) return null;

    const [printing, setPrinting] = useState(false);

    const typeRaw = item?.type;
    const typeStr = String(typeRaw || '').toLowerCase();
    const isRetour = ['retour', 'br', 'return'].some(k => typeStr.includes(k));
    const typeLabel = isRetour ? 'Retour' : 'Vente';

    const reference = item?.reference;
    const clientNom = item?.client_nom;
    const timeRaw = item?.time;
    let time = '' as string;
    if (timeRaw) {
        const d = new Date(timeRaw);
        if (!isNaN(d.getTime())) {
            const datePart = new Intl.DateTimeFormat('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(d);
            const timePart = new Intl.DateTimeFormat('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(d);
            time = `${datePart} ${timePart}`;
        } else {
            time = String(timeRaw);
        }
    }
    const statut = item?.statut ;
    const total = item?.total_ttc ?? item?.total ?? 0;

    const lignes =  item.lignes;
    const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
    const typeBadge = isRetour
        ? `${badgeBase} bg-red-50 text-red-600 border border-red-200`
        : `${badgeBase} bg-emerald-50 text-emerald-600 border border-emerald-200`;

    const statutBadge = `${badgeBase} bg-slate-50 text-slate-600 border border-slate-200`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
            <div className="relative bg-white w-full max-w-5xl mx-4 rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className={typeBadge}>{typeLabel}</span>
                        <h5 className="text-lg font-semibold text-[#3b5461]">{reference}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={statutBadge}>{statut}</span>
                        <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                <path fill="currentColor"
                                      d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59L7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                            <div
                                className="rounded bg-blue-50 text-blue-600 p-2 w-[44px] h-[44px] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                    <path fill="currentColor"
                                          d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10m-7 9a7 7 0 1 1 14 0z"/>
                                </svg>
                            </div>
                            <div className="ms-3">
                                <span className="font-semibold text-xs text-gray-600">Référence</span>
                                <p className="mb-0 text-sm text-gray-900">{reference}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div
                                className="rounded bg-emerald-50 text-emerald-600 p-2 w-[44px] h-[44px] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 3L1 9l11 6l9-4.91V17h2V9z"/>
                                </svg>
                            </div>
                            <div className="ms-3">
                                <span className="font-semibold text-xs text-gray-600">Client</span>
                                <p className="mb-0 text-sm text-gray-900 capitalize">{clientNom}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div
                                className="rounded bg-rose-50 text-rose-600 p-2 w-[44px] h-[44px] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                    <path fill="currentColor"
                                          d="M6 2h12a2 2 0 0 1 2 2v14.8l-3.6-2.4l-2.7 2.7l-3.6-2.4l-2.7 2.7L4 18.8V4a2 2 0 0 1 2-2"/>
                                </svg>
                            </div>
                            <div className="ms-3">
                                <span className="font-semibold text-xs text-gray-600">Date d'émission</span>
                                <p className="mb-0 text-sm text-gray-900">{time}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div
                                className="rounded bg-violet-50 text-violet-600 p-2 w-[44px] h-[44px] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                    <path fill="currentColor"
                                          d="M4 20h16v2H4zm1-2h14.01l-2.363-6.85A4.002 4.002 0 0 0 12.838 9H11.16a4.002 4.002 0 0 0-3.81 2.15zM13 4h-2v3h2zm-1 9a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/>
                                </svg>
                            </div>
                            <div className="ms-3">
                                <span className="font-semibold text-xs text-gray-600">Montant TTC</span>
                                <p className="mb-0 text-sm text-gray-900">{formatNumber(total, true)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 overflow-auto rounded border border-gray-100">
                        <table className="w-full min-w-[720px]">
                            <thead className="bg-[#3b5461] text-white sticky top-0">
                            <tr>
                                <th className="text-left px-3 py-2">Produit</th>
                                <th className="text-left px-3 py-2">Quantité</th>
                                <th className="text-right px-3 py-2">Prix</th>
                                <th className="text-right px-3 py-2">Total</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {lignes.map((raw: any, index: number) => {
                                return (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-3 py-2">{raw.article}</td>
                                        <td className="px-3 py-2">{raw.quantity} {raw.unite}</td>
                                        <td className="px-3 py-2 text-right">{raw.price}</td>
                                        <td className="px-3 py-2 text-right">{raw.total_ttc}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

const EmptyState: React.FC<{ text: string }> = ({text}) => (
    <div className="text-center text-gray-500 py-6 text-sm">{text}</div>
);

const HistoryPanel: React.FC<{ sessionId?: string | number }> = ({sessionId}) => {
    const { sessionId: authSessionId } = useAuth();
    const effectiveSessionId = sessionId ?? authSessionId ?? undefined;

    const [activeTab, setActiveTab] = useState<TabKey>('ventes');
    const [data, setData] = useState<HistoryResponse>({depenses: [], ventes: [], retours: []});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetailsOpen, setShowDetailsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [printingId, setPrintingId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!effectiveSessionId) {
                setData({depenses: [], ventes: [], retours: []});
                return;
            }
            const res = await endpoints.history.getSessionHistory(effectiveSessionId);
            setData(res.data as HistoryResponse);
        } catch (e: any) {
            setError('Impossible de charger l\'historique');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveSessionId]);

    const tabCounts = useMemo(() => ({
        ventes: data.ventes?.length ?? 0,
        retours: data.retours?.length ?? 0,
        depenses: data.depenses?.length ?? 0,
    }), [data]);

    const list = activeTab === 'ventes' ? data.ventes : activeTab === 'retours' ? data.retours : data.depenses;

    const handlePrintFromList = async (id?: number) => {
        if (!id) return;
        try {
            setPrintingId(id);
            const res = await endpoints.orders.getTicket(id);
            const html = typeof res.data === 'string' ? res.data : (res.data?.template || res.data?.html || '');
            if (html) {
                await printHtmlInHiddenIframe(html);
            } else {
                console.warn('Aucun contenu de ticket reçu');
            }
        } catch (e) {
            console.error('Erreur d\'impression du ticket', e);
        } finally {
            setPrintingId(null);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h5 className="text-[#3b5461] font-medium">Historique</h5>
                <button
                    onClick={load}
                    className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-[#3b5461]"
                >
                    Actualiser
                </button>
            </div>

            <div className="flex mb-3">
                {(['ventes', 'retours', 'depenses'] as TabKey[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`mr-2 px-3 py-1 rounded-full text-sm transition-colors ${
                            activeTab === key ? 'bg-[#3b5461] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        <span className="ml-2 inline-block min-w-5 text-center bg-white/20 rounded-full px-2">
              {tabCounts[key]}
            </span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                {loading && <EmptyState text="Chargement..."/>}
                {!loading && error && <EmptyState text={error}/>}
                {!loading && !error && (!list || list.length === 0) && (
                    <EmptyState text="Aucun élément"/>
                )}
                {!loading && !error && list && list.length > 0 && (
                    <div>
                        {list.map((item: any, idx: number) => (
                            activeTab === 'depenses' ? (
                                <DepenseCard key={idx} item={item}/>
                            ) : (
                                <ItemRow
                                    key={idx}
                                    item={item}
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setShowDetailsOpen(true);
                                    }}
                                    onPrint={() => handlePrintFromList(item?.id)}
                                    printing={printingId === item?.id}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
            <VenteDetailsModal
                isOpen={showDetailsOpen}
                onClose={() => {
                    setShowDetailsOpen(false);
                    setSelectedItem(null);
                }}
                item={selectedItem}
            />
        </div>
    );
};

export default HistoryPanel;

// Mount the details modal at the end so it overlays properly
// It relies on HistoryPanel state above
// Note: keeping export default as HistoryPanel

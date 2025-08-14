import React, { useEffect, useMemo, useState, useRef } from 'react';
import { endpoints } from '../../services/api';
import { usePOSStore } from '~/pos/pos-store';
import {toast} from "react-toastify";
import { useSettingsStore } from "../../stores/settings-store";
import PaymentModal, { type PaymentData } from "../cart/payment-modal";
import {formatNumber} from "../../utils/formats";

interface Option {
  value: string | number;
  label: string;
}

const CaissePanel: React.FC = () => {
  const { cart, cartTotal, checkout, clearCart, lastOrderId, lastOrderTotal, lastOrderPaid, isPaymentComplete, addPaymentToOrder, clearLastOrderInfo } = usePOSStore();

  // Local state for inputs
  const [paiementRecu, setPaiementRecu] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [methodId, setMethodId] = useState<string | number>('');
  const [accountId, setAccountId] = useState<string | number>('');
  const [expectedDate, setExpectedDate] = useState<string>('');

  // Options
  const [methods, setMethods] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Success UI and printing state (for caisse checkout)
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [ticketTemplate, setTicketTemplate] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { features } = useSettingsStore();

  // Additional payment & modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isAdditionalPayment, setIsAdditionalPayment] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string> | null | undefined>(null);


  useEffect(() => {
      setPaiementRecu(cartTotal.toFixed(2));
  }, [cartTotal]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accRes, methRes] = await Promise.all([
          endpoints.payment.getAccounts(),
          endpoints.payment.getPaymentMethods(),
        ]);
        const accData = accRes.data as any[];
        const methData = methRes.data as any[];

        setAccounts(accData);
        setMethods(methData);

        // Set defaults if not already selected
        if (!accountId && accData && accData.length > 0) {
          setAccountId(accData[0].value);
        }
        if (!methodId && methData && methData.length > 0) {
          const lower = (s: any) => String(s ?? '').toLowerCase();
          let def = methData.find((m: any) => lower(m.value) === 'especes' || lower(m.label).includes('esp'));
          if (!def) {
            def = methData.find((m: any) => lower(m.value) !== 'credit') || methData[0];
          }
          setMethodId(def.value);
        }
      } catch (e) {
        console.error('Failed to fetch payment data', e);
        setError('Erreur lors du chargement des méthodes/compte.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/cashout.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // --- Helpers to enforce SOLID (SRP/DRY) ---
  type CheckoutResponseData = {
    message?: string;
    template?: string | null;
    vente_id?: string | number | null;
  };

  const resolveTicketTemplateFromData = async (data: CheckoutResponseData): Promise<string | null> => {
    const tpl = data?.template ?? null;
    if (tpl) return tpl as string;
    const id = (data?.vente_id as string | number | undefined) || lastOrderId;
    if (!id) return null;
    try {
      const tr = await endpoints.orders.getTicket(id);
      const html = (tr.data && (tr.data as any).template) ?? tr.data ?? null;
      return (html as string) ?? null;
    } catch (err) {
      console.warn('Failed to fetch ticket template:', err);
      return null;
    }
  };

  const playSuccessSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error('Error playing sound:', err));
    }
  };

  const handleCheckoutSuccess = async (response: any) => {
    const data: CheckoutResponseData = (response?.data ?? {}) as CheckoutResponseData;
    setSuccessMessage(data?.message || 'Paiement effectué');
    const tpl = await resolveTicketTemplateFromData(data);
    if (tpl) setTicketTemplate(tpl);
    setShowSuccessToast(true);
    playSuccessSound();
  };

  const handlePrintTicket = () => {
    if (!ticketTemplate) {
      toast.warning("Aucun ticket à imprimer");
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Impossible de créer le document d'impression");
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(ticketTemplate);
    iframeDoc.close();

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (err) {
        console.error("Error printing:", err);
        toast.error("Erreur lors de l'impression");
        document.body.removeChild(iframe);
      }
    };
  };

  useEffect(() => {
    if (ticketTemplate && features.autoTicketPrinting && features.ticketPrinting) {
      const timer = setTimeout(() => {
        handlePrintTicket();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ticketTemplate, features.autoTicketPrinting, features.ticketPrinting]);

  const handleAdditionalPayment = () => {
    if (!lastOrderId) {
      toast.warning("Aucune commande à compléter");
      return;
    }
    setIsAdditionalPayment(true);
    setShowPaymentModal(true);
  };

  const handlePaymentError = (err: any) => {
    if (err.response?.data?.error) {
      toast.error(err.response.data.error);
    } else if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      const formattedErrors: Record<string, string> = {};
      Object.entries(errors).forEach(([key, value]) => {
        formattedErrors[key] = Array.isArray(value) ? value[0] : (value as string);
      });
      setServerErrors(formattedErrors);
    } else {
      toast.error("Une erreur s'est produite lors du traitement du paiement");
    }
  };

  const handlePaymentSubmit = async (paymentData: PaymentData) => {
    setServerErrors(null);
    try {
      if (isAdditionalPayment && lastOrderId) {
        await addPaymentToOrder(lastOrderId, paymentData);
        setSuccessMessage('Paiement supplémentaire ajouté avec succès');
        setShowSuccessToast(true);
        setShowPaymentModal(false);
        setIsAdditionalPayment(false);
        playSuccessSound();
        return;
      }
      const response = await checkout(paymentData);
      await handleCheckoutSuccess(response);
      setShowPaymentModal(false);
    } catch (err: any) {
      handlePaymentError(err);
    }
  };

  const total = cartTotal || 0;
  const received = useMemo(() => {
    const n = parseFloat(paiementRecu || '0');
    return isNaN(n) ? 0 : n;
  }, [paiementRecu]);

  const paymentRemaining = useMemo(() => {
    const remaining = total - received;
    return remaining > 0 ? remaining : 0;
  }, [total, received]);

  const refundAmount = useMemo(() => {
    const refund = received - total;
    return refund > 0 ? refund : 0;
  }, [total, received]);

  const itemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [cart]);

  const requiresAdditionalFields = (id: string | number) => {
    return id === 'lcn' || id === 'cheque' || id === 'credit';
  };

  const clearAll = () =>{
      resetAll();
      clearCart();
  }
  const resetAll = () => {
    setPaiementRecu('0.00');
    setReference('');
    setNote('');
    setExpectedDate('');
  };

  const payer = async () => {
    try {
      // Basic validations
      if (!methodId) {
        toast.warning('Veuillez sélectionner une méthode de paiement');
        return;
      }

      // Handle credit specially
      const isCredit = methodId === 'credit';

      if (!isCredit) {
        if (!accountId) {
          toast.warning('Veuillez sélectionner un compte');
          return;
        }
        const amountNumber = Math.max(0, Math.min(received, total)); // do not exceed total
        if (amountNumber <= 0) {
          toast.warning('Veuillez saisir un montant valide');
          return;
        }
        // For cheque/LCN, expected date is usually required
        if ((methodId === 'cheque' || methodId === 'lcn') && !expectedDate) {
          toast.warning('Veuillez sélectionner une date prévue');
          return;
        }

        const response = await checkout({
          amount: amountNumber,
          accountId: accountId,
          paymentMethodId: methodId,
          note: note,
          checkReference: reference || undefined,
          expectedDate: expectedDate || undefined,
        } as any);
        await handleCheckoutSuccess(response);
      } else {
        // Credit sale
        const response = await checkout({
          amount: 0,
          accountId: '',
          paymentMethodId: 'credit',
          note: note,
          checkReference: reference || undefined,
          credit: true,
        } as any);
        await handleCheckoutSuccess(response);
      }

      resetAll();
    } catch (e: any) {
      console.error('Payment failed', e);
      toast.error(e?.response?.data?.message || 'Le paiement a échoué');
    }
  };

  return (
    <div className="relative h-full">
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <svg
                  className="h-12 w-12 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="mb-6 text-lg font-semibold text-gray-800">
                {successMessage}
              </p>
              <div className="flex flex-col space-y-2">
                {ticketTemplate && features.ticketPrinting && (
                  <button
                    onClick={handlePrintTicket}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Imprimer le ticket
                  </button>
                )}
                {!isPaymentComplete() && lastOrderId && (
                  <button
                    onClick={() => {
                      setShowSuccessToast(false);
                      setTicketTemplate(null);
                      handleAdditionalPayment();
                    }}
                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    Ajouter un paiement
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSuccessToast(false);
                    setTicketTemplate(null);
                    clearLastOrderInfo();
                  }}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute inset-1 flex flex-col bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Paiement reçu</label>
                <input
                  type="number"
                  value={paiementRecu}
                  onChange={(e) => setPaiementRecu(e.target.value)}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 px-3 py-2"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Référence</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 px-3 py-2"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Montant restant</label>
                <input
                  type="text"
                  value={formatNumber(paymentRemaining,true)}
                  readOnly
                  className="w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 px-3 py-2"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Montant du retour</label>
                <input
                  type="text"
                  value={formatNumber(refundAmount,true)}
                  readOnly
                  className="w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 px-3 py-2"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Méthode de paiement</label>
                <select
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 px-3 py-2"
                  value={methodId}
                  onChange={(e) => setMethodId(e.target.value)}
                >
                  <option value="">Sélectionnez une méthode</option>
                  {methods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Compte de paiement</label>
                <select
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 px-3 py-2"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  <option value="">Sélectionnez un compte</option>
                  {accounts.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              {(methodId === 'cheque' || methodId === 'lcn') && (
                <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date prévue</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 px-3 py-2"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Note</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 px-3 py-2"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 border-t border-gray-200 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Montant total TTC :</span>
            <span className="font-bold text-green-600 text-lg">
             {formatNumber(total,true)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Nombre d'articles :</span>
            <span className="font-bold text-gray-800">{itemsCount}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={clearAll}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-3 font-medium transition transform hover:scale-[1.02]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 mb-0" width="2em"
                     height="2em" viewBox="0 0 24 24">
                    <path fill="currentColor" fillRule="evenodd"
                          d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 0 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06"
                          clipRule="evenodd"/>
                </svg>
                Annuler
            </button>
            <button
              onClick={payer}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg py-3 font-medium transition transform hover:scale-[1.02]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="2em"
                     height="2em" viewBox="0 0 512 512">
                    <path fill="currentColor"
                          d="M128 96V80c0-44.2 86-80 192-80s192 35.8 192 80v16c0 30.6-41.3 57.2-102 70.7c-2.4-2.8-4.9-5.5-7.4-8c-15.5-15.3-35.5-26.9-56.4-35.5c-41.9-17.5-96.5-27.1-154.2-27.1c-21.9 0-43.3 1.4-63.8 4.1c-.2-1.3-.2-2.7-.2-4.1zm304 257v-46.2c15.1-3.9 29.3-8.5 42.2-13.9c13.2-5.5 26.1-12.2 37.8-20.3V288c0 26.8-31.5 50.5-80 65m0-96v-33c0-4.5-.4-8.8-1-13c15.5-3.9 30-8.6 43.2-14.2s26.1-12.2 37.8-20.3v15.4c0 26.8-31.5 50.5-80 65zM0 240v-16c0-44.2 86-80 192-80s192 35.8 192 80v16c0 44.2-86 80-192 80S0 284.2 0 240m384 96c0 44.2-86 80-192 80S0 380.2 0 336v-15.4c11.6 8.1 24.5 14.7 37.8 20.3C79.7 358.4 134.3 368 192 368s112.3-9.7 154.2-27.1c13.2-5.5 26.1-12.2 37.8-20.3zm0 80.6V432c0 44.2-86 80-192 80S0 476.2 0 432v-15.4c11.6 8.1 24.5 14.7 37.8 20.3C79.7 454.4 134.3 464 192 464s112.3-9.7 154.2-27.1c13.2-5.5 26.1-12.2 37.8-20.3"/>
                </svg>
                Payer
            </button>
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setServerErrors(null);
          setIsAdditionalPayment(false);
        }}
        onSubmit={handlePaymentSubmit}
        serverErrors={serverErrors}
        isAdditionalPayment={isAdditionalPayment}
        remainingAmount={isAdditionalPayment && lastOrderTotal && lastOrderPaid ? (lastOrderTotal - lastOrderPaid) : undefined}
      />
    </div>
  );
};

export default CaissePanel;

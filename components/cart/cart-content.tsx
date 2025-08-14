import {usePOSStore} from "~/pos/pos-store";
import {formatNumber} from "../../utils/formats";
import React, {useState, useEffect, useRef} from "react";
import CartTable from "./cart-table";
import PaymentModal, {type PaymentData} from "./payment-modal";
import {toast} from "react-toastify";
import {useSettingsStore} from "../../stores/settings-store";
import { endpoints } from "../../services/api";

const CartContent = () => {
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isAdditionalPayment, setIsAdditionalPayment] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string> | null | undefined>(null);
    const [ticketTemplate, setTicketTemplate] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Get the ticket printing feature flag from settings store
    const { features, posType } = useSettingsStore();

    useEffect(() => {
        // Create audio element when component mounts
        audioRef.current = new Audio('/sounds/cashout.mp3');
        return () => {
            // Cleanup
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Auto print ticket when available and feature is enabled
    useEffect(() => {
        if (ticketTemplate && features.autoTicketPrinting && features.ticketPrinting) {
            // Small delay to ensure the success toast is visible before printing
            const timer = setTimeout(() => {
                handlePrintTicket();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [ticketTemplate, features.autoTicketPrinting, features.ticketPrinting]);
    const {
        cart,
        cartTotal,
        client,
        clearCart,
        checkout,
        lastOrderId,
        lastOrderTotal,
        lastOrderPaid,
        isPaymentComplete,
        addPaymentToOrder,
        clearLastOrderInfo,
        orderType,
        toggleOrderType,
        setOrderType,
        globalReduction,
        setGlobalReduction,
    } = usePOSStore();

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.warning("Le panier est vide");
            return;
        }

        if (!client) {
            toast.warning("Veuillez sélectionner un client");
            return;
        }

        checkout().then(response => {
            setSuccessMessage(response.data.message);
            const tpl = response.data?.template;
            if (tpl) {
                setTicketTemplate(tpl);
            } else {
                const id = response.data?.vente_id || lastOrderId;
                if (id) {
                    endpoints.orders.getTicket(id).then(tr => {
                        const html = (tr.data && (tr.data as any).template) ?? tr.data ?? null;
                        if (html) setTicketTemplate(html as any);
                    }).catch(err => console.warn('Failed to fetch ticket template:', err));
                }
            }
            setShowSuccessToast(true);
            if (audioRef.current) {
                audioRef.current.currentTime = 0; // Reset to start
                audioRef.current.play().catch(err => console.error("Error playing sound:", err));
            }
        });
    };

    const handleCreditCheckout = () => {
        if (cart.length === 0) {
            toast.warning("Le panier est vide");
            return;
        }

        if (!client) {
            toast.warning("Veuillez sélectionner un client");
            return;
        }

        // Create payment data with credit field set to true
        const paymentData: PaymentData = {
            amount: cartTotal,
            accountId: "1", // Default account ID
            paymentMethodId: "credit",
            note: "",
            credit: true
        };

        checkout(paymentData).then(response => {
            setSuccessMessage(response.data.message);
            const tpl = response.data?.template;
            if (tpl) {
                setTicketTemplate(tpl);
            } else {
                const id = response.data?.vente_id || lastOrderId;
                if (id) {
                    endpoints.orders.getTicket(id).then(tr => {
                        const html = (tr.data && (tr.data as any).template) ?? tr.data ?? null;
                        if (html) setTicketTemplate(html as any);
                    }).catch(err => console.warn('Failed to fetch ticket template:', err));
                }
            }
            setShowSuccessToast(true);
            if (audioRef.current) {
                audioRef.current.currentTime = 0; // Reset to start
                audioRef.current.play().catch(err => console.error("Error playing sound:", err));
            }
        }).catch(err => {
            handlePaymentError(err);
        });
    };

    const handleAdditionalPayment = () => {
        if (!lastOrderId) {
            toast.warning("Aucune commande à compléter");
            return;
        }

        setIsAdditionalPayment(true);
        setShowPaymentModal(true);
    };
    const handleOpenPaymentModal = () => {
        if (cart.length === 0) {
            toast.warning("Le panier est vide");
            return;
        }

        if (!client) {
            toast.warning("Veuillez sélectionner un client");
            return;
        }

        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = (paymentData: PaymentData) => {
        // Reset server errors when submitting
        setServerErrors(null);

        if (isAdditionalPayment && lastOrderId) {
            // Add payment to existing order
            addPaymentToOrder(lastOrderId, paymentData).then(response => {
                setSuccessMessage("Paiement supplémentaire ajouté avec succès");
                setShowSuccessToast(true);
                setShowPaymentModal(false);
                setIsAdditionalPayment(false);
                if (audioRef.current) {
                    audioRef.current.currentTime = 0; // Reset to start
                    audioRef.current.play().catch(err => console.error("Error playing sound:", err));
                }
            }).catch(err => {
                handlePaymentError(err);
            });
        } else {
            // Regular checkout with payment
            checkout(paymentData).then(response => {
                setSuccessMessage(response.data.message);
                const tpl = response.data?.template;
                if (tpl) {
                    setTicketTemplate(tpl);
                } else {
                    const id = response.data?.vente_id || lastOrderId;
                    if (id) {
                        endpoints.orders.getTicket(id).then(tr => {
                            const html = (tr.data && (tr.data as any).template) ?? tr.data ?? null;
                            if (html) setTicketTemplate(html as any);
                        }).catch(err => console.warn('Failed to fetch ticket template:', err));
                    }
                }
                setShowSuccessToast(true);
                setShowPaymentModal(false);
                if (audioRef.current) {
                    audioRef.current.currentTime = 0; // Reset to start
                    audioRef.current.play().catch(err => console.error("Error playing sound:", err));
                }
            }).catch(err => {
                handlePaymentError(err);
            });
        }
    };

    const handlePaymentError = (err: any) => {
        if (err.response?.data?.error) {
            toast.error(err.response.data.error);
        } else if (err.response?.data?.errors) {
            // Format server errors for react-hook-form
            const errors = err.response.data.errors;
            const formattedErrors: Record<string, string> = {};

            Object.entries(errors).forEach(([key, value]) => {
                formattedErrors[key] = Array.isArray(value) ? value[0] : value as string;
            });

            // Set server errors to be passed to the PaymentModal
            setServerErrors(formattedErrors);
        } else {
            // Handle unexpected errors
            toast.error("Une erreur s'est produite lors du traitement du paiement");
        }
    };

    const handlePrintTicket = () => {
        if (!ticketTemplate) {
            toast.warning("Aucun ticket à imprimer");
            return;
        }

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';

        // Append iframe to the document
        document.body.appendChild(iframe);

        // Write the template HTML to the iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            toast.error("Impossible de créer le document d'impression");
            document.body.removeChild(iframe);
            return;
        }

        iframeDoc.open();
        iframeDoc.write(ticketTemplate);
        iframeDoc.close();

        // Wait for the content to load before printing
        iframe.onload = () => {
            try {
                // Focus the iframe for printing
                iframe.contentWindow?.focus();
                // Print the iframe content
                iframe.contentWindow?.print();

                // Remove the iframe after a delay to ensure print dialog has time to open
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
    return (
        <div className="flex flex-col w-full h-full justify-between ">
            {/* Success Toast Popup */}
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
            <CartTable bottom={bottomRef}/>
            {posType !== "caisse" && (
                <div className="p-4  border-dashed border-t-2 border-[#0002] ">
                    {/* Show additional payment button if there's an incomplete payment */}
                    {lastOrderId && !isPaymentComplete() && (
                        <div className="mb-4 p-3 bg-yellow-100 rounded-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-yellow-800">Paiement incomplet</p>
                                    <p className="text-sm text-yellow-700">
                                        Montant total: {formatNumber(lastOrderTotal || 0, true)} |
                                        Payé: {formatNumber(lastOrderPaid || 0, true)} |
                                        Reste: {formatNumber((lastOrderTotal || 0) - (lastOrderPaid || 0), true)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleAdditionalPayment}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                >
                                    Compléter le paiement
                                </button>
                            </div>
                        </div>
                    )}
                    {features.globalReductionEnabled  && (
                        <div className="flex justify-between items-center mb-3 gap-4">
                            <div className="flex items-center gap-2 w-2/3">
                                <span className="font-medium text-gray-700 whitespace-nowrap">Réduction globale:</span>
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        className="w-full outline-none rounded-md border border-gray-200 px-2 py-1"
                                        value={(globalReduction ? Number(globalReduction) : '')}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (v === '') { setGlobalReduction(0); return; }
                                            const val = parseFloat(v);
                                            if (!isNaN(val)) {
                                                const clamped = Math.min(100, Math.max(0, val));
                                                setGlobalReduction(clamped);
                                            } else {
                                                setGlobalReduction(0);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const val = parseFloat(e.target.value || '0');
                                            const clamped = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
                                            setGlobalReduction(clamped);
                                        }}
                                        placeholder="0.00"
                                        aria-label="Réduction globale (%)"
                                    />
                                    <span className="px-2 py-1 text-gray-600">%</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end w-1/3">
                                <span className="text-xs text-gray-500">Sous-total: {formatNumber(cart.reduce((s,i)=>s+i.finalPrice,0), true)}</span>
                                {(globalReduction ?? 0) > 0 && (
                                    <span className="text-xs text-gray-500">Remise: {formatNumber(cart.reduce((s,i)=>s+i.finalPrice,0) - cartTotal, true)}</span>
                                )}
                            </div>
                        </div>
                    )}

                        <div className="flex justify-between items-center mb-4">
                            <span className="font-medium text-gray-700">Total:</span>
                            <span className="font-bold text-xl text-primary">{formatNumber(cartTotal, true)}</span>
                        </div>

                    <div ref={bottomRef} className="flex flex-col ">

                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-700">Nombre d'articles:</span>
                                <span
                                    className="font-bold text-xl text-primary">{formatNumber(cart.reduce((a, b) => a + b.quantity, 0))}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <button onClick={clearCart}
                                        disabled={cart.length === 0}
                                        className={`w-full py-3 px-4 rounded-md text-white font-medium cursor-pointer ${
                                            cart.length === 0
                                                ? 'bg-red-400 cursor-not-allowed'
                                                : 'bg-red-500 hover:bg-red-600'
                                        }`}
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
                                    onClick={handleCreditCheckout}
                                    disabled={!client || cart.length === 0}
                                    className={`w-full py-3 px-4 rounded-md text-white font-medium cursor-pointer ${
                                        !client || cart.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-yellow-500 hover:bg-yellow-600'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="2em"
                                         height="2em" viewBox="0 0 576 512">
                                        <path fill="currentColor"
                                              d="M64 32C28.7 32 0 60.7 0 96v32H576V96c0-35.3-28.7-64-64-64H64zM576 224H0V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V224zM112 352h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm112 16c0-8.8 7.2-16 16-16H368c8.8 0 16 7.2 16 16s-7.2 16-16 16H240c-8.8 0-16-7.2-16-16z"/>
                                    </svg>
                                    <span>
                                Crédit
                            </span>
                                </button>
                                <button
                                    onClick={handleOpenPaymentModal}
                                    disabled={!client || cart.length === 0}
                                    className={`w-full py-3 px-4 rounded-md text-white font-medium cursor-pointer ${
                                        !client || cart.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-500 hover:bg-indigo-600'
                                    }`}
                                >
                                    <svg  className="inline-block mr-2" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 512 512"><path fill="currentColor" d="M96 0C60.7 0 32 28.7 32 64s28.7 64 64 64h48v32H87c-31.6 0-58.5 23.1-63.3 54.4L1.1 364.1c-.7 4.7-1.1 9.5-1.1 14.3V448c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64v-69.6c0-4.8-.4-9.6-1.1-14.4l-22.7-149.6c-4.7-31.3-31.6-54.4-63.2-54.4H208v-32h48c35.3 0 64-28.7 64-64S291.3 0 256 0zm0 48h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H96c-8.8 0-16-7.2-16-16s7.2-16 16-16M64 424c0-13.3 10.7-24 24-24h336c13.3 0 24 10.7 24 24s-10.7 24-24 24H88c-13.3 0-24-10.7-24-24m48-160a24 24 0 1 1 0-48a24 24 0 1 1 0 48m120-24a24 24 0 1 1-48 0a24 24 0 1 1 48 0m-72 104a24 24 0 1 1 0-48a24 24 0 1 1 0 48m168-104a24 24 0 1 1-48 0a24 24 0 1 1 48 0m-72 104a24 24 0 1 1 0-48a24 24 0 1 1 0 48m168-104a24 24 0 1 1-48 0a24 24 0 1 1 48 0m-72 104a24 24 0 1 1 0-48a24 24 0 1 1 0 48"/></svg>
                                    <span>
                                Autre
                            </span>
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={!client || cart.length === 0}
                                    className={`w-full py-3 px-4 rounded-md text-white font-medium cursor-pointer ${
                                        !client || cart.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="2em"
                                         height="2em" viewBox="0 0 512 512">
                                        <path fill="currentColor"
                                              d="M128 96V80c0-44.2 86-80 192-80s192 35.8 192 80v16c0 30.6-41.3 57.2-102 70.7c-2.4-2.8-4.9-5.5-7.4-8c-15.5-15.3-35.5-26.9-56.4-35.5c-41.9-17.5-96.5-27.1-154.2-27.1c-21.9 0-43.3 1.4-63.8 4.1c-.2-1.3-.2-2.7-.2-4.1zm304 257v-46.2c15.1-3.9 29.3-8.5 42.2-13.9c13.2-5.5 26.1-12.2 37.8-20.3V288c0 26.8-31.5 50.5-80 65m0-96v-33c0-4.5-.4-8.8-1-13c15.5-3.9 30-8.6 43.2-14.2s26.1-12.2 37.8-20.3v15.4c0 26.8-31.5 50.5-80 65zM0 240v-16c0-44.2 86-80 192-80s192 35.8 192 80v16c0 44.2-86 80-192 80S0 284.2 0 240m384 96c0 44.2-86 80-192 80S0 380.2 0 336v-15.4c11.6 8.1 24.5 14.7 37.8 20.3C79.7 358.4 134.3 368 192 368s112.3-9.7 154.2-27.1c13.2-5.5 26.1-12.2 37.8-20.3zm0 80.6V432c0 44.2-86 80-192 80S0 476.2 0 432v-15.4c11.6 8.1 24.5 14.7 37.8 20.3C79.7 454.4 134.3 464 192 464s112.3-9.7 154.2-27.1c13.2-5.5 26.1-12.2 37.8-20.3"/>
                                    </svg>
                                    <span>
                                Espèces
                            </span>
                                </button>
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
                                    remainingAmount={isAdditionalPayment && lastOrderTotal && lastOrderPaid
                                        ? lastOrderTotal - lastOrderPaid
                                        : undefined}
                                />
                            </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartContent;

import React, { useState, useEffect } from 'react';
import { endpoints } from '../../services/api';
import { usePOSStore } from '../../app/pos/pos-store';
import { formatNumber } from '../../utils/formats';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (paymentData: PaymentData) => void;
}

interface Account {
    value: string | number;
    label: string;
}

interface PaymentMethod {
    value: string | number;
    label: string;
}

export interface PaymentData {
    amount: number;
    accountId: string | number;
    paymentMethodId: string | number;
    note: string;
    expectedDate?: string;
    checkReference?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [amount, setAmount] = useState<string>('');
    const [accountId, setAccountId] = useState<string | number>('');
    const [paymentMethodId, setPaymentMethodId] = useState<string | number>('');
    const [note, setNote] = useState<string>('');
    const [expectedDate, setExpectedDate] = useState<string>('');
    const [checkReference, setCheckReference] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { cart } = usePOSStore();
    const cartTotal = cart.reduce((total, item) => total + item.finalPrice, 0);

    useEffect(() => {
        if (isOpen) {
            setAmount(cartTotal.toString());
            fetchData();
        }
    }, [isOpen, cartTotal]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [accountsResponse, paymentMethodsResponse] = await Promise.all([
                endpoints.payment.getAccounts(),
                endpoints.payment.getPaymentMethods()
            ]);
            setAccounts(accountsResponse.data);
            setPaymentMethods(paymentMethodsResponse.data);
        } catch (err) {
            console.error('Error fetching payment data:', err);
            setError('Erreur lors du chargement des données de paiement');
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const amountValue = parseFloat(amount);

        // Validation
        if (isNaN(amountValue) || amountValue <= 0) {
            setError('Le montant doit être supérieur à 0');
            return;
        }

        if (amountValue > cartTotal) {
            setError('Le montant ne peut pas être supérieur au total du panier');
            return;
        }

        if (!accountId) {
            setError('Veuillez sélectionner un compte');
            return;
        }

        if (!paymentMethodId) {
            setError('Veuillez sélectionner une méthode de paiement');
            return;
        }

        // Validate additional fields for lcn or cheque payment methods
        if (requiresAdditionalFields(paymentMethodId)) {
            if (!expectedDate) {
                setError('Veuillez sélectionner une date prévue');
                return;
            }
            if (!checkReference) {
                setError('Veuillez entrer une référence de chèque');
                return;
            }
        }

        // Submit payment data
        onSubmit({
            amount: amountValue,
            accountId,
            paymentMethodId,
            note,
            ...(requiresAdditionalFields(paymentMethodId) && {
                expectedDate,
                checkReference
            })
        });

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setAmount('');
        setAccountId('');
        setPaymentMethodId('');
        setNote('');
        setExpectedDate('');
        setCheckReference('');
        setError(null);
    };

    const requiresAdditionalFields = (methodId: string | number): boolean => {
        return methodId === 'lcn' || methodId === 'cheque';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Paiement</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                Montant ({formatNumber(cartTotal, true)})
                            </label>
                            <input
                                type="text"
                                id="amount"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
                                Compte
                            </label>
                            <select
                                id="account"
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Sélectionnez un compte</option>
                                {accounts.map((account) => (
                                    <option key={account.value} value={account.value}>
                                        {account.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                                Méthode de paiement
                            </label>
                            <select
                                id="paymentMethod"
                                value={paymentMethodId}
                                onChange={(e) => setPaymentMethodId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Sélectionnez une méthode de paiement</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {requiresAdditionalFields(paymentMethodId) && (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date prévu
                                    </label>
                                    <input
                                        type="date"
                                        id="expectedDate"
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="checkReference" className="block text-sm font-medium text-gray-700 mb-1">
                                        Référence de chèque
                                    </label>
                                    <input
                                        type="text"
                                        id="checkReference"
                                        value={checkReference}
                                        onChange={(e) => setCheckReference(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Référence de chèque"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="mb-6">
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                Note
                            </label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                placeholder="Ajouter une note (optionnel)"
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                Confirmer
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;

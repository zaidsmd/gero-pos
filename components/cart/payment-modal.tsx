import React, { useState, useEffect } from 'react';
import { endpoints } from '../../services/api';
import { usePOSStore } from '~/pos/pos-store';
import { formatNumber } from '../../utils/formats';
import { useForm, type SubmitHandler } from 'react-hook-form';

// Helper function to round monetary values to 2 decimal places (0.01)
const roundToTwoDecimals = (value: number): number => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (paymentData: PaymentData) => void;
    serverErrors?: Record<string, string> | null;
    isAdditionalPayment?: boolean;
    remainingAmount?: number;
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
    credit?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    serverErrors, 
    isAdditionalPayment = false,
    remainingAmount
}) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const { cartTotal: storeCartTotal } = usePOSStore();
    const cartTotal = isAdditionalPayment && remainingAmount !== undefined 
        ? remainingAmount 
        : storeCartTotal;
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        setValue, 
        watch, 
        reset,
        setError
    } = useForm<PaymentData>({
        defaultValues: {
            amount: cartTotal,
            accountId: '',
            paymentMethodId: '',
            note: '',
            expectedDate: '',
            checkReference: ''
        }
    });
    
    const paymentMethodId = watch('paymentMethodId');

    useEffect(() => {
        if (isOpen) {
            // Set default amount based on whether it's an additional payment or regular payment
            setValue('amount', cartTotal);
            fetchData();
            
            // Reset errors when modal opens
            setGeneralError(null);
        }
    }, [isOpen, cartTotal, setValue, isAdditionalPayment]);
    
    // Apply server errors if provided
    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            Object.entries(serverErrors).forEach(([field, message]) => {
                // Map server error fields to form fields
                const fieldMap: Record<string, string> = {
                    "paiement.i_date": "expectedDate",
                    "paiement.i_montant": "amount",
                    "paiement.i_method_key": "paymentMethodId",
                    "paiement.i_compte_id": "accountId",
                    "paiement.i_reference": "checkReference",
                    "paiement.i_note": "note",
                };
                
                const formField = fieldMap[field] || field;
                setError(formField as any, { 
                    type: 'server', 
                    message: Array.isArray(message) ? message[0] : message 
                });
            });
        }
    }, [serverErrors, setError]);

    const fetchData = async () => {
        setLoading(true);
        setGeneralError(null);
        try {
            const [accountsResponse, paymentMethodsResponse] = await Promise.all([
                endpoints.payment.getAccounts(),
                endpoints.payment.getPaymentMethods()
            ]);
            const accountsData = accountsResponse.data as Account[];
            const methodsData = paymentMethodsResponse.data as PaymentMethod[];
            setAccounts(accountsData);
            setPaymentMethods(methodsData);

        } catch (err) {
            console.error('Error fetching payment data:', err);
            setGeneralError('Erreur lors du chargement des données de paiement');
        } finally {
            setLoading(false);
        }
    };

    const onFormSubmit: SubmitHandler<PaymentData> = (data) => {
        // Round the amount to 2 decimal places
        data.amount = roundToTwoDecimals(data.amount);
        
        // Validation for amount
        if (data.amount > cartTotal) {
            setError('amount', { 
                type: 'manual', 
                message: isAdditionalPayment 
                    ? 'Le montant ne peut pas être supérieur au montant restant à payer' 
                    : 'Le montant ne peut pas être supérieur au total du panier' 
            });
            return;
        }
        
        // Submit payment data
        onSubmit(data);
    };
    
    const resetFormData = () => {
        reset({
            amount: cartTotal,
            accountId: '',
            paymentMethodId: '',
            note: '',
            expectedDate: '',
            checkReference: ''
        });
        setGeneralError(null);
    };

    const requiresAdditionalFields = (methodId: string | number): boolean => {
        return methodId === 'lcn' || methodId === 'cheque' || methodId === 'credit';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isAdditionalPayment ? "Paiement Supplémentaire" : "Paiement"}
                        </h2>
                        {isAdditionalPayment && remainingAmount !== undefined && (
                            <p className="text-sm text-gray-600">
                                Montant restant à payer: {formatNumber(remainingAmount, true)}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {generalError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {generalError}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                        <div className="mb-4">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                {isAdditionalPayment 
                                    ? `Montant à ajouter (max: ${formatNumber(cartTotal, true)})` 
                                    : `Montant (${formatNumber(cartTotal, true)})`}
                            </label>
                            <input
                                id="amount"
                                type="text"
                                {...register('amount', {
                                    required: 'Le montant est requis',
                                    validate: {
                                        isNumber: value => !isNaN(Number(value)) || 'Le montant doit être un nombre',
                                        isPositive: value => Number(value) > 0 || 'Le montant doit être supérieur à 0'
                                    },
                                    setValueAs: value => Number(value)
                                })}
                                className={`w-full px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                placeholder="0.00"
                            />
                            {errors.amount && (
                                <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                                Compte
                            </label>
                            <select
                                id="accountId"
                                {...register('accountId', { 
                                    required: 'Veuillez sélectionner un compte' 
                                })}
                                className={`w-full px-3 py-2 border ${errors.accountId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                            >
                                <option value="">Sélectionnez un compte</option>
                                {accounts.map((account) => (
                                    <option key={account.value} value={account.value}>
                                        {account.label}
                                    </option>
                                ))}
                            </select>
                            {errors.accountId && (
                                <p className="text-red-500 text-xs mt-1">{errors.accountId.message}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="paymentMethodId" className="block text-sm font-medium text-gray-700 mb-1">
                                Méthode de paiement
                            </label>
                            <select
                                id="paymentMethodId"
                                {...register('paymentMethodId', { 
                                    required: 'Veuillez sélectionner une méthode de paiement' 
                                })}
                                className={`w-full px-3 py-2 border ${errors.paymentMethodId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                            >
                                <option value="">Sélectionnez une méthode de paiement</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                            {errors.paymentMethodId && (
                                <p className="text-red-500 text-xs mt-1">{errors.paymentMethodId.message}</p>
                            )}
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
                                        {...register('expectedDate', { 
                                            required: requiresAdditionalFields(paymentMethodId) ? 'Veuillez sélectionner une date prévue' : false 
                                        })}
                                        className={`w-full px-3 py-2 border ${errors.expectedDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                    />
                                    {errors.expectedDate && (
                                        <p className="text-red-500 text-xs mt-1">{errors.expectedDate.message}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="checkReference" className="block text-sm font-medium text-gray-700 mb-1">
                                        Référence de chèque
                                    </label>
                                    <input
                                        type="text"
                                        id="checkReference"
                                        {...register('checkReference', { 
                                            required: requiresAdditionalFields(paymentMethodId) ? 'Veuillez entrer une référence de chèque' : false 
                                        })}
                                        className={`w-full px-3 py-2 border ${errors.checkReference ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                        placeholder="Référence de chèque"
                                    />
                                    {errors.checkReference && (
                                        <p className="text-red-500 text-xs mt-1">{errors.checkReference.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="mb-6">
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                Note
                            </label>
                            <textarea
                                id="note"
                                {...register('note')}
                                className={`w-full px-3 py-2 border ${errors.note ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                                rows={3}
                                placeholder="Ajouter une note (optionnel)"
                            ></textarea>
                            {errors.note && (
                                <p className="text-red-500 text-xs mt-1">{errors.note.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    resetFormData();
                                    onClose();
                                }}
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

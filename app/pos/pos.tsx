import React, { useEffect } from 'react';
import { usePOSStore } from './pos-store';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Articles from "../../components/articles/articles";
import CartLayout from "../../components/cart/cart-layout";
import TypeToggler from "~/pos/type-toggler";

// Define the form data type for checkout
interface CheckoutFormData {
  customerName: string;
  paymentMethod: 'cash' | 'card' | 'mobile';
  notes: string;
}

export function POS() {
  const { 
    products, 
    cart, 
    client,
    isLoading, 
    error, 
    fetchProducts, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    checkout 
  } = usePOSStore();

  // React Hook Form setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      customerName: '',
      paymentMethod: 'cash',
      notes: ''
    }
  });

  return (
    <div className="h-full w-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#3b5461]">Point of Sale</h1>
          {client && (
            <div className="text-sm text-gray-600 mt-1">
              Client: <span className="font-medium">{client.nom}</span>
            </div>
          )}
        </div>
        <a href="/" className="px-4 py-2 bg-[#3b5461] text-white rounded-md hover:bg-[#2a3e48] transition-colors">
          Back
        </a>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden pb-3">
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm flex">
          <CartLayout/>
        </div>

        <div className="w-full md:w-1/3 overflow-hidden flex flex-col gap-4 ">
          <div className="bg-white rounded-lg shadow-sm p-4 ">
            <TypeToggler/>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col overflow-hidden">
            <Articles/>
          </div>
        </div>

      </div>
    </div>
  );
}

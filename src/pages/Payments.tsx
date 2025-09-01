import React from 'react';
import { PaymentForm } from '../components/payments/PaymentForm';
import { PaymentHistory } from '../components/payments/PaymentHistory';

export const Payments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Premium Features</h1>
        <p className="text-gray-600">
          Unlock advanced health insights and personalized care
        </p>
      </div>

      <PaymentForm />
      <PaymentHistory />
    </div>
  );
};
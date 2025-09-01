import { PaystackProps } from 'react-paystack/dist/types';

export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export const createPaystackConfig = (
  email: string,
  amount: number,
  reference: string,
  onSuccess: (reference: any) => void,
  onClose: () => void
): PaystackProps => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('Paystack public key not configured');
  }

  return {
    publicKey,
    email,
    amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
    reference,
    onSuccess,
    onClose,
    currency: 'KES',
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
    label: 'HealthCheck Premium Advice',
    metadata: {
      custom_fields: [
        {
          display_name: 'Service',
          variable_name: 'service',
          value: 'Premium Health Advice'
        }
      ]
    }
  };
};

export const generatePaymentReference = (userId: string): string => {
  return `healthcheck_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
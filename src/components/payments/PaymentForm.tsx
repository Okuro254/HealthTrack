import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePaystackPayment } from 'react-paystack';
import toast from 'react-hot-toast';
import { CreditCard, Star, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { createPaystackConfig, generatePaymentReference } from '../../lib/paystack';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const PaymentForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const onPaymentSuccess = async (reference: any) => {
    try {
      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'paid',
          payment_ref: reference.reference 
        })
        .eq('payment_ref', reference.reference);

      if (error) throw error;

      toast.success('Payment completed successfully! 🎉', {
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Payment completed but failed to update status. Please contact support.');
    }
  };

  const onPaymentClose = () => {
    toast.error('Payment was cancelled');
  };

  const paymentReference = user ? generatePaymentReference(user.id) : '';
  
  const paystackConfig = user ? createPaystackConfig(
    user.email,
    100, // KES 100
    paymentReference,
    onPaymentSuccess,
    onPaymentClose
  ) : null;

  const initializePayment = usePaystackPayment(paystackConfig || {});

  const handlePremiumPayment = async () => {
    if (!user) return;

    // Check if Paystack API key is available
    const apiKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!apiKey) {
      toast.error('Payment system not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      // Save payment record to database
      const { error: dbError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: 100, // KES 100
          status: 'pending',
          payment_ref: paymentReference,
        });

      if (dbError) throw dbError;

      // Initialize Paystack payment
      initializePayment();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Premium Health Advice</h2>
          <p className="text-gray-600 mb-6">
            Get detailed, personalized health recommendations from our advanced AI system
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 mb-6"
          >
            <h3 className="font-medium text-gray-900 mb-3">Premium Features Include:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Detailed symptom analysis
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Personalized treatment plans
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Medication recommendations
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Follow-up care instructions
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-gray-900">KES 100</span>
            <span className="text-gray-600 ml-2">per consultation</span>
          </div>

          <Button
            onClick={handlePremiumPayment}
            loading={loading}
            className="w-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with Paystack
          </Button>

          <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Secure payment powered by Paystack
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
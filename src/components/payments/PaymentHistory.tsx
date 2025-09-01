import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Payment } from '../../lib/types';
import { Card } from '../ui/Card';

export const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    // Subscribe to payment updates
    const subscription = supabase
      .channel('payments')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setPayments(prev => 
          prev.map(payment => 
            payment.id === payload.new.id 
              ? { ...payment, ...payload.new }
              : payment
          )
        );
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment history...</div>;
  }

  if (payments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-600">Your payment history will appear here once you make a purchase.</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
      <AnimatePresence>
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(payment.status)}
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Premium Health Advice</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(payment.created_at), 'MMM d, yyyy at h:mm a')}
                    </p>
                    {payment.payment_ref && (
                      <p className="text-xs text-gray-500">Ref: {payment.payment_ref}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">KES {payment.amount}</p>
                  <p className={`text-sm ${
                    payment.status === 'paid' ? 'text-green-600' :
                    payment.status === 'failed' ? 'text-red-600' :
                    payment.status === 'cancelled' ? 'text-gray-600' :
                    'text-yellow-600'
                  }`}>
                    {getStatusText(payment.status)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
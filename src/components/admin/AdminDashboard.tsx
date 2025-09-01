import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Users, FileText, CreditCard, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalUsers: number;
  totalSymptoms: number;
  totalPayments: number;
  totalRevenue: number;
  recentSymptoms: any[];
  recentPayments: any[];
  symptomTrends: { date: string; count: number }[];
  paymentStats: { status: string; count: number; amount: number }[];
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSymptoms: 0,
    totalPayments: 0,
    totalRevenue: 0,
    recentSymptoms: [],
    recentPayments: [],
    symptomTrends: [],
    paymentStats: [],
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch comprehensive statistics
        const [symptomsResponse, paymentsResponse, usersResponse] = await Promise.all([
          supabase.from('symptoms').select('*', { count: 'exact' }),
          supabase.from('payments').select('*', { count: 'exact' }),
          supabase.from('users').select('*', { count: 'exact' }),
        ]);

        const symptoms = symptomsResponse.data || [];
        const payments = paymentsResponse.data || [];

        const totalRevenue = payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount), 0);

        // Calculate symptom trends (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const symptomTrends = last7Days.map(date => ({
          date,
          count: symptoms.filter(s => s.created_at.startsWith(date)).length
        }));

        // Calculate payment statistics
        const paymentStats = ['pending', 'paid', 'failed', 'cancelled'].map(status => ({
          status,
          count: payments.filter(p => p.status === status).length,
          amount: payments.filter(p => p.status === status).reduce((sum, p) => sum + Number(p.amount), 0)
        }));

        // Get recent data
        const { data: recentSymptoms } = await supabase
          .from('symptoms')
          .select(`
            *,
            user:user_id (email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: recentPayments } = await supabase
          .from('payments')
          .select(`
            *,
            user:user_id (email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalUsers: usersResponse.count || 0,
          totalSymptoms: symptomsResponse.count || 0,
          totalPayments: paymentsResponse.count || 0,
          totalRevenue,
          recentSymptoms: recentSymptoms || [],
          recentPayments: recentPayments || [],
          symptomTrends,
          paymentStats,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  // Chart configurations
  const symptomTrendData = {
    labels: stats.symptomTrends.map(item => format(new Date(item.date), 'MMM d')),
    datasets: [
      {
        label: 'Symptoms Logged',
        data: stats.symptomTrends.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const paymentStatusData = {
    labels: stats.paymentStats.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
    datasets: [
      {
        data: stats.paymentStats.map(item => item.count),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)', // pending - yellow
          'rgba(34, 197, 94, 0.8)',  // paid - green
          'rgba(239, 68, 68, 0.8)',  // failed - red
          'rgba(156, 163, 175, 0.8)', // cancelled - gray
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
          { title: 'Symptoms Logged', value: stats.totalSymptoms, icon: FileText, color: 'green' },
          { title: 'Total Payments', value: stats.totalPayments, icon: CreditCard, color: 'purple' },
          { title: 'Revenue (KES)', value: stats.totalRevenue, icon: TrendingUp, color: 'yellow' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card padding="sm">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Trends (Last 7 Days)</h3>
            <div className="h-64">
              <Line data={symptomTrendData} options={chartOptions} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={paymentStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Symptoms</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentSymptoms.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No symptoms logged yet</p>
              ) : (
                stats.recentSymptoms.map((symptom, index) => (
                  <motion.div
                    key={symptom.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-blue-500 pl-3 hover:bg-gray-50 p-2 rounded-r"
                  >
                    <p className="text-sm text-gray-900 font-medium">
                      {symptom.description.substring(0, 80)}
                      {symptom.description.length > 80 ? '...' : ''}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {format(new Date(symptom.created_at), 'MMM d, h:mm a')}
                      </p>
                      {symptom.referral_needed && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payments yet</p>
              ) : (
                stats.recentPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center hover:bg-gray-50 p-2 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">KES {payment.amount}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(payment.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      payment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Health Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {stats.recentSymptoms.filter(s => !s.referral_needed).length}
              </p>
              <p className="text-xs text-gray-600">Non-urgent cases</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {stats.recentSymptoms.filter(s => s.referral_needed).length}
              </p>
              <p className="text-xs text-gray-600">Urgent referrals</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {((stats.paymentStats.find(p => p.status === 'paid')?.count || 0) / Math.max(stats.totalPayments, 1) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Payment success rate</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
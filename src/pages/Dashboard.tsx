import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { FileText, Brain, MapPin, CreditCard, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Log Symptoms',
      description: 'Record your health symptoms and get AI advice',
      icon: FileText,
      to: '/symptoms',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'AI Health Advice',
      description: 'Get personalized health recommendations',
      icon: Brain,
      to: '/advice',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Find Clinics',
      description: 'Locate nearby healthcare facilities',
      icon: MapPin,
      to: '/clinics',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Premium Features',
      description: 'Unlock advanced health insights',
      icon: CreditCard,
      to: '/payments',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.email.split('@')[0]}!
              </h1>
              <p className="text-gray-600">
                Take control of your health with AI-powered insights
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
              <Link to={action.to} className="block">
                <div className="flex items-start">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                </div>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Health Tips</h2>
          <div className="space-y-3">
            {[
              { color: 'blue', tip: 'Stay hydrated by drinking at least 8 glasses of water daily' },
              { color: 'green', tip: 'Get 7-9 hours of quality sleep each night for optimal health' },
              { color: 'purple', tip: 'Exercise for at least 30 minutes, 5 days a week' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start"
              >
                <div className={`w-2 h-2 bg-${item.color}-600 rounded-full mt-2 mr-3`}></div>
                <p className="text-gray-700">{item.tip}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
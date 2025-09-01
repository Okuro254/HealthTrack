import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PaymentForm } from '../components/payments/PaymentForm';

export const AIAdvice: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Health Advisor</h1>
        <p className="text-gray-600">
          Get personalized health recommendations powered by advanced AI
        </p>
      </div>

      <Card>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Basic Health Advice</h2>
          <p className="text-gray-600 mb-4">
            When you log symptoms, our AI provides basic health guidance automatically.
            This includes general recommendations and whether you should seek professional care.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Included with every symptom log</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• General health recommendations</li>
              <li>• Severity assessment</li>
              <li>• When to seek medical care</li>
            </ul>
          </div>
        </div>
      </Card>

      <PaymentForm />
    </div>
  );
};
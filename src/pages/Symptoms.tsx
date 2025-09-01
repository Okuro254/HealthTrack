import React, { useState } from 'react';
import { SymptomForm } from '../components/symptoms/SymptomForm';
import { SymptomsList } from '../components/symptoms/SymptomsList';

export const Symptoms: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSymptomSubmit = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Symptom Tracker</h1>
        <p className="text-gray-600">
          Log your symptoms and get AI-powered health insights
        </p>
      </div>

      <SymptomForm onSubmitSuccess={handleSymptomSubmit} />
      
      <div key={refreshKey}>
        <SymptomsList />
      </div>
    </div>
  );
};
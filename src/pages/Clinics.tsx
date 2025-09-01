import React from 'react';
import { ClinicFinder } from '../components/clinics/ClinicFinder';

export const Clinics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Nearby Clinics</h1>
        <p className="text-gray-600">
          Locate healthcare facilities in your area
        </p>
      </div>

      <ClinicFinder />
    </div>
  );
};
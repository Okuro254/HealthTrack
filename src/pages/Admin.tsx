import React from 'react';
import { AdminDashboard } from '../components/admin/AdminDashboard';

export const Admin: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Monitor app usage and manage users
        </p>
      </div>

      <AdminDashboard />
    </div>
  );
};
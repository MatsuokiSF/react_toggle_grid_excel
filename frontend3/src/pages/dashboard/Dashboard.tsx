// src/pages/dashboard/Dashboard.tsx
import React from 'react';
import Toggle from '../../components/dashboard/Toggle';

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
      <Toggle />
    </div>
  );
};

export default Dashboard;

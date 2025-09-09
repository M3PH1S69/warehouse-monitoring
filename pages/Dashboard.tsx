import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService } from '../utils/api';
import DashboardCard from '../components/DashboardCard';
import { UI_TEXT } from '../constants';
import { InventoryIcon, ArrowUpIcon, ArrowDownIcon, CheckCircleIcon, ExclamationCircleIcon } from '../components/icons/Icons';
import { Transaction, TransactionType } from '../types';

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [devicesData, transactionsData, statsData] = await Promise.all([
        apiService.getDevices(),
        apiService.getTransactions(),
        apiService.getDashboardStats()
      ]);
      
      setDevices(devicesData);
      setTransactions(transactionsData);
      setDashboardStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={loadDashboardData}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate category data from devices
  const categoryData = devices.reduce((acc, device) => {
    const category = acc.find((c: any) => c.name === device.category);
    if (category) {
      category.quantity += device.quantity;
    } else {
      acc.push({ name: device.category, quantity: device.quantity });
    }
    return acc;
  }, [] as { name: string; quantity: number }[]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{UI_TEXT.dashboard}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title={UI_TEXT.totalItems} 
          value={dashboardStats.totalItems || 0} 
          icon={<InventoryIcon className="w-8 h-8 text-white" />} 
          colorClass="bg-blue-500" 
        />
        <DashboardCard 
          title={UI_TEXT.normalItems} 
          value={dashboardStats.normalItems || 0} 
          icon={<CheckCircleIcon className="w-8 h-8 text-white" />} 
          colorClass="bg-teal-500" 
        />
        <DashboardCard 
          title={UI_TEXT.damagedItems} 
          value={dashboardStats.damagedItems || 0} 
          icon={<ExclamationCircleIcon className="w-8 h-8 text-white" />} 
          colorClass="bg-orange-500" 
        />
        <DashboardCard 
          title={UI_TEXT.lowStockItems} 
          value={dashboardStats.lowStockItems || 0} 
          icon={<InventoryIcon className="w-8 h-8 text-white" />} 
          colorClass="bg-yellow-500" 
        />
        <DashboardCard 
          title={UI_TEXT.itemsOut} 
          value={dashboardStats.itemsOut || 0} 
          icon={<ArrowUpIcon className="w-8 h-8 text-white" />} 
          colorClass="bg-red-500" 
        />
        <DashboardCard 
          title={UI_TEXT.itemsIn} 
          value={dashboardStats.itemsIn || 0} 
          icon={<ArrowDownIcon className="w-8 h-8 text-white" />} 
          colorClass="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{UI_TEXT.inventoryByCategory}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: 'rgba(128, 128, 128, 0.5)',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Bar dataKey="quantity" fill="#3B82F6" name="Jumlah" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{UI_TEXT.recentTransactions}</h2>
          <div className="overflow-y-auto h-[300px]">
            <ul className="space-y-4">
              {transactions.slice(0, 5).map((t: any) => (
                <li key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <p className="font-semibold">{t.deviceName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.date} oleh {t.user}
                    </p>
                  </div>
                  <div className={`flex items-center text-sm font-bold ${t.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'in' ? '+' : '-'}
                    {t.quantity}
                    {t.type === 'in' ? <ArrowDownIcon className="w-4 h-4 ml-1"/> : <ArrowUpIcon className="w-4 h-4 ml-1"/>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
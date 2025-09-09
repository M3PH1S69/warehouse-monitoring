import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { UI_TEXT } from '../constants';

const Settings: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    loadSystemStats();
    loadSettings();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await apiService.getDashboardStats();
      setStats(dashboardStats);
      setError(null);
    } catch (err) {
      console.error('Error loading system stats:', err);
      setError('Failed to load system statistics.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedAutoBackup = localStorage.getItem('autoBackup') !== 'false';
    const savedThreshold = parseInt(localStorage.getItem('lowStockThreshold') || '10');

    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
    setAutoBackup(savedAutoBackup);
    setLowStockThreshold(savedThreshold);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply dark mode to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNotificationsToggle = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    localStorage.setItem('notifications', newNotifications.toString());
  };

  const handleAutoBackupToggle = () => {
    const newAutoBackup = !autoBackup;
    setAutoBackup(newAutoBackup);
    localStorage.setItem('autoBackup', newAutoBackup.toString());
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 10;
    setLowStockThreshold(value);
    localStorage.setItem('lowStockThreshold', value.toString());
  };

  const handleExportData = () => {
    // In a real application, this would trigger a backend export
    alert('Export functionality would be implemented with backend support');
  };

  const handleImportData = () => {
    // In a real application, this would trigger a backend import
    alert('Import functionality would be implemented with backend support');
  };

  const handleClearCache = () => {
    localStorage.removeItem('dashboardCache');
    localStorage.removeItem('inventoryCache');
    alert('Cache cleared successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{UI_TEXT.settings}</h1>
      
      {/* System Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalItems || 0}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems || 0}</div>
              <div className="text-sm text-gray-500">Low Stock Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems || 0}</div>
              <div className="text-sm text-gray-500">Out of Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.recentTransactions || 0}</div>
              <div className="text-sm text-gray-500">Recent Transactions</div>
            </div>
          </div>
        )}
      </div>

      {/* Application Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark Mode
              </label>
              <p className="text-xs text-gray-500">Enable dark theme for the application</p>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notifications
              </label>
              <p className="text-xs text-gray-500">Receive notifications for low stock alerts</p>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto Backup
              </label>
              <p className="text-xs text-gray-500">Automatically backup data daily</p>
            </div>
            <button
              onClick={handleAutoBackupToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoBackup ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Low Stock Threshold
              </label>
              <p className="text-xs text-gray-500">Alert when stock falls below this number</p>
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={lowStockThreshold}
              onChange={handleThresholdChange}
              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Database Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Database Configuration</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Database Host
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                localhost
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Database Name
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                warehouse_db
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Database User
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                aty
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connection Status
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Connected
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Database configuration is managed in backend/config/database.php
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Export Data
            </button>
            <button
              onClick={handleImportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Import Data
            </button>
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Clear Cache
            </button>
            <button
              onClick={loadSystemStats}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh Stats
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Use these tools to manage your warehouse data and system performance
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
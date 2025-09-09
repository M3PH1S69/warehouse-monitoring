import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { UI_TEXT } from '../constants';

interface BackupInfo {
  lastBackup: string;
  backupSize: string;
  status: 'success' | 'failed' | 'in_progress';
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

const BackupSettings: React.FC = () => {
  const [backupInfo, setBackupInfo] = useState<BackupInfo>({
    lastBackup: '2025-09-07 10:30:00',
    backupSize: '2.5 MB',
    status: 'success',
    autoBackupEnabled: true,
    backupFrequency: 'daily'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadBackupSettings();
  }, []);

  const loadBackupSettings = () => {
    // Load backup settings from localStorage (in a real app, this would come from the backend)
    const savedSettings = localStorage.getItem('backupSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setBackupInfo(prev => ({ ...prev, ...settings }));
    }
  };

  const saveBackupSettings = () => {
    localStorage.setItem('backupSettings', JSON.stringify(backupInfo));
    setMessage({ type: 'success', text: 'Backup settings saved successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleManualBackup = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Simulate backup process
      setBackupInfo(prev => ({ ...prev, status: 'in_progress' }));
      
      // In a real application, this would call a backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date().toLocaleString();
      setBackupInfo(prev => ({
        ...prev,
        lastBackup: now,
        status: 'success',
        backupSize: '2.7 MB'
      }));
      
      setMessage({ type: 'success', text: 'Manual backup completed successfully' });
    } catch (err) {
      setBackupInfo(prev => ({ ...prev, status: 'failed' }));
      setMessage({ type: 'error', text: 'Backup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = () => {
    if (window.confirm('Are you sure you want to restore from backup? This will overwrite current data.')) {
      setMessage({ type: 'success', text: 'Restore functionality would be implemented with backend support' });
    }
  };

  const handleDownloadBackup = () => {
    // In a real application, this would download the backup file
    setMessage({ type: 'success', text: 'Download functionality would be implemented with backend support' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Success';
      case 'failed': return 'Failed';
      case 'in_progress': return 'In Progress';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Backup Settings</h1>
      
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Backup Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Current Backup Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Backup
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {backupInfo.lastBackup}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Backup Size
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {backupInfo.backupSize}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className={`font-medium ${getStatusColor(backupInfo.status)}`}>
                {getStatusText(backupInfo.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Backup Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleManualBackup}
            disabled={loading || backupInfo.status === 'in_progress'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating Backup...' : 'Create Manual Backup'}
          </button>
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Download Latest Backup
          </button>
          <button
            onClick={handleRestoreBackup}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Restore from Backup
          </button>
        </div>
      </div>

      {/* Automatic Backup Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Automatic Backup Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Automatic Backup
              </label>
              <p className="text-xs text-gray-500">Automatically create backups based on schedule</p>
            </div>
            <button
              onClick={() => setBackupInfo(prev => ({ ...prev, autoBackupEnabled: !prev.autoBackupEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                backupInfo.autoBackupEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  backupInfo.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {backupInfo.autoBackupEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Frequency
              </label>
              <select
                value={backupInfo.backupFrequency}
                onChange={(e) => setBackupInfo(prev => ({ 
                  ...prev, 
                  backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={saveBackupSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Database Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Database Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database Type
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              MySQL
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database Name
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              warehouse_db
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tables Count
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              5 (users, categories, devices, device_instances, transactions)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Backup Format
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              SQL Dump
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Backups include all data from the warehouse monitoring system including users, 
            categories, devices, device instances, and transaction history. The backup is compatible with 
            PHPMyAdmin import functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
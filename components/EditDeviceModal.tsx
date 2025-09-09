// Fix: Created EditDeviceModal component to resolve "not a module" error.
import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { UI_TEXT } from '../constants';

interface EditDeviceModalProps {
  device: Device | null;
  onClose: () => void;
  onSave: (device: Device) => void;
  categories: string[];
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({ device, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState<Omit<Device, 'id' | 'status'>>({
    name: '',
    category: categories[0] || '',
    brand: '',
    quantity: 0,
    condition: 'Normal',
    description: '',
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        category: device.category,
        brand: device.brand,
        quantity: device.quantity,
        condition: device.condition,
        description: device.description || '',
      });
    } else {
       // Reset for new device
       setFormData({
        name: '',
        category: categories[0] || '',
        brand: '',
        quantity: 0,
        condition: 'Normal',
        description: '',
      });
    }
  }, [device, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 
      formData.quantity === 0 ? 'Out of Stock' :
      formData.quantity <= 5 ? 'Low Stock' : 'In Stock';
      
    const deviceToSave: Device = {
        ...formData,
        id: device?.id || '', // ID will be handled by parent for new devices
        status,
    };
    onSave(deviceToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{device ? UI_TEXT.editDevice : UI_TEXT.addDevice}</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.name}</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.category}</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.deviceBrand}</label>
                <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
               <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.quantity}</label>
                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
               <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.deviceCondition}</label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="Normal">Normal</option>
                    <option value="Rusak">Rusak</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.description}</label>
                <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              {UI_TEXT.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {UI_TEXT.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;

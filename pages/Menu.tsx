import '../src/index.css'
import React, { useState, useEffect } from 'react';
import { UI_TEXT } from '../constants';
import { mockDevices, mockCategories } from '../data/mockData';
import { TransactionType, Device, Transaction } from '../types';
import { useAuth } from '../hooks/useAuth';
import { showSuccessNotification, showErrorNotification, sendTelegramMessage } from '../utils/notifications';

const Menu: React.FC = () => {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.OUT);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(!isNewDevice && mockDevices.length > 0 ? mockDevices[0].id : '');

  // Existing Device Fields
  const [quantity, setQuantity] = useState<number | string>(1);

  // New Device Fields
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceCategory, setNewDeviceCategory] = useState(mockCategories.length > 0 ? mockCategories[0].name : '');
  const [newDeviceBrand, setNewDeviceBrand] = useState('');
  const [newDeviceCondition, setNewDeviceCondition] = useState<'Normal' | 'Rusak'>('Normal');
  const [registrationNumbers, setRegistrationNumbers] = useState<string[]>([]);
  
  // Transaction Fields
  const [destination, setDestination] = useState('');
  const [recipient, setRecipient] = useState('');
  const [source, setSource] = useState('');
  const [sender, setSender] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  // Summary State
  const [summary, setSummary] = useState<{ deviceName: string; initialStock: number; finalStock: number; amount: number; } | null>(null);

  const selectedDevice = mockDevices.find(d => d.id === selectedDeviceId);
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500";


  useEffect(() => {
    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
        setSummary(null);
        setStockError('');
        return;
    }

    let deviceName = '';
    let initialStock = 0;
    
    if (isNewDevice) {
        deviceName = newDeviceName || '(Perangkat Baru)';
        initialStock = 0;
    } else if (selectedDevice) {
        deviceName = selectedDevice.name;
        initialStock = selectedDevice.quantity;
    } else {
        setSummary(null);
        setStockError('');
        return;
    }
    
    let finalStock = 0;
    if (transactionType === TransactionType.IN) {
        finalStock = initialStock + numericQuantity;
        setStockError('');
    } else { // OUT
        finalStock = initialStock - numericQuantity;
        if (finalStock < 0) {
            setStockError(UI_TEXT.insufficientStockError);
        } else {
            setStockError('');
        }
    }

    setSummary({ deviceName, initialStock, finalStock, amount: numericQuantity });

  }, [selectedDeviceId, quantity, transactionType, isNewDevice, newDeviceName, selectedDevice]);

  // Handle registration number inputs dynamically based on quantity
  useEffect(() => {
    if (transactionType === TransactionType.IN && isNewDevice) {
        const numQuantity = Number(quantity);
        if (numQuantity > 0 && !isNaN(numQuantity)) {
            // Adjust the array size while preserving existing inputs
            setRegistrationNumbers(currentRegNums => {
                const newRegNums = new Array(numQuantity).fill('');
                // Copy over existing values that fit within the new quantity
                currentRegNums.slice(0, numQuantity).forEach((val, index) => {
                    newRegNums[index] = val;
                });
                return newRegNums;
            });
        } else {
            setRegistrationNumbers([]);
        }
    } else {
        setRegistrationNumbers([]);
    }
  }, [quantity, transactionType, isNewDevice]);

  const handleRegNumChange = (index: number, value: string) => {
    const newRegNums = [...registrationNumbers];
    newRegNums[index] = value;
    setRegistrationNumbers(newRegNums);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockError) {
        showErrorNotification(stockError);
        return;
    }
    setIsLoading(true);

    // Filter out empty or whitespace-only registration numbers
    const validRegistrationNumbers = registrationNumbers.filter(num => num.trim() !== '');

    // Define the base transaction data object
    const transactionData: Partial<Transaction> = {
        type: transactionType,
        deviceId: isNewDevice ? `NEW-${Date.now()}` : selectedDeviceId,
        deviceName: isNewDevice ? newDeviceName : (selectedDevice?.name || ''),
        quantity: Number(quantity),
        user: user?.name,
        ...(transactionType === TransactionType.OUT ? { destination, recipient } : { source, sender }),
    };
    
    // Conditionally add registration numbers for new incoming devices
    if (isNewDevice && transactionType === TransactionType.IN && validRegistrationNumbers.length > 0) {
        transactionData.registrationNumbers = validRegistrationNumbers;
    }

    console.log("Creating transaction:", transactionData);

    try {
        const telegramSettings = JSON.parse(localStorage.getItem('telegramSettings') || '{}');
        if (telegramSettings.enabled && telegramSettings.botToken && telegramSettings.chatId) {
            
            let message = `*Transaksi Baru: ${transactionType === TransactionType.IN ? 'Barang Masuk' : 'Barang Keluar'}*
Oleh: ${user?.name}
Perangkat: ${transactionData.deviceName}
Jumlah: ${transactionData.quantity}
${transactionType === TransactionType.OUT 
    ? `Tujuan: ${destination} (Penerima: ${recipient})` 
    : `Sumber: ${source} (Pengirim: ${sender})`}`;

            // Update the telegram message formatting to include registration numbers
            if (validRegistrationNumbers.length > 0) {
                message += `\nNomor Registrasi:\n - ${validRegistrationNumbers.join('\n - ')}`;
            }

            await sendTelegramMessage(telegramSettings.botToken, telegramSettings.chatId, message);

            const finalStock = summary?.finalStock;
            const initialStock = summary?.initialStock;
            const LOW_STOCK_THRESHOLD = 5; 
            
            if (finalStock !== undefined && initialStock !== undefined && finalStock < LOW_STOCK_THRESHOLD && initialStock >= LOW_STOCK_THRESHOLD) {
                const lowStockMessage = `*‼️ STOK MENIPIS ‼️*
Perangkat: ${transactionData.deviceName}
Sisa Stok: ${finalStock}`;
                await sendTelegramMessage(telegramSettings.botToken, telegramSettings.chatId, lowStockMessage);
            }
        }
    } catch (error) {
        console.error("Failed to process notifications:", error);
        showErrorNotification("Gagal mengirim notifikasi.");
    }

    showSuccessNotification('Transaksi berhasil dibuat!');
    setIsLoading(false);
    
    // Reset form for next transaction
    setQuantity(1);
    setNewDeviceName('');
    setNewDeviceBrand('');
    setDestination('');
    setRecipient('');
    setSource('');
    setSender('');
    setRegistrationNumbers([]);
    setSummary(null);
    if (!isNewDevice && mockDevices.length > 0) {
      setSelectedDeviceId(mockDevices[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{UI_TEXT.createTransaction}</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Column 1: Form Inputs */}
          <div className="space-y-6">
            
            {/* Transaction Type Section */}
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{UI_TEXT.transactionType}</label>
              <div className="flex items-center space-x-4">
                <button type="button" onClick={() => setTransactionType(TransactionType.OUT)} className={`px-4 py-2 rounded-md text-sm font-medium w-full ${transactionType === TransactionType.OUT ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{UI_TEXT.outgoing}</button>
                <button type="button" onClick={() => setTransactionType(TransactionType.IN)} className={`px-4 py-2 rounded-md text-sm font-medium w-full ${transactionType === TransactionType.IN ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{UI_TEXT.incoming}</button>
              </div>
            </div>
            
            {/* Device Details Section */}
            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-4">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">{UI_TEXT.deviceDetails}</h3>
              {transactionType === TransactionType.IN && (
                <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                        <input type="radio" name="device-type" checked={!isNewDevice} onChange={() => setIsNewDevice(false)} className="form-radio h-4 w-4 text-blue-600"/>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Perangkat yang Ada</span>
                    </label>
                     <label className="flex items-center">
                        <input type="radio" name="device-type" checked={isNewDevice} onChange={() => setIsNewDevice(true)} className="form-radio h-4 w-4 text-blue-600"/>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Tambah Perangkat Baru</span>
                    </label>
                </div>
              )}
              { isNewDevice && transactionType === TransactionType.IN ? (
                   <div className="space-y-4">
                      <input type="text" placeholder="Nama Perangkat Baru" value={newDeviceName} onChange={e => setNewDeviceName(e.target.value)} required className={inputClasses}/>
                      <select value={newDeviceCategory} onChange={e => setNewDeviceCategory(e.target.value)} required className={inputClasses}>
                          {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <input type="text" placeholder="Merek Perangkat" value={newDeviceBrand} onChange={e => setNewDeviceBrand(e.target.value)} required className={inputClasses}/>
                      <select value={newDeviceCondition} onChange={e => setNewDeviceCondition(e.target.value as 'Normal' | 'Rusak')} required className={inputClasses}>
                          <option value="Normal">Normal</option>
                          <option value="Rusak">Rusak</option>
                      </select>
                  </div>
              ) : (
                  <div>
                    <label htmlFor="device" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.name}</label>
                    <select id="device" value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} required className={inputClasses}>
                      {mockDevices.map((device: Device) => (<option key={device.id} value={device.id}>{device.name} (Stok: {device.quantity})</option>))}
                    </select>
                  </div>
              )}
            </div>

            {/* Transaction Details Section */}
            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-4">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">{UI_TEXT.transactionDetails}</h3>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{UI_TEXT.quantity}</label>
                <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required className={inputClasses}/>
              </div>
              {transactionType === TransactionType.OUT ? (
                <>
                  <input type="text" placeholder="Tujuan" value={destination} onChange={(e) => setDestination(e.target.value)} required className={inputClasses} />
                  <input type="text" placeholder="Penerima" value={recipient} onChange={(e) => setRecipient(e.target.value)} required className={inputClasses} />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Sumber" value={source} onChange={(e) => setSource(e.target.value)} required className={inputClasses} />
                  <input type="text" placeholder="Pengirim" value={sender} onChange={(e) => setSender(e.target.value)} required className={inputClasses} />
                </>
              )}
            </div>
          </div>

          {/* Column 2: Transaction Summary & Registration Numbers */}
          <div className="space-y-6">
             {summary && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg sticky top-6">
                <h3 className="font-bold text-lg mb-4">{UI_TEXT.transactionSummary}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Perangkat:</span> <span className="font-medium text-right">{summary.deviceName}</span></div>
                  <hr className="border-gray-200 dark:border-gray-600"/>
                  <div className="flex justify-between"><span>{UI_TEXT.initialStock}:</span> <span>{summary.initialStock}</span></div>
                  <div className={`flex justify-between font-medium ${transactionType === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                    <span>{UI_TEXT.transactionAmount}:</span>
                    <span>{transactionType === 'in' ? '+' : '-'} {summary.amount}</span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-500 border-dashed"/>
                  <div className="flex justify-between font-bold text-base"><span>{UI_TEXT.finalStock}:</span> <span>{summary.finalStock}</span></div>
                </div>
                {stockError && <p className="mt-4 text-sm text-red-500 font-semibold">{stockError}</p>}
              </div>
             )}
            
            {registrationNumbers.length > 0 && (
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{UI_TEXT.deviceRegistrationNumber}</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {registrationNumbers.map((regNum, index) => (
                             <input key={index} type="text" placeholder={`Nomor Registrasi #${index + 1}`} value={regNum} onChange={e => handleRegNumChange(index, e.target.value)} className={`w-full ${inputClasses}`}/>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
           {/* Submit Button spanning both columns */}
          <div className="md:col-span-2 pt-4">
            <button type="submit" disabled={isLoading || !!stockError} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800 dark:disabled:text-gray-400 disabled:cursor-not-allowed">
              {isLoading ? 'Memproses...' : UI_TEXT.createTransaction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Menu;

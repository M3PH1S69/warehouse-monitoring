import { Device, Category, Transaction, TransactionType } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Laptop', description: 'Perangkat komputer portabel' },
  { id: '2', name: 'Desktop', description: 'Komputer desktop' },
  { id: '3', name: 'Monitor', description: 'Layar monitor' },
  { id: '4', name: 'Printer', description: 'Perangkat cetak' },
  { id: '5', name: 'Networking', description: 'Perangkat jaringan' },
  { id: '6', name: 'Aksesoris', description: 'Aksesoris komputer' }
];

export const mockDevices: Device[] = [
  {
    id: 'DEV001',
    name: 'Laptop Dell Inspiron 15',
    category: 'Laptop',
    brand: 'Dell',
    condition: 'Normal',
    quantity: 25,
    status: 'In Stock',
    registrationNumbers: ['LT001', 'LT002', 'LT003']
  },
  {
    id: 'DEV002', 
    name: 'Monitor Samsung 24"',
    category: 'Monitor',
    brand: 'Samsung',
    condition: 'Normal',
    quantity: 15,
    status: 'In Stock',
    registrationNumbers: ['MN001', 'MN002']
  },
  {
    id: 'DEV003',
    name: 'Printer HP LaserJet',
    category: 'Printer', 
    brand: 'HP',
    condition: 'Normal',
    quantity: 8,
    status: 'In Stock',
    registrationNumbers: ['PR001']
  },
  {
    id: 'DEV004',
    name: 'Router Cisco',
    category: 'Networking',
    brand: 'Cisco',
    condition: 'Normal',
    quantity: 3,
    status: 'Low Stock',
    registrationNumbers: ['RT001']
  },
  {
    id: 'DEV005',
    name: 'Desktop HP EliteDesk',
    category: 'Desktop',
    brand: 'HP',
    condition: 'Rusak',
    quantity: 2,
    status: 'Low Stock',
    registrationNumbers: ['DT001']
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: TransactionType.OUT,
    deviceId: 'DEV001',
    deviceName: 'Laptop Dell Inspiron 15',
    quantity: 5,
    date: '2024-01-15',
    user: 'Admin User',
    destination: 'Kantor Cabang Jakarta',
    recipient: 'John Doe'
  },
  {
    id: 'TXN002',
    type: TransactionType.IN,
    deviceId: 'DEV002',
    deviceName: 'Monitor Samsung 24"',
    quantity: 10,
    date: '2024-01-14',
    user: 'Admin User',
    source: 'Supplier ABC',
    sender: 'Jane Smith'
  },
  {
    id: 'TXN003',
    type: TransactionType.OUT,
    deviceId: 'DEV003',
    deviceName: 'Printer HP LaserJet',
    quantity: 2,
    date: '2024-01-13',
    user: 'Staff User',
    destination: 'Kantor Cabang Surabaya',
    recipient: 'Bob Wilson'
  }
];

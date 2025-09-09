import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useTheme';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';
import Transactions from '../pages/Transactions';
import Users from '../pages/Users';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import Categories from '../pages/Categories';
import { UserRole } from '../types';
import './index.css'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <MainApp />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const MainApp = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* pastikan root tanpa auth diarahkan ke login hash route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transactions" element={<Transactions />} />
            {user.role === UserRole.ADMINISTRATOR && <Route path="/categories" element={<Categories />} />}
            {user.role === UserRole.ADMINISTRATOR && <Route path="/users" element={<Users />} />}
            {user.role === UserRole.ADMINISTRATOR && <Route path="/menu" element={<Menu />} />}
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;

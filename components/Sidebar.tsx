import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UI_TEXT } from '../constants';
import { UserRole } from '../types';
import { DashboardIcon, InventoryIcon, TransactionIcon, UserIcon, SettingsIcon, CreateTransactionIcon, CategoryIcon } from './icons/Icons';

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const { user } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-base font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <aside className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
      <div className="w-64">
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{UI_TEXT.inventory}</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink to="/" className={navLinkClasses}>
            <DashboardIcon className="w-6 h-6 mr-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{UI_TEXT.dashboard}</span>
          </NavLink>
          <NavLink to="/inventory" className={navLinkClasses}>
            <InventoryIcon className="w-6 h-6 mr-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{UI_TEXT.inventory}</span>
          </NavLink>
          {user?.role === UserRole.ADMINISTRATOR && (
              <NavLink to="/categories" className={navLinkClasses}>
                  <CategoryIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{UI_TEXT.categories}</span>
              </NavLink>
          )}
          <NavLink to="/transactions" className={navLinkClasses}>
            <TransactionIcon className="w-6 h-6 mr-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{UI_TEXT.transactions}</span>
          </NavLink>
          {user?.role === UserRole.ADMINISTRATOR && (
            <NavLink to="/menu" className={navLinkClasses}>
              <CreateTransactionIcon className="w-6 h-6 mr-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{UI_TEXT.createTransaction}</span>
            </NavLink>
          )}
          {user?.role === UserRole.ADMINISTRATOR && (
            <NavLink to="/users" className={navLinkClasses}>
              <UserIcon className="w-6 h-6 mr-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{UI_TEXT.users}</span>
            </NavLink>
          )}
          <NavLink to="/settings" className={navLinkClasses}>
            <SettingsIcon className="w-6 h-6 mr-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{UI_TEXT.settings}</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
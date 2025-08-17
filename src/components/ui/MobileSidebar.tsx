'use client';

import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  EnvelopeIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import {
  EnvelopeIcon as EnvelopeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  user
}) => {
  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: HomeIcon, current: activeTab === 'dashboard' },
    { name: 'Campaigns', href: 'campaigns', icon: MegaphoneIcon, current: activeTab === 'campaigns' },
    { name: 'Leads', href: 'leads', icon: UserGroupIcon, current: activeTab === 'leads' },
    { name: 'Analytics', href: 'analytics', icon: ChartBarIcon, current: activeTab === 'analytics' },
    { name: 'Settings', href: 'settings', icon: Cog6ToothIcon, current: activeTab === 'settings' },
  ];

  // Handle body scroll lock when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen, setSidebarOpen]);

  if (!sidebarOpen) return null;

  return (
    <div className="relative z-40 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed inset-0 flex z-40">
        <div 
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <img 
                src="/logo with no background no nae just logo.png" 
                alt="Reachly Logo" 
                className="h-8 w-auto mr-3"
              />
              <span className="text-xl font-bold text-blue-600">Reachly</span>
            </div>
            
            {/* Navigation */}
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.current 
                  ? (item.name === 'Analytics' ? ChartBarIconSolid : item.icon)
                  : item.icon;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      item.current
                        ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-l-md w-full text-left transition-colors`}
                  >
                    <IconComponent
                      className={`${
                        item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
      </div>
    </div>
  );
};

export default MobileSidebar;

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface ModernTopbarProps {
  sidebarExpanded?: boolean;
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
  user?: any;
  onLogout?: () => void;
  onCreateNew?: () => void;
}

const ModernTopbar: React.FC<ModernTopbarProps> = ({
  sidebarExpanded = false,
  onMobileMenuToggle,
  showMobileMenu = false,
  user,
  onLogout,
  onCreateNew
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);

  // Adjust left margin based on sidebar state
  const leftMargin = sidebarExpanded ? 'ml-72' : 'ml-16';

  return (
    <header
      className="fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-200"
      style={{ left: 64 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left Section - Mobile menu & Search */}
          <div className="flex items-center flex-1 max-w-lg">
            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuToggle}
              className="p-2 text-gray-500 hover:text-gray-700 md:hidden"
            >
              {showMobileMenu ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>

            {/* Simple Search Bar */}
            <div className="relative flex-1 ml-4 md:ml-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-gray-300 focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Section - Simple Actions */}
          <div className="flex items-center space-x-2">
            {/* Simple Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <BellIcon className="h-5 w-5" />
              {hasNotifications && (
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernTopbar;

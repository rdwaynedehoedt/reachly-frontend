'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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

  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header
      className="fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-200"
      style={{ left: 64 }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left Section - Mobile menu */}
          <div className="flex items-center">
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

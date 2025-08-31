'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MegaphoneIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MegaphoneIcon as MegaphoneIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';

interface ModernSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  onLogout?: () => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: 'dashboard', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      current: activeTab === 'dashboard' 
    },
    { 
      name: 'Campaigns', 
      href: 'campaigns', 
      icon: MegaphoneIcon, 
      iconSolid: MegaphoneIconSolid,
      current: activeTab === 'campaigns' 
    },
    { 
      name: 'Leads', 
      href: 'leads', 
      icon: UserGroupIcon, 
      iconSolid: UserGroupIconSolid,
      current: activeTab === 'leads' 
    },
    { 
      name: 'Analytics', 
      href: 'analytics', 
      icon: ChartBarIcon, 
      iconSolid: ChartBarIconSolid,
      current: activeTab === 'analytics' 
    },
    { 
      name: 'Settings', 
      href: 'settings', 
      icon: Cog6ToothIcon, 
      iconSolid: Cog6ToothIconSolid,
      current: activeTab === 'settings' 
    },
  ];

  // Show expanded on hover or when manually expanded
  const shouldShow = isExpanded || isHovering;

  // Auto-collapse on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('modern-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  return (
    <motion.div
      id="modern-sidebar"
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 flex flex-col"
      initial={{ width: 64 }}
      animate={{ width: shouldShow ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-100">
        <div className="flex items-center">
          {shouldShow ? (
            <div className="flex items-center space-x-3">
              <img 
                src="/logo with no background no nae just logo.png" 
                alt="Reachly" 
                className="h-7 w-auto"
              />
              <span className="text-lg font-semibold text-gray-900">Reachly</span>
            </div>
          ) : (
            <img 
              src="/logo with no background no nae just logo.png" 
              alt="Reachly" 
              className="h-7 w-auto"
            />
          )}
        </div>
      </div>



      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-hidden">
        {navigation.map((item) => {
          const IconComponent = item.current ? item.iconSolid : item.icon;
          
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.href)}
              className={`relative w-full flex items-center group py-3 transition-colors ${
                item.current
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >

              
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-6">
                <IconComponent className="h-5 w-5" />
              </div>

              {/* Label */}
              {shouldShow && (
                <span className="ml-4 font-medium text-sm truncate">
                  {item.name}
                </span>
              )}

              {/* Simple tooltip */}
              {!shouldShow && (
                <div className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center group cursor-pointer">
          {/* Avatar */}
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium text-sm">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>

          {/* User info */}
          {shouldShow && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          )}

          {/* Logout button */}
          {shouldShow && (
            <button
              onClick={onLogout}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            </button>
          )}

          {/* Simple tooltip */}
          {!shouldShow && (
            <div className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {user?.firstName} {user?.lastName}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ModernSidebar;

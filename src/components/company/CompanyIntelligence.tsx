'use client';

import React from 'react';
import { BuildingOfficeIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function CompanyIntelligence() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Intelligence</h1>
                <p className="text-gray-600">Discover insights about companies and their decision makers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feature Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Company Profiles</h3>
              </div>
              <p className="text-gray-600">Get detailed information about companies including size, industry, and key metrics.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Decision Makers</h3>
              </div>
              <p className="text-gray-600">Find and connect with key decision makers and stakeholders within companies.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Market Intelligence</h3>
              </div>
              <p className="text-gray-600">Access market trends, competitor analysis, and industry insights.</p>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Company Intelligence Dashboard</h2>
                <p className="text-gray-600 mb-6">
                  Advanced company research and intelligence features are coming soon. 
                  Get detailed company profiles, team structures, and business insights.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>🏢 Company Research Tools</p>
                  <p>👥 Team Mapping & Org Charts</p>
                  <p>📊 Financial & Market Data</p>
                  <p>🎯 Strategic Contact Identification</p>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Use the Search tab to find company employees and decision makers with our current tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

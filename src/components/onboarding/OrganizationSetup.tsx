import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Industry = {
  id: string;
  name: string;
};

type CompanySize = {
  id: string;
  name: string;
};

const industries: Industry[] = [
  { id: 'technology', name: 'Technology & Software' },
  { id: 'marketing', name: 'Marketing & Advertising' },
  { id: 'ecommerce', name: 'E-commerce & Retail' },
  { id: 'finance', name: 'Finance & Banking' },
  { id: 'healthcare', name: 'Healthcare & Medical' },
  { id: 'education', name: 'Education & Training' },
  { id: 'nonprofit', name: 'Non-profit & Charity' },
  { id: 'other', name: 'Other' }
];

const companySizes: CompanySize[] = [
  { id: 'solo', name: 'Solo' },
  { id: 'small', name: '2-10 employees' },
  { id: 'medium', name: '11-50 employees' },
  { id: 'large', name: '51-200 employees' },
  { id: 'enterprise', name: '201+ employees' }
];

interface OrganizationSetupProps {
  onOrganizationSetup: (organizationData: {
    mode: 'create' | 'join';
    name?: string;
    industry?: string;
    size?: string;
    existingOrgId?: string;
  }) => void;
  onContinue: () => void;
  onBack: () => void;
}

const OrganizationSetup: React.FC<OrganizationSetupProps> = ({
  onOrganizationSetup,
  onContinue,
  onBack
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; members: number }[]>([]);

  // Mock search function - in real implementation, this would call an API
  const handleSearch = () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock results
      const results = [
        { id: 'org1', name: 'Acme Inc', members: 12 },
        { id: 'org2', name: 'Globex Corporation', members: 5 },
        { id: 'org3', name: 'Initech', members: 8 }
      ].filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 600);
  };

  const handleContinue = () => {
    if (mode === 'create') {
      if (organizationName && industry && companySize) {
        onOrganizationSetup({
          mode: 'create',
          name: organizationName,
          industry,
          size: companySize
        });
        onContinue();
      }
    } else if (mode === 'join' && selectedOrgId) {
      onOrganizationSetup({
        mode: 'join',
        existingOrgId: selectedOrgId
      });
      onContinue();
    }
  };

  const isFormValid = () => {
    if (mode === 'create') {
      return organizationName && industry && companySize;
    }
    return !!selectedOrgId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Let's set up your organization
        </h1>
        <p className="text-lg text-gray-600">
          Create a new organization or join an existing one
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-4 text-center font-medium ${
              mode === 'create'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create New Organization
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-4 text-center font-medium ${
              mode === 'join'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Join Existing Organization
          </button>
        </div>

        <div className="p-6">
          {mode === 'create' ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name*
                </label>
                <input
                  type="text"
                  id="org-name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your organization name"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry*
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an industry</option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company-size" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size*
                </label>
                <select
                  id="company-size"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select company size</option>
                  {companySizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="org-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search for your organization
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="org-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter organization name"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Search
                  </button>
                </div>
              </div>

              {isSearching ? (
                <div className="flex justify-center py-4">
                  <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Select your organization:</p>
                  {searchResults.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`p-4 border rounded-md cursor-pointer ${
                        selectedOrgId === org.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{org.name}</h3>
                          <p className="text-sm text-gray-500">{org.members} members</p>
                        </div>
                        {selectedOrgId === org.id && (
                          <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No organizations found with that name.</p>
                  <p className="text-sm text-gray-500 mt-1">Try a different search term or create a new organization.</p>
                </div>
              ) : null}

              <div className="text-sm text-gray-500">
                <p>Can't find your organization? Ask your administrator for an invitation link or create a new organization.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isFormValid()}
          className={`px-6 py-2 rounded-md font-medium ${
            isFormValid()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default OrganizationSetup;
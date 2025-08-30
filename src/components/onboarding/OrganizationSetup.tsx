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
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');



  const handleContinue = () => {
    if (organizationName && industry && companySize) {
      onOrganizationSetup({
        mode: 'create',
        name: organizationName,
        industry,
        size: companySize
      });
      onContinue();
    }
  };

  const isFormValid = () => {
    return organizationName && industry && companySize;
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
          Tell us about your organization to personalize your experience
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name*
              </label>
              <input
                type="text"
                id="org-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your organization name"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry*
              </label>
              <div className="relative">
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select an industry</option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="company-size" className="block text-sm font-medium text-gray-700 mb-2">
                Company Size*
              </label>
              <div className="relative">
                <select
                  id="company-size"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select company size</option>
                  {companySizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
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
              ? 'bg-blue-600 text-white hover:bg-blue-700'
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
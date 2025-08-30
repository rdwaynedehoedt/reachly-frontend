import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Role = {
  id: string;
  title: string;
  icon: string;
  description?: string;
};

const roles: Role[] = [
  {
    id: 'marketing',
    title: 'Marketing Manager',
    icon: '📣',
    description: 'Create and manage email campaigns'
  },
  {
    id: 'sales',
    title: 'Sales Representative',
    icon: '🤝',
    description: 'Connect with leads and prospects'
  },
  {
    id: 'founder',
    title: 'Business Owner/Founder',
    icon: '👑',
    description: 'Grow your business with email marketing'
  },
  {
    id: 'operations',
    title: 'Operations Manager',
    icon: '⚙️',
    description: 'Streamline marketing operations'
  },
  {
    id: 'customer_success',
    title: 'Customer Success',
    icon: '🌟',
    description: 'Engage with existing customers'
  },
  {
    id: 'other',
    title: 'Other',
    icon: '✨',
    description: 'Tell us more about your role'
  }
];

interface RoleSelectionProps {
  onRoleSelect: (roleId: string) => void;
  onContinue: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect, onContinue }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    onRoleSelect(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onContinue();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What best describes your role?
        </h1>
        <p className="text-lg text-gray-600">
          We'll use this information to surface the most relevant features for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect(role.id)}
            className={`cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
              selectedRole === role.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-3">{role.icon}</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {role.title}
              </h3>
              {role.description && (
                <p className="text-sm text-gray-500">{role.description}</p>
              )}
              {selectedRole === role.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-3 bg-blue-600 text-white rounded-full p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`px-6 py-2 rounded-md font-medium ${
            selectedRole
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

export default RoleSelection;
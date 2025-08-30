import React from 'react';
import { motion } from 'framer-motion';

interface CompletionScreenProps {
  userData: {
    role?: string;
    goals?: string[];
    experienceLevel?: string;
    organization?: {
      name: string;
      isNew: boolean;
    };
  };
  onComplete: (action: string) => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  userData,
  onComplete
}) => {

  // Determine recommended next steps based on user data
  const getRecommendedActions = () => {
    const actions = [];
    
    if (userData.goals?.includes('email_campaigns')) {
      actions.push({
        id: 'create_campaign',
        title: 'Create Your First Campaign',
        description: 'Start engaging with your audience',
        icon: '✉️'
      });
    }
    
    if (userData.goals?.includes('contact_management')) {
      actions.push({
        id: 'import_contacts',
        title: 'Import Your Contacts',
        description: 'Build your contact database',
        icon: '👥'
      });
    }
    
    if (userData.organization?.isNew) {
      actions.push({
        id: 'setup_organization',
        title: 'Complete Organization Setup',
        description: 'Add your logo and customize settings',
        icon: '🏢'
      });
    }
    
    // Always include explore dashboard
    actions.push({
      id: 'explore_dashboard',
      title: 'Explore Your Dashboard',
      description: 'Get familiar with Reachly',
      icon: '🚀'
    });
    
    return actions;
  };

  const recommendedActions = getRecommendedActions();

  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-4 text-center"
      >
        {/* Simple success circle */}
        <motion.div 
          className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.svg 
            className="w-10 h-10 text-white" 
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          You're all set!
        </motion.h1>
        
        <motion.p
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          Your Reachly account is ready to use
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Here's what you can do next
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                onClick={() => onComplete(action.id)}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-2xl">
                  {action.icon}
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-500 mb-4">
            Need help getting started? Check out our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              quick start guide
            </a>
            {' '}or{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              contact support
            </a>
          </p>
          <button
            onClick={() => onComplete('explore_dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompletionScreen;
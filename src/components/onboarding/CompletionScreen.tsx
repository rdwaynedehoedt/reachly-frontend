import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

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
  useEffect(() => {
    // Trigger confetti animation on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 10 }}
        className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-green-100 rounded-full"
      >
        <svg className="w-12 h-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-4xl font-bold text-gray-900 mb-4"
      >
        You're all set!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-xl text-gray-600 mb-8"
      >
        Your Reachly account is ready to use
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mb-12"
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
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              onClick={() => onComplete(action.id)}
              className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-full text-2xl">
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
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-center"
      >
        <p className="text-gray-500 mb-4">
          Need help getting started? Check out our{' '}
          <a href="#" className="text-indigo-600 hover:text-indigo-800">
            quick start guide
          </a>
          {' '}or{' '}
          <a href="#" className="text-indigo-600 hover:text-indigo-800">
            contact support
          </a>
        </p>
        <button
          onClick={() => onComplete('explore_dashboard')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors duration-200"
        >
          Go to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
};

export default CompletionScreen;
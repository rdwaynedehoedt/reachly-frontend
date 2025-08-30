import React, { useState } from 'react';
import { motion } from 'framer-motion';

type Goal = {
  id: string;
  title: string;
  description: string;
  recommended?: boolean;
  roleSpecific?: string[];
  icon?: string;
  category?: 'marketing' | 'sales' | 'analytics' | 'productivity' | 'other';
};

const allGoals: Goal[] = [
  // Marketing goals
  {
    id: 'email_campaigns',
    title: 'Create email campaigns',
    description: 'Design and send professional email campaigns to your audience',
    recommended: true,
    roleSpecific: ['marketing', 'founder'],
    icon: '✉️',
    category: 'marketing'
  },
  {
    id: 'newsletter',
    title: 'Send regular newsletters',
    description: 'Keep your audience engaged with consistent, valuable content',
    roleSpecific: ['marketing', 'founder'],
    icon: '📰',
    category: 'marketing'
  },
  {
    id: 'drip_campaigns',
    title: 'Set up drip campaigns',
    description: 'Create automated email sequences that deliver over time',
    roleSpecific: ['marketing', 'sales'],
    icon: '💧',
    category: 'marketing'
  },
  {
    id: 'personalization',
    title: 'Personalize email content',
    description: 'Create dynamic, personalized content for different segments',
    roleSpecific: ['marketing'],
    icon: '👤',
    category: 'marketing'
  },
  
  // Sales goals
  {
    id: 'contact_management',
    title: 'Manage contacts and leads',
    description: 'Organize and segment your contacts for targeted outreach',
    recommended: true,
    roleSpecific: ['sales', 'marketing', 'founder'],
    icon: '📇',
    category: 'sales'
  },
  {
    id: 'lead_generation',
    title: 'Generate more leads',
    description: 'Create lead magnets and capture forms to grow your database',
    roleSpecific: ['sales', 'marketing'],
    icon: '🎯',
    category: 'sales'
  },
  {
    id: 'sales_outreach',
    title: 'Streamline sales outreach',
    description: 'Create templates and workflows for consistent sales communications',
    roleSpecific: ['sales'],
    icon: '🤝',
    category: 'sales'
  },
  {
    id: 'lead_nurturing',
    title: 'Nurture leads to conversion',
    description: 'Guide prospects through your sales funnel with targeted content',
    roleSpecific: ['sales', 'marketing'],
    icon: '🌱',
    category: 'sales'
  },
  
  // Analytics goals
  {
    id: 'performance_tracking',
    title: 'Track email performance',
    description: 'Monitor opens, clicks, and conversions to optimize results',
    roleSpecific: ['marketing', 'operations'],
    icon: '📊',
    category: 'analytics'
  },
  {
    id: 'ab_testing',
    title: 'Run A/B tests',
    description: 'Test different subject lines, content, and send times to optimize',
    roleSpecific: ['marketing'],
    icon: '🧪',
    category: 'analytics'
  },
  {
    id: 'roi_reporting',
    title: 'Measure campaign ROI',
    description: 'Track revenue attribution and campaign performance metrics',
    roleSpecific: ['marketing', 'founder'],
    icon: '💰',
    category: 'analytics'
  },
  {
    id: 'audience_insights',
    title: 'Gain audience insights',
    description: 'Understand subscriber behavior and preferences',
    roleSpecific: ['marketing', 'operations'],
    icon: '🔍',
    category: 'analytics'
  },
  
  // Productivity goals
  {
    id: 'automation',
    title: 'Automate follow-ups',
    description: 'Set up automated sequences to nurture leads and customers',
    roleSpecific: ['sales', 'customer_success'],
    icon: '⚙️',
    category: 'productivity'
  },
  {
    id: 'collaboration',
    title: 'Collaborate with team members',
    description: 'Work together with your team on campaigns and contacts',
    roleSpecific: ['operations', 'founder'],
    icon: '👥',
    category: 'productivity'
  },
  {
    id: 'workflow_optimization',
    title: 'Optimize marketing workflows',
    description: 'Create efficient processes for campaign creation and approval',
    roleSpecific: ['operations', 'marketing'],
    icon: '📋',
    category: 'productivity'
  },
  {
    id: 'template_management',
    title: 'Manage email templates',
    description: 'Create and organize reusable templates for consistent branding',
    roleSpecific: ['marketing', 'operations'],
    icon: '📝',
    category: 'productivity'
  },
  
  // Other goals
  {
    id: 'customer_retention',
    title: 'Improve customer retention',
    description: 'Keep customers engaged and reduce churn with targeted communications',
    roleSpecific: ['customer_success', 'marketing'],
    icon: '🔄',
    category: 'other'
  },
  {
    id: 'event_promotion',
    title: 'Promote events and webinars',
    description: 'Drive registrations and attendance for your virtual or in-person events',
    roleSpecific: ['marketing'],
    icon: '📅',
    category: 'other'
  },
  {
    id: 'product_announcements',
    title: 'Announce new products or features',
    description: 'Keep customers informed about your latest offerings',
    roleSpecific: ['marketing', 'product'],
    icon: '🚀',
    category: 'other'
  },
  {
    id: 'explore',
    title: 'Just exploring Reachly',
    description: 'I want to see what Reachly has to offer',
    icon: '🔍',
    category: 'other'
  }
];

interface GoalSelectionProps {
  selectedRole: string;
  onGoalsSelect: (goalIds: string[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

const GoalSelection: React.FC<GoalSelectionProps> = ({
  selectedRole,
  onGoalsSelect,
  onContinue,
  onBack
}) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Filter goals based on selected role
  const goals = allGoals.filter(
    goal => !goal.roleSpecific || goal.roleSpecific.includes(selectedRole)
  );

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      const isSelected = prev.includes(goalId);
      
      // If selecting "Just exploring", deselect all others
      if (goalId === 'explore' && !isSelected) {
        return ['explore'];
      }
      
      // If selecting another goal while "Just exploring" is selected, remove it
      if (goalId !== 'explore' && prev.includes('explore')) {
        return [goalId];
      }
      
      // Normal toggle behavior
      return isSelected 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId];
    });
  };

  const handleContinue = () => {
    onGoalsSelect(selectedGoals);
    onContinue();
  };

  React.useEffect(() => {
    // Pre-select recommended goals for the selected role
    const recommendedGoals = goals
      .filter(goal => goal.recommended && (!goal.roleSpecific || goal.roleSpecific.includes(selectedRole)))
      .map(goal => goal.id);
    
    if (recommendedGoals.length > 0) {
      setSelectedGoals(recommendedGoals);
    }
  }, [selectedRole]);

  // Group goals by category
  const goalsByCategory = React.useMemo(() => {
    const categories = {
      marketing: { title: 'Marketing', goals: [] as Goal[] },
      sales: { title: 'Sales', goals: [] as Goal[] },
      analytics: { title: 'Analytics', goals: [] as Goal[] },
      productivity: { title: 'Productivity', goals: [] as Goal[] },
      other: { title: 'Other', goals: [] as Goal[] }
    };
    
    goals.forEach(goal => {
      const category = goal.category || 'other';
      if (categories[category]) {
        categories[category].goals.push(goal);
      }
    });
    
    return Object.values(categories).filter(cat => cat.goals.length > 0);
  }, [goals]);
  
  // Count selected goals
  const selectedCount = selectedGoals.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What would you like to do with Reachly?
        </h1>
        <p className="text-lg text-gray-600">
          We'll use your input to recommend the best next steps
        </p>
        {selectedCount > 0 && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
            <span className="mr-1">{selectedCount}</span> 
            {selectedCount === 1 ? 'goal' : 'goals'} selected
          </div>
        )}
      </div>

      <div className="mb-8">
        {goalsByCategory.map((category, catIndex) => (
          <div key={category.title} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleGoal(goal.id)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    selectedGoals.includes(goal.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      {goal.icon ? (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          selectedGoals.includes(goal.id)
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}>
                          {goal.icon}
                        </div>
                      ) : (
                        <div
                          className={`w-6 h-6 rounded border flex items-center justify-center ${
                            selectedGoals.includes(goal.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedGoals.includes(goal.id) && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </motion.svg>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap">
                        <h3 className="text-lg font-medium text-gray-900 mr-2">
                          {goal.title}
                        </h3>
                        {goal.recommended && (
                          <span className="mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                    </div>
                    <div className="ml-4">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          selectedGoals.includes(goal.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedGoals.includes(goal.id) && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
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
          disabled={selectedGoals.length === 0}
          className={`px-6 py-2 rounded-md font-medium ${
            selectedGoals.length > 0
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

export default GoalSelection;
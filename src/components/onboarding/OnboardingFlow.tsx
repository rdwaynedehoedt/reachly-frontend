import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import RoleSelection from './RoleSelection';
import GoalSelection from './GoalSelection';
import ExperienceLevel from './ExperienceLevel';
import OrganizationSetup from './OrganizationSetup';
import TeamInvitation from './TeamInvitation';
import EmailConnection from './EmailConnection';
import CompletionScreen from './CompletionScreen';
import { useEmail } from '@/contexts/EmailContext';

interface OnboardingFlowProps {
  userId: string;
  onComplete: (userData: any) => void;
}

type OnboardingStep = 
  | 'role_selection'
  | 'goal_selection'
  | 'experience_level'
  | 'organization_setup'
  | 'team_invitation'
  | 'email_connection'
  | 'completion';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const { emailAccounts } = useEmail();

  // Initialize step based on OAuth callback or start from first step
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    // Check if we're returning from OAuth callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('connected') || urlParams.has('error')) {
        // Return from OAuth, stay on email connection step
        return 'email_connection';
      }
    }
    return 'role_selection';
  });

  // Clear any existing step persistence on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_step');
    }
  }, []);
  
  // Initialize userData from localStorage or defaults
  const [userData, setUserData] = useState(() => {
    const defaultData = {
      userId,
      role: '',
      goals: [] as string[],
      experienceLevel: '',
      organization: {
        name: '',
        industry: '',
        size: '',
        isNew: true
      },
      teamMembers: [] as { email: string; role: string }[],
      emailAccounts: {
        connectedAccounts: [] as { provider: string; email: string; status: string }[],
        skipForNow: false
      }
    };

    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('onboarding_data');
      if (savedData) {
        try {
          return { ...defaultData, ...JSON.parse(savedData) };
        } catch (error) {
          console.warn('Failed to parse saved onboarding data');
        }
      }
    }
    return defaultData;
  });



  // Save userData to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_data', JSON.stringify(userData));
    }
  }, [userData]);

  // Clear localStorage when onboarding is completed
  useEffect(() => {
    if (currentStep === 'completion') {
      localStorage.removeItem('onboarding_data');
    }
  }, [currentStep]);

  // Handle successful OAuth callback and auto-progress to completion
  useEffect(() => {
    if (currentStep === 'email_connection' && emailAccounts.length > 0) {
      // Check if we just returned from OAuth (URL has connected parameter)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('connected')) {
        // Update user data with connected accounts
        const connectedAccounts = emailAccounts.map(account => ({
          provider: account.provider,
          email: account.email,
          status: account.status
        }));
        
        setUserData((prev: typeof userData) => ({
          ...prev,
          emailAccounts: {
            connectedAccounts,
            skipForNow: false
          }
        }));
        
        console.log('✅ Email account connected via OAuth, showing success animation...');
        
        // Show success animation for 3.5 seconds then proceed to completion
        setTimeout(() => {
          console.log('🎯 Auto-progressing to completion screen...');
          setCurrentStep('completion');
        }, 3500); // Give user time to enjoy the beautiful animation
      }
    }
  }, [currentStep, emailAccounts]);

  const handleRoleSelect = (role: string) => {
    setUserData((prev: typeof userData) => ({ ...prev, role }));
  };

  const handleGoalsSelect = (goals: string[]) => {
    setUserData((prev: typeof userData) => ({ ...prev, goals }));
  };

  const handleExperienceSelect = (experienceLevel: string) => {
    setUserData((prev: typeof userData) => ({ ...prev, experienceLevel }));
  };

  const handleOrganizationSetup = (organizationData: {
    mode: 'create' | 'join';
    name?: string;
    industry?: string;
    size?: string;
    existingOrgId?: string;
  }) => {
    if (organizationData.mode === 'create' && organizationData.name) {
      setUserData((prev: typeof userData) => ({
        ...prev,
        organization: {
          name: organizationData.name || '',
          industry: organizationData.industry || '',
          size: organizationData.size || '',
          isNew: true
        }
      }));
    } else if (organizationData.mode === 'join' && organizationData.existingOrgId) {
      // In a real app, you would fetch the organization details here
      setUserData((prev: typeof userData) => ({
        ...prev,
        organization: {
          name: 'Existing Organization', // This would be fetched from the API
          industry: '',
          size: '',
          isNew: false,
          id: organizationData.existingOrgId
        }
      }));
    }
  };

  const handleInviteTeam = (invitees: { email: string; role: string }[]) => {
    setUserData((prev: typeof userData) => ({ ...prev, teamMembers: invitees }));
  };

  const handleEmailSetup = (emailData: { 
    connectedAccounts: { provider: string; email: string; status: string }[];
    skipForNow: boolean;
  }) => {
    setUserData((prev: typeof userData) => ({ ...prev, emailAccounts: emailData }));
    
    // Auto-progress to completion if email account(s) were successfully connected
    if (emailData.connectedAccounts.length > 0) {
      console.log('✅ Email account(s) connected successfully, proceeding to completion...');
      setTimeout(() => {
        setCurrentStep('completion');
      }, 1500); // Give user a moment to see the success state
    }
  };

  const handleNextStep = () => {
    const steps: OnboardingStep[] = [
      'role_selection',
      'goal_selection',
      'experience_level',
      'organization_setup',
      'team_invitation',
      'email_connection',
      'completion'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: OnboardingStep[] = [
      'role_selection',
      'goal_selection',
      'experience_level',
      'organization_setup',
      'team_invitation',
      'email_connection',
      'completion'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    // Skip to next step
    handleNextStep();
  };

  const handleCompletion = (action: string) => {
    // In a real app, you would save all the collected data to the backend here
    console.log('Onboarding completed with data:', userData);
    console.log('User selected action:', action);
    
    // Pass the collected data to the parent component
    onComplete({ ...userData, completionAction: action });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'role_selection':
        return (
          <RoleSelection
            onRoleSelect={handleRoleSelect}
            onContinue={handleNextStep}
          />
        );
      case 'goal_selection':
        return (
          <GoalSelection
            selectedRole={userData.role}
            onGoalsSelect={handleGoalsSelect}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 'experience_level':
        return (
          <ExperienceLevel
            onExperienceSelect={handleExperienceSelect}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
            onSkip={handleSkip}
          />
        );
      case 'organization_setup':
        return (
          <OrganizationSetup
            onOrganizationSetup={handleOrganizationSetup}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 'team_invitation':
        return (
          <TeamInvitation
            onInviteTeam={handleInviteTeam}
            onComplete={handleNextStep}
            onBack={handlePreviousStep}
            onSkip={handleSkip}
          />
        );
      case 'email_connection':
        return (
          <EmailConnection
            onEmailSetup={handleEmailSetup}
            onContinue={handleNextStep}
            onBack={handlePreviousStep}
            onSkip={handleSkip}
          />
        );
      case 'completion':
        return (
          <CompletionScreen
            userData={userData}
            onComplete={handleCompletion}
          />
        );
      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    const steps = [
      'role_selection',
      'goal_selection',
      'experience_level',
      'organization_setup',
      'team_invitation',
      'email_connection'
    ];
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === -1) return 100; // Completion screen
    
    return Math.round((currentIndex / (steps.length - 1)) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {currentStep !== 'completion' && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Step {getStepNumber(currentStep)} of 6
            </span>
            <span className="text-sm font-medium text-gray-500">
              {getProgressPercentage()}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
};

function getStepNumber(step: OnboardingStep): number {
  const steps: OnboardingStep[] = [
    'role_selection',
    'goal_selection',
    'experience_level',
    'organization_setup',
    'team_invitation',
    'email_connection'
  ];
  
  return steps.indexOf(step) + 1;
}

export default OnboardingFlow;
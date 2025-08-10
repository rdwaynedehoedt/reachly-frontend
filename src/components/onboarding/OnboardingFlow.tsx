import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RoleSelection from './RoleSelection';
import GoalSelection from './GoalSelection';
import ExperienceLevel from './ExperienceLevel';
import OrganizationSetup from './OrganizationSetup';
import TeamInvitation from './TeamInvitation';
import CompletionScreen from './CompletionScreen';

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
  | 'completion';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role_selection');
  const [userData, setUserData] = useState({
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
    teamMembers: [] as { email: string; role: string }[]
  });

  const handleRoleSelect = (role: string) => {
    setUserData(prev => ({ ...prev, role }));
  };

  const handleGoalsSelect = (goals: string[]) => {
    setUserData(prev => ({ ...prev, goals }));
  };

  const handleExperienceSelect = (experienceLevel: string) => {
    setUserData(prev => ({ ...prev, experienceLevel }));
  };

  const handleOrganizationSetup = (organizationData: {
    mode: 'create' | 'join';
    name?: string;
    industry?: string;
    size?: string;
    existingOrgId?: string;
  }) => {
    if (organizationData.mode === 'create' && organizationData.name) {
      setUserData(prev => ({
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
      setUserData(prev => ({
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
    setUserData(prev => ({ ...prev, teamMembers: invitees }));
  };

  const handleNextStep = () => {
    const steps: OnboardingStep[] = [
      'role_selection',
      'goal_selection',
      'experience_level',
      'organization_setup',
      'team_invitation',
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
      'team_invitation'
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
              Step {getStepNumber(currentStep)} of 5
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
    'team_invitation'
  ];
  
  return steps.indexOf(step) + 1;
}

export default OnboardingFlow;
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, LoadingScreen } from '@/components/ui';
import { 
  MegaphoneIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Campaign creation steps
type CampaignStep = 'name' | 'leads' | 'sequences' | 'schedule' | 'review';

interface CampaignData {
  name: string;
  description: string;
  selectedLeads: any[];
  emailSequences: EmailSequence[];
  schedule: ScheduleSettings;
}

interface EmailSequence {
  id: string;
  stepNumber: number;
  name: string;
  subject: string;
  content: string;
  delayAmount: number;
  delayUnit: 'minutes' | 'hours' | 'days' | 'weeks';
}

interface ScheduleSettings {
  name: string;
  startTime: string;
  endTime: string;
  timezone: string;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export default function CreateCampaignPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<CampaignStep>('name');
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    selectedLeads: [],
    emailSequences: [],
    schedule: {
      name: 'New schedule',
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'America/New_York',
      days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const validateCampaignName = (name: string): boolean => {
    if (!name.trim()) {
      setErrors({ name: 'Campaign name is required' });
      return false;
    }
    if (name.trim().length <= 3) {
      setErrors({ name: 'Please enter a name with more than 3 characters' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNameSubmit = () => {
    if (validateCampaignName(campaignData.name)) {
      setCurrentStep('leads');
    }
  };

  const steps = [
    { id: 'name', title: 'Campaign Name', description: 'What would you like to name it?' },
    { id: 'leads', title: 'Add Leads', description: 'Select your target audience' },
    { id: 'sequences', title: 'Email Sequences', description: 'Create your email content' },
    { id: 'schedule', title: 'Schedule', description: 'Set timing and preferences' },
    { id: 'review', title: 'Review & Launch', description: 'Review and start your campaign' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepInfo = steps[currentStepIndex];

  if (loading) {
    return <LoadingScreen message="Loading campaign builder..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard?tab=campaigns')}
              className="p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <MegaphoneIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${index <= currentStepIndex 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                  }
                `}>
                  {index < currentStepIndex ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2 
                    ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          {/* Current Step Info */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{currentStepInfo.title}</h2>
            <p className="text-gray-600">{currentStepInfo.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          
          {/* STEP 1: Campaign Name */}
          {currentStep === 'name' && (
            <CampaignNameStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
              errors={errors}
              onNext={handleNameSubmit}
              onCancel={() => router.push('/dashboard?tab=campaigns')}
            />
          )}

          {/* STEP 2: Add Leads */}
          {currentStep === 'leads' && (
            <AddLeadsStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
              onNext={() => setCurrentStep('sequences')}
              onBack={() => setCurrentStep('name')}
            />
          )}

          {/* STEP 3: Email Sequences */}
          {currentStep === 'sequences' && (
            <EmailSequencesStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
              onNext={() => setCurrentStep('schedule')}
              onBack={() => setCurrentStep('leads')}
            />
          )}

          {/* STEP 4: Schedule */}
          {currentStep === 'schedule' && (
            <ScheduleStep 
              campaignData={campaignData}
              setCampaignData={setCampaignData}
              onNext={() => setCurrentStep('review')}
              onBack={() => setCurrentStep('sequences')}
            />
          )}

          {/* STEP 5: Review & Launch */}
          {currentStep === 'review' && (
            <ReviewStep 
              campaignData={campaignData}
              isCreating={isCreating}
              onLaunch={() => {/* TODO: Implement campaign creation */}}
              onBack={() => setCurrentStep('schedule')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// STEP 1: Campaign Name Component
function CampaignNameStep({ 
  campaignData, 
  setCampaignData, 
  errors, 
  onNext, 
  onCancel 
}: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Let's create a new campaign
        </h3>
      </div>

      <div>
        <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Name
        </label>
        <input
          type="text"
          id="campaignName"
          placeholder="My Campaign"
          value={campaignData.name}
          onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
          className={`
            w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.name ? 'border-red-500' : 'border-gray-300'}
          `}
          autoFocus
        />
        {errors.name && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">{errors.name}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="campaignDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="campaignDescription"
          placeholder="Brief description of your campaign..."
          value={campaignData.description}
          onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// STEP 2: Add Leads Component (Placeholder)
function AddLeadsStep({ campaignData, setCampaignData, onNext, onBack }: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">👋 Add some leads to get started</h3>
        <p className="text-gray-600 mb-6">Select leads from your existing list or upload new ones</p>
        
        <div className="space-y-3">
          <Button className="w-full">Choose from Existing Leads</Button>
          <Button variant="outline" className="w-full">Upload CSV File</Button>
          <Button variant="outline" className="w-full">Add Manually</Button>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// STEP 3: Email Sequences Component (Placeholder)
function EmailSequencesStep({ campaignData, setCampaignData, onNext, onBack }: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Email Sequences</h3>
        <p className="text-gray-600">Create your email sequence steps</p>
      </div>

      {/* Email sequence builder will go here */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">Email sequence builder coming next...</p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// STEP 4: Schedule Component (Placeholder)
function ScheduleStep({ campaignData, setCampaignData, onNext, onBack }: {
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Schedule Settings</h3>
        <p className="text-gray-600">Configure when your emails should be sent</p>
      </div>

      {/* Schedule builder will go here */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">Schedule builder coming next...</p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// STEP 5: Review Component (Placeholder)
function ReviewStep({ campaignData, isCreating, onLaunch, onBack }: {
  campaignData: CampaignData;
  isCreating: boolean;
  onLaunch: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Review & Launch</h3>
        <p className="text-gray-600">Review your campaign settings before launching</p>
      </div>

      {/* Campaign summary will go here */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">Campaign review coming next...</p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onLaunch} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Launch Campaign'}
        </Button>
      </div>
    </div>
  );
}

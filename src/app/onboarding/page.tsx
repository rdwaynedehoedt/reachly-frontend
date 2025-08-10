'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real app, you would get the user ID from your auth system
    // For now, we'll simulate a logged-in user
    const simulatedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    setUserId(simulatedUserId);
    
    // You would also check if the user has already completed onboarding
    // If yes, redirect them to the dashboard
  }, []);

  const handleOnboardingComplete = (userData: any) => {
    console.log('Onboarding completed:', userData);
    
    // In a real app, you would save this data to your backend
    
    // Redirect based on the selected action
    switch (userData.completionAction) {
      case 'create_campaign':
        router.push('/campaigns/new');
        break;
      case 'import_contacts':
        router.push('/contacts/import');
        break;
      case 'setup_organization':
        router.push('/settings/organization');
        break;
      case 'explore_dashboard':
      default:
        router.push('/dashboard');
        break;
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <OnboardingFlow userId={userId} onComplete={handleOnboardingComplete} />;
}
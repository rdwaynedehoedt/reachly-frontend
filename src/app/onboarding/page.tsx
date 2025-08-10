'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingFlow } from '@/components/onboarding';
import { completeOnboarding } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && user?.onboardingCompleted) {
      // User has already completed onboarding, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, isAuthenticated, router]);

  const handleOnboardingComplete = async (userData: any) => {
    console.log('Onboarding completed:', userData);
    setIsCompleting(true);
    
    try {
      // Prepare organization data for backend
      let organizationData = null;
      if (userData.organization && userData.organization.name) {
        organizationData = {
          mode: userData.organization.isNew ? 'create' as const : 'join' as const,
          name: userData.organization.name,
          industry: userData.organization.industry || undefined,
          size: userData.organization.size || undefined,
          existingOrgId: userData.organization.id || undefined
        };
      }

      // Save onboarding data to backend
      const result = await completeOnboarding({
        role: userData.role,
        experienceLevel: userData.experienceLevel,
        goals: userData.goals,
        organization: organizationData,
        teamMembers: userData.teamMembers || [],
        jobTitle: userData.role
      });
      
      if (result.success) {
        // Refresh user data to update onboarding status
        await refreshUser();
        
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
      } else {
        console.error('Failed to complete onboarding:', result.message);
        // Still redirect to dashboard as fallback
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still redirect to dashboard as fallback
      router.push('/dashboard');
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#1876d3' }}></div>
      </div>
    );
  }

  if (user.onboardingCompleted) {
    return null; // Will redirect to dashboard
  }

  return (
    <div>
      <OnboardingFlow 
        userId={user.id} 
        onComplete={handleOnboardingComplete} 
      />
      {isCompleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2" style={{ borderColor: '#1876d3' }}></div>
            <span className="text-gray-700">Completing onboarding...</span>
          </div>
        </div>
      )}
    </div>
  );
}
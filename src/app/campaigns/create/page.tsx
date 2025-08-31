'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CampaignCreationForm from '@/components/campaigns/CampaignCreationForm';

export default function CreateCampaignPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/campaigns');
  };

  const handleSuccess = () => {
    router.push('/campaigns');
  };

  return (
    <CampaignCreationForm 
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  );
}

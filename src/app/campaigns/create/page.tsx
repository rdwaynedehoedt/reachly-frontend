'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useEmail } from '../../../contexts/EmailContext';
import { LoadingScreen, Button } from '@/components/ui';
import { campaignApi, CreateCampaignData } from '@/lib/campaignApi';
import CampaignLeadImport from '@/components/campaigns/CampaignLeadImport';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  UsersIcon,
  PencilIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ClockIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';

interface FormData {
  // Basic Info
  name: string;
  description: string;
  type: 'single' | 'sequence';
  
  // Email Settings
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  
  // Scheduling
  sendImmediately: boolean;
  scheduledAt: string;
  timezone: string;
  dailySendLimit: number;
  
  // Template
  subject: string;
  bodyHtml: string;
  bodyText: string;
  
  // Campaign Leads (new approach)
  campaignLeads: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    jobTitle?: string;
    phone?: string;
    website?: string;
    customFields?: Record<string, string>;
  }>;
}

export default function CreateCampaignPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { emailAccounts } = useEmail();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Remove old lead management state - no longer needed
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'single',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    sendImmediately: true,
    scheduledAt: '',
    timezone: 'UTC',
    dailySendLimit: 50,
    subject: '',
    bodyHtml: '',
    bodyText: '',
    campaignLeads: [],
  });

  const steps = [
    { id: 1, name: 'Basic Info', icon: InformationCircleIcon, description: 'Campaign details' },
    { id: 2, name: 'Email Settings', icon: EnvelopeIcon, description: 'From address & settings' },
    { id: 3, name: 'Add Leads', icon: UsersIcon, description: 'Upload or add recipients' },
    { id: 4, name: 'Email Template', icon: PencilIcon, description: 'Design your message' },
    { id: 5, name: 'Review & Launch', icon: RocketLaunchIcon, description: 'Final review' },
  ];

  // Initialize component mount
  useEffect(() => {
    if (isAuthenticated) {
      // Set default from name if user is available
      if (user) {
        setFormData(prev => ({
          ...prev,
          fromName: `${user.firstName} ${user.lastName}`.trim(),
        }));
      }
    }
  }, [isAuthenticated, user]);

  // Remove old lead fetching - no longer needed



  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.fromEmail.trim().length > 0 && emailAccounts.length > 0;
      case 3:
        return formData.campaignLeads.length > 0;
      case 4:
        return formData.subject.trim().length > 0 && (formData.bodyHtml.trim().length > 0 || formData.bodyText.trim().length > 0);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (launch = false) => {
    try {
      setLoading(true);

      // Create campaign
      const campaignData: CreateCampaignData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        from_name: formData.fromName,
        from_email: formData.fromEmail,
        reply_to_email: formData.replyToEmail || undefined,
        send_immediately: formData.sendImmediately,
        scheduled_at: formData.scheduledAt || undefined,
        timezone: formData.timezone,
        daily_send_limit: formData.dailySendLimit,
      };

      const campaignResponse = await campaignApi.create(campaignData);
      if (!campaignResponse.success) {
        throw new Error(campaignResponse.message || 'Failed to create campaign');
      }

      const campaignId = campaignResponse.data.campaign.id;

      // Save template
      if (formData.subject || formData.bodyHtml || formData.bodyText) {
        await campaignApi.saveTemplate(campaignId, {
          subject: formData.subject,
          bodyHtml: formData.bodyHtml,
          bodyText: formData.bodyText,
        });
      }

      // Add campaign leads to database
      if (formData.campaignLeads.length > 0) {
        console.log(`📥 Creating ${formData.campaignLeads.length} leads for campaign...`);
        
        // Step 1: Create leads in database using bulk import
        const leadsForImport = formData.campaignLeads.map(lead => ({
          email: lead.email,
          first_name: lead.firstName || '',
          last_name: lead.lastName || '',
          company_name: lead.companyName || '',
          job_title: lead.jobTitle || '',
          phone: lead.phone || '',
          website: lead.website || '',
          source: 'campaign_import'
        }));

        // Import leads to database
        const { leadsApi } = await import('@/lib/apiClient');
        const importResult = await leadsApi.import({
          leads: leadsForImport,
          columnMapping: {
            email: 'email',
            first_name: 'first_name',
            last_name: 'last_name',
            company_name: 'company_name',
            job_title: 'job_title',
            phone: 'phone',
            website: 'website'
          },
          fileName: `campaign-${formData.name}-${new Date().toISOString()}`,
          duplicateChecks: {
            workspace: false // Allow duplicates for campaign-specific leads
          }
        });

        if (!importResult.success) {
          throw new Error(`Failed to import leads: ${importResult.message}`);
        }

        console.log(`✅ Imported ${importResult.data.imported} leads`);

        // Step 2: Get the lead IDs by querying the emails we just imported
        const leadEmails = formData.campaignLeads.map(lead => lead.email);
        const allLeadsResult = await leadsApi.getAll();
        
        if (allLeadsResult.success && allLeadsResult.data?.leads) {
          // Find the lead IDs for our newly imported leads
          const leadIds: string[] = [];
          for (const lead of allLeadsResult.data.leads) {
            if (leadEmails.includes((lead as any).email)) {
              leadIds.push((lead as any).id);
            }
          }

          console.log(`🔗 Linking ${leadIds.length} leads to campaign...`);

          // Step 3: Associate leads with campaign
          if (leadIds.length > 0) {
            const addLeadsResult = await campaignApi.addLeads(campaignId, leadIds);
            if (!addLeadsResult.success) {
              console.warn('⚠️ Failed to add some leads to campaign:', addLeadsResult.message);
            } else {
              console.log(`✅ Successfully linked ${addLeadsResult.data.added} leads to campaign`);
            }
          }
        }
      }

      // Launch campaign if requested
      if (launch) {
        console.log('🚀 Launching campaign...');
        
        // First activate the campaign and wait for it
        const statusUpdateResult = await campaignApi.updateStatus(campaignId, 'active');
        if (!statusUpdateResult.success) {
          throw new Error(`Failed to activate campaign: ${statusUpdateResult.message}`);
        }
        
        console.log('✅ Campaign activated, now launching...');
        
        // Add a small delay to ensure the status update is committed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Then launch it
        const launchResponse = await campaignApi.launch(campaignId);
        if (launchResponse.success) {
          alert(`🎉 Campaign launched successfully! ${launchResponse.data.sentCount} emails sent.`);
        } else {
          alert(`❌ Campaign created but launch failed: ${launchResponse.message}`);
        }
      } else {
        alert('✅ Campaign created successfully!');
      }

      // Redirect to campaigns dashboard
      router.push('/dashboard?tab=campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="responsive-container min-h-screen">
      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard?tab=campaigns')}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
          <div className="hidden sm:block h-6 w-px bg-gray-300" />
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">Step {currentStep} of {steps.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Progress Steps - Responsive */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Simple Progress Bar */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  steps[currentStep - 1] ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {steps[currentStep - 1]?.icon && (() => {
                    const IconComponent = steps[currentStep - 1].icon;
                    return <IconComponent className="h-4 w-4" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">{steps[currentStep - 1]?.name}</p>
                  <p className="text-xs text-gray-500">{steps[currentStep - 1]?.description}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {currentStep}/{steps.length}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop: Full Stepper */}
          <div className="hidden sm:flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUpcoming = currentStep < step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIconSolid className="h-4 w-4 lg:h-5 lg:w-5" />
                      ) : (
                        <step.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs lg:text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400 hidden lg:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 lg:mx-4 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content - Responsive padding */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {currentStep === 1 && (
              <BasicInfoStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <EmailSettingsStep 
                formData={formData} 
                updateFormData={updateFormData}
                emailAccounts={emailAccounts}
              />
            )}
                    {currentStep === 3 && (
          <AddLeadsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
            {currentStep === 4 && (
              <EmailTemplateStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 5 && (
              <ReviewStep formData={formData} />
            )}
          </div>

          {/* Navigation - Responsive */}
          <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
              size="lg"
              className="w-full sm:w-auto min-h-[44px] touch-target"
            >
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                className="w-full sm:w-auto min-w-[120px] min-h-[44px] touch-target"
                size="lg"
              >
                Next Step
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={!canProceed() || loading}
                  isLoading={loading && !loading}
                  leftIcon={<CheckCircleIconSolid className="h-4 w-4" />}
                  className="w-full sm:w-auto min-w-[140px] min-h-[44px] touch-target"
                  size="lg"
                >
                  Create Campaign
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={!canProceed() || loading}
                  isLoading={loading}
                  leftIcon={<RocketLaunchIcon className="h-4 w-4" />}
                  className="w-full sm:w-auto min-w-[160px] bg-green-600 hover:bg-green-700 min-h-[44px] touch-target"
                  size="lg"
                >
                  Create & Launch
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Basic Info
interface BasicInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

function BasicInfoStep({ formData, updateFormData }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Campaign Information</h2>
        <p className="text-gray-500 mt-1">Give your campaign a name and description</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="e.g., Q1 Product Launch"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Brief description of your campaign goals..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateFormData({ type: 'single' })}
              className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                formData.type === 'single'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Single Email</div>
              <div className="text-sm text-gray-500 mt-1">Send one email to all leads</div>
            </button>
            <button
              type="button"
              onClick={() => updateFormData({ type: 'sequence' })}
              className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                formData.type === 'sequence'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled
            >
              <div className="font-medium">Email Sequence</div>
              <div className="text-sm text-gray-500 mt-1">Coming soon</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Email Settings
interface EmailSettingsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  emailAccounts: any[];
}

function EmailSettingsStep({ formData, updateFormData, emailAccounts }: EmailSettingsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Email Settings</h2>
        <p className="text-gray-500 mt-1">Configure how your emails will be sent</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name *
          </label>
          <input
            type="text"
            value={formData.fromName}
            onChange={(e) => updateFormData({ fromName: e.target.value })}
            placeholder="Your Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email *
          </label>
          {emailAccounts.length > 0 ? (
            <select
              value={formData.fromEmail}
              onChange={(e) => updateFormData({ fromEmail: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Select email account</option>
              {emailAccounts.map((account) => (
                <option key={account.id} value={account.email}>
                  {account.email}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-center py-4 px-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-800 mb-3">
                No email accounts connected. You need to connect an email account to send campaigns.
              </p>
              <Button
                size="sm"
                onClick={() => window.location.href = '/dashboard?tab=settings'}
                className="text-xs"
              >
                Connect Email Account
              </Button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reply-to Email
          </label>
          <input
            type="email"
            value={formData.replyToEmail}
            onChange={(e) => updateFormData({ replyToEmail: e.target.value })}
            placeholder="Optional, defaults to from email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => updateFormData({ timezone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="CST">CST</option>
              <option value="MST">MST</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Limit
            </label>
            <input
              type="number"
              value={formData.dailySendLimit}
              onChange={(e) => updateFormData({ dailySendLimit: parseInt(e.target.value) || 50 })}
              min="1"
              max="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Add Leads (New Campaign-Centric Approach)
interface AddLeadsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

function AddLeadsStep({ formData, updateFormData }: AddLeadsStepProps) {
  const handleLeadsChange = (leads: FormData['campaignLeads']) => {
    updateFormData({ campaignLeads: leads });
  };

  return (
    <CampaignLeadImport
      leads={formData.campaignLeads}
      onLeadsChange={handleLeadsChange}
    />
  );
}

// Step 4: Email Template
interface EmailTemplateStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

function EmailTemplateStep({ formData, updateFormData }: EmailTemplateStepProps) {
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Create Email Template</h2>
        <p className="text-gray-500 mt-1">Design your email content with personalization</p>
      </div>

      <div className="space-y-6">
        {/* Toggle between Edit and Preview */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setPreviewMode('edit')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                previewMode === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                previewMode === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {previewMode === 'edit' ? (
          <div className="space-y-4">
            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => updateFormData({ subject: e.target.value })}
                placeholder="e.g., Hi {{firstName}}, quick question about {{company}}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              <textarea
                value={formData.bodyText}
                onChange={(e) => updateFormData({ 
                  bodyText: e.target.value,
                  bodyHtml: `<p>${e.target.value.replace(/\n/g, '</p><p>')}</p>`
                })}
                placeholder="Hi {{firstName}},

I noticed that {{company}} is..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-sm"
              />
            </div>

            {/* Personalization Variables */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Variables:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{{firstName}}'}</code>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{{lastName}}'}</code>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{{email}}'}</code>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{{company}}'}</code>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{{jobTitle}}'}</code>
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{{fromName}}'}</code>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <p className="text-sm text-gray-600">
                  <strong>Subject:</strong> {formData.subject.replace(/\{\{firstName\}\}/g, 'John').replace(/\{\{company\}\}/g, 'Acme Corp')}
                </p>
              </div>
              <div className="p-4 bg-white">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.bodyHtml
                      .replace(/\{\{firstName\}\}/g, 'John')
                      .replace(/\{\{lastName\}\}/g, 'Doe')
                      .replace(/\{\{email\}\}/g, 'john.doe@example.com')
                      .replace(/\{\{company\}\}/g, 'Acme Corp')
                      .replace(/\{\{jobTitle\}\}/g, 'Marketing Manager')
                      .replace(/\{\{fromName\}\}/g, formData.fromName)
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Preview with sample data: John Doe, john.doe@example.com, Acme Corp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 5: Review
interface ReviewStepProps {
  formData: FormData;
}

function ReviewStep({ formData }: ReviewStepProps) {

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Ready to Launch</h2>
        <p className="text-gray-500 mt-1">Review your campaign details before launching</p>
      </div>

      <div className="space-y-6">
        {/* Campaign Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Campaign Name</p>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium capitalize">{formData.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">From</p>
              <p className="font-medium">{formData.fromName} &lt;{formData.fromEmail}&gt;</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recipients</p>
              <p className="font-medium">{formData.campaignLeads.length} leads</p>
            </div>
          </div>
          {formData.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{formData.description}</p>
            </div>
          )}
        </div>

        {/* Email Preview */}
        <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
            <p className="text-sm text-gray-600">
              <strong>Subject:</strong> {formData.subject}
            </p>
          </div>
          <div className="p-4">
            <div className="prose max-w-none text-sm">
              {formData.bodyText ? formData.bodyText.split('\n').map((line: string, index: number) => (
                <p key={index}>{line}</p>
              )) : (
                <div dangerouslySetInnerHTML={{ __html: formData.bodyHtml }} />
              )}
            </div>
          </div>
        </div>

        {/* Campaign Leads Preview */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Campaign Recipients ({formData.campaignLeads.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {formData.campaignLeads.slice(0, 10).map((lead, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircleIconSolid className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{lead.firstName} {lead.lastName} - {lead.email}</span>
              </div>
            ))}
            {formData.campaignLeads.length > 10 && (
              <p className="text-sm text-gray-600 col-span-2">
                + {formData.campaignLeads.length - 10} more leads
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

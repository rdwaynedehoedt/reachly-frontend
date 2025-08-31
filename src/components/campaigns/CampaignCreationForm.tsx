'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEmail } from '../../contexts/EmailContext';
import { LoadingScreen, Button } from '@/components/ui';
import { campaignApi, CreateCampaignData } from '@/lib/campaignApi';
import CampaignLeadImport from './CampaignLeadImport';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  UsersIcon,
  PencilIcon,
  RocketLaunchIcon,
  XMarkIcon,
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
  
  // Email Sending Options
  isMassEmail: boolean;  // true = send all at once, false = distributed sending
  massEmailConcurrency: number;  // how many emails to send simultaneously for mass emails
  
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

interface CampaignCreationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const CampaignCreationForm: React.FC<CampaignCreationFormProps> = ({ onCancel, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { emailAccounts } = useEmail();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
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
    isMassEmail: false,  // Default to distributed sending
    massEmailConcurrency: 100,  // Default concurrent emails for mass sending
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
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fromName: `${user.firstName} ${user.lastName}`.trim(),
      }));
    }
  }, [isAuthenticated, user]);

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
        is_mass_email: formData.isMassEmail,
        mass_email_concurrency: formData.massEmailConcurrency,
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
          // Show top corner notification
          setNotification({message: 'Campaign launched successfully!', type: 'success'});
          setTimeout(() => {
            setNotification(null);
            onSuccess();
          }, 2000);
        } else {
          setNotification({message: `Campaign created but launch failed: ${launchResponse.message}`, type: 'error'});
          setTimeout(() => setNotification(null), 3000);
        }
      } else {
        // Show success notification for draft
        setNotification({message: 'Campaign created successfully!', type: 'success'});
        setTimeout(() => {
          setNotification(null);
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setNotification({message: 'Failed to create campaign. Please try again.', type: 'error'});
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Corner Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-8 px-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative">
            <button
              onClick={onCancel}
              className="absolute left-0 top-0 text-gray-400 hover:text-gray-600"
              title="Cancel and return to campaigns"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cool Icon Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep - 1;
              const isCurrent = index === currentStep - 1;
              const IconComponent = step.icon;
              // Line should be green if we've moved past this step (i.e., next step is current or completed)
              const lineCompleted = index < currentStep - 1;
              
              return (
                <Fragment key={step.id}>
                  {/* Step Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIconSolid className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="w-16 h-0.5 mx-4 bg-gray-200 relative overflow-hidden">
                      <div 
                        className={`h-full absolute left-0 top-0 transition-all duration-500 ease-out ${
                          lineCompleted ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
                        }`}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content - Plain without box */}
        <div className="max-w-5xl mx-auto mb-8">
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

        {/* Navigation */}
        <div className="flex items-center justify-center pt-8">
          <div className="flex items-center space-x-6">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-500 hover:text-gray-700 flex items-center space-x-2 font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}

            {currentStep === steps.length ? (
              <>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!canProceed() || loading}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 font-medium" 
                >
                  {loading ? 'Creating...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={!canProceed() || loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 font-medium"
                >
                  <RocketLaunchIcon className="h-4 w-4" />
                  <span>{loading ? 'Launching...' : 'Create & Launch'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 font-medium"
              >
                <span>Next</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Import the step components from the original page (we'll need to extract these)
// For now, let's create simplified versions:

function BasicInfoStep({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium text-black mb-8">Campaign Information</h2>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-4">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Campaign Name"
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-4">
            Description <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Description"
            rows={4}
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function EmailSettingsStep({ formData, updateFormData, emailAccounts }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void; emailAccounts: any[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium text-black mb-8">Email Settings</h2>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-4">
            From Name *
          </label>
          <input
            type="text"
            value={formData.fromName}
            onChange={(e) => updateFormData({ fromName: e.target.value })}
            placeholder="From Name"
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-4">
            From Email *
          </label>
          <select
            value={formData.fromEmail}
            onChange={(e) => updateFormData({ fromEmail: e.target.value })}
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black"
          >
            <option value="" className="text-gray-500">Select email account</option>
            {emailAccounts.map((account) => (
              <option key={account.email} value={account.email}>
                {account.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-4">
            Reply-To Email <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type="email"
            value={formData.replyToEmail}
            onChange={(e) => updateFormData({ replyToEmail: e.target.value })}
            placeholder="Reply-To Email"
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500"
          />
        </div>

        {/* Email Sending Type */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-4">
            Email Sending Type
          </label>
          <div className="space-y-4">
            <div 
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                !formData.isMassEmail 
                  ? 'bg-blue-50 border-2 border-blue-200 ring-2 ring-blue-500/10' 
                  : 'bg-gray-50/50 border-2 border-transparent hover:border-gray-200'
              }`}
              onClick={() => updateFormData({ isMassEmail: false })}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.isMassEmail}
                  onChange={() => updateFormData({ isMassEmail: false })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <label className="text-base font-medium text-gray-900 cursor-pointer">
                      Distributed Sending <span className="text-green-600 font-semibold">(Recommended)</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Emails sent gradually with rate limiting for better deliverability
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                formData.isMassEmail 
                  ? 'bg-blue-50 border-2 border-blue-200 ring-2 ring-blue-500/10' 
                  : 'bg-gray-50/50 border-2 border-transparent hover:border-gray-200'
              }`}
              onClick={() => updateFormData({ isMassEmail: true })}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={formData.isMassEmail}
                  onChange={() => updateFormData({ isMassEmail: true })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3 flex items-center">
                  <RocketLaunchIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <label className="text-base font-medium text-gray-900 cursor-pointer">
                      Mass Email <span className="text-blue-600 font-semibold">(High Performance)</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Send all emails simultaneously for maximum speed and impact
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mass Email Settings */}
        {formData.isMassEmail && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center mb-4">
              <RocketLaunchIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Mass Email Configuration</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concurrent Processing
              </label>
              <select
                value={formData.massEmailConcurrency}
                onChange={(e) => updateFormData({ massEmailConcurrency: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
              >
                <option value={50}>50 emails at once</option>
                <option value={100}>100 emails at once</option>
                <option value={250}>250 emails at once</option>
                <option value={500}>500 emails at once</option>
                <option value={1000}>1000 emails at once</option>
              </select>
              <p className="text-xs text-blue-600 mt-1">
                Higher concurrency = faster campaign delivery
              </p>
            </div>
          </div>
        )}

        {/* Daily Send Limit - Only show for distributed sending */}
        {!formData.isMassEmail && (
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-4">
              Daily Send Limit
            </label>
            <input
              type="number"
              value={formData.dailySendLimit}
              onChange={(e) => updateFormData({ dailySendLimit: parseInt(e.target.value) || 50 })}
              min="1"
              max="10000"
              placeholder="50"
              className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500"
            />
            <p className="text-sm text-gray-600 mt-2">
              Maximum emails to send per day for distributed campaigns
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddLeadsStep({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) {
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

function EmailTemplateStep({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) {
  // Common personalization variables
  const variables = [
    { name: 'firstName', example: 'John' },
    { name: 'lastName', example: 'Doe' },
    { name: 'companyName', example: 'TechCorp Inc' },
    { name: 'jobTitle', example: 'Software Engineer' }
  ];

  const insertVariable = (variableName: string, targetField: 'subject' | 'body') => {
    const variable = `{{${variableName}}}`;
    
    if (targetField === 'subject') {
      updateFormData({ subject: (formData.subject || '') + variable });
    } else {
      updateFormData({ 
        bodyText: (formData.bodyText || '') + variable,
        bodyHtml: `<p>${((formData.bodyText || '') + variable).replace(/\n/g, '</p><p>')}</p>`
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium text-black mb-8">Email Template</h2>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between mb-5">
            <label className="block text-base font-semibold text-gray-800">
              Subject Line *
            </label>
            <div className="flex gap-2">
              {variables.map((variable) => (
                <button
                  key={variable.name}
                  onClick={() => insertVariable(variable.name, 'subject')}
                  className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                  title={`Insert {{${variable.name}}}`}
                >
                  {variable.name}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => updateFormData({ subject: e.target.value })}
            placeholder="Subject Line"
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <label className="block text-base font-semibold text-gray-800">
              Email Content *
            </label>
            <div className="flex gap-2">
              {variables.map((variable) => (
                <button
                  key={variable.name}
                  onClick={() => insertVariable(variable.name, 'body')}
                  className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
                  title={`Insert {{${variable.name}}}`}
                >
                  {variable.name}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={formData.bodyText}
            onChange={(e) => updateFormData({ 
              bodyText: e.target.value, 
              bodyHtml: `<p>${e.target.value.replace(/\n/g, '</p><p>')}</p>` 
            })}
            placeholder="Email content..."
            rows={10}
            className="w-full px-6 py-5 bg-gray-50/50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-md outline-none text-lg text-black placeholder-gray-500 resize-none"
          />
          <p className="text-sm text-gray-600 mt-4">
            Use the buttons above to add personalization variables like <code className="bg-gray-100 px-2 py-1 rounded text-xs">{`{{firstName}}`}</code> or <code className="bg-gray-100 px-2 py-1 rounded text-xs">{`{{companyName}}`}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-black mb-4">Ready to Launch</h2>
        <p className="text-gray-600">Review your campaign details before launching</p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Minimalistic Campaign Summary */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Campaign Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Campaign Name</span>
                <p className="font-semibold text-xl text-gray-900 mt-1">{formData.name}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">From</span>
                <p className="font-semibold text-lg text-gray-900 mt-1">{formData.fromName}</p>
                <p className="text-blue-600 font-medium">{formData.fromEmail}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Type</span>
                <div className="flex items-center mt-1">
                  {formData.isMassEmail ? (
                    <>
                      <RocketLaunchIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-lg text-blue-600">Mass Email</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-lg text-green-600">Distributed Sending</span>
                    </>
                  )}
                </div>
                {formData.isMassEmail && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.massEmailConcurrency} emails at once
                  </p>
                )}
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Recipients</span>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold text-blue-600">{formData.campaignLeads.length}</span>
                  <span className="text-gray-600 ml-2">
                    {formData.campaignLeads.length === 1 ? 'lead ready' : 'leads ready'} to receive your message
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subject Line</span>
                <p className="font-semibold text-lg text-gray-900 mt-1">
                  "{formData.subject}"
                </p>
              </div>
              
              {!formData.isMassEmail && (
                <div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Daily Limit</span>
                  <p className="font-semibold text-lg text-gray-900 mt-1">
                    {formData.dailySendLimit} emails/day
                  </p>
                  {formData.campaignLeads.length > formData.dailySendLimit && (
                    <div className="flex items-center mt-1">
                      <InformationCircleIcon className="h-4 w-4 text-amber-600 mr-1" />
                      <p className="text-sm text-amber-600">
                        Campaign will take ~{Math.ceil(formData.campaignLeads.length / formData.dailySendLimit)} days
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Email Preview */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>To:</strong> {formData.campaignLeads.length > 0 ? formData.campaignLeads[0].email : 'your-recipients@email.com'}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>From:</strong> {formData.fromName} &lt;{formData.fromEmail}&gt;
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <strong>Subject:</strong> {formData.subject}
              </div>
              <div className="bg-white rounded border p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                {formData.bodyText || 'Your email content will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignCreationForm;

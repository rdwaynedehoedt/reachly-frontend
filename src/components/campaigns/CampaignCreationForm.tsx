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
        {/* Campaign Summary */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-black mb-6">Campaign Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">Campaign Name:</span>
              <span className="font-semibold text-lg">{formData.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">From:</span>
              <span className="font-semibold">{formData.fromName} &lt;{formData.fromEmail}&gt;</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">Recipients:</span>
              <span className="font-semibold text-blue-600">{formData.campaignLeads.length} leads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600">Subject:</span>
              <span className="font-semibold">{formData.subject}</span>
            </div>
          </div>
        </div>

        {/* Preview first few leads */}
        {formData.campaignLeads.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-black mb-6">Recipients Preview</h3>
            <div className="space-y-3">
              {formData.campaignLeads.slice(0, 5).map((lead, index) => (
                <div key={index} className="text-base text-gray-700 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{lead.firstName} {lead.lastName} - {lead.email}</span>
                </div>
              ))}
              {formData.campaignLeads.length > 5 && (
                <div className="text-base text-gray-600 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>+ {formData.campaignLeads.length - 5} more recipients</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignCreationForm;

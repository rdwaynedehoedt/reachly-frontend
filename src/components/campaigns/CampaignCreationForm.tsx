'use client';

import React, { useState, useEffect } from 'react';
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
          alert(`🎉 Campaign launched successfully! ${launchResponse.data.sentCount} emails sent.`);
        } else {
          alert(`❌ Campaign created but launch failed: ${launchResponse.message}`);
        }
      } else {
        alert('✅ Campaign created successfully!');
      }

      // Call success callback to refresh and close
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onCancel}
              leftIcon={<XMarkIcon className="h-4 w-4" />}
              size="sm"
            >
              Cancel
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="mt-1 text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : isCurrent 
                      ? 'bg-blue-100 border-blue-500 text-blue-600' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIconSolid className="h-6 w-6" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="p-6">
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
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentStep === steps.length ? (
              <>
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={!canProceed() || loading}
                  variant="outline"
                >
                  {loading ? 'Creating...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={!canProceed() || loading}
                  leftIcon={<RocketLaunchIcon className="h-4 w-4" />}
                >
                  {loading ? 'Launching...' : 'Create & Launch'}
                </Button>
              </>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                Next
              </Button>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
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

function EmailSettingsStep({ formData, updateFormData, emailAccounts }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void; emailAccounts: any[] }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Email Settings</h2>
        <p className="text-gray-500 mt-1">Configure your sending details</p>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email *
          </label>
          <select
            value={formData.fromEmail}
            onChange={(e) => updateFormData({ fromEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select email account</option>
            {emailAccounts.map((account) => (
              <option key={account.email} value={account.email}>
                {account.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reply-To Email
          </label>
          <input
            type="email"
            value={formData.replyToEmail}
            onChange={(e) => updateFormData({ replyToEmail: e.target.value })}
            placeholder="Optional different reply address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
  const [activeField, setActiveField] = useState<'subject' | 'body'>('subject');
  const [subjectCursorPos, setSubjectCursorPos] = useState(0);
  const [bodyCursorPos, setBodyCursorPos] = useState(0);
  const [customFields, setCustomFields] = useState<Array<{name: string, label: string, example: string}>>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  
  // Standard personalization variables
  const standardVariables = [
    { name: 'firstName', label: 'First Name', example: 'John' },
    { name: 'lastName', label: 'Last Name', example: 'Doe' },
    { name: 'companyName', label: 'Company Name', example: 'TechCorp Inc' },
    { name: 'jobTitle', label: 'Job Title', example: 'Software Engineer' },
    { name: 'phone', label: 'Phone', example: '+1-555-0123' },
    { name: 'website', label: 'Website', example: 'techcorp.com' }
  ];

  // Fetch custom fields from leads in the campaign
  useEffect(() => {
    const fetchCustomFields = async () => {
      if (formData.campaignLeads && formData.campaignLeads.length > 0) {
        setLoadingFields(true);
        try {
          // Extract all custom field keys from campaign leads
          const customFieldKeys = new Set<string>();
          formData.campaignLeads.forEach(lead => {
            if (lead.customFields && typeof lead.customFields === 'object') {
              Object.keys(lead.customFields).forEach(key => {
                customFieldKeys.add(key);
              });
            }
          });

          // Convert to variables format
          const customVars = Array.from(customFieldKeys).map(fieldName => ({
            name: fieldName,
            label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            example: formData.campaignLeads.find(lead => 
              lead.customFields && lead.customFields[fieldName]
            )?.customFields?.[fieldName] || 'Sample Value'
          }));

          setCustomFields(customVars);
        } catch (error) {
          console.error('Error extracting custom fields:', error);
        } finally {
          setLoadingFields(false);
        }
      }
    };

    fetchCustomFields();
  }, [formData.campaignLeads]);

  // All available variables (standard + custom)
  const allVariables = [...standardVariables, ...customFields];

  // Insert variable at cursor position
  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    
    if (activeField === 'subject') {
      const currentSubject = formData.subject || '';
      const beforeCursor = currentSubject.slice(0, subjectCursorPos);
      const afterCursor = currentSubject.slice(subjectCursorPos);
      const newSubject = beforeCursor + variable + afterCursor;
      updateFormData({ subject: newSubject });
      // Update cursor position to after inserted variable
      setTimeout(() => setSubjectCursorPos(subjectCursorPos + variable.length), 0);
    } else {
      const currentBody = formData.bodyText || '';
      const beforeCursor = currentBody.slice(0, bodyCursorPos);
      const afterCursor = currentBody.slice(bodyCursorPos);
      const newBody = beforeCursor + variable + afterCursor;
      updateFormData({ 
        bodyText: newBody,
        bodyHtml: `<p>${newBody.replace(/\n/g, '</p><p>')}</p>`
      });
      // Update cursor position to after inserted variable
      setTimeout(() => setBodyCursorPos(bodyCursorPos + variable.length), 0);
    }
  };

  // Track cursor position in text fields
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ subject: e.target.value });
    setSubjectCursorPos(e.target.selectionStart || 0);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ 
      bodyText: e.target.value, 
      bodyHtml: `<p>${e.target.value.replace(/\n/g, '</p><p>')}</p>` 
    });
    setBodyCursorPos(e.target.selectionStart || 0);
  };

  const handleSubjectCursorMove = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubjectCursorPos(e.target.selectionStart || 0);
  };

  const handleBodyCursorMove = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBodyCursorPos(e.target.selectionStart || 0);
  };

  // Create preview with personalized content
  const createPreview = (content: string) => {
    if (!content) return '';
    
    let preview = content;
    
    // Replace standard variables
    const standardReplacements: Record<string, string> = {
      '{{firstName}}': 'John',
      '{{lastName}}': 'Doe', 
      '{{companyName}}': 'TechCorp Inc',
      '{{jobTitle}}': 'Software Engineer',
      '{{phone}}': '+1-555-0123',
      '{{website}}': 'techcorp.com'
    };

    // Apply standard replacements
    Object.entries(standardReplacements).forEach(([placeholder, value]) => {
      preview = preview.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace custom field variables with their examples
    customFields.forEach(field => {
      const placeholder = `{{${field.name}}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), field.example);
    });

    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Email Template</h2>
        <p className="text-gray-500 mt-1">Design your email content with personalization</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Template Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={handleSubjectChange}
                onSelect={handleSubjectCursorMove}
                onFocus={() => setActiveField('subject')}
                placeholder="e.g., Quick question about {{companyName}}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              <textarea
                value={formData.bodyText}
                onChange={handleBodyChange}
                onSelect={handleBodyCursorMove}
                onFocus={() => setActiveField('body')}
                placeholder={`Hi {{firstName}},\n\nI hope this email finds you well. I noticed that {{companyName}} is doing great work in the industry.\n\nI'd love to connect and discuss how we might be able to help {{companyName}} achieve even greater success.\n\nBest regards,\nYour Name`}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Click on variables in the sidebar to insert them into your {activeField === 'subject' ? 'subject' : 'email content'}
              </p>
            </div>
          </div>

          {/* Variable Picker Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Personalization Variables</h3>
              <p className="text-xs text-gray-600 mb-4">
                Click to insert into {activeField === 'subject' ? 'subject line' : 'email body'}
              </p>
              
              <div className="space-y-2">
                {loadingFields && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Loading custom fields...
                  </div>
                )}
                {allVariables.map((variable, index) => {
                  const isCustomField = index >= standardVariables.length;
                  return (
                    <button
                      key={variable.name}
                      onClick={() => insertVariable(variable.name)}
                      className={`w-full text-left p-3 border rounded-lg hover:border-blue-300 transition-colors group ${
                        isCustomField 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : 'bg-white border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm flex items-center gap-1">
                            {`{{${variable.name}}}`}
                            {isCustomField && (
                              <span className="text-xs bg-green-600 text-white px-1 rounded">Custom</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{variable.label}</div>
                        </div>
                        <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Insert
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        e.g., "{variable.example}"
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-xs text-blue-800">
                <div className="mb-2">
                  <strong>Subject:</strong><br />
                  <span className="italic">
                    {formData.subject ? 
                      createPreview(formData.subject)
                      : 'Enter subject line...'
                    }
                  </span>
                </div>
                <div>
                  <strong>Body:</strong><br />
                  <div className="italic whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {formData.bodyText ? 
                      createPreview(formData.bodyText)
                      : 'Enter email content...'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Ready to Launch</h2>
        <p className="text-gray-500 mt-1">Review your campaign details before launching</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Campaign Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Campaign Name</p>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">From</p>
              <p className="font-medium">{formData.fromName} &lt;{formData.fromEmail}&gt;</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Recipients</p>
              <p className="font-medium">{formData.campaignLeads.length} leads</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subject</p>
              <p className="font-medium">{formData.subject}</p>
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

export default CampaignCreationForm;

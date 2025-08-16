'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import FadeIn from '@/components/FadeIn';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface CampaignFormData {
  name: string;
  description: string;
  type: 'sequence' | 'single' | 'drip' | 'evergreen';
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  timezone: string;
  scheduleDays: string[];
  scheduleStartTime: string;
  scheduleEndTime: string;
  dailySendLimit: number;
  maxEmailsPerLead: number;
  stopOnReply: boolean;
  linkTracking: boolean;
  openTracking: boolean;
  textOnly: boolean;
}

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const campaignTypes = [
  { 
    value: 'sequence', 
    label: 'Sequence Campaign', 
    description: 'Multi-step email sequence with automated follow-ups',
    icon: '📧',
    recommended: true
  },
  { 
    value: 'single', 
    label: 'Single Email', 
    description: 'One-time email blast to your leads',
    icon: '✉️'
  },
  { 
    value: 'drip', 
    label: 'Drip Campaign', 
    description: 'Time-based email series for nurturing',
    icon: '💧'
  },
  { 
    value: 'evergreen', 
    label: 'Evergreen Campaign', 
    description: 'Continuous campaign that runs indefinitely',
    icon: '🌱'
  }
];

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: 'sequence',
    fromName: user?.firstName + ' ' + user?.lastName || '',
    fromEmail: '',
    replyToEmail: '',
    timezone: 'America/New_York',
    scheduleDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    scheduleStartTime: '09:00',
    scheduleEndTime: '18:00',
    dailySendLimit: 50,
    maxEmailsPerLead: 5,
    stopOnReply: false,
    linkTracking: true,
    openTracking: true,
    textOnly: false,
  });

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.fromName.trim() !== '' && formData.fromEmail.trim() !== '';
      case 3:
        return formData.scheduleDays.length > 0 && formData.dailySendLimit > 0;
      case 4:
        return true; // Final review step
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        scheduleStartTime: formData.scheduleStartTime + ':00',
        scheduleEndTime: formData.scheduleEndTime + ':00',
      };

      const response = await apiClient.post('/campaigns', payload);
      
      if (response.success) {
        router.push(`/campaigns/${response.data.campaign.id}`);
      } else {
        setError(response.message || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Error creating campaign');
      console.error('Error creating campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Basics</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Q1 Cold Outreach Campaign"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your campaign goals..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Campaign Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaignTypes.map(type => (
                <div
                  key={type.value}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
                  onClick={() => handleInputChange('type', type.value)}
                >
                  {type.recommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{type.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name *
            </label>
            <Input
              type="text"
              value={formData.fromName}
              onChange={(e) => handleInputChange('fromName', e.target.value)}
              placeholder="e.g., John Smith"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">This name will appear in your recipients' inbox</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email *
            </label>
            <Input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => handleInputChange('fromEmail', e.target.value)}
              placeholder="e.g., john@company.com"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Make sure this email is connected to your account and warmed up
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reply-To Email
            </label>
            <Input
              type="email"
              value={formData.replyToEmail}
              onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
              placeholder="Leave empty to use From Email"
              className="w-full"
            />
          </div>

          {/* Email Tracking Options */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Tracking Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Open Tracking</label>
                  <p className="text-sm text-gray-500">Track when recipients open your emails</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.openTracking}
                  onChange={(e) => handleInputChange('openTracking', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Link Tracking</label>
                  <p className="text-sm text-gray-500">Track when recipients click links in your emails</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.linkTracking}
                  onChange={(e) => handleInputChange('linkTracking', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Text Only</label>
                  <p className="text-sm text-gray-500">Send plain text emails (better deliverability)</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.textOnly}
                  onChange={(e) => handleInputChange('textOnly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule & Limits</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sending Days *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <label key={day.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.scheduleDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <Input
                type="time"
                value={formData.scheduleStartTime}
                onChange={(e) => handleInputChange('scheduleStartTime', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <Input
                type="time"
                value={formData.scheduleEndTime}
                onChange={(e) => handleInputChange('scheduleEndTime', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Send Limit
              </label>
              <Input
                type="number"
                value={formData.dailySendLimit}
                onChange={(e) => handleInputChange('dailySendLimit', parseInt(e.target.value))}
                min={1}
                max={1000}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum emails to send per day</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Emails per Lead
              </label>
              <Input
                type="number"
                value={formData.maxEmailsPerLead}
                onChange={(e) => handleInputChange('maxEmailsPerLead', parseInt(e.target.value))}
                min={1}
                max={20}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">Total emails in sequence</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Campaign Behavior</h3>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Stop on Reply</label>
                <p className="text-sm text-gray-500">Automatically stop sending emails when a lead replies</p>
              </div>
              <input
                type="checkbox"
                checked={formData.stopOnReply}
                onChange={(e) => handleInputChange('stopOnReply', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Create</h2>
        <div className="space-y-6">
          {/* Campaign Summary */}
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Campaign Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{formData.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium capitalize">{formData.type}</span>
              </div>
              <div>
                <span className="text-gray-600">From:</span>
                <span className="ml-2 font-medium">{formData.fromName} &lt;{formData.fromEmail}&gt;</span>
              </div>
              <div>
                <span className="text-gray-600">Timezone:</span>
                <span className="ml-2 font-medium">{timezones.find(tz => tz.value === formData.timezone)?.label}</span>
              </div>
              <div>
                <span className="text-gray-600">Schedule:</span>
                <span className="ml-2 font-medium">
                  {formData.scheduleStartTime} - {formData.scheduleEndTime}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Daily Limit:</span>
                <span className="ml-2 font-medium">{formData.dailySendLimit} emails/day</span>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add email sequences (steps) to your campaign</li>
              <li>• Import or add leads to your campaign</li>
              <li>• Review and test your emails</li>
              <li>• Launch your campaign</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
            <p className="text-gray-600 mt-2">Set up your professional email marketing campaign</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basics</span>
              <span>Email Settings</span>
              <span>Schedule</span>
              <span>Review</span>
            </div>
          </div>

          <Card className="p-8">
            {error && (
              <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className="flex justify-between mt-8">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
              </div>
              <div className="space-x-4">
                {step < 4 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={!validateStep(step)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading || !validateStep(step)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? 'Creating...' : 'Create Campaign'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
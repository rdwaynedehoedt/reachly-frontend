'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  BoltIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

export interface SchedulingOptions {
  sendType: 'immediate' | 'scheduled';
  scheduledFor?: Date;
  rateLimit: number;
  timezone: string;
}

interface CampaignSchedulerProps {
  initialOptions?: Partial<SchedulingOptions>;
  onOptionsChange: (options: SchedulingOptions) => void;
  disabled?: boolean;
  campaignLeadCount?: number;
}

const CampaignScheduler: React.FC<CampaignSchedulerProps> = ({
  initialOptions = {},
  onOptionsChange,
  disabled = false,
  campaignLeadCount = 0
}) => {
  const [options, setOptions] = useState<SchedulingOptions>({
    sendType: 'immediate',
    rateLimit: 100,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...initialOptions
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Update parent whenever options change
  useEffect(() => {
    onOptionsChange(options);
  }, [options, onOptionsChange]);

  // Calculate estimated completion time
  const getEstimatedCompletion = () => {
    if (campaignLeadCount === 0) return null;
    
    const hoursNeeded = Math.ceil(campaignLeadCount / options.rateLimit);
    
    if (options.sendType === 'immediate') {
      const completionTime = new Date(Date.now() + hoursNeeded * 60 * 60 * 1000);
      return completionTime;
    } else if (options.scheduledFor) {
      const completionTime = new Date(options.scheduledFor.getTime() + hoursNeeded * 60 * 60 * 1000);
      return completionTime;
    }
    
    return null;
  };

  const updateScheduledDateTime = () => {
    if (scheduledDate && scheduledTime) {
      const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      setOptions(prev => ({ ...prev, scheduledFor: combinedDateTime }));
    }
  };

  useEffect(() => {
    updateScheduledDateTime();
  }, [scheduledDate, scheduledTime]);

  const formatEstimatedTime = (date: Date) => {
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const isValidSchedule = () => {
    if (options.sendType === 'immediate') return true;
    if (!options.scheduledFor) return false;
    return options.scheduledFor > new Date();
  };

  const getValidationMessage = () => {
    if (options.sendType === 'immediate') return null;
    if (!options.scheduledFor) return 'Please select a date and time';
    if (options.scheduledFor <= new Date()) return 'Scheduled time must be in the future';
    return null;
  };

  const getRateLimitRecommendation = () => {
    if (campaignLeadCount <= 50) return 50;
    if (campaignLeadCount <= 100) return 100;
    if (campaignLeadCount <= 500) return 200;
    return 300;
  };

  return (
    <div className="space-y-6">
      {/* Send Type Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">When to Send</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Immediate Option */}
          <div 
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
              options.sendType === 'immediate'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && setOptions(prev => ({ ...prev, sendType: 'immediate' }))}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <BoltIcon className={`h-6 w-6 ${
                  options.sendType === 'immediate' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="ml-3 flex-1">
                <h4 className={`text-lg font-medium ${
                  options.sendType === 'immediate' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Send Now
                </h4>
                <p className={`mt-1 text-sm ${
                  options.sendType === 'immediate' ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  Start sending emails immediately with smart rate limiting
                </p>
                {options.sendType === 'immediate' && (
                  <div className="mt-2 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-600 font-medium">Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scheduled Option */}
          <div 
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
              options.sendType === 'scheduled'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && setOptions(prev => ({ ...prev, sendType: 'scheduled' }))}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className={`h-6 w-6 ${
                  options.sendType === 'scheduled' ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="ml-3 flex-1">
                <h4 className={`text-lg font-medium ${
                  options.sendType === 'scheduled' ? 'text-green-900' : 'text-gray-900'
                }`}>
                  Schedule for Later
                </h4>
                <p className={`mt-1 text-sm ${
                  options.sendType === 'scheduled' ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Choose a specific date and time to start sending
                </p>
                {options.sendType === 'scheduled' && (
                  <div className="mt-2 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled DateTime Selection */}
      {options.sendType === 'scheduled' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-green-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Schedule Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Timezone Display */}
          <div className="mt-4 p-3 bg-green-100 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Timezone:</strong> {options.timezone}
            </p>
          </div>

          {/* Validation Messages */}
          {!isValidSchedule() && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{getValidationMessage()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rate Limiting */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Sending Rate
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={disabled}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emails per Hour
              </label>
              <select
                value={options.rateLimit}
                onChange={(e) => setOptions(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value={25}>25 (Very Conservative)</option>
                <option value={50}>50 (Conservative)</option>
                <option value={100}>100 (Recommended)</option>
                <option value={200}>200 (Aggressive)</option>
                <option value={300}>300 (Maximum)</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Recommended:</strong> {getRateLimitRecommendation()} emails/hour
              </p>
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Conservative (25-50/hour):</strong> Best for cold outreach, reduces spam risk</p>
                <p><strong>Recommended (100/hour):</strong> Balanced approach for most campaigns</p>
                <p><strong>Aggressive (200-300/hour):</strong> For warm leads or transactional emails</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estimated Completion */}
      {campaignLeadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Campaign Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Recipients:</strong> {campaignLeadCount.toLocaleString()} leads</p>
                <p><strong>Rate:</strong> {options.rateLimit} emails per hour</p>
                <p><strong>Duration:</strong> ~{Math.ceil(campaignLeadCount / options.rateLimit)} hours</p>
                {getEstimatedCompletion() && (
                  <p><strong>Estimated Completion:</strong> {formatEstimatedTime(getEstimatedCompletion()!)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignScheduler;

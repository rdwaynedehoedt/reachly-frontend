'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface CampaignJobStats {
  campaignId: string;
  campaignName: string;
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  sentJobs: number;
  failedJobs: number;
  scheduledFor?: string;
  sendType: 'immediate' | 'scheduled';
  rateLimit: number;
  estimatedCompletion?: string;
  lastUpdated: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
}

interface CampaignProgressProps {
  campaignId: string;
  refreshInterval?: number; // milliseconds
  onStatusChange?: (campaignId: string, newStatus: any) => void;
}

const CampaignProgress: React.FC<CampaignProgressProps> = ({
  campaignId,
  refreshInterval = 30000, // 30 seconds
  onStatusChange
}) => {
  const [stats, setStats] = useState<CampaignJobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock function to fetch campaign job stats
  // In real implementation, this would call your API
  const fetchCampaignStats = async (): Promise<CampaignJobStats> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual API call
    const mockStats: CampaignJobStats = {
      campaignId,
      campaignName: 'Spring Product Launch Campaign',
      totalJobs: 150,
      pendingJobs: 45,
      processingJobs: 5,
      sentJobs: 95,
      failedJobs: 5,
      sendType: 'immediate',
      rateLimit: 100,
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'active'
    };
    
    return mockStats;
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCampaignStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign stats');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadStats();
  }, [campaignId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getProgressPercentage = () => {
    if (!stats || stats.totalJobs === 0) return 0;
    return Math.round((stats.sentJobs / stats.totalJobs) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeRemaining = () => {
    if (!stats?.estimatedCompletion) return 'Unknown';
    
    const now = new Date();
    const completion = new Date(stats.estimatedCompletion);
    const diffMs = completion.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Completing soon';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `~${hours}h ${minutes}m remaining`;
    }
    return `~${minutes}m remaining`;
  };

  if (loading && !stats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">Failed to load campaign progress</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadStats}>
            Try Again
          </Button>
        </div>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Campaign Progress</h3>
            <p className="text-sm text-gray-600 mt-1">{stats.campaignName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stats.status)}`}>
              {stats.status}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoRefresh(!autoRefresh)}
              leftIcon={autoRefresh ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            >
              {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadStats}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">{getProgressPercentage()}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        {stats.estimatedCompletion && (
          <p className="text-xs text-gray-500 mt-2">{formatTimeRemaining()}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Jobs */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <div className="text-lg font-semibold text-yellow-900">{stats.pendingJobs}</div>
                <div className="text-xs text-yellow-700">Pending</div>
              </div>
            </div>
          </div>

          {/* Processing Jobs */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
              <div>
                <div className="text-lg font-semibold text-blue-900">{stats.processingJobs}</div>
                <div className="text-xs text-blue-700">Processing</div>
              </div>
            </div>
          </div>

          {/* Sent Jobs */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-lg font-semibold text-green-900">{stats.sentJobs}</div>
                <div className="text-xs text-green-700">Sent</div>
              </div>
            </div>
          </div>

          {/* Failed Jobs */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <div className="text-lg font-semibold text-red-900">{stats.failedJobs}</div>
                <div className="text-xs text-red-700">Failed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Send Type:</span>
            <span className="ml-2 font-medium capitalize">{stats.sendType}</span>
          </div>
          <div>
            <span className="text-gray-600">Rate Limit:</span>
            <span className="ml-2 font-medium">{stats.rateLimit} emails/hour</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">{new Date(stats.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>
        
        {stats.scheduledFor && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Scheduled Start:</strong> {new Date(stats.scheduledFor).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<EyeIcon className="h-4 w-4" />}
          >
            View Details
          </Button>
          
          <div className="flex space-x-2">
            {stats.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange?.(campaignId, 'paused')}
              >
                Pause Campaign
              </Button>
            )}
            {stats.status === 'paused' && (
              <Button
                size="sm"
                onClick={() => onStatusChange?.(campaignId, 'active')}
              >
                Resume Campaign
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChartBarIcon className="h-4 w-4" />}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignProgress;

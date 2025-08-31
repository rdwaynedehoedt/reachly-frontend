'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingScreen, Button } from '@/components/ui';
import { campaignApi, Campaign } from '@/lib/campaignApi';
import CampaignProgress from '@/components/campaigns/CampaignProgress';
import {
  ArrowLeftIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChartBarIcon,
  UsersIcon,
  EnvelopeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'leads'>('overview');

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.getById(id as string);
      if (response.success) {
        setCampaign(response.data.campaign);
      } else {
        console.error('Failed to fetch campaign:', response.message);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await campaignApi.getAnalytics(id as string);
      if (response.success) {
        setAnalytics(response.data);
      } else {
        console.error('Failed to fetch analytics:', response.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchCampaign();
      fetchAnalytics();
    }
  }, [isAuthenticated, id]);

  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      setActionLoading(true);
      const response = await campaignApi.updateStatus(campaignId, newStatus);
      if (response.success) {
        setCampaign(prev => prev ? { ...prev, status: newStatus } : null);
        fetchAnalytics(); // Refresh analytics
      } else {
        console.error('Failed to update status:', response.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!analytics?.analytics) return 0;
    const { total_leads, emails_sent } = analytics.analytics;
    if (total_leads === 0) return 0;
    return Math.round((emails_sent / total_leads) * 100);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading campaign..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!campaign) {
    return (
      <div className="responsive-container min-h-screen py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/campaigns')} leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionButton = () => {
    if (campaign.status === 'draft') {
      return (
        <Button
          onClick={() => handleStatusChange(campaign.id, 'active')}
          disabled={actionLoading}
          leftIcon={<PlayIcon className="h-4 w-4" />}
        >
          Launch Campaign
        </Button>
      );
    }
    if (campaign.status === 'active') {
      return (
        <Button
          variant="secondary"
          onClick={() => handleStatusChange(campaign.id, 'paused')}
          disabled={actionLoading}
          leftIcon={<PauseIcon className="h-4 w-4" />}
        >
          Pause Campaign
        </Button>
      );
    }
    if (campaign.status === 'paused') {
      return (
        <Button
          onClick={() => handleStatusChange(campaign.id, 'active')}
          disabled={actionLoading}
          leftIcon={<PlayIcon className="h-4 w-4" />}
        >
          Resume Campaign
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="responsive-container min-h-screen py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/campaigns')}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            className="mr-4"
          >
            Back to Campaigns
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{campaign.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            {campaign.description && (
              <p className="text-gray-600 mb-4">{campaign.description}</p>
            )}
            <div className="text-sm text-gray-500">
              Created {new Date(campaign.created_at).toLocaleDateString()} • From: {campaign.from_email}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-4">
            {getActionButton()}
            <Button
              variant="outline"
              leftIcon={<PencilIcon className="h-4 w-4" />}
            >
              Edit Campaign
            </Button>
            <Button
              variant="outline"
              leftIcon={<ChartBarIcon className="h-4 w-4" />}
            >
              Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Campaign Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">{campaign.total_leads || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Emails Sent</dt>
                  <dd className="text-lg font-medium text-gray-900">{campaign.emails_sent || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {campaign.emails_sent > 0 ? Math.round((campaign.emails_opened / campaign.emails_sent) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Click Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {campaign.emails_sent > 0 ? Math.round((campaign.emails_clicked / campaign.emails_sent) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Progress Dashboard */}
      {(campaign.status === 'active' || campaign.status === 'paused') && (
        <div className="mb-8">
          <CampaignProgress
            campaignId={campaign.id}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Information</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Campaign Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{campaign.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">From Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{campaign.from_name || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">From Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{campaign.from_email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Reply To</dt>
                  <dd className="mt-1 text-sm text-gray-900">{campaign.reply_to_email || 'Same as from email'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timezone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{campaign.timezone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Daily Send Limit</dt>
                  <dd className="mt-1 text-sm text-gray-900">{campaign.daily_send_limit} emails/day</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign.emails_delivered || 0}</div>
                  <div className="text-xs text-gray-500">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.emails_opened || 0}</div>
                  <div className="text-xs text-gray-500">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.emails_clicked || 0}</div>
                  <div className="text-xs text-gray-500">Clicked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{campaign.emails_bounced || 0}</div>
                  <div className="text-xs text-gray-500">Bounced</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                leftIcon={<UsersIcon className="h-4 w-4" />}
              >
                View Leads
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
              >
                Edit Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                leftIcon={<ChartBarIcon className="h-4 w-4" />}
              >
                Download Report
              </Button>
            </div>
          </div>

          {/* Campaign Timeline */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
                {campaign.status !== 'draft' && (
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <span>Launched {new Date(campaign.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
                {campaign.scheduled_at && (
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                    <span>Scheduled for {new Date(campaign.scheduled_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

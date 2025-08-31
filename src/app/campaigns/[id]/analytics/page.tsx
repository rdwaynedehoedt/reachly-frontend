'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { LoadingScreen, Button } from '@/components/ui';
import { campaignApi, Campaign } from '@/lib/campaignApi';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function CampaignAnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
    return <LoadingScreen message="Loading campaign analytics..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!campaign) {
    return (
      <div className="responsive-container min-h-screen py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h1>
          <Button onClick={() => router.push('/campaigns')}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const analyticsData = analytics?.analytics;

  return (
    <div className="responsive-container min-h-screen py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/campaigns')}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Campaigns
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-gray-600 mb-4">{campaign.description}</p>
            )}
          </div>
          
          {/* Campaign Status & Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Status:</div>
              <div className={`text-lg font-medium ${
                campaign.status === 'active' ? 'text-green-600' :
                campaign.status === 'paused' ? 'text-yellow-600' :
                campaign.status === 'completed' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </div>
            </div>
            
            {campaign.status === 'active' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange(campaign.id, 'paused')}
                disabled={actionLoading}
              >
                Pause campaign
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button
                onClick={() => handleStatusChange(campaign.id, 'active')}
                disabled={actionLoading}
              >
                Resume campaign
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-medium text-gray-900">{progress}%</div>
              <div className="text-sm text-gray-500">
                Sequence started
                <br />
                {formatNumber(analyticsData?.total_leads || 0)}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-sm text-gray-500">Open rate</div>
                <div className="text-lg font-medium">
                  {analyticsData?.open_rate || 0}%
                  <span className="text-sm text-gray-500 ml-2">
                    | {formatNumber(analyticsData?.emails_opened || 0)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Click rate</div>
                <div className="text-lg font-medium">
                  {analyticsData?.click_rate || 0}%
                  <span className="text-sm text-gray-500 ml-2">
                    | {formatNumber(analyticsData?.emails_clicked || 0)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Opportunities</div>
                <div className="text-lg font-medium">
                  {formatNumber(analyticsData?.emails_replied || 0)}
                  <span className="text-sm text-gray-500 ml-2">
                    | ${((analyticsData?.emails_replied || 0) * 2500).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Conversions</div>
                <div className="text-lg font-medium">
                  {formatNumber(Math.floor((analyticsData?.emails_replied || 0) * 0.3))}
                  <span className="text-sm text-gray-500 ml-2">
                    | ${(Math.floor((analyticsData?.emails_replied || 0) * 0.3) * 2500).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-step breakdown */}
        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th className="pb-3">STEP</th>
                  <th className="pb-3">SENT</th>
                  <th className="pb-3">OPENED</th>
                  <th className="pb-3">REPLIED</th>
                  <th className="pb-3">CLICKED</th>
                  <th className="pb-3">OPPORTUNITIES</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Step 1</span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">A</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm font-medium">{formatNumber(analyticsData?.emails_sent || 0)}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm">
                      <span className="font-medium">{formatNumber(analyticsData?.emails_opened || 0)}</span>
                      <span className="text-gray-500">|{analyticsData?.open_rate || 0}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm">
                      <span className="font-medium">{formatNumber(analyticsData?.emails_replied || 0)}</span>
                      <span className="text-gray-500">|{analyticsData?.reply_rate || 0}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm">
                      <span className="font-medium">{formatNumber(analyticsData?.emails_clicked || 0)}</span>
                      <span className="text-gray-500">|{analyticsData?.click_rate || 0}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm font-medium">{formatNumber(analyticsData?.emails_replied || 0)}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Settings & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">From Email</label>
                  <div className="text-sm text-gray-900">{campaign.from_email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Daily Limit</label>
                  <div className="text-sm text-gray-900">{campaign.daily_send_limit} emails/day</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="text-sm text-gray-900">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="text-sm text-gray-900">
                    {new Date(campaign.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          </div>
          <div className="px-6 py-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              leftIcon={<UsersIcon className="h-4 w-4" />}
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              View Campaign
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
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

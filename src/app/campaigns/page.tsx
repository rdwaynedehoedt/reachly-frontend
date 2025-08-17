'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen, Button } from '@/components/ui';
import { campaignApi, Campaign, campaignUtils } from '@/lib/campaignApi';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  EyeIcon,
  UsersIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
} from '@heroicons/react/24/solid';

export default function CampaignsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.getAll();
      if (response.success && response.data?.campaigns) {
        setCampaigns(response.data.campaigns);
      } else {
        console.error('Failed to fetch campaigns:', response.message);
        setCampaigns([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
    }
  }, [isAuthenticated]);

  // Filter campaigns - add safety check
  const filteredCampaigns = (campaigns || []).filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle campaign actions
  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      setActionLoading(campaignId);
      const response = await campaignApi.updateStatus(campaignId, newStatus);
      if (response.success) {
        await fetchCampaigns(); // Refresh the list
      } else {
        console.error('Failed to update status:', response.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(campaignId);
      const response = await campaignApi.delete(campaignId);
      if (response.success) {
        await fetchCampaigns(); // Refresh the list
      } else {
        console.error('Failed to delete campaign:', response.message);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading campaigns..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your email campaigns and track performance.
            </p>
          </div>
          <Button
            onClick={() => router.push('/campaigns/create')}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MegaphoneIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Campaigns
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{campaigns?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Campaigns
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{(campaigns || []).filter(c => c.status === 'active').length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{(campaigns || []).reduce((sum, c) => sum + (c.total_leads || 0), 0).toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Emails Sent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{(campaigns || []).reduce((sum, c) => sum + (c.emails_sent || 0), 0).toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              {filteredCampaigns.length} of {campaigns?.length || 0} campaigns
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState onCreateCampaign={() => router.push('/campaigns/create')} />
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteCampaign}
                  onEdit={() => router.push(`/campaigns/${campaign.id}/edit`)}
                  onView={() => router.push(`/campaigns/${campaign.id}`)}
                  onAnalytics={() => router.push(`/campaigns/${campaign.id}/analytics`)}
                  loading={actionLoading === campaign.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



// Campaign Card Component
interface CampaignCardProps {
  campaign: Campaign;
  onStatusChange: (id: string, status: Campaign['status']) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onView: () => void;
  onAnalytics: () => void;
  loading: boolean;
}

function CampaignCard({ campaign, onStatusChange, onDelete, onEdit, onView, onAnalytics, loading }: CampaignCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusButton = () => {
    if (campaign.status === 'draft') {
      return (
        <Button
          size="sm"
          onClick={() => onStatusChange(campaign.id, 'active')}
          leftIcon={<PlayIcon className="h-4 w-4" />}
          disabled={loading}
        >
          Launch
        </Button>
      );
    }
    if (campaign.status === 'active') {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onStatusChange(campaign.id, 'paused')}
          leftIcon={<PauseIcon className="h-4 w-4" />}
          disabled={loading}
        >
          Pause
        </Button>
      );
    }
    if (campaign.status === 'paused') {
      return (
        <Button
          size="sm"
          onClick={() => onStatusChange(campaign.id, 'active')}
          leftIcon={<PlayIcon className="h-4 w-4" />}
          disabled={loading}
        >
          Resume
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between">
        {/* Campaign Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {campaign.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaignUtils.getStatusColor(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
          
          {campaign.description && (
            <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">{campaign.total_leads || 0}</div>
              <div className="text-xs text-gray-500">Leads</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">{campaign.emails_sent || 0}</div>
              <div className="text-xs text-gray-500">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">{campaign.emails_opened || 0}</div>
              <div className="text-xs text-gray-500">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">{campaign.emails_clicked || 0}</div>
              <div className="text-xs text-gray-500">Clicked</div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-sm text-gray-500">
            Created {campaignUtils.formatDate(campaign.created_at)} • From: {campaign.from_email}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 ml-4">
          {getStatusButton()}
          
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowActions(!showActions)}
              disabled={loading}
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => { onView(); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => { onEdit(); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Campaign</span>
                </button>
                <button
                  onClick={() => { onAnalytics(); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>View Analytics</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { onDelete(campaign.id); setShowActions(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete Campaign</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  onCreateCampaign: () => void;
}

function EmptyState({ onCreateCampaign }: EmptyStateProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="text-center py-12 px-6">
        <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Get started by creating your first email campaign. You can import leads, customize templates, and track performance all in one place.
        </p>
        <Button
          onClick={onCreateCampaign}
          leftIcon={<PlusIcon className="h-4 w-4" />}
        >
          Create Your First Campaign
        </Button>
      </div>
    </div>
  );
}

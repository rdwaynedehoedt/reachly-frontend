'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import FadeIn from '@/components/FadeIn';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  type: 'sequence' | 'single' | 'drip';
  total_leads: number;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  sequence_steps: number;
  created_at: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/campaigns');
      if (response.success) {
        setCampaigns(response.data.campaigns);
      } else {
        setError('Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Error loading campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOpenRate = (sent: number, opened: number) => {
    if (sent === 0) return '0%';
    return `${((opened / sent) * 100).toFixed(1)}%`;
  };

  const getReplyRate = (sent: number, replied: number) => {
    if (sent === 0) return '0%';
    return `${((replied / sent) * 100).toFixed(1)}%`;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                <p className="text-gray-600 mt-2">Create and manage your email marketing campaigns</p>
              </div>
              <Link href="/campaigns/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Campaign
                </Button>
              </Link>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {error && (
              <Card className="mb-6 p-4 border-red-200 bg-red-50">
                <p className="text-red-700">{error}</p>
              </Card>
            )}

            {/* Campaigns Grid */}
            {filteredCampaigns.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6">
                  {campaigns.length === 0 
                    ? "Create your first email campaign to start reaching your leads"
                    : "No campaigns match your current filters"
                  }
                </p>
                {campaigns.length === 0 && (
                  <Link href="/campaigns/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Create Your First Campaign
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {campaign.name}
                        </h3>
                        {campaign.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {campaign.description}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Leads</span>
                        <span className="font-medium">{campaign.total_leads}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Steps</span>
                        <span className="font-medium">{campaign.sequence_steps}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Emails Sent</span>
                        <span className="font-medium">{campaign.emails_sent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Open Rate</span>
                        <span className="font-medium text-green-600">
                          {getOpenRate(campaign.emails_sent, campaign.emails_opened)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reply Rate</span>
                        <span className="font-medium text-blue-600">
                          {getReplyRate(campaign.emails_sent, campaign.emails_replied)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.id}/edit`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Edit
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                        {campaign.created_by_first_name && (
                          <> by {campaign.created_by_first_name} {campaign.created_by_last_name}</>
                        )}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

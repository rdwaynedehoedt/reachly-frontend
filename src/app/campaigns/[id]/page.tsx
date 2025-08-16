'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import FadeIn from '@/components/FadeIn';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  total_leads: number;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  from_name: string;
  from_email: string;
  reply_to_email?: string;
  timezone: string;
  schedule_days: string[];
  schedule_start_time: string;
  schedule_end_time: string;
  daily_send_limit: number;
  max_emails_per_lead: number;
  created_at: string;
}

interface Sequence {
  id: string;
  step_number: number;
  name?: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  delay_days: number;
  delay_hours: number;
  delay_minutes: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  emails_replied: number;
  is_active: boolean;
}

interface CampaignLead {
  id: string;
  status: string;
  current_step: number;
  next_send_at?: string;
  enrolled_at: string;
  last_email_sent_at?: string;
  completed_at?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface Analytics {
  overview: {
    total_leads: number;
    active_leads: number;
    completed_leads: number;
    emails_sent: number;
    emails_opened: number;
    emails_clicked: number;
    emails_replied: number;
    open_rate: number;
    click_rate: number;
    reply_rate: number;
  };
  sequences: Array<{
    step_number: number;
    step_name?: string;
    subject: string;
    emails_sent: number;
    emails_opened: number;
    emails_clicked: number;
    emails_replied: number;
    open_rate: number;
    click_rate: number;
    reply_rate: number;
  }>;
}

export default function CampaignDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sequences' | 'leads' | 'analytics'>('overview');
  const [showAddSequence, setShowAddSequence] = useState(false);

  // New sequence form state
  const [newSequence, setNewSequence] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    delayDays: 0,
    delayHours: 0,
    delayMinutes: 0
  });

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
      fetchAnalytics();
    }
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/campaigns/${campaignId}`);
      if (response.success) {
        setCampaign(response.data.campaign);
        setSequences(response.data.sequences);
        setLeads(response.data.leads);
      } else {
        setError('Failed to fetch campaign details');
      }
    } catch (err) {
      setError('Error loading campaign');
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/analytics`);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const updateCampaignStatus = async (status: string) => {
    try {
      const response = await apiClient.put(`/campaigns/${campaignId}/status`, { status });
      if (response.success) {
        setCampaign(prev => prev ? { ...prev, status } : null);
      } else {
        setError('Failed to update campaign status');
      }
    } catch (err) {
      setError('Error updating campaign status');
      console.error('Error updating status:', err);
    }
  };

  const addSequenceStep = async () => {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/sequences`, newSequence);
      if (response.success) {
        setSequences(prev => [...prev, response.data.sequence]);
        setShowAddSequence(false);
        setNewSequence({
          name: '',
          subject: '',
          htmlContent: '',
          textContent: '',
          delayDays: 0,
          delayHours: 0,
          delayMinutes: 0
        });
      } else {
        setError('Failed to add sequence step');
      }
    } catch (err) {
      setError('Error adding sequence step');
      console.error('Error adding sequence:', err);
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

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'unsubscribed': return 'text-red-600 bg-red-100';
      case 'bounced': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign not found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist.</p>
          <Link href="/campaigns">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Campaigns
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-600">{campaign.description}</p>
              </div>
              <div className="flex space-x-2">
                {campaign.status === 'draft' && (
                  <Button 
                    onClick={() => updateCampaignStatus('active')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Campaign
                  </Button>
                )}
                {campaign.status === 'active' && (
                  <Button 
                    onClick={() => updateCampaignStatus('paused')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Pause Campaign
                  </Button>
                )}
                {campaign.status === 'paused' && (
                  <Button 
                    onClick={() => updateCampaignStatus('active')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Resume Campaign
                  </Button>
                )}
                <Link href={`/campaigns/${campaign.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-sm text-gray-600">Total Leads</div>
                <div className="text-2xl font-bold text-gray-900">{campaign.total_leads}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Emails Sent</div>
                <div className="text-2xl font-bold text-gray-900">{campaign.emails_sent}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Open Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {campaign.emails_sent > 0 ? ((campaign.emails_opened / campaign.emails_sent) * 100).toFixed(1) : 0}%
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">Reply Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {campaign.emails_sent > 0 ? ((campaign.emails_replied / campaign.emails_sent) * 100).toFixed(1) : 0}%
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'sequences', label: 'Sequences' },
                  { id: 'leads', label: 'Leads' },
                  { id: 'analytics', label: 'Analytics' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {error && (
            <Card className="mb-6 p-4 border-red-200 bg-red-50">
              <p className="text-red-700">{error}</p>
            </Card>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{campaign.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From Name</span>
                    <span className="font-medium">{campaign.from_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From Email</span>
                    <span className="font-medium">{campaign.from_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timezone</span>
                    <span className="font-medium">{campaign.timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Limit</span>
                    <span className="font-medium">{campaign.daily_send_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Emails/Lead</span>
                    <span className="font-medium">{campaign.max_emails_per_lead}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sending Days</span>
                    <span className="font-medium">
                      {(Array.isArray(campaign.schedule_days) 
                        ? campaign.schedule_days 
                        : JSON.parse(campaign.schedule_days || '[]')
                      ).map((day: string) => 
                        day.charAt(0).toUpperCase() + day.slice(1)
                      ).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Window</span>
                    <span className="font-medium">
                      {campaign.schedule_start_time} - {campaign.schedule_end_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'sequences' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Sequences</h3>
                <Button 
                  onClick={() => setShowAddSequence(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Step
                </Button>
              </div>

              {showAddSequence && (
                <Card className="p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Sequence Step</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Step Name</label>
                      <Input
                        type="text"
                        value={newSequence.name}
                        onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Follow-up 1"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line *</label>
                      <Input
                        type="text"
                        value={newSequence.subject}
                        onChange={(e) => setNewSequence(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g., Following up on my previous email"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                      <textarea
                        value={newSequence.textContent}
                        onChange={(e) => setNewSequence(prev => ({ ...prev, textContent: e.target.value }))}
                        placeholder="Write your email content here..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delay Before Sending</label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500">Days</label>
                          <Input
                            type="number"
                            value={newSequence.delayDays}
                            onChange={(e) => setNewSequence(prev => ({ ...prev, delayDays: parseInt(e.target.value) || 0 }))}
                            min={0}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Hours</label>
                          <Input
                            type="number"
                            value={newSequence.delayHours}
                            onChange={(e) => setNewSequence(prev => ({ ...prev, delayHours: parseInt(e.target.value) || 0 }))}
                            min={0}
                            max={23}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Minutes</label>
                          <Input
                            type="number"
                            value={newSequence.delayMinutes}
                            onChange={(e) => setNewSequence(prev => ({ ...prev, delayMinutes: parseInt(e.target.value) || 0 }))}
                            min={0}
                            max={59}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={addSequenceStep}
                        disabled={!newSequence.subject.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Add Step
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowAddSequence(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                {sequences.map((sequence, index) => (
                  <Card key={sequence.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Step {sequence.step_number}
                          </span>
                          {sequence.name && (
                            <span className="text-sm text-gray-600">{sequence.name}</span>
                          )}
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{sequence.subject}</h4>
                        {sequence.text_content && (
                          <p className="text-gray-600 text-sm line-clamp-3">{sequence.text_content}</p>
                        )}
                        <div className="mt-3 text-sm text-gray-500">
                          Delay: {sequence.delay_days}d {sequence.delay_hours}h {sequence.delay_minutes}m
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Sent: {sequence.emails_sent}</div>
                          <div>Opened: {sequence.emails_opened}</div>
                          <div>Replied: {sequence.emails_replied}</div>
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sequence.is_active ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {sequence.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {sequences.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="text-4xl mb-4">📧</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sequences yet</h3>
                    <p className="text-gray-600 mb-4">Add email steps to create your campaign sequence</p>
                    <Button 
                      onClick={() => setShowAddSequence(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add First Step
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Campaign Leads</h3>
                <Link href={`/campaigns/${campaign.id}/leads/add`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add Leads
                  </Button>
                </Link>
              </div>

              {leads.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads added</h3>
                  <p className="text-gray-600 mb-4">Add leads to start your email campaign</p>
                  <Link href={`/campaigns/${campaign.id}/leads/add`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Add Leads
                    </Button>
                  </Link>
                </Card>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lead
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Step
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Next Send
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrolled
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead) => (
                          <tr key={lead.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {lead.first_name} {lead.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{lead.email}</div>
                                {lead.company_name && (
                                  <div className="text-sm text-gray-500">{lead.company_name}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeadStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Step {lead.current_step}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lead.next_send_at 
                                ? new Date(lead.next_send_at).toLocaleDateString()
                                : 'N/A'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(lead.enrolled_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Open Rate</div>
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.open_rate.toFixed(1)}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Click Rate</div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.overview.click_rate.toFixed(1)}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Reply Rate</div>
                  <div className="text-2xl font-bold text-purple-600">{analytics.overview.reply_rate.toFixed(1)}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.overview.total_leads > 0 
                      ? ((analytics.overview.completed_leads / analytics.overview.total_leads) * 100).toFixed(1)
                      : 0
                    }%
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequence Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Step</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Subject</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Sent</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Open Rate</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Click Rate</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Reply Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.sequences.map((seq) => (
                        <tr key={seq.step_number} className="border-b border-gray-100">
                          <td className="py-3 text-sm">{seq.step_number}</td>
                          <td className="py-3 text-sm font-medium">{seq.subject}</td>
                          <td className="py-3 text-sm">{seq.emails_sent}</td>
                          <td className="py-3 text-sm text-green-600">{seq.open_rate.toFixed(1)}%</td>
                          <td className="py-3 text-sm text-blue-600">{seq.click_rate.toFixed(1)}%</td>
                          <td className="py-3 text-sm text-purple-600">{seq.reply_rate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}

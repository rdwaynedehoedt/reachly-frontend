'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen, Button } from '@/components/ui';
import MobileSidebar from '@/components/ui/MobileSidebar';
import ModernSidebar from '@/components/ui/ModernSidebar';
import ModernTopbar from '@/components/ui/ModernTopbar';
import { api } from '@/lib/apiClient';
import { campaignApi, Campaign, campaignUtils } from '@/lib/campaignApi';
import CampaignCreationForm from '@/components/campaigns/CampaignCreationForm';

import {
  HomeIcon,
  EnvelopeIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PlusIcon,
  BellIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  Bars3Icon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
  FunnelIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MegaphoneIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import {
  EnvelopeIcon as EnvelopeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, needsOnboarding, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check for tab parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['dashboard', 'campaigns', 'leads', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && needsOnboarding) {
      router.push('/onboarding');
    }
    
    // Check if returning from leads import
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'leads') {
        setActiveTab('leads');
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isAuthenticated, needsOnboarding, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Handle create new action - no longer used since we removed the New button from topbar
  const handleCreateNew = () => {
    // This function is no longer used since we removed the New button
    // Campaign creation now happens within the dashboard
  };

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: HomeIcon, current: activeTab === 'dashboard' },
    { name: 'Campaigns', href: 'campaigns', icon: MegaphoneIcon, current: activeTab === 'campaigns' },
    { name: 'Leads', href: 'leads', icon: UserGroupIcon, current: activeTab === 'leads' },
    { name: 'Analytics', href: 'analytics', icon: ChartBarIcon, current: activeTab === 'analytics' },
    { name: 'Settings', href: 'settings', icon: Cog6ToothIcon, current: activeTab === 'settings' },
  ];

  // Show loading screen while auth is loading OR if user needs onboarding (prevents dashboard flash)
  if (loading || (!loading && isAuthenticated && needsOnboarding)) {
    return <LoadingScreen message={needsOnboarding ? "Setting up your experience..." : "Loading dashboard..."} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />

      {/* Modern Desktop Sidebar */}
      <div className="hidden md:block">
        <ModernSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
          </div>
          
      {/* Modern Topbar */}
      <ModernTopbar
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMobileMenu={sidebarOpen}
        user={user}
        onLogout={handleLogout}
        onCreateNew={handleCreateNew}
      />

      {/* Main content */}
      <main className="pt-14 ml-0 md:ml-16 transition-all duration-200">
        <div className="min-h-screen">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <DashboardContent user={user} />}
              {activeTab === 'campaigns' && <CampaignsContent />}
              {activeTab === 'leads' && <LeadsContent />}
              {activeTab === 'analytics' && <AnalyticsContent />}
              {activeTab === 'settings' && <SettingsContent />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({ user }: { user: any }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const { campaignApi } = await import('@/lib/campaignApi');
      const response = await campaignApi.getDashboardAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        console.error('Failed to fetch analytics:', response.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'k';
    return '$' + num.toLocaleString();
  };

  return (
    <>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your campaigns today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EnvelopeIconSolid className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Emails Sent
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {loadingAnalytics ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    formatNumber(analytics?.overview?.emails_sent || 0)
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIconSolid className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Open Rate
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {loadingAnalytics ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    `${analytics?.overview?.open_rate || 0}%`
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Reply Rate
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {loadingAnalytics ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    `${analytics?.overview?.reply_rate || 0}%`
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 bg-orange-100 rounded flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">$</span>
              </div>
            </div>
            <div className="ml-3">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Opportunities
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {loadingAnalytics ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    formatCurrency(analytics?.overview?.opportunities || 0)
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {loadingAnalytics ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
                  <div className="flex-1">
                    <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-1/4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : analytics?.recent_activity?.length > 0 ? (
            <div className="space-y-4">
              {analytics.recent_activity.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <EnvelopeIconSolid className="h-4 w-4 text-green-600" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.emails_sent}</span> emails sent
                      {activity.emails_opened > 0 && (
                        <>, <span className="font-medium">{activity.emails_opened}</span> opened</>
                      )}
                      {activity.emails_replied > 0 && (
                        <>, <span className="font-medium text-green-600">{activity.emails_replied}</span> replied</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Start sending campaigns to see activity here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Campaigns */}
      {analytics?.top_campaigns?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Campaigns</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.top_campaigns.slice(0, 3).map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
                    <p className="text-xs text-gray-500">
                      {campaign.emails_sent} sent • {campaign.open_rate}% open rate
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.emails_replied} replies
                    </div>
                    <div className="text-xs text-gray-500">
                      {((campaign.emails_replied / (campaign.emails_sent || 1)) * 100).toFixed(1)}% reply rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



// Leads Content Component  
function LeadsContent() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(50);
  const [selectedList, setSelectedList] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const data = await import('@/lib/apiClient').then(({ leadsApi }) => leadsApi.getAll());
      
      if (data.success) {
        // Transform backend data to frontend format
        const transformedLeads = data.data.leads.map((lead: any) => ({
          id: lead.id,
          email: lead.email,
          firstName: lead.first_name,
          lastName: lead.last_name,
          companyName: lead.company_name,
          jobTitle: lead.job_title,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          createdAt: lead.created_at
        }));
        setLeads(transformedLeads);
      } else {
        console.error('Failed to fetch leads:', data.message);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Filter by list selection first
  const listFilteredLeads = leads.filter(lead => {
    if (selectedList === 'all') return true;
    if (selectedList === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(lead.createdAt) > oneWeekAgo;
    }
    if (selectedList === 'prospects') return lead.status === 'active';
    if (selectedList === 'customers') return lead.status === 'replied';
    if (selectedList === 'motor') {
      return lead.companyName && lead.companyName.toLowerCase().includes('motor');
    }
    if (selectedList === 'life') {
      return lead.companyName && lead.companyName.toLowerCase().includes('life');
    }
    if (selectedList === 'property') {
      return lead.companyName && lead.companyName.toLowerCase().includes('property');
    }
    if (selectedList === 'health') {
      return lead.companyName && lead.companyName.toLowerCase().includes('health');
    }
    return true;
  });

  // Then filter by search term
  const filteredLeads = listFilteredLeads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when search or list selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, leadsPerPage, selectedList]);
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="mt-1 text-sm text-gray-500">
              Import and manage your contact lists.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Leads</option>
              <option value="recent">Recently Added</option>
              <option value="prospects">Prospects</option>
              <option value="customers">Customers</option>
              <option value="motor">Motor Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="property">Property Insurance</option>
              <option value="health">Health Insurance</option>
            </select>
            <Button 
              variant="outline"
              onClick={() => {/* TODO: Add create list modal */}}
              className="text-sm"
            >
              Create List
            </Button>
            <Button onClick={() => router.push('/leads/import')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Leads
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{filteredLeads.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredLeads.filter(l => l.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">✉</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Contacted
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredLeads.filter(l => l.status === 'contacted').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">💬</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Replied
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredLeads.filter(l => l.status === 'replied').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Search leads</label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search leads by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <label htmlFor="per-page" className="text-sm text-gray-700 whitespace-nowrap">Show:</label>
              <select
                id="per-page"
                value={leadsPerPage}
                onChange={(e) => setLeadsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
        
        {/* Filter summary */}
        {selectedList !== 'all' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredLeads.length} leads in "{selectedList}" list
              </span>
              <button 
                onClick={() => setSelectedList('all')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loadingLeads ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by importing your first contacts from a CSV file.
            </p>
            <Button onClick={() => router.push('/leads/import')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Your First Leads
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        {lead.phone && (
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.companyName || '-'}</div>
                      {lead.jobTitle && (
                        <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'active' ? 'bg-green-100 text-green-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredLeads.length)}</span> of{' '}
                <span className="font-medium">{filteredLeads.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Content Component
function AnalyticsContent() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your email performance and metrics.
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data yet</h3>
        <p className="mt-1 text-sm text-gray-500">Start sending emails to see your analytics here.</p>
      </div>
    </div>
  );
}

// Settings Content Component
function SettingsContent() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences.
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
            <div className="mt-1">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200" />
              <span className="ml-2 text-sm text-gray-600">Receive email notifications for email updates</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Zone</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>UTC</option>
              <option>EST</option>
              <option>PST</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Campaigns Content Component
function CampaignsContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns();
    }
  }, [isAuthenticated]);

  // Auto-refresh campaigns every 30 seconds to pick up email statistics updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Only refresh if there are active campaigns that might be sending emails
      const hasActiveCampaigns = campaigns.some(c => 
        c.status === 'active'
      );
      
      if (hasActiveCampaigns) {
        fetchCampaigns();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, campaigns]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.getAll();
      
      if (response && response.success && response.data?.campaigns) {
        setCampaigns(response.data.campaigns);
      } else {
        console.error('Failed to fetch campaigns:', response?.message || 'Unknown error');
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Campaign['status']) => {
    try {
      setActionLoading(id);
      const response = await campaignApi.updateStatus(id, status);
      if (response.success) {
        setCampaigns(campaigns.map(c => 
          c.id === id ? { ...c, status } : c
        ));
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }
    
    try {
      setActionLoading(id);
      const response = await campaignApi.delete(id);
      if (response.success) {
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLaunchCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to send emails for this campaign?')) {
      return;
    }
    
    try {
      setActionLoading(id);
      const response = await campaignApi.launch(id);
      if (response.success) {
        alert(`Campaign launched successfully! ${response.data.sentCount} emails sent.`);
        fetchCampaigns(); // Refresh the list to update stats
      } else {
        alert(`Failed to launch campaign: ${response.message}`);
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('Failed to launch campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCampaigns = (campaigns || []).filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingScreen message="Loading campaigns..." />;
  }

  return (
    <>
      {!showCreateForm ? (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your email campaigns and track performance.
              {campaigns.some(c => c.status === 'active') && (
                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-1 animate-pulse"></span>
                  Auto-updating stats
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchCampaigns()}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Button
              onClick={() => setShowCreateForm(true)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              New Campaign
            </Button>
          </div>
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
        <div className="bg-white shadow-sm rounded-lg">
          <div className="text-center py-12 px-6">
            <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by creating your first email campaign. You can import leads, customize templates, and track performance all in one place.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Create Your First Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCardDashboard
                  key={campaign.id}
                  campaign={campaign}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteCampaign}
                  onEdit={() => alert('Campaign editing coming soon!')}
                  onView={() => alert('Campaign details coming soon!')}
                  onAnalytics={() => router.push(`/campaigns/${campaign.id}/analytics`)}
                  onLaunch={handleLaunchCampaign}
                  loading={actionLoading === campaign.id}
                />
              ))}
            </div>
          </div>
        </div>
          )}
        </>
      ) : (
        <CampaignCreationForm 
          onCancel={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchCampaigns(); // Refresh campaigns list
          }}
        />
      )}
    </>
  );
}

// Campaign Card Component for Dashboard
interface CampaignCardDashboardProps {
  campaign: Campaign;
  onStatusChange: (id: string, status: Campaign['status']) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onView: () => void;
  onAnalytics: () => void;
  onLaunch: (id: string) => void;
  loading: boolean;
}

function CampaignCardDashboard({ campaign, onStatusChange, onDelete, onEdit, onView, onAnalytics, onLaunch, loading }: CampaignCardDashboardProps) {
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
                {campaign.status === 'active' && (
                  <>
                    <button
                      onClick={() => { onLaunch(campaign.id); setShowActions(false); }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <RocketLaunchIcon className="h-4 w-4" />
                      <span>Send Emails</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                  </>
                )}
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
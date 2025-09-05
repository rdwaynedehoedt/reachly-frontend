'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { campaignApi } from '@/lib/campaignApi';

// Global email statistics interface
interface GlobalEmailStats {
  // Dashboard overview
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  emailsSentToday: number;
  emailsSentTotal: number;
  openRateAverage: number;
  clickRateAverage: number;
  
  // Campaign list data
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    emailsSent: number;
    totalLeads: number;
    openRate: number;
    clickRate: number;
    lastActivity: string;
  }>;
  
  // Active campaign progress
  activeCampaignStats: Array<{
    campaignId: string;
    currentProgress: number;
    emailsInQueue: number;
    emailsBeingSent: number;
    recentActivity: Array<{
      timestamp: string;
      action: string;
      count: number;
    }>;
  }>;
  
  // System status
  isEmailSending: boolean;
  lastUpdated: string;
}

// Adaptive polling intervals based on activity
const POLLING_INTERVALS = {
  ACTIVE_SENDING: 3000,    // 3 seconds when emails are being sent
  ACTIVE_CAMPAIGN: 5000,   // 5 seconds when campaigns are active
  IDLE: 30000,             // 30 seconds when idle
  BACKGROUND: 60000,       // 1 minute in background
} as const;

/**
 * Global hook for real-time email statistics across all dashboard pages
 */
export function useGlobalEmailStats() {
  const queryClient = useQueryClient();
  const visibilityRef = useRef(document.visibilityState);

  // Fetch dashboard overview stats
  const {
    data: dashboardStats,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await campaignApi.getDashboardAnalytics();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard stats');
      }
      // Debug logging to see actual API response
      console.log('📊 Dashboard API Response:', response.data);
      return response.data;
    },
    refetchInterval: (data: any) => {
      // Adaptive polling based on activity
      if (visibilityRef.current === 'hidden') return POLLING_INTERVALS.BACKGROUND;
      if (data?.overview?.active_campaigns > 0) return POLLING_INTERVALS.ACTIVE_CAMPAIGN;
      return POLLING_INTERVALS.IDLE;
    },
    refetchIntervalInBackground: false,
  });

  // Fetch campaigns list with real-time updates
  const {
    data: campaignsData,
    isLoading: isCampaignsLoading,
    error: campaignsError,
  } = useQuery({
    queryKey: ['campaigns-list'],
    queryFn: async () => {
      const response = await campaignApi.getAll();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch campaigns');
      }
      // Debug logging to see actual campaigns API response
      console.log('🎯 Campaigns API Response:', response.data);
      return response.data;
    },
    refetchInterval: (data: any) => {
      if (visibilityRef.current === 'hidden') return POLLING_INTERVALS.BACKGROUND;
      
      // Check if any campaigns are active
      const hasActiveCampaigns = data?.campaigns?.some((c: any) => 
        c.status === 'active' || c.status === 'sending'
      );
      
      if (hasActiveCampaigns) return POLLING_INTERVALS.ACTIVE_SENDING;
      return POLLING_INTERVALS.IDLE;
    },
    refetchIntervalInBackground: false,
  });

  // Handle visibility changes for adaptive polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = document.visibilityState;
      
      if (document.visibilityState === 'visible') {
        // Immediately refetch when user returns to tab
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['campaigns-list'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Combine and normalize data
  const globalStats: GlobalEmailStats = {
    // Dashboard overview - map from backend API structure
    totalCampaigns: dashboardStats?.overview?.total_campaigns || 0,
    activeCampaigns: dashboardStats?.overview?.active_campaigns || 0,
    totalLeads: dashboardStats?.overview?.total_leads || 0,
    emailsSentToday: dashboardStats?.overview?.emails_sent || 0, // Backend doesn't separate today vs total yet
    emailsSentTotal: dashboardStats?.overview?.emails_sent || 0,
    openRateAverage: dashboardStats?.overview?.open_rate || 0,
    clickRateAverage: dashboardStats?.overview?.click_rate || 0,
    
    // Campaign list
    campaigns: campaignsData?.campaigns?.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      emailsSent: campaign.emails_sent || 0,
      totalLeads: campaign.total_leads || 0,
      openRate: campaign.open_rate || 0,
      clickRate: campaign.click_rate || 0,
      lastActivity: campaign.updated_at,
    })) || [],
    
    // Active campaign stats (placeholder - will be populated by individual campaign hooks)
    activeCampaignStats: [],
    
    // System status
    isEmailSending: campaignsData?.campaigns?.some((c: any) => c.status === 'sending') || false,
    lastUpdated: new Date().toISOString(),
  };

  // Debug logging to see final computed stats
  console.log('📈 Global Stats Computed:', {
    totalCampaigns: globalStats.totalCampaigns,
    activeCampaigns: globalStats.activeCampaigns,
    totalLeads: globalStats.totalLeads,
    emailsSentTotal: globalStats.emailsSentTotal,
    campaignsCount: globalStats.campaigns?.length || 0,
    sampleCampaign: globalStats.campaigns?.[0] || null,
  });

  return {
    stats: globalStats,
    isLoading: isDashboardLoading || isCampaignsLoading,
    error: dashboardError || campaignsError,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns-list'] });
    },
  };
}

/**
 * Hook for real-time campaign-specific analytics
 */
export function useCampaignAnalytics(campaignId: string) {
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async () => {
      const response = await campaignApi.getAnalytics(campaignId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch campaign analytics');
      }
      return response.data;
    },
    refetchInterval: POLLING_INTERVALS.ACTIVE_CAMPAIGN,
    refetchIntervalInBackground: false,
    enabled: !!campaignId,
  });

  return {
    analytics,
    isLoading,
    error,
  };
}

/**
 * Hook for real-time campaign progress (for active campaigns)
 */
export function useCampaignProgress(campaignId: string) {
  const {
    data: progress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['campaign-progress', campaignId],
    queryFn: async () => {
      // This would call a new API endpoint for real-time progress
      // For now, we'll use the existing analytics endpoint
      const response = await campaignApi.getAnalytics(campaignId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch campaign progress');
      }
      return {
        campaignId,
        totalJobs: response.data?.analytics?.total_leads || 0,
        sentJobs: response.data?.analytics?.emails_sent || 0,
        pendingJobs: (response.data?.analytics?.total_leads || 0) - (response.data?.analytics?.emails_sent || 0),
        completionPercentage: response.data?.analytics?.total_leads > 0 
          ? Math.round((response.data?.analytics?.emails_sent / response.data?.analytics?.total_leads) * 100)
          : 0,
      };
    },
    refetchInterval: POLLING_INTERVALS.ACTIVE_SENDING,
    refetchIntervalInBackground: false,
    enabled: !!campaignId,
  });

  return {
    progress,
    isLoading,
    error,
  };
}

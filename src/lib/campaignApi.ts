// Campaign API client with TypeScript types and modern patterns
import { apiClient } from './apiClient';

// Dashboard Analytics Types
export interface DashboardAnalytics {
  overview: {
    total_campaigns: number;
    active_campaigns: number;
    total_leads: number;
    emails_sent: number;
    open_rate: number;
    click_rate: number;
    reply_rate: number;
    opportunities: number;
  };
  campaign_breakdown: {
    active: number;
    paused: number;
    completed: number;
    draft: number;
  };
  recent_activity: Array<{
    date: string;
    emails_sent: number;
    emails_opened: number;
    emails_clicked: number;
    emails_replied: number;
  }>;
  top_campaigns: Array<{
    id: string;
    name: string;
    status: string;
    total_leads: number;
    emails_sent: number;
    emails_opened: number;
    emails_replied: number;
    open_rate: number;
  }>;
}

// Type definitions
export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'single' | 'sequence';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  from_name?: string;
  from_email: string;
  reply_to_email?: string;
  scheduled_at?: string;
  send_immediately?: boolean;
  timezone: string;
  daily_send_limit: number;
  total_leads: number;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  emails_replied: number;
  emails_bounced: number;
  emails_failed: number;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
}

export interface CampaignTemplate {
  id: string;
  campaign_id: string;
  name: string;
  subject: string;
  body_html?: string;
  body_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed' | 'unsubscribed';
  enrolled_at: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  error_message?: string;
  custom_variables?: Record<string, any>;
  // Lead details
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  job_title?: string;
  phone?: string;
  website?: string;
  linkedin_url?: string;
  lead_status?: string;
  source?: string;
  tags?: string[];
}

export interface CampaignAnalytics {
  campaign: Pick<Campaign, 'id' | 'name' | 'created_at'>;
  analytics: {
    total_leads: number;
    pending_leads: number;
    emails_sent: number;
    emails_delivered: number;
    emails_opened: number;
    emails_clicked: number;
    emails_replied: number;
    emails_bounced: number;
    emails_failed: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
    reply_rate: number;
    bounce_rate: number;
    first_sent_at?: string;
    last_sent_at?: string;
  };
  timeline: Array<{
    date: string;
    emails_sent: number;
    emails_delivered: number;
    emails_opened: number;
    emails_clicked: number;
  }>;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  type?: 'single' | 'sequence';
  from_name?: string;
  from_email: string;
  reply_to_email?: string;
  scheduled_at?: string;
  send_immediately?: boolean;
  timezone?: string;
  daily_send_limit?: number;
  is_mass_email?: boolean;
  mass_email_concurrency?: number;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  from_name?: string;
  from_email?: string;
  reply_to_email?: string;
  scheduled_at?: string;
  send_immediately?: boolean;
  timezone?: string;
  daily_send_limit?: number;
}

export interface CampaignTemplateData {
  name?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
}

export interface PersonalizationVariable {
  name: string;
  placeholder: string;
  description: string;
  isCustom?: boolean;
}

// Campaign API client
export const campaignApi = {
  // Get dashboard analytics
  async getDashboardAnalytics(): Promise<{
    success: boolean;
    data?: DashboardAnalytics;
    message?: string;
  }> {
    try {
      const response = await apiClient.get('/campaigns/dashboard/analytics');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching dashboard analytics:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  },
  // Campaign CRUD operations
  getAll: async (): Promise<{ success: boolean; data: { campaigns: Campaign[] }; message?: string }> => {
    return await apiClient.get('/campaigns');
  },

  getById: async (id: string): Promise<{ 
    success: boolean; 
    data: { 
      campaign: Campaign; 
      template: CampaignTemplate | null;
      leads: CampaignLead[];
      analytics: any;
    }; 
    message?: string 
  }> => {
    return await apiClient.get(`/campaigns/${id}`);
  },

  create: async (data: CreateCampaignData): Promise<{ 
    success: boolean; 
    data: { campaign: Campaign }; 
    message?: string 
  }> => {
    return await apiClient.post('/campaigns', data);
  },

  update: async (id: string, data: UpdateCampaignData): Promise<{ 
    success: boolean; 
    data: { campaign: Campaign }; 
    message?: string 
  }> => {
    return await apiClient.put(`/campaigns/${id}`, data);
  },

  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return await apiClient.delete(`/campaigns/${id}`);
  },

  updateStatus: async (id: string, status: Campaign['status']): Promise<{ 
    success: boolean; 
    data: { campaign: Campaign }; 
    message?: string 
  }> => {
    return await apiClient.put(`/campaigns/${id}/status`, { status });
  },

  launch: async (id: string, options?: {
    sendType?: 'immediate' | 'scheduled';
    scheduledFor?: string; // ISO date string
    rateLimit?: number;   // emails per hour
  }): Promise<{ 
    success: boolean; 
    data: { 
      campaignId: string;
      sendType: string;
      scheduledFor?: string;
      jobsCreated: number;
      totalRecipients: number;
      rateLimit: number;
      estimatedCompletionTime?: string;
      scheduleInfo?: any;
      // Legacy support
      sentCount?: number;
      failedCount?: number;
      totalProcessed?: number;
      errors?: string[];
    }; 
    message?: string 
  }> => {
    const payload = {
      sendType: options?.sendType || 'immediate',
      scheduledFor: options?.scheduledFor,
      rateLimit: options?.rateLimit || 100
    };
    return await apiClient.post(`/campaigns/${id}/launch`, payload);
  },

  // Lead management
  addLeads: async (id: string, leadIds: string[]): Promise<{ 
    success: boolean; 
    data: { added: number; skipped: number; errors: string[] }; 
    message?: string 
  }> => {
    return await apiClient.post(`/campaigns/${id}/leads`, { leadIds });
  },

  removeLeads: async (id: string, leadIds: string[]): Promise<{ 
    success: boolean; 
    data: { removedCount: number }; 
    message?: string 
  }> => {
    return await apiClient.post(`/campaigns/${id}/leads/remove`, { leadIds });
  },

  // Template management
  getTemplate: async (id: string): Promise<{ 
    success: boolean; 
    data: { template: CampaignTemplate | null }; 
    message?: string 
  }> => {
    return await apiClient.get(`/campaigns/${id}/template`);
  },

  saveTemplate: async (id: string, data: CampaignTemplateData): Promise<{ 
    success: boolean; 
    data: { template: CampaignTemplate }; 
    message?: string 
  }> => {
    return await apiClient.post(`/campaigns/${id}/template`, data);
  },

  deleteTemplate: async (id: string): Promise<{ 
    success: boolean; 
    data: { deletedCount: number }; 
    message?: string 
  }> => {
    return await apiClient.delete(`/campaigns/${id}/template`);
  },

  previewTemplate: async (id: string, data: {
    subject: string;
    bodyHtml?: string;
    bodyText?: string;
    sampleData?: Record<string, any>;
  }): Promise<{ 
    success: boolean; 
    data: { 
      preview: {
        subject: string;
        bodyHtml?: string;
        bodyText?: string;
        sampleData: Record<string, any>;
      }
    }; 
    message?: string 
  }> => {
    return await apiClient.post(`/campaigns/${id}/template/preview`, data);
  },

  getPersonalizationVariables: async (id: string): Promise<{ 
    success: boolean; 
    data: { 
      variables: {
        standard: PersonalizationVariable[];
        custom: PersonalizationVariable[];
      }
    }; 
    message?: string 
  }> => {
    return await apiClient.get(`/campaigns/${id}/template/variables`);
  },

  // Analytics
  getAnalytics: async (id: string): Promise<{ 
    success: boolean; 
    data: CampaignAnalytics; 
    message?: string 
  }> => {
    return await apiClient.get(`/campaigns/${id}/analytics`);
  },
};

// Utility functions
export const campaignUtils = {
  getStatusColor: (status: Campaign['status']): string => {
    switch (status) {
      case 'draft': return 'text-gray-500 bg-gray-100';
      case 'active': return 'text-green-700 bg-green-100';
      case 'paused': return 'text-yellow-700 bg-yellow-100';
      case 'completed': return 'text-blue-700 bg-blue-100';
      case 'archived': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  },

  getStatusIcon: (status: Campaign['status']): string => {
    switch (status) {
      case 'draft': return '📝';
      case 'active': return '🚀';
      case 'paused': return '⏸️';
      case 'completed': return '✅';
      case 'archived': return '📦';
      default: return '❓';
    }
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateTime: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  calculateEngagementRate: (campaign: Campaign): number => {
    if (campaign.emails_sent === 0) return 0;
    return Math.round(((campaign.emails_opened + campaign.emails_clicked + campaign.emails_replied) / campaign.emails_sent) * 100);
  },

  getPerformanceGrade: (openRate: number, clickRate: number): { grade: string; color: string } => {
    const avgRate = (openRate + clickRate) / 2;
    if (avgRate >= 25) return { grade: 'A', color: 'text-green-600' };
    if (avgRate >= 20) return { grade: 'B', color: 'text-blue-600' };
    if (avgRate >= 15) return { grade: 'C', color: 'text-yellow-600' };
    if (avgRate >= 10) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  },
};

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  AcademicCapIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SearchFilters {
  // Basic Info
  name?: string;
  job_title?: string[];
  exclude_job_titles?: string[];
  current_titles_only?: boolean;
  include_related_job_titles?: boolean;
  
  // Company & Experience  
  company?: string[];
  exclude_companies?: string[];
  company_filter?: 'current' | 'past' | 'both';
  current_company_only?: boolean;
  match_experience?: 'current' | 'past' | 'both';
  domain?: string[];
  years_of_experience?: string[];
  years_in_current_role?: string[];
  
  // Location & Industry
  location?: string[];
  industry?: string[];
  company_size?: string[];
  
  // Education & Skills
  education?: string[];
  skills?: string[];
  
  // Search & Contact
  keyword?: string;
  data_types?: string[];
  reveal_info?: boolean;
  
  // Page
  page?: number;
  
  // No validation or quality verification needed
}

interface SearchResult {
  success: boolean;
  data: {
    metadata: {
      total_results: number;
      page: number;
      page_size: number;
      total_pages: number;
    };
    filters_applied: any;
    profiles: any[];
    quality_verification: {
      enabled: boolean;
      distribution?: {
        high_quality: number;
        medium_quality: number;
        low_quality: number;
        cost_recommended: number;
        verified_emails: number;
      };
      credits_used: number;
      estimated_savings?: string;
    };
    credits_used: number;
  };
}

const companySizeOptions = [
  { value: '1_10', label: '1-10 employees' },
  { value: '11_50', label: '11-50 employees' },
  { value: '51_200', label: '51-200 employees' },
  { value: '201_500', label: '201-500 employees' },
  { value: '501_1000', label: '501-1,000 employees' },
  { value: '1001_5000', label: '1,001-5,000 employees' },
  { value: '5001_10000', label: '5,000+ employees' }
];

const experienceOptions = [
  { value: '0_1', label: 'Less than 1 year' },
  { value: '1_2', label: '1-2 years' },
  { value: '3_5', label: '3-5 years' },
  { value: '6_10', label: '6-10 years' },
  { value: '10', label: 'More than 10 years' }
];

const dataTypeOptions = [
  { value: 'personal_email', label: 'Personal Email' },
  { value: 'work_email', label: 'Work Email' },
  { value: 'phone', label: 'Phone Number' }
];

export default function AdvancedPeopleSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    current_titles_only: true,
    company_filter: 'current' as const,
    current_company_only: true,
    reveal_info: false,
    // No validation or quality checks - just show all data
    // Note: match_experience removed from defaults to avoid conflicts
    // It can be set manually but will override other parameters
  });

  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<number>>(new Set());
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
 
  // Column visibility state - default to basic info only
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    title: true,
    company: true,
    location: true,
    personal_email: false,
    work_email: false,
    phone: false,
    industry: false,
    experience: false,
    education: false,
    skills: false,
    company_size: false,
    linkedin: false,
    github: false,
    summary: false,
    actions: true
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // FindyMail integration state
  const [findingEmails, setFindingEmails] = useState<{[key: number]: boolean}>({});
  const [foundEmails, setFoundEmails] = useState<{[key: number]: string}>({});
  
  // Export functionality
  const [isExporting, setIsExporting] = useState(false);
  
  // Save as list functionality
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // UI State
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    basic: true,
    company: false,
    location: false,
    education: false,
    advanced: false
  });

  // Array field states for multi-value inputs
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [educationInput, setEducationInput] = useState('');

  // Sidebar state for dynamic positioning
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for sidebar hover/expansion and implement specific scrolling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const sidebar = document.getElementById('modern-sidebar');
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const isHoveringSidebar = e.clientX <= sidebarRect.right + 10;
        setSidebarExpanded(isHoveringSidebar || sidebarRect.width > 100);
      }
    };

    // Handle mouse movement for section-specific scrolling
    const handleMouseMoveForScrolling = (e: MouseEvent) => {
      const filtersPanel = document.getElementById('search-filters-scroll');
      const resultsPanel = document.getElementById('search-results-scroll');
      
      if (filtersPanel && resultsPanel) {
        const filtersPanelParent = filtersPanel.parentElement;
        const resultsPanelParent = resultsPanel.parentElement;
        
        if (filtersPanelParent && resultsPanelParent) {
          const filtersPanelRect = filtersPanelParent.getBoundingClientRect();
          const resultsPanelRect = resultsPanelParent.getBoundingClientRect();
          
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          
          // Check if mouse is over filters panel
          const isOverFilters = mouseX >= filtersPanelRect.left && 
                               mouseX <= filtersPanelRect.right && 
                               mouseY >= filtersPanelRect.top && 
                               mouseY <= filtersPanelRect.bottom;
          
          // Check if mouse is over results panel
          const isOverResults = mouseX >= resultsPanelRect.left && 
                               mouseX <= resultsPanelRect.right && 
                               mouseY >= resultsPanelRect.top && 
                               mouseY <= resultsPanelRect.bottom;
          
          // Set data attributes for CSS to handle scrolling
          if (isOverFilters) {
            document.body.setAttribute('data-scroll-section', 'filters');
          } else if (isOverResults) {
            document.body.setAttribute('data-scroll-section', 'results');
          } else {
            document.body.removeAttribute('data-scroll-section');
          }
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousemove', handleMouseMoveForScrolling);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleMouseMoveForScrolling);
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addToArrayField = (field: keyof SearchFilters, value: string) => {
    if (!value.trim()) return;
    
    setFilters(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[] || []), value.trim()]
    }));

    // Clear input
    switch (field) {
      case 'job_title': setJobTitleInput(''); break;
      case 'company': setCompanyInput(''); break;
      case 'location': setLocationInput(''); break;
      case 'industry': setIndustryInput(''); break;
      case 'skills': setSkillsInput(''); break;
      case 'education': setEducationInput(''); break;
    }
  };

  const removeFromArrayField = (field: keyof SearchFilters, index: number) => {
    setFilters(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSearch = async () => {
    if (Object.keys(filters).length === 0) {
      setError('Please add at least one search filter');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Remove empty arrays and null values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== null && value !== undefined && value !== '';
        })
      );

      const leadGenApiUrl = process.env.NEXT_PUBLIC_LEAD_GENERATION_API_URL || 'http://localhost:5001';
      const response = await fetch(`${leadGenApiUrl}/api/advanced-people-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanFilters)
      });

      const data: SearchResult = await response.json();

      if (data.success) {
        setSearchResults(data);
        setError(null);
      } else {
        // Handle rate limit errors specifically
        if ((data as any).rate_limit_hit || response.status === 429) {
          setError(`⏰ Rate Limit Exceeded\n\n${(data as any).error || 'ContactOut API rate limit hit.'}\n\n💡 Tip: ${(data as any).tip || 'Wait 1-2 minutes before searching again.'}`);
        } else {
          setError((data as any).error || 'Advanced search failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Advanced search error:', err);
      setError('Failed to connect to search service. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // FindyMail API integration
  const findEmailFromLinkedIn = async (profileIndex: number, linkedinUrl: string) => {
    setFindingEmails(prev => ({ ...prev, [profileIndex]: true }));
    
    try {
      const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
      
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await fetch(`${backendApiUrl}/api/findymail/find-email-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          lead_id: null // We can add lead_id if we have it
        })
      });

      const result = await response.json();

      if (result.success && result.data?.email) {
        setFoundEmails(prev => ({ 
          ...prev, 
          [profileIndex]: result.data.email 
        }));
        
        // Show success message
        alert(`✅ Email found: ${result.data.email}\n${result.cached ? 'From cache' : 'Via FindyMail API'}\nCredits used: ${result.credits_used}`);
      } else {
        // Handle errors
        let errorMessage = 'Failed to find email';
        if (response.status === 402) {
          errorMessage = '💳 Insufficient FindyMail credits';
        } else if (response.status === 404) {
          errorMessage = '🔍 No email found for this LinkedIn profile';
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('FindyMail API Error:', error);
      alert('❌ Failed to connect to FindyMail service');
    } finally {
      setFindingEmails(prev => ({ ...prev, [profileIndex]: false }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      current_titles_only: true,
      company_filter: 'current' as const,
      current_company_only: true,
      reveal_info: false
      // match_experience removed from reset to avoid conflicts
    });
    setJobTitleInput('');
    setCompanyInput('');
    setLocationInput('');
    setIndustryInput('');
    setSkillsInput('');
    setEducationInput('');
    setSearchResults(null);
    setError(null);
  };

  const loadExample = (exampleName: string) => {
    const examples = {
      tech_executives: {
        job_title: ['CEO', 'CTO', 'VP Engineering', 'Chief Technology Officer'],
        company: ['Microsoft', 'Google', 'Apple', 'Meta', 'Amazon'],
        location: ['San Francisco', 'Seattle', 'New York', 'Austin'],
        skills: ['Leadership', 'Strategy', 'Software Architecture'],
        company_size: ['1001_5000', '5001_10000'],
        years_of_experience: ['6_10', '10'],
        current_titles_only: true,
        company_filter: 'current' as const,
        data_types: ['work_email'],
        // No validation needed,
        sort_by_quality: true
      },
      marketing_professionals: {
        job_title: ['Marketing Manager', 'Director of Marketing', 'CMO', 'VP Marketing'],
        industry: ['Computer Software', 'Internet', 'Marketing & Advertising'],
        skills: ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media'],
        years_of_experience: ['3_5', '6_10'],
        location: ['Remote', 'New York', 'Los Angeles', 'Chicago'],
        company_size: ['201_500', '501_1000', '1001_5000'],
        current_titles_only: true,
        company_filter: 'current' as const,
        // No validation needed
      },
      startup_founders: {
        job_title: ['Founder', 'CEO', 'Co-Founder', 'President'],
        company_size: ['1_10', '11_50', '51_200'],
        education: ['Stanford', 'Harvard', 'MIT', 'Berkeley', 'Y Combinator'],
        keyword: 'startup entrepreneur venture capital',
        location: ['San Francisco', 'New York', 'Austin', 'Boston'],
        years_of_experience: ['3_5', '6_10', '10'],
        current_titles_only: true,
        company_filter: 'current' as const,
        data_types: ['work_email', 'personal_email'],
        // No validation needed,
        sort_by_quality: true
      },
      sales_leaders: {
        job_title: ['VP Sales', 'Sales Director', 'Head of Sales', 'Chief Revenue Officer'],
        skills: ['Sales', 'Business Development', 'Account Management', 'CRM'],
        industry: ['Computer Software', 'Information Technology & Services', 'Financial Services'],
        location: ['New York', 'Chicago', 'Dallas', 'Atlanta'],
        company_size: ['501_1000', '1001_5000', '5001_10000'],
        years_of_experience: ['6_10', '10'],
        current_titles_only: true,
        company_filter: 'current' as const,
        data_types: ['work_email', 'phone'],
        // No validation needed,
        sort_by_quality: true
      },
      ai_ml_engineers: {
        job_title: ['Machine Learning Engineer', 'AI Engineer', 'Data Scientist', 'ML Researcher'],
        skills: ['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning', 'AI'],
        keyword: 'artificial intelligence machine learning AI ML',
        company: ['OpenAI', 'DeepMind', 'Anthropic', 'Tesla', 'NVIDIA'],
        location: ['San Francisco', 'Seattle', 'Boston', 'Remote'],
        years_of_experience: ['3_5', '6_10'],
        education: ['Stanford', 'MIT', 'Carnegie Mellon', 'Berkeley'],
        current_titles_only: true,
        company_filter: 'current' as const,
        // No validation needed
      },
      healthcare_executives: {
        job_title: ['CEO', 'COO', 'VP Operations', 'Medical Director'],
        industry: ['Hospital & Health Care', 'Biotechnology', 'Pharmaceuticals', 'Medical Practice'],
        location: ['Boston', 'San Francisco', 'New York', 'Chicago', 'Philadelphia'],
        company_size: ['201_500', '501_1000', '1001_5000', '5001_10000'],
        years_of_experience: ['6_10', '10'],
        skills: ['Healthcare Management', 'Operations', 'Strategy'],
        current_titles_only: true,
        company_filter: 'current' as const,
        data_types: ['work_email'],
        // No validation needed,
        sort_by_quality: true
      },
      fintech_professionals: {
        job_title: ['Product Manager', 'VP Product', 'Head of Product', 'CPO'],
        industry: ['Financial Services', 'Banking', 'Investment Banking', 'Venture Capital & Private Equity'],
        skills: ['Product Management', 'Fintech', 'Financial Services', 'Strategy'],
        keyword: 'fintech cryptocurrency blockchain payments',
        location: ['New York', 'San Francisco', 'London', 'Singapore'],
        company_size: ['11_50', '51_200', '201_500', '501_1000'],
        years_of_experience: ['3_5', '6_10'],
        current_titles_only: true,
        company_filter: 'current' as const,
        // No validation needed
      },
      remote_developers: {
        job_title: ['Software Engineer', 'Senior Developer', 'Full Stack Developer', 'Backend Engineer'],
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS'],
        location: ['Remote'],
        industry: ['Computer Software', 'Internet', 'Information Technology & Services'],
        years_of_experience: ['3_5', '6_10'],
        company_size: ['11_50', '51_200', '201_500'],
        current_titles_only: true,
        company_filter: 'current' as const,
        data_types: ['work_email', 'personal_email'],
        // No validation needed
      }
    };

    const example = examples[exampleName as keyof typeof examples];
    if (example) {
      // Clear any existing match_experience to avoid conflicts
      const newFilters = { ...filters };
      delete newFilters.match_experience;
      setFilters({ ...newFilters, ...example });
    }
  };

  const renderArrayField = (
    field: keyof SearchFilters,
    label: string,
    input: string,
    setInput: (value: string) => void,
    placeholder: string
  ) => {
    const values = filters[field] as string[] || [];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArrayField(field, input);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => addToArrayField(field, input)}
            disabled={!input.trim()}
          >
            Add
          </Button>
        </div>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors duration-150"
              >
                {value}
                <button
                  onClick={() => removeFromArrayField(field, index)}
                  className="ml-2 text-gray-400 hover:text-blue-500 transition-colors duration-150"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // CSV Export Functions
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportSelectedProfiles = () => {
    if (!searchResults || selectedProfiles.size === 0) {
      alert('Please select profiles to export');
      return;
    }

    setIsExporting(true);

    try {
      const selectedData = Array.from(selectedProfiles).map(index => {
        const profile = searchResults.data.profiles[index];
        
        // Debug: Log the profile structure to console
        console.log('Profile structure for export:', profile);
        
        return {
          Name: profile.full_name || '',
          Title: profile.title || '',
          Company: profile.company?.name || profile.company || '',
          Location: profile.location || '',
          LinkedIn: profile.linkedin_url || '',
          Email: foundEmails[index] || '',
          Source: foundEmails[index] ? 'ContactOut + FindyMail' : 'ContactOut',
          Industry: profile.industry || '',
          CompanySize: profile.company?.size || '',
          Experience: profile.experience && profile.experience.length > 0 
            ? profile.experience[0].title : '',
          Education: profile.education && profile.education.length > 0 
            ? profile.education[0].school_name : '',
          Skills: profile.skills && profile.skills.length > 0 
            ? profile.skills.slice(0, 3).join(', ') : '',
          Summary: profile.summary ? profile.summary.substring(0, 100) + '...' : ''
        };
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `contactout-export-${timestamp}.csv`;
      
      downloadCSV(selectedData, filename);
      
      // Show success message
      alert(`✅ Exported ${selectedData.length} profiles to ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Save as Contact List Functions
  const openSaveModal = () => {
    if (!searchResults || selectedProfiles.size === 0) {
      alert('Please select profiles to save');
      return;
    }
    setShowSaveModal(true);
  };

  const saveAsContactList = async () => {
    if (!listName.trim()) {
      alert('Please enter a list name');
      return;
    }

    setIsSaving(true);

    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        alert('Please login to save contact lists');
        return;
      }

      // Prepare profile data
      const selectedData = Array.from(selectedProfiles).map(index => {
        const profile = searchResults!.data.profiles[index];
        const [firstName, ...lastNameParts] = (profile.full_name || '').split(' ');
        const lastName = lastNameParts.join(' ');
        
        return {
          name: profile.full_name || '',
          firstName: firstName || '',
          lastName: lastName || '',
          title: profile.title || '',
          company: profile.company?.name || profile.company || '',
          location: profile.location || '',
          linkedin_url: profile.linkedin_url || '',
          email: foundEmails[index] || null,
          industry: profile.industry || '',
          source: foundEmails[index] ? 'ContactOut + FindyMail' : 'ContactOut'
        };
      });

      // Filter profiles with emails (only save those with emails)
      const profilesWithEmails = selectedData.filter(profile => profile.email);

      if (profilesWithEmails.length === 0) {
        alert('No profiles with emails found. Please use "Find Email" to get emails before saving.');
        return;
      }

      // Call backend API
      const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendApiUrl}/api/contact-lists/create-from-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listName: listName.trim(),
          description: listDescription.trim() || `ContactOut search results - ${new Date().toLocaleDateString()}`,
          profiles: profilesWithEmails
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Created contact list "${listName}" with ${result.data.importedCount} contacts!`);
        
        // Reset modal
        setShowSaveModal(false);
        setListName('');
        setListDescription('');
        setSelectedProfiles(new Set()); // Clear selection
        
        // Show success details
        setTimeout(() => {
          alert(`📊 List Details:\n- Name: ${listName}\n- Contacts: ${result.data.importedCount}\n- Source: ContactOut + FindyMail\n\nYou can now use this list in email campaigns!`);
        }, 500);
      } else {
        alert(`❌ Error creating list: ${result.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Save list error:', error);
      alert('❌ Failed to save contact list. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Search Filters Panel - Fixed position aligned with sidebar */}
      <div 
        className="fixed bg-white border-r border-gray-200 transition-all duration-200 ease-out z-30"
        style={{ 
          top: '56px', // Below top bar
          left: sidebarExpanded ? '240px' : '64px', // Right of sidebar
          width: '320px',
          height: 'calc(100vh - 56px)' // Full height minus top bar
        }}
      >
        <div className="h-full overflow-y-auto" id="search-filters-scroll">
          <div className="pt-2 px-4 pb-4">
            {/* Clean Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
                <p className="text-xs text-gray-500">Use 15+ filters to find exact prospects</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                Reset
              </Button>
            </div>


              {/* Basic Information */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('basic')}
                  className="w-full text-left py-2 group transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Basic Information</h3>
                    <svg 
                      className={`w-4 h-4 transition-all duration-200 group-hover:text-blue-500 ${
                        expandedSections.basic ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.basic && (
                  <div className="pl-4 space-y-4">
                    <Input
                      label="Name"
                      value={filters.name || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Smith"
                      size="md"
                    />

                    {renderArrayField('job_title', 'Job Titles', jobTitleInput, setJobTitleInput, 'CEO, Software Engineer, etc.')}

                    <Input
                      label="Keywords"
                      value={filters.keyword || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                      placeholder="machine learning, startup, etc."
                      size="md"
                    />
                  </div>
                )}

                {/* Company & Experience */}
                <button
                  onClick={() => toggleSection('company')}
                  className="w-full text-left py-2 group transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Company & Experience</h3>
                    <svg 
                      className={`w-4 h-4 transition-all duration-200 group-hover:text-blue-500 ${
                        expandedSections.company ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.company && (
                  <div className="pl-4 space-y-4">
                    {renderArrayField('company', 'Companies', companyInput, setCompanyInput, 'Microsoft, Google, Apple')}
                    {renderArrayField('industry', 'Industries', industryInput, setIndustryInput, 'Computer Software, Healthcare')}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        onChange={(e) => {
                          if (e.target.value) {
                            setFilters(prev => ({
                              ...prev,
                              company_size: [...(prev.company_size || []), e.target.value]
                            }));
                          }
                        }}
                      >
                        <option value="">Select company size...</option>
                        {companySizeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {filters.company_size && filters.company_size.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {filters.company_size.map((size, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors duration-150"
                            >
                              {companySizeOptions.find(opt => opt.value === size)?.label}
                              <button
                                onClick={() => removeFromArrayField('company_size', index)}
                                className="ml-2 text-gray-400 hover:text-blue-500 transition-colors duration-150"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        onChange={(e) => {
                          if (e.target.value) {
                            setFilters(prev => ({
                              ...prev,
                              years_of_experience: [...(prev.years_of_experience || []), e.target.value]
                            }));
                          }
                        }}
                      >
                        <option value="">Select experience level...</option>
                        {experienceOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {filters.years_of_experience && filters.years_of_experience.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          {filters.years_of_experience.map((exp, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors duration-150"
                            >
                              {experienceOptions.find(opt => opt.value === exp)?.label}
                              <button
                                onClick={() => removeFromArrayField('years_of_experience', index)}
                                className="ml-2 text-gray-400 hover:text-blue-500 transition-colors duration-150"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                <button
                  onClick={() => toggleSection('location')}
                  className="w-full text-left py-2 group transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Location</h3>
                    <svg 
                      className={`w-4 h-4 transition-all duration-200 group-hover:text-blue-500 ${
                        expandedSections.location ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.location && (
                  <div className="pl-4 space-y-4">
                    {renderArrayField('location', 'Locations', locationInput, setLocationInput, 'San Francisco, New York, Remote')}
                  </div>
                )}

                {/* Education & Skills */}
                <button
                  onClick={() => toggleSection('education')}
                  className="w-full text-left py-2 group transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Education & Skills</h3>
                    <svg 
                      className={`w-4 h-4 transition-all duration-200 group-hover:text-blue-500 ${
                        expandedSections.education ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.education && (
                  <div className="pl-4 space-y-4">
                    {renderArrayField('education', 'Education', educationInput, setEducationInput, 'Harvard, Stanford, MBA')}
                    {renderArrayField('skills', 'Skills', skillsInput, setSkillsInput, 'JavaScript, Marketing, Leadership')}
                  </div>
                )}

                {/* Advanced Options */}
                <button
                  onClick={() => toggleSection('advanced')}
                  className="w-full text-left py-2 group transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Advanced Options</h3>
                    <svg 
                      className={`w-4 h-4 transition-all duration-200 group-hover:text-blue-500 ${
                        expandedSections.advanced ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedSections.advanced && (
                  <div className="pl-4 space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.current_titles_only || false}
                          onChange={(e) => setFilters(prev => ({ ...prev, current_titles_only: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm font-medium text-gray-700">Current Job Titles Only</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Required Contact Data</label>
                      <div className="space-y-2">
                        {dataTypeOptions.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.data_types?.includes(option.value) || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev,
                                    data_types: [...(prev.data_types || []), option.value]
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev,
                                    data_types: (prev.data_types || []).filter(dt => dt !== option.value)
                                  }));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Matching</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={filters.match_experience || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setFilters(prev => ({ ...prev, match_experience: e.target.value as 'current' | 'past' | 'both' }));
                          } else {
                            const newFilters = { ...filters };
                            delete newFilters.match_experience;
                            setFilters(newFilters);
                          }
                        }}
                      >
                        <option value="">Use default experience filters</option>
                        <option value="current">Current experience only</option>
                        <option value="past">Past experience only</option>
                        <option value="both">Current or past experience</option>
                      </select>
                      {filters.match_experience && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-xs text-amber-700">
                            ⚠️ Experience matching will override company filter and current titles settings.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            {/* Search Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                leftIcon={!isLoading ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : undefined}
              >
                {isLoading ? 'Searching professionals...' : 'Search People'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel - Takes remaining space */}
      <div 
        className="flex-1 transition-all duration-200 ease-out"
          style={{
            marginLeft: sidebarExpanded ? '560px' : '384px', // Sidebar width + filters width
            marginTop: '56px', // Below top bar
            height: 'calc(100vh - 56px)' // Full height minus top bar
          }}
        >
          <div className="h-full overflow-y-auto" id="search-results-scroll">
            <div className="pt-2 px-4 pb-4">
            {error && (
              <Card className="mb-4">
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">
                      <h3 className="font-medium">Search Error</h3>
                      <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {searchResults && (
              <>
                {/* Search Summary */}
                {/* Compact Results Toolbar */}
                <div className="bg-white border-b border-gray-200 py-2 mb-3">
                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedProfiles.size === searchResults.data.profiles.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProfiles(new Set(searchResults.data.profiles.map((_, index) => index)));
                            } else {
                              setSelectedProfiles(new Set());
                            }
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {selectedProfiles.size > 0 ? `${selectedProfiles.size} selected` : 'Select all'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 font-medium">
                        {searchResults.data.metadata.total_results.toLocaleString()} profiles found
                      </div>
                      
                      {/* Action buttons when items are selected */}
                      {selectedProfiles.size > 0 && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={exportSelectedProfiles}
                            disabled={isExporting}
                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center space-x-1"
                          >
                            {isExporting ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                <span>Exporting...</span>
                              </>
                            ) : (
                              <>
                                <span>📤</span>
                                <span>Export {selectedProfiles.size}</span>
                              </>
                            )}
                          </button>
                          <button 
                            onClick={openSaveModal}
                            className="text-sm text-gray-700 hover:text-green-600 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-green-400 bg-white hover:bg-green-50"
                          >
                            💾 Save as List
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <select 
                          className="text-sm border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={resultsPerPage}
                          onChange={(e) => setResultsPerPage(Number(e.target.value))}
                        >
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                      
                      {/* View Toggle */}
                      <div className="flex items-center space-x-1 border border-gray-300 rounded p-1">
                        <button
                          className={`p-1 rounded transition-colors ${
                            viewMode === 'card' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setViewMode('card')}
                          title="Card View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </button>
                        <button
                          className={`p-1 rounded transition-colors ${
                            viewMode === 'table' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setViewMode('table')}
                          title="Table View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Column Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowColumnSelector(!showColumnSelector)}
                          className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                          <span>Columns</span>
                        </button>
                        
                        {showColumnSelector && (
                          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                            <div className="text-sm font-medium mb-3">Select Columns</div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {Object.entries({
                                name: 'Name',
                                title: 'Title', 
                                company: 'Company',
                                location: 'Location',
                                personal_email: 'Personal Email',
                                work_email: 'Work Email',
                                phone: 'Phone',
                                industry: 'Industry',
                                experience: 'Experience',
                                education: 'Education',
                                skills: 'Skills',
                                company_size: 'Company Size',
                                linkedin: 'LinkedIn URL',
                                github: 'GitHub',
                                summary: 'Summary',
                                actions: 'Actions'
                              }).map(([key, label]) => (
                                <label key={key} className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={visibleColumns[key as keyof typeof visibleColumns]}
                                    onChange={(e) => setVisibleColumns(prev => ({
                                      ...prev,
                                      [key]: e.target.checked
                                    }))}
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                              <button 
                                onClick={() => setVisibleColumns({
                                 name: true, title: true, company: true, location: true,
                                   personal_email: false, work_email: false, phone: false,
                                   industry: false, experience: false, education: false,
                                   skills: false, company_size: false, linkedin: false,
                                   github: false, summary: false, actions: true
                                })}
                                className="text-xs text-gray-600 hover:text-blue-600"
                              >
                                Reset to Basic
                              </button>
                              <button 
                                onClick={() => setShowColumnSelector(false)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button 
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:text-gray-400 px-2 py-1 rounded hover:bg-gray-50"
                          disabled={searchResults.data.metadata.page <= 1}
                          onClick={() => {
                            // TODO: Handle previous page
                          }}
                        >
                          ← Prev
                        </button>
                        <div className="text-sm text-gray-600 px-2">
                          Page {searchResults.data.metadata.page} of {searchResults.data.metadata.total_pages}
                        </div>
                        <button 
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:text-gray-400 px-2 py-1 rounded hover:bg-gray-50"
                          disabled={searchResults.data.metadata.page >= searchResults.data.metadata.total_pages}
                          onClick={() => {
                            // TODO: Handle next page
                          }}
                        >
                          Next →
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Credits: {searchResults.data.credits_used}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedProfiles.size === searchResults.data.profiles.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProfiles(new Set(searchResults.data.profiles.map((_, index) => index)));
                            } else {
                              setSelectedProfiles(new Set());
                            }
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {selectedProfiles.size > 0 ? `${selectedProfiles.size} selected` : 'Select all'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 font-medium">
                        {searchResults.data.metadata.total_results.toLocaleString()} found
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Show:</span>
                          <select 
                            className="text-sm border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={resultsPerPage}
                            onChange={(e) => setResultsPerPage(Number(e.target.value))}
                          >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </div>
                        
                        {/* Mobile View Toggle */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 border border-gray-300 rounded p-1">
                            <button
                              className={`p-1 rounded transition-colors ${
                                viewMode === 'card' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                              onClick={() => setViewMode('card')}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </button>
                            <button
                              className={`p-1 rounded transition-colors ${
                                viewMode === 'table' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                              onClick={() => setViewMode('table')}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Mobile Column Selector */}
                          <div className="relative">
                            <button
                              onClick={() => setShowColumnSelector(!showColumnSelector)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                              </svg>
                              <span>Cols</span>
                            </button>
                            
                            {showColumnSelector && (
                              <div className="absolute top-full right-0 mt-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3">
                                <div className="text-xs font-medium mb-2">Select Columns</div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                  {Object.entries({
                                    name: 'Name',
                                    title: 'Title', 
                                    company: 'Company',
                                    location: 'Location',
                                    personal_email: 'Personal Email',
                                    work_email: 'Work Email',
                                    phone: 'Phone',
                                    industry: 'Industry',
                                    experience: 'Experience',
                                    education: 'Education',
                                    skills: 'Skills',
                                    company_size: 'Company Size',
                                    linkedin: 'LinkedIn URL',
                                    github: 'GitHub',
                                    summary: 'Summary',
                                    actions: 'Actions'
                                  }).map(([key, label]) => (
                                    <label key={key} className="flex items-center space-x-2 text-xs">
                                      <input
                                        type="checkbox"
                                        className="w-3 h-3"
                                        checked={visibleColumns[key as keyof typeof visibleColumns]}
                                        onChange={(e) => setVisibleColumns(prev => ({
                                          ...prev,
                                          [key]: e.target.checked
                                        }))}
                                      />
                                      <span>{label}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                                  <button 
                                    onClick={() => setVisibleColumns({
                                 name: true, title: true, company: true, location: true,
                                   personal_email: false, work_email: false, phone: false,
                                   industry: false, experience: false, education: false,
                                   skills: false, company_size: false, linkedin: false,
                                   github: false, summary: false, actions: true
                                    })}
                                    className="text-xs text-gray-600 hover:text-blue-600"
                                  >
                                    Reset
                                  </button>
                                  <button 
                                    onClick={() => setShowColumnSelector(false)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Credits: {searchResults.data.credits_used}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:text-gray-400 px-2 py-1"
                          disabled={searchResults.data.metadata.page <= 1}
                          onClick={() => {
                            // TODO: Handle previous page
                          }}
                        >
                          ← Prev
                        </button>
                        <div className="text-sm text-gray-600">
                          Page {searchResults.data.metadata.page} of {searchResults.data.metadata.total_pages}
                        </div>
                        <button 
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:text-gray-400 px-2 py-1"
                          disabled={searchResults.data.metadata.page >= searchResults.data.metadata.total_pages}
                          onClick={() => {
                            // TODO: Handle next page
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                    
                    {/* Mobile Action buttons when items are selected */}
                    {selectedProfiles.size > 0 && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={exportSelectedProfiles}
                          disabled={isExporting}
                          className="text-sm text-gray-700 hover:text-blue-600 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center space-x-1"
                        >
                          {isExporting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              <span>Exporting...</span>
                            </>
                          ) : (
                            <>
                              <span>📤</span>
                              <span>Export</span>
                            </>
                          )}
                        </button>
                        <button 
                          onClick={openSaveModal}
                          className="text-sm text-gray-700 hover:text-green-600 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-green-400 bg-white hover:bg-green-50"
                        >
                          💾 Save as List
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Results */}
                {viewMode === 'card' ? (
                  <div className="space-y-3">
                    {searchResults.data.profiles.map((profile, index) => (
                    <Card key={index} className="hover:shadow-sm transition-all duration-200 border border-gray-200">
                      <div className="p-5">
                        {/* Two-Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          
                          {/* Left Column - Profile Details (3/4 width) */}
                          <div className="lg:col-span-3 space-y-4">
                            
                            {/* Selection Checkbox */}
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                checked={selectedProfiles.has(index)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedProfiles);
                                  if (e.target.checked) {
                                    newSelected.add(index);
                                  } else {
                                    newSelected.delete(index);
                                  }
                                  setSelectedProfiles(newSelected);
                                }}
                              />
                              <div className="flex-1 space-y-3">
                            
                            {/* Header Section */}
                            <div className="flex items-start gap-4">
                              {/* Profile Picture */}
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {profile.profile_picture_url ? (
                                  <img
                                    src={profile.profile_picture_url}
                                    alt={profile.full_name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserGroupIcon className="w-6 h-6 text-gray-400" />
                                )}
                              </div>

                              {/* Name & Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {profile.full_name}
                                  </h3>
                                  {profile.linkedin_url && (
                                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                                       className="text-gray-400 hover:text-blue-600 transition-colors">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>

                                {profile.location && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {profile.location}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Experience */}
                            <div className="space-y-2">
                              {profile.title && (
                                <div>
                                  <span className="font-semibold text-gray-900">{profile.title}</span>
                                  {profile.company && (
                                    <>
                                      <span className="text-gray-500"> at </span>
                                      <span className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer font-medium">
                                        {profile.company.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}

                              {profile.headline && (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {profile.headline}
                                </p>
                              )}
                              </div>
                            </div>
                              </div>
                          </div>

                          {/* Right Column - Contact Info (1/4 width) */}
                          <div className="lg:col-span-1">
                            <div className="space-y-3 lg:pl-4 lg:border-l lg:border-gray-100">
                              {/* Contact display removed - use Find Email button below */}
                              <div>
                                  {/* Find Email Button */}
                                  {profile.linkedin_url && (
                                    <div className="pt-2 border-t border-gray-100">
                                      {foundEmails[index] ? (
                                        <div className="space-y-1">
                                          <div className="text-sm text-green-600 font-medium">
                                            ✅ {foundEmails[index]}
                                          </div>
                                          <div className="text-xs text-gray-500">Found via FindyMail</div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => findEmailFromLinkedIn(index, profile.linkedin_url)}
                                          disabled={findingEmails[index]}
                                          className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                        >
                                          {findingEmails[index] ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                              <span>Finding...</span>
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                              </svg>
                                              <span>Find Email</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Contact info section removed */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  </div>
                ) : (
                  /* Spreadsheet View */
                  <div className="bg-white border border-gray-400 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{borderCollapse: 'collapse'}}>
                        {/* Table Header */}
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium w-8">
                              <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={selectedProfiles.size === searchResults.data.profiles.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProfiles(new Set(searchResults.data.profiles.map((_, index) => index)));
                                  } else {
                                    setSelectedProfiles(new Set());
                                  }
                                }}
                              />
                            </th>
                            {visibleColumns.name && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '150px'}}>
                                Name
                              </th>
                            )}
                            {visibleColumns.title && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '180px'}}>
                                Title
                              </th>
                            )}
                            {visibleColumns.company && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '150px'}}>
                                Company
                              </th>
                            )}
                            {visibleColumns.location && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '160px'}}>
                                Location
                              </th>
                            )}
                            {/* Personal Email header removed */}
                            {/* Work Email header removed */}
                            {/* Phone header removed */}
                            {visibleColumns.industry && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '130px'}}>
                                Industry
                              </th>
                            )}
                            {visibleColumns.experience && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '150px'}}>
                                Experience
                              </th>
                            )}
                            {visibleColumns.education && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '140px'}}>
                                Education
                              </th>
                            )}
                            {visibleColumns.skills && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '120px'}}>
                                Skills
                              </th>
                            )}
                            {visibleColumns.company_size && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '110px'}}>
                                Company Size
                              </th>
                            )}
                            {visibleColumns.linkedin && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '200px'}}>
                                LinkedIn URL
                              </th>
                            )}
                            {visibleColumns.github && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '80px'}}>
                                GitHub
                              </th>
                            )}
                            {visibleColumns.summary && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '200px'}}>
                                Summary
                              </th>
                            )}
                            {visibleColumns.actions && (
                              <th className="border border-gray-400 px-2 py-2 text-left text-sm font-medium" style={{width: '80px'}}>
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        
                        {/* Table Body */}
                        <tbody>
                          {searchResults.data.profiles.map((profile, index) => (
                            <tr key={index} className="even:bg-gray-50">
                              {/* Checkbox */}
                              <td className="border border-gray-400 px-2 py-2">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4"
                                  checked={selectedProfiles.has(index)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedProfiles);
                                    if (e.target.checked) {
                                      newSelected.add(index);
                                    } else {
                                      newSelected.delete(index);
                                    }
                                    setSelectedProfiles(newSelected);
                                  }}
                                />
                              </td>
                              
                              {/* Name */}
                              {visibleColumns.name && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.full_name}
                                </td>
                              )}
                              
                              {/* Title */}
                              {visibleColumns.title && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.title || '-'}
                                </td>
                              )}
                              
                              {/* Company */}
                              {visibleColumns.company && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.company?.name || '-'}
                                </td>
                              )}
                              
                              {/* Location */}
                              {visibleColumns.location && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.location || '-'}
                                </td>
                              )}
                              
                              {/* Personal Email column removed */}
                              
                              {/* Work Email column removed */}
                              
                              {/* Phone column removed */}
                              
                              {/* Industry */}
                              {visibleColumns.industry && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.industry || '-'}
                                </td>
                              )}
                              
                              {/* Experience */}
                              {visibleColumns.experience && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.experience && profile.experience.length > 0 ? profile.experience[0].title : '-'}
                                </td>
                              )}
                              
                              {/* Education */}
                              {visibleColumns.education && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.education && profile.education.length > 0 ? profile.education[0].school_name : '-'}
                                </td>
                              )}
                              
                              {/* Skills */}
                              {visibleColumns.skills && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.skills && profile.skills.length > 0 ? profile.skills.slice(0, 2).join(', ') + (profile.skills.length > 2 ? ` +${profile.skills.length - 2}` : '') : '-'}
                                </td>
                              )}
                              
                              {/* Company Size */}
                              {visibleColumns.company_size && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.company?.size || '-'}
                                </td>
                              )}
                              
                              {/* LinkedIn */}
                              {visibleColumns.linkedin && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.linkedin_url ? (
                                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" title={profile.linkedin_url}>
                                      {profile.linkedin_url}
                                    </a>
                                  ) : '-'}
                                </td>
                              )}
                              
                              {/* GitHub */}
                              {visibleColumns.github && (
                                <td className="border border-gray-400 px-2 py-2 text-sm text-center whitespace-nowrap">
                                  {profile.github && profile.github.length > 0 ? (
                                    <a href={`https://github.com/${profile.github[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                      ✓
                                    </a>
                                  ) : '-'}
                                </td>
                              )}
                              
                              {/* Summary */}
                              {visibleColumns.summary && (
                                <td className="border border-gray-400 px-2 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {profile.summary ? profile.summary.substring(0, 100) + (profile.summary.length > 100 ? '...' : '') : '-'}
                                </td>
                              )}
                              
                              {/* Actions */}
                              {visibleColumns.actions && (
                                <td className="border border-gray-400 px-2 py-2 text-sm text-center whitespace-nowrap">
                                  <div className="flex flex-col space-y-1">
                                    {/* Find Email Button */}
                                    {profile.linkedin_url && (
                                      <div>
                                        {foundEmails[index] ? (
                                          <div className="text-xs text-green-600 font-medium">
                                            ✅ Found
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => findEmailFromLinkedIn(index, profile.linkedin_url)}
                                            disabled={findingEmails[index]}
                                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                                          >
                                            {findingEmails[index] ? (
                                              <div className="flex items-center space-x-1">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                <span>Finding</span>
                                              </div>
                                            ) : (
                                              'Find Email'
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* View Contact Info Button */}
                                    {(profile.contact_availability?.personal_email || profile.contact_availability?.work_email || profile.contact_availability?.phone) && (
                                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                                        View
                                      </button>
                                    )}
                                    
                                    {/* Default dash when no actions available */}
                                    {!profile.linkedin_url && !(profile.contact_availability?.personal_email || profile.contact_availability?.work_email || profile.contact_availability?.phone) && (
                                      <span>-</span>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!searchResults && !error && (
              <Card>
                <div className="p-12 text-center">
                  <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Search
                  </h3>
                  <p className="text-gray-600">
                    Configure your filters and click "Search People" to find exactly the right prospects using ContactOut's powerful search engine.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Save as Contact List Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Save as Contact List</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* List Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g., Sri Lanka CEOs, Tech Leaders, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Brief description of this contact list..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Selection Summary */}
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Selected Profiles:</span>
                    <span className="font-medium">{selectedProfiles.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With Emails:</span>
                    <span className="font-medium text-green-600">
                      {Array.from(selectedProfiles).filter(index => foundEmails[index]).length}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  💡 Only profiles with emails will be saved to the list
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAsContactList}
                  disabled={isSaving || !listName.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save List</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

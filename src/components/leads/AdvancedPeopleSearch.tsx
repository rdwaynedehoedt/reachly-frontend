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
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArrayField(field, input);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addToArrayField(field, input)}
            disabled={!input.trim()}
          >
            Add
          </Button>
        </div>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-md border border-slate-200 hover:bg-slate-200 transition-colors duration-150"
              >
                {value}
                <button
                  onClick={() => removeFromArrayField(field, index)}
                  className="ml-2 text-slate-500 hover:text-slate-700 transition-colors duration-150"
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-slate-100 rounded-lg">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Advanced People Search
            </h1>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Use ContactOut's powerful filtering system with 15+ professional filters
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Search Filters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </Button>
              </div>


              {/* Basic Information */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('basic')}
                  className="w-full flex items-center justify-between py-3 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Basic Information
                  </h3>
                  {expandedSections.basic ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {expandedSections.basic && (
                  <div className="space-y-4 pl-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <Input
                        value={filters.name || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Smith"
                      />
                    </div>

                    {renderArrayField('job_title', 'Job Titles', jobTitleInput, setJobTitleInput, 'CEO, Software Engineer, etc.')}

                    <div>
                      <label className="text-sm font-medium text-gray-700">Keyword</label>
                      <Input
                        value={filters.keyword || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                        placeholder="machine learning, startup, etc."
                      />
                    </div>
                  </div>
                )}

                {/* Company & Experience */}
                <button
                  onClick={() => toggleSection('company')}
                  className="w-full flex items-center justify-between py-3 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Company & Experience
                  </h3>
                  {expandedSections.company ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {expandedSections.company && (
                  <div className="space-y-4 pl-4">
                    {renderArrayField('company', 'Companies', companyInput, setCompanyInput, 'Microsoft, Google, Apple')}
                    {renderArrayField('industry', 'Industries', industryInput, setIndustryInput, 'Computer Software, Healthcare')}

                    <div>
                      <label className="text-sm font-medium text-gray-700">Company Size</label>
                      <select
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="flex flex-wrap gap-2 mt-2">
                          {filters.company_size.map((size, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {companySizeOptions.find(opt => opt.value === size)?.label}
                              <button
                                onClick={() => removeFromArrayField('company_size', index)}
                                className="ml-1 text-green-600 hover:text-green-800"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                      <select
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="flex flex-wrap gap-2 mt-2">
                          {filters.years_of_experience.map((exp, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                            >
                              {experienceOptions.find(opt => opt.value === exp)?.label}
                              <button
                                onClick={() => removeFromArrayField('years_of_experience', index)}
                                className="ml-1 text-purple-600 hover:text-purple-800"
                              >
                                <XMarkIcon className="w-3 h-3" />
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
                  className="w-full flex items-center justify-between py-3 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Location
                  </h3>
                  {expandedSections.location ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {expandedSections.location && (
                  <div className="space-y-4 pl-4">
                    {renderArrayField('location', 'Locations', locationInput, setLocationInput, 'San Francisco, New York, Remote')}
                  </div>
                )}

                {/* Education & Skills */}
                <button
                  onClick={() => toggleSection('education')}
                  className="w-full flex items-center justify-between py-3 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    Education & Skills
                  </h3>
                  {expandedSections.education ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {expandedSections.education && (
                  <div className="space-y-4 pl-4">
                    {renderArrayField('education', 'Education', educationInput, setEducationInput, 'Harvard, Stanford, MBA')}
                    {renderArrayField('skills', 'Skills', skillsInput, setSkillsInput, 'JavaScript, Marketing, Leadership')}
                  </div>
                )}

                {/* Advanced Options */}
                <button
                  onClick={() => toggleSection('advanced')}
                  className="w-full flex items-center justify-between py-3 px-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3 shadow-sm border border-gray-200">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Advanced Options
                  </h3>
                  {expandedSections.advanced ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {expandedSections.advanced && (
                  <div className="space-y-4 pl-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        All lead generation data is now displayed without validation checks for faster results.
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.current_titles_only || false}
                          onChange={(e) => setFilters(prev => ({ ...prev, current_titles_only: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Current Job Titles Only</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Required Contact Data</label>
                      <div className="space-y-2 mt-2">
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
                              className="mr-2"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience Matching</label>
                      <select
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                          ⚠️ Note: Using experience matching will override company filter and current titles settings.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 py-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching professionals...
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search People
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                      </svg>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {error && (
            <Card className="mb-6">
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
              <Card className="mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Search Results
                    </h2>
                    <div className="text-sm text-gray-600">
                      {searchResults.data.metadata.total_results.toLocaleString()} profiles found
                    </div>
                  </div>

                  {searchResults.data.quality_verification.enabled && searchResults.data.quality_verification.distribution && (
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {searchResults.data.quality_verification.distribution.high_quality}
                        </div>
                        <div className="text-sm text-green-700">High Quality</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <div className="text-2xl font-bold text-yellow-600">
                          {searchResults.data.quality_verification.distribution.medium_quality}
                        </div>
                        <div className="text-sm text-yellow-700">Medium Quality</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <div className="text-2xl font-bold text-red-600">
                          {searchResults.data.quality_verification.distribution.low_quality}
                        </div>
                        <div className="text-sm text-red-700">Low Quality</div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    Page {searchResults.data.metadata.page} of {searchResults.data.metadata.total_pages} • 
                    Credits Used: {searchResults.data.credits_used} • 
                    {searchResults.data.quality_verification.estimated_savings && (
                      <span className="text-green-600 font-medium">
                        {searchResults.data.quality_verification.estimated_savings}
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              {/* Profile Results */}
              <div className="space-y-4">
                {searchResults.data.profiles.map((profile, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {profile.profile_picture_url ? (
                            <img
                              src={profile.profile_picture_url}
                              alt={profile.full_name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <UserGroupIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {profile.full_name}
                              </h3>
                              <p className="text-blue-600 font-medium">
                                {profile.title}
                              </p>
                              {profile.headline && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {profile.headline}
                                </p>
                              )}
                            </div>
                            
                            {/* Quality scores removed for faster performance */}
                          </div>

                          <div className="mt-3 space-y-2">
                            {profile.company && (
                              <div className="flex items-center text-sm text-gray-600">
                                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                                {profile.company.name}
                              </div>
                            )}
                            {profile.location && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPinIcon className="w-4 h-4 mr-2" />
                                {profile.location}
                              </div>
                            )}
                          </div>

                          {profile.contact_availability && (
                            <div className="mt-3 flex gap-4 text-xs">
                              <span className={profile.contact_availability.personal_email ? 'text-green-600' : 'text-gray-400'}>
                                📧 Personal Email: {profile.contact_availability.personal_email ? '✓' : '✗'}
                              </span>
                              <span className={profile.contact_availability.work_email ? 'text-green-600' : 'text-gray-400'}>
                                💼 Work Email: {profile.contact_availability.work_email ? '✓' : '✗'}
                                {profile.contact_availability.work_email_status === 'Verified' && (
                                  <span className="text-green-700 font-medium"> ✓ Verified</span>
                                )}
                              </span>
                              <span className={profile.contact_availability.phone ? 'text-green-600' : 'text-gray-400'}>
                                📱 Phone: {profile.contact_availability.phone ? '✓' : '✗'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
  );
}

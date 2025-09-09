'use client';

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Employee {
  name: string;
  job_title: string;
  headline: string;
  linkedin_url: string;
  location: string;
  company: {
    name: string;
    domain: string;
    size: number;
    industry: string;
    revenue: string;
  };
  contact_availability: {
    personal_email: boolean;
    work_email: boolean;
    work_email_verified: boolean;
    phone: boolean;
  };
  quality_score: {
    overall_score: number;
    confidence_level: 'high' | 'medium' | 'low';
    completeness: number;
    contact_score: number;
    company_verification: number;
    freshness: number;
    flags: string[];
    cost_recommended: boolean;
  };
  profile_picture: string;
  verified_at: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    company_name: string;
    total_employees_found: number;
    employees_returned: number;
    employees: Employee[];
    quality_distribution: {
      high_quality: number;
      medium_quality: number;
      low_quality: number;
      cost_recommended: number;
      verified_emails: number;
    };
    credits_used: number;
    estimated_savings: string;
    cost_recommended_count: number;
    verification_method: string;
    verified_at: string;
  };
}

export default function CompanyEmployeeSearch() {
  const [companyName, setCompanyName] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get quality color and icon
  const getQualityIndicator = (confidence: 'high' | 'medium' | 'low', score: number) => {
    switch (confidence) {
      case 'high':
        return {
          color: 'text-green-600 bg-green-50',
          icon: '🟢',
          text: `High Quality (${score}/100)`,
          description: 'Recommended for contact reveal'
        };
      case 'medium':
        return {
          color: 'text-yellow-600 bg-yellow-50',
          icon: '🟡',
          text: `Medium Quality (${score}/100)`,
          description: 'Consider for targeted outreach'
        };
      case 'low':
        return {
          color: 'text-red-600 bg-red-50',
          icon: '🔴',
          text: `Low Quality (${score}/100)`,
          description: 'Not recommended for credit spend'
        };
    }
  };

  // Helper function to format quality flags
  const formatFlags = (flags: string[]) => {
    const flagDescriptions: { [key: string]: string } = {
      'job_hopper': 'Frequent job changes',
      'consultant': 'Multiple company affiliations',
      'no_profile_picture': 'Incomplete profile',
      'low_quality': 'Overall low quality indicators',
      'no_contact_info': 'No verified contact information'
    };

    return flags.map(flag => flagDescriptions[flag] || flag);
  };

  const handleSearch = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const leadGenApiUrl = process.env.NEXT_PUBLIC_LEAD_GENERATION_API_URL || 'http://localhost:5001';
      const response = await fetch(`${leadGenApiUrl}/api/company-employees?company=${encodeURIComponent(companyName.trim())}`);
      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setEmployees(data.data.employees);
        setSearchResults(data.data);
      } else {
        // Handle rate limit errors specifically
        if ((data as any).rate_limit_hit || response.status === 429) {
          setError(`⏰ Rate Limit Exceeded\n\n${(data as any).error || 'ContactOut API rate limit hit.'}\n\n💡 Tip: ${(data as any).tip || 'Wait 1-2 minutes before searching again.'}\n\n⏱️ Please wait ${(data as any).retry_after || 120} seconds.`);
        } else {
          setError((data as any).error || 'Search failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to connect to search service. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Company Employees
        </h1>
        <p className="text-gray-600">
          Search for employees at any company. Get names, job titles, and LinkedIn profiles instantly.
        </p>
      </div>

      {/* Search Box */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter company name (e.g. Microsoft, Google, Apple)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Search
                </div>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Search Results Summary with Quality Distribution */}
      {searchResults && (
        <div className="mb-6 space-y-4">
          {/* Main Results */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Found {searchResults.employees_returned} employees at {searchResults.company_name}
                </h3>
                <p className="text-sm text-blue-700">
                  Total employees in database: {searchResults.total_employees_found.toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                💰 Credits used: {searchResults.credits_used}
              </div>
            </div>
          </div>

          {/* Quality Distribution */}
          {searchResults.quality_distribution && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Quality Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      🟢 <span className="ml-1">High Quality</span>
                    </span>
                    <span className="text-sm font-medium">{searchResults.quality_distribution.high_quality}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      🟡 <span className="ml-1">Medium Quality</span>
                    </span>
                    <span className="text-sm font-medium">{searchResults.quality_distribution.medium_quality}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      🔴 <span className="ml-1">Low Quality</span>
                    </span>
                    <span className="text-sm font-medium">{searchResults.quality_distribution.low_quality}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Cost Savings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Credits Saved:</span>
                    <span className="font-medium text-green-700">{searchResults.estimated_savings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recommended for Reveal:</span>
                    <span className="font-medium text-green-700">{searchResults.cost_recommended_count} profiles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Verified Emails:</span>
                    <span className="font-medium text-green-700">{searchResults.quality_distribution.verified_emails} found</span>
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    ✨ All verification was FREE using contact checkers!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employee Results */}
      {employees.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Employee Directory
          </h2>
          
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {employees.map((employee, index) => {
              const qualityIndicator = getQualityIndicator(employee.quality_score.confidence_level, employee.quality_score.overall_score);
              const flags = formatFlags(employee.quality_score.flags);
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Quality Score Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${qualityIndicator.color}`}>
                        {qualityIndicator.icon} {qualityIndicator.text}
                      </div>
                      {employee.quality_score.cost_recommended && (
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          💰 Recommended for reveal
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Profile Picture */}
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {employee.profile_picture ? (
                          <img
                            src={employee.profile_picture}
                            alt={employee.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Employee Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {employee.name}
                        </h3>
                        <p className="text-blue-600 font-medium mb-2">
                          {employee.job_title}
                        </p>
                        
                        {employee.headline && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {employee.headline}
                          </p>
                        )}

                        <div className="space-y-2">
                          {/* Company Info */}
                          <div className="flex items-center text-sm text-gray-600">
                            <BuildingOfficeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {employee.company?.name} 
                              {employee.company?.size && (
                                <span className="text-gray-500 ml-2">
                                  ({employee.company.size.toLocaleString()} employees)
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Location */}
                          {employee.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{employee.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Contact Availability */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information (Verified FREE)</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            <span className={employee.contact_availability.personal_email ? 'text-green-600' : 'text-gray-400'}>
                              Personal Email: {employee.contact_availability.personal_email ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            <span className={employee.contact_availability.work_email ? 'text-green-600' : 'text-gray-400'}>
                              Work Email: {employee.contact_availability.work_email ? '✓' : '✗'}
                              {employee.contact_availability.work_email_verified && (
                                <span className="ml-1 text-green-700 font-medium">✓ Verified</span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            <span className={employee.contact_availability.phone ? 'text-green-600' : 'text-gray-400'}>
                              Phone: {employee.contact_availability.phone ? '✓ Available' : '✗ Not found'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quality Score Breakdown */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Quality Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div>Profile Completeness: {employee.quality_score.completeness}/30</div>
                          <div>Contact Score: {employee.quality_score.contact_score}/25</div>
                        </div>
                        <div>
                          <div>Company Verification: {employee.quality_score.company_verification}/25</div>
                          <div>Data Freshness: {employee.quality_score.freshness}/20</div>
                        </div>
                      </div>
                      
                      {/* Quality Flags */}
                      {flags.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Quality Flags:</div>
                          <div className="flex flex-wrap gap-1">
                            {flags.map((flag, i) => (
                              <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                ⚠️ {flag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {employee.linkedin_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(employee.linkedin_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <LinkIcon className="w-4 h-4" />
                          LinkedIn
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled
                      >
                        💾 Save Lead
                      </Button>

                      {employee.quality_score.cost_recommended ? (
                        <Button
                          size="sm"
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          disabled
                        >
                          💰 Reveal Contact (Recommended)
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-gray-500"
                          disabled
                        >
                          💰 Reveal Contact (Not Recommended)
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !employees.length && !error && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to find employees?
          </h3>
          <p className="text-gray-600 mb-6">
            Enter any company name above to discover their key employees and decision makers.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>• Microsoft</span>
            <span>• Google</span>
            <span>• Apple</span>
            <span>• Tesla</span>
          </div>
        </div>
      )}
    </div>
  );
}


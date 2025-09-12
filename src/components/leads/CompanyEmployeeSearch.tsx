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
  job_title?: string;
  headline?: string;
  linkedin_url: string;
  location?: string;
  company?: {
    name?: string;
    domain?: string;
    size?: number;
    industry?: string;
    revenue?: string;
  };
  created_at: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    company_name: string;
    total_results: number;
    employees_returned: number;
    profiles: Employee[];
    statistics: {
      total_employees: number;
      with_titles: number;
      with_locations: number;
    };
    credits_used: number;
    api_endpoint: string;
    timestamp: string;
  };
}

export default function CompanyEmployeeSearch() {
  const [companyName, setCompanyName] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);


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
        setEmployees(data.data.profiles);
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
                  Total employees in database: {searchResults.total_results?.toLocaleString() ?? 'N/A'}
                </p>
              </div>
              <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                💰 Credits used: {searchResults.credits_used}
              </div>
            </div>
          </div>

          {/* Basic Statistics */}
          {searchResults.statistics && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Profile Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{searchResults.statistics.total_employees}</div>
                  <div className="text-sm text-gray-600">Total Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{searchResults.statistics.with_titles}</div>
                  <div className="text-sm text-gray-600">With Job Titles</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{searchResults.statistics.with_locations}</div>
                  <div className="text-sm text-gray-600">With Locations</div>
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
            {employees.map((employee, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Employee Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {employee.name}
                      </h3>
                      {employee.job_title && (
                        <p className="text-blue-600 font-medium mb-2">
                          {employee.job_title}
                        </p>
                      )}
                      
                      {employee.headline && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {employee.headline}
                        </p>
                      )}

                      <div className="space-y-2">
                        {/* Company Info */}
                        {employee.company?.name && (
                          <div className="flex items-center text-sm text-gray-600">
                            <BuildingOfficeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {employee.company.name} 
                              {employee.company.size && (
                                <span className="text-gray-500 ml-2">
                                  ({employee.company.size.toLocaleString()} employees)
                                </span>
                              )}
                            </span>
                          </div>
                        )}

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

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled
                    >
                      💰 Reveal Contact
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
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


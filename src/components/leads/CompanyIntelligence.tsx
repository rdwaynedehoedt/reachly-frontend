'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  ExclamationTriangleIcon as AlertCircle,
  BuildingOfficeIcon as Building,
  GlobeAltIcon as Globe,
  UsersIcon as Users,
  MapPinIcon as MapPin,
  CalendarDaysIcon as Calendar,
  CurrencyDollarIcon as DollarSign,
  BuildingStorefrontIcon as Industry,
  ArrowTopRightOnSquareIcon as ExternalLink,
  MagnifyingGlassIcon as Search,
  ArrowPathIcon as Loader2
} from '@heroicons/react/24/outline';

interface CompanyData {
  name: string;
  domain: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: number;
  country?: string;
  headquarter?: string;
  founded_at?: number;
  revenue?: string | number;
  type?: string;
  logo_url?: string;
  specialties?: string[];
  locations?: string[];
  li_vanity?: string;
}

interface CompanyIntelligenceResponse {
  success: boolean;
  timestamp: string;
  data: {
    company: CompanyData | null;
    credits_used: number;
    source: string;
  };
  error?: string;
}

export default function CompanyIntelligence() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    // Clean domain input
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
    
    setLoading(true);
    setError(null);
    setCompanyData(null);
    setSearchPerformed(false);

    try {
      const response = await fetch(`http://localhost:5001/api/company/${cleanDomain}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: CompanyIntelligenceResponse = await response.json();

      if (result.success && result.data.company) {
        setCompanyData(result.data.company);
      } else if (result.success && !result.data.company) {
        setError('No company information found for this domain');
      } else {
        setError(result.error || 'Failed to fetch company information');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
      setSearchPerformed(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatRevenue = (revenue: string | number | undefined) => {
    if (!revenue) return 'Not specified';
    if (typeof revenue === 'string') return revenue;
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}M`;
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(0)}K`;
    return `$${revenue}`;
  };

  const formatEmployeeCount = (size: number | undefined) => {
    if (!size) return 'Not specified';
    if (size >= 1000) return `${(size / 1000).toFixed(1)}K+ employees`;
    return `${size} employees`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Company Intelligence</h1>
        <p className="text-lg text-gray-600">
          Get comprehensive company information and insights using domain names
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Company Lookup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="domain" className="text-sm font-medium mb-2 block text-gray-700">
                Company Domain
              </label>
              <Input
                id="domain"
                placeholder="e.g., microsoft.com, google.com, contactout.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a company domain name (without https:// or www)
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={loading || !domain.trim()}
                className="w-full sm:w-auto px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Company Information Display */}
      {companyData && (
        <div className="grid gap-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {companyData.logo_url ? (
                    <img
                      src={companyData.logo_url}
                      alt={`${companyData.name} logo`}
                      className="w-12 h-12 object-contain rounded-lg border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{companyData.name}</h2>
                    <p className="text-sm text-gray-500">{companyData.domain}</p>
                  </div>
                </div>
                {companyData.website && (
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  </a>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companyData.description && (
                <p className="text-gray-700 leading-relaxed">{companyData.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Company Details Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Industry & Type */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Industry className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Industry & Type</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {companyData.industry && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {companyData.industry}
                    </span>
                  )}
                  {companyData.type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                      {companyData.type}
                    </span>
                  )}
                  {!companyData.industry && !companyData.type && (
                    <p className="text-gray-500">Not specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Size */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Company Size</h3>
                </div>
                <p className="text-lg font-medium">{formatEmployeeCount(companyData.size)}</p>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold">Revenue</h3>
                </div>
                <p className="text-lg font-medium">{formatRevenue(companyData.revenue)}</p>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold">Location</h3>
                </div>
                <div className="space-y-1">
                  {companyData.headquarter && (
                    <p className="text-sm font-medium">{companyData.headquarter}</p>
                  )}
                  {companyData.country && (
                    <p className="text-sm text-gray-600">{companyData.country}</p>
                  )}
                  {!companyData.headquarter && !companyData.country && (
                    <p className="text-gray-500">Not specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Founded */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Founded</h3>
                </div>
                <p className="text-lg font-medium">
                  {companyData.founded_at ? companyData.founded_at : 'Not specified'}
                </p>
              </CardContent>
            </Card>

            {/* Website */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold">Website</h3>
                </div>
                {companyData.website ? (
                  <a
                    href={companyData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {companyData.website}
                  </a>
                ) : (
                  <p className="text-gray-500">Not available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Specialties */}
          {companyData.specialties && companyData.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {companyData.specialties.map((specialty, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                      {specialty}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Locations */}
          {companyData.locations && companyData.locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {companyData.locations.map((location, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{location}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Results Message */}
      {searchPerformed && !companyData && !error && !loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-3">
              <Building className="w-16 h-16 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-600">No Company Data Found</h3>
              <p className="text-gray-500">
                We couldn't find company information for this domain. Try with a different domain or check the spelling.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">How Company Intelligence Works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter any company domain name to get comprehensive business information</li>
                <li>• Data includes company size, industry, revenue, location, and more</li>
                <li>• Information is sourced from ContactOut's business intelligence database</li>
                <li>• Company lookups are free and don't consume API credits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

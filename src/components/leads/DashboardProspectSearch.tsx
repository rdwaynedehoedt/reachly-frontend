'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import ContactRevealModal from './ContactRevealModal';

interface SearchFilters {
  job_title: string;
  company: string;
  location: string;
  reveal_info: boolean;
}

interface ProspectResult {
  id: string;
  name: string;
  job_title: string;
  company: string;
  location: string;
  linkedin_url: string;
  email_available: boolean;
  phone_available: boolean;
  revealed_email?: string;
  revealed_phone?: string;
}

export default function DashboardProspectSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    job_title: '',
    company: '',
    location: '',
    reveal_info: false,
  });

  const [results, setResults] = useState<ProspectResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectResult | null>(null);
  const [revealType, setRevealType] = useState<'email' | 'phone'>('email');

  const handleSearch = async () => {
    if (!filters.job_title && !filters.company && !filters.location) {
      alert('Please enter at least one search criteria');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/search/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'reachly-demo',
        },
        body: JSON.stringify({
          job_title: filters.job_title ? [filters.job_title] : undefined,
          company: filters.company ? [filters.company] : undefined,
          location: filters.location ? [filters.location] : undefined,
          reveal_info: filters.reveal_info,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Transform the data to match our interface
        const transformedResults = data.data.prospects?.map((prospect: any, index: number) => ({
          id: prospect.id || `prospect-${index}`,
          name: prospect.name || 'N/A',
          job_title: prospect.job_title || 'N/A',
          company: prospect.company || 'N/A',
          location: prospect.location || 'N/A',
          linkedin_url: prospect.linkedin_url || '#',
          email_available: prospect.email_available || false,
          phone_available: prospect.phone_available || false,
          revealed_email: prospect.email,
          revealed_phone: prospect.phone_number,
        })) || [];

        setResults(transformedResults);
        setTotalResults(data.data.total_found || 0);
        setCreditsUsed(data.data.credits_used || 0);
      } else {
        alert(`Search failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealClick = (prospect: ProspectResult, type: 'email' | 'phone') => {
    if (!prospect.linkedin_url || prospect.linkedin_url === '#') {
      alert('LinkedIn URL not available for this prospect');
      return;
    }
    
    setSelectedProspect(prospect);
    setRevealType(type);
    setModalOpen(true);
  };

  const handleRevealConfirm = async () => {
    if (!selectedProspect) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/contacts/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'reachly-demo',
        },
        body: JSON.stringify({
          linkedin_url: selectedProspect.linkedin_url,
          reveal_types: [revealType],
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the prospect with revealed contact info
        setResults(prev => prev.map(p => 
          p.id === selectedProspect.id 
            ? {
                ...p,
                revealed_email: revealType === 'email' ? data.data.contact_info.email : p.revealed_email,
                revealed_phone: revealType === 'phone' ? data.data.contact_info.phone : p.revealed_phone,
              }
            : p
        ));
        
        // Close modal and show success
        setModalOpen(false);
        setSelectedProspect(null);
        
        // Show success message
        alert(`✅ ${revealType === 'email' ? 'Email' : 'Phone'} revealed successfully!`);
      } else {
        alert(`Contact reveal failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Contact reveal error:', error);
      alert('Contact reveal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!isLoading) {
      setModalOpen(false);
      setSelectedProspect(null);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="flex">
        {/* Left Sidebar - Search Filters (within the card) */}
        <div className="w-80 border-r border-gray-200 p-6">
          <div className="space-y-6">
            {/* Search Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Search Criteria</h2>
              <p className="text-sm text-gray-500">
                Enter at least one search parameter to find prospects
              </p>
            </div>

            {/* Search Filters */}
            <div className="space-y-4">
              <Input
                label="Job Title"
                placeholder="e.g. Software Engineer"
                value={filters.job_title}
                onChange={(e) => setFilters(prev => ({ ...prev, job_title: e.target.value }))}
                size="sm"
              />

              <Input
                label="Company"
                placeholder="e.g. Google"
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                size="sm"
              />

              <Input
                label="Location"
                placeholder="e.g. San Francisco"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                size="sm"
              />

              {/* Reveal Option */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.reveal_info}
                    onChange={(e) => setFilters(prev => ({ ...prev, reveal_info: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Reveal contacts immediately
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Costs 1 credit per email/phone revealed
                </p>
              </div>

              {/* Search Button */}
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                onClick={handleSearch}
                disabled={!filters.job_title && !filters.company && !filters.location}
              >
                🔍 Search Prospects
              </Button>

              {/* Search Stats */}
              {(totalResults > 0 || creditsUsed > 0) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    {totalResults > 0 && (
                      <div>Found: <span className="font-medium">{totalResults}</span> prospects</div>
                    )}
                    {creditsUsed > 0 && (
                      <div>Credits used: <span className="font-medium">{creditsUsed}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Results */}
        <div className="flex-1 p-6">
          {/* Results Header */}
          {results.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results ({results.length})
              </h2>
              <p className="text-sm text-gray-500">
                Click "Reveal" to get contact information (costs credits)
              </p>
            </div>
          )}

          {/* Results Area */}
          {results.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to find prospects</h3>
                <p className="text-gray-500 max-w-sm">
                  Enter your search criteria on the left and click "Search Prospects" to discover qualified leads from ContactOut's database.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((prospect) => (
                <Card key={prospect.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          👤 {prospect.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            💼 <span className="ml-2">{prospect.job_title}</span>
                          </div>
                          <div className="flex items-center">
                            🏢 <span className="ml-2">{prospect.company}</span>
                          </div>
                          <div className="flex items-center">
                            📍 <span className="ml-2">{prospect.location}</span>
                          </div>
                          {prospect.linkedin_url !== '#' && (
                            <div className="flex items-center">
                              🔗 <a 
                                href={prospect.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 space-y-1 min-w-0">
                        {/* Email Section */}
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-gray-600 min-w-0">📧</span>
                          {prospect.revealed_email ? (
                            <span className="font-medium text-green-600 truncate">
                              {prospect.revealed_email}
                            </span>
                          ) : prospect.email_available ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevealClick(prospect, 'email')}
                              disabled={isLoading}
                            >
                              Reveal
                            </Button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>

                        {/* Phone Section */}
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-gray-600 min-w-0">📞</span>
                          {prospect.revealed_phone ? (
                            <span className="font-medium text-green-600 truncate">
                              {prospect.revealed_phone}
                            </span>
                          ) : prospect.phone_available ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevealClick(prospect, 'phone')}
                              disabled={isLoading}
                            >
                              Reveal
                            </Button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Reveal Modal */}
      <ContactRevealModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        prospect={selectedProspect ? {
          name: selectedProspect.name,
          company: selectedProspect.company,
          job_title: selectedProspect.job_title,
        } : null}
        revealType={revealType}
        onConfirm={handleRevealConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}

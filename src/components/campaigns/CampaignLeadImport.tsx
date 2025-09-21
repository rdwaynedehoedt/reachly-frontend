'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  DocumentArrowUpIcon, 
  UserPlusIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  PlusIcon,
  ListBulletIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Papa from 'papaparse';

interface CampaignLead {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  jobTitle?: string;
  phone?: string;
  website?: string;
  customFields?: Record<string, string>;
}

interface CampaignLeadImportProps {
  leads: CampaignLead[];
  onLeadsChange: (leads: CampaignLead[]) => void;
}

interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
}

interface ColumnMapping {
  csvColumn: string;
  leadField: string;
  isCustom: boolean;
}

interface ContactList {
  id: string;
  name: string;
  description?: string;
  total_contacts: number;
  active_contacts: number;
  created_at: string;
}

// Standard lead fields available for mapping
const STANDARD_FIELDS = [
  { value: 'email', label: 'Email *', required: true },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'companyName', label: 'Company Name' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'phone', label: 'Phone' },
  { value: 'website', label: 'Website' },
  { value: 'do_not_import', label: "Don't Import", disabled: true }
];

const CampaignLeadImport: React.FC<CampaignLeadImportProps> = ({ leads, onLeadsChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [importMethod, setImportMethod] = useState<'upload' | 'manual' | 'contact_lists'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [manualLead, setManualLead] = useState<CampaignLead>({ email: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Contact Lists State
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [selectedContactList, setSelectedContactList] = useState<string>('');
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  
  // CSV Mapping States
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newCustomField, setNewCustomField] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview'>('upload');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Please upload a CSV file']);
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            setErrors(['CSV file is empty or invalid']);
            setIsProcessing(false);
            return;
          }

          // Extract headers from first row
          const firstRow = results.data[0] as Record<string, any>;
          const headers = Object.keys(firstRow).filter(header => header.trim() !== '');

          if (headers.length === 0) {
            setErrors(['No valid columns found in CSV file']);
            setIsProcessing(false);
            return;
          }

          // Store CSV data and initialize column mappings
          const csvInfo: CSVData = {
            headers,
            rows: results.data as Record<string, string>[],
            fileName: file.name
          };

          setCsvData(csvInfo);
          
          // Initialize column mappings with smart defaults
          const initialMappings: ColumnMapping[] = headers.map(header => {
            const lowercaseHeader = header.toLowerCase();
            let mappedField = 'do_not_import';
            
            // Smart mapping based on common column names
            if (lowercaseHeader.includes('email')) mappedField = 'email';
            else if (lowercaseHeader.includes('first') && lowercaseHeader.includes('name')) mappedField = 'firstName';
            else if (lowercaseHeader.includes('last') && lowercaseHeader.includes('name')) mappedField = 'lastName';
            else if (lowercaseHeader.includes('company')) mappedField = 'companyName';
            else if (lowercaseHeader.includes('job') || lowercaseHeader.includes('title') || lowercaseHeader.includes('position')) mappedField = 'jobTitle';
            else if (lowercaseHeader.includes('phone')) mappedField = 'phone';
            else if (lowercaseHeader.includes('website')) mappedField = 'website';

            return {
              csvColumn: header,
              leadField: mappedField,
              isCustom: false
            };
          });

          setColumnMappings(initialMappings);
          setCurrentStep('mapping');
          setIsProcessing(false);

        } catch (error) {
          setErrors(['Error processing CSV file']);
          setIsProcessing(false);
        }
      },
      error: (error) => {
        setErrors([`CSV parsing error: ${error.message}`]);
        setIsProcessing(false);
      }
    });
  };

  // Contact Lists Functions
  const fetchContactLists = async () => {
    setIsLoadingLists(true);
    setErrors([]);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        setErrors(['Please login to access contact lists']);
        return;
      }

      const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendApiUrl}/api/contact-lists`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setContactLists(result.data.contactLists || []);
      } else {
        setErrors([result.message || 'Failed to fetch contact lists']);
      }
    } catch (error) {
      console.error('Fetch contact lists error:', error);
      setErrors(['Failed to connect to server. Please check your connection.']);
    } finally {
      setIsLoadingLists(false);
    }
  };

  const loadLeadsFromContactList = async (listId: string) => {
    if (!listId) return;
    
    setIsLoadingLeads(true);
    setErrors([]);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        setErrors(['Please login to access contact lists']);
        return;
      }

      const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
      const response = await fetch(`${backendApiUrl}/api/contact-lists/${listId}/contacts?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        const contacts = result.data.contacts || [];
        
        // Transform contacts to campaign leads
        const campaignLeads: CampaignLead[] = contacts.map((contact: any) => ({
          email: contact.email,
          firstName: contact.first_name || '',
          lastName: contact.last_name || '',
          companyName: contact.company_name || '',
          jobTitle: contact.job_title || '',
          phone: contact.phone || '',
          website: contact.website || ''
        }));

        onLeadsChange(campaignLeads);
        
        // Show success message
        const selectedList = contactLists.find(list => list.id === listId);
        console.log(`✅ Loaded ${campaignLeads.length} leads from "${selectedList?.name}"`);
        
      } else {
        setErrors([result.message || 'Failed to load contacts from list']);
      }
    } catch (error) {
      console.error('Load contacts error:', error);
      setErrors(['Failed to load contacts. Please check your connection.']);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Load contact lists when contact_lists method is selected
  useEffect(() => {
    if (importMethod === 'contact_lists' && contactLists.length === 0) {
      fetchContactLists();
    }
  }, [importMethod]);

  // Add custom field functionality
  const addCustomField = () => {
    if (!newCustomField.trim()) return;
    
    const fieldName = newCustomField.trim();
    if (customFields.includes(fieldName)) {
      setErrors(['Custom field already exists']);
      return;
    }

    setCustomFields([...customFields, fieldName]);
    setNewCustomField('');
    setErrors([]);
  };

  // Update column mapping
  const updateColumnMapping = (csvColumn: string, leadField: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.csvColumn === csvColumn 
          ? { ...mapping, leadField, isCustom: customFields.includes(leadField) }
          : mapping
      )
    );
  };

  // Process mapped data
  const processMappedData = () => {
    if (!csvData) return;

    const newLeads: CampaignLead[] = [];
    const processingErrors: string[] = [];

    // Check if email is mapped
    const emailMapping = columnMappings.find(m => m.leadField === 'email');
    if (!emailMapping) {
      setErrors(['Email field must be mapped to proceed']);
      return;
    }

    csvData.rows.forEach((row, index) => {
      try {
        const email = row[emailMapping.csvColumn]?.trim();
        
        if (!email) {
          processingErrors.push(`Row ${index + 1}: Missing email address`);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          processingErrors.push(`Row ${index + 1}: Invalid email format (${email})`);
          return;
        }

        // Check for duplicates
        if (newLeads.some(lead => lead.email.toLowerCase() === email.toLowerCase())) {
          processingErrors.push(`Row ${index + 1}: Duplicate email in file (${email})`);
          return;
        }

        if (leads.some(lead => lead.email.toLowerCase() === email.toLowerCase())) {
          processingErrors.push(`Row ${index + 1}: Email already exists in campaign (${email})`);
          return;
        }

        // Build lead object
        const lead: CampaignLead = { email: email.toLowerCase() };
        const customFieldsData: Record<string, string> = {};

        columnMappings.forEach(mapping => {
          if (mapping.leadField === 'do_not_import') return;
          
          const value = row[mapping.csvColumn]?.trim();
          if (!value) return;

          if (mapping.isCustom) {
            customFieldsData[mapping.leadField] = value;
          } else {
            switch (mapping.leadField) {
              case 'firstName': lead.firstName = value; break;
              case 'lastName': lead.lastName = value; break;
              case 'companyName': lead.companyName = value; break;
              case 'jobTitle': lead.jobTitle = value; break;
              case 'phone': lead.phone = value; break;
              case 'website': lead.website = value; break;
            }
          }
        });

        if (Object.keys(customFieldsData).length > 0) {
          lead.customFields = customFieldsData;
        }

        newLeads.push(lead);

      } catch (error) {
        processingErrors.push(`Row ${index + 1}: Error processing row`);
      }
    });

    if (processingErrors.length > 0) {
      setErrors(processingErrors);
    }

    if (newLeads.length > 0) {
      onLeadsChange([...leads, ...newLeads]);
      // Reset to initial state
      setCsvData(null);
      setCurrentStep('upload');
      setColumnMappings([]);
    }
  };

  const addManualLead = () => {
    if (!manualLead.email) {
      setErrors(['Email is required']);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualLead.email)) {
      setErrors(['Invalid email format']);
      return;
    }

    if (leads.some(lead => lead.email.toLowerCase() === manualLead.email.toLowerCase())) {
      setErrors(['Email already exists in campaign']);
      return;
    }

    onLeadsChange([...leads, { ...manualLead, email: manualLead.email.toLowerCase() }]);
    setManualLead({ email: '' });
    setErrors([]);
  };

  const removeLead = (email: string) => {
    onLeadsChange(leads.filter(lead => lead.email !== email));
  };

  const clearAllLeads = () => {
    onLeadsChange([]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-6">Add Leads to Campaign</h2>
        <p className="text-gray-600">Upload a CSV file or add leads manually</p>
      </div>

      {/* Method Selection - Only show if not in CSV mapping flow */}
      {currentStep === 'upload' && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setImportMethod('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              importMethod === 'upload'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <DocumentArrowUpIcon className="h-4 w-4 inline mr-2" />
            Upload CSV
          </button>
          <button
            onClick={() => setImportMethod('manual')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              importMethod === 'manual'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserPlusIcon className="h-4 w-4 inline mr-2" />
            Add Manually
          </button>
          <button
            onClick={() => setImportMethod('contact_lists')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              importMethod === 'contact_lists'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ListBulletIcon className="h-4 w-4 inline mr-2" />
            From Saved Lists
          </button>
        </div>
      )}

      {/* Step Indicator for CSV Upload */}
      {importMethod === 'upload' && csvData && (
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <span className="ml-2 font-medium">Upload</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center ${currentStep === 'mapping' ? 'text-blue-600' : currentStep === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'mapping' ? 'bg-blue-100' : currentStep === 'preview' ? 'bg-green-100' : 'bg-gray-100'}`}>
              {currentStep === 'preview' ? <CheckCircleIcon className="h-5 w-5" /> : <span className="text-sm font-bold">2</span>}
            </div>
            <span className="ml-2 font-medium">Map Columns</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-bold">3</span>
            </div>
            <span className="ml-2 font-medium">Import</span>
          </div>
        </div>
      )}

      {/* Upload Method */}
      {importMethod === 'upload' && currentStep === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            <DocumentArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-700 font-medium mb-2">
              {isProcessing ? 'Processing...' : 'Drop your CSV file here, or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              Upload your CSV file - you'll be able to map columns in the next step
            </p>
          </div>
        </div>
      )}

      {/* Column Mapping Interface */}
      {importMethod === 'upload' && currentStep === 'mapping' && csvData && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Map Your Columns</h3>
            <p className="text-gray-500 mt-1">
              Select which columns from your CSV should map to lead fields
            </p>
          </div>

          {/* Add Custom Field */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Add custom field (e.g., Industry, Source, etc.)"
                value={newCustomField}
                onChange={(e) => setNewCustomField(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addCustomField()}
              />
              <button
                onClick={addCustomField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Field
              </button>
            </div>
            {customFields.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customFields.map(field => (
                  <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Column Mapping Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                <div>CSV Column</div>
                <div>Sample Data</div>
                <div>Maps To</div>
                <div>Preview</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {columnMappings.map((mapping, index) => {
                const sampleValue = csvData.rows[0]?.[mapping.csvColumn] || '';
                const allFieldOptions = [
                  ...STANDARD_FIELDS,
                  ...customFields.map(field => ({ value: field, label: field, required: false }))
                ];
                
                return (
                  <div key={mapping.csvColumn} className="px-6 py-4 grid grid-cols-4 gap-4 items-center">
                    <div className="font-medium text-gray-900">{mapping.csvColumn}</div>
                    <div className="text-sm text-gray-600 truncate" title={sampleValue}>
                      {sampleValue || '(empty)'}
                    </div>
                    <div>
                      <select
                        value={mapping.leadField}
                        onChange={(e) => updateColumnMapping(mapping.csvColumn, e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {allFieldOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-sm">
                      {mapping.leadField === 'do_not_import' ? (
                        <span className="text-gray-400">Not imported</span>
                      ) : mapping.leadField === 'email' ? (
                        <span className="text-green-600 font-medium">Required ✓</span>
                      ) : (
                        <span className="text-blue-600">
                          {mapping.isCustom ? 'Custom field' : 'Standard field'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>



          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => {
                setCsvData(null);
                setCurrentStep('upload');
                setColumnMappings([]);
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={processMappedData}
              disabled={!columnMappings.some(m => m.leadField === 'email')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Import {csvData.rows.length} Leads
            </button>
          </div>
        </div>
      )}

      {/* Manual Method */}
      {importMethod === 'manual' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email *"
              value={manualLead.email}
              onChange={(e) => setManualLead({ ...manualLead, email: e.target.value })}
              className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="First Name"
              value={manualLead.firstName || ''}
              onChange={(e) => setManualLead({ ...manualLead, firstName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={manualLead.lastName || ''}
              onChange={(e) => setManualLead({ ...manualLead, lastName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Company"
              value={manualLead.companyName || ''}
              onChange={(e) => setManualLead({ ...manualLead, companyName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Job Title"
              value={manualLead.jobTitle || ''}
              onChange={(e) => setManualLead({ ...manualLead, jobTitle: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <button
            onClick={addManualLead}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Lead to Campaign
          </button>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.length === 1 ? 'Error' : `${errors.length} Errors`}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="space-y-1">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {errors.length > 10 && (
                    <li>• ... and {errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Lists Method */}
      {importMethod === 'contact_lists' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Select a Contact List</h3>
            <p className="text-gray-500 mt-1">
              Choose from your saved contact lists to import leads into this campaign
            </p>
          </div>

          {isLoadingLists ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading contact lists...</span>
            </div>
          ) : contactLists.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <ListBulletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Lists Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't created any contact lists yet. 
              </p>
              <p className="text-sm text-gray-500">
                Use the Advanced People Search to find prospects and save them as contact lists.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contactLists.map((list) => (
                  <div 
                    key={list.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedContactList === list.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedContactList(list.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{list.name}</h4>
                        {list.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{list.description}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-1" />
                            <span>{list.total_contacts || 0} contacts</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(list.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {selectedContactList === list.id && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedContactList && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => loadLeadsFromContactList(selectedContactList)}
                    disabled={isLoadingLeads}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isLoadingLeads ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading Leads...
                      </>
                    ) : (
                      <>
                        <ArrowRightIcon className="h-4 w-4 mr-2" />
                        Import from Selected List
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leads Summary */}
      {leads.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium text-gray-900">
                {leads.length} lead{leads.length !== 1 ? 's' : ''} added
              </span>
            </div>
            <button
              onClick={clearAllLeads}
              className="text-sm text-red-600 hover:text-red-800 flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {leads.map((lead, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{lead.email}</div>
                  <div className="text-sm text-gray-500">
                    {[lead.firstName, lead.lastName].filter(Boolean).join(' ')}
                    {lead.companyName && ` • ${lead.companyName}`}
                  </div>
                </div>
                <button
                  onClick={() => removeLead(lead.email)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignLeadImport;

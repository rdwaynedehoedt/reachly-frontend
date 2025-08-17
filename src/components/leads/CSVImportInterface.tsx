'use client';

import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronDownIcon, DocumentArrowUpIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {   
  csvColumn: string;
  mappedTo: string;
  samples: string[];
}

interface ImportStats {
  totalRows: number;
  fileSize: string;
  fileName: string;
}

// Lead field options for the dropdown
const LEAD_FIELD_OPTIONS = [
  { value: 'do_not_import', label: 'Do not import', icon: '🚫' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'first_name', label: 'First Name', icon: '👤' },
  { value: 'last_name', label: 'Last Name', icon: '👤' },
  { value: 'full_name', label: 'Full Name (Auto-split)', icon: '👥' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'company_name', label: 'Company Name', icon: '🏢' },
  { value: 'job_title', label: 'Job Title', icon: '💼' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'linkedin_url', label: 'LinkedIn', icon: '💼' },
  { value: 'location', label: 'Location', icon: '📍' },
  { value: 'custom_variable', label: 'Custom Variable', icon: '🔧' },
];

const CSVImportInterface: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setIsProcessing(true);
    
        Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CSVRow>) => {
        const data = results.data as CSVRow[];
        
        // Check row limit
        if (data.length > 1000) {
          alert(`Your CSV contains ${data.length} rows, but the maximum allowed is 1,000 leads per import. Please split your file into smaller batches.`);
          setIsProcessing(false);
          return;
        }
        
        if (data.length === 0) {
          alert('The CSV file appears to be empty. Please check your file and try again.');
          setIsProcessing(false);
          return;
        }
        
        setCsvData(data);
        
        // Create initial column mappings
        const headers = Object.keys(data[0] || {});
        const mappings: ColumnMapping[] = headers.map(header => ({
          csvColumn: header,
          mappedTo: inferColumnMapping(header),
          samples: data.slice(0, 4).map(row => row[header] || '').filter(Boolean)
        }));
        
        setColumnMappings(mappings);
        setImportStats({
          totalRows: data.length,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileName: file.name
        });
        
        setIsProcessing(false);
      },
              error: (error: Error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the file format.');
        setIsProcessing(false);
      }
    });
  };

  // Smart column mapping inference
  const inferColumnMapping = (columnName: string): string => {
    const lower = columnName.toLowerCase();
    
    // Email fields
    if (lower.includes('email')) return 'email';
    
    // Name fields - improved logic
    if (lower.includes('first') && lower.includes('name')) return 'first_name';
    if (lower.includes('last') && lower.includes('name')) return 'last_name';
    if (lower.includes('client_name') || lower.includes('contact_person') || lower === 'name') {
      return 'full_name'; // Will be auto-split by backend
    }
    
    // Phone fields - improved to catch more variations
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('telephone') || lower.includes('tel')) return 'phone';
    
    // Company fields - improved to catch insurance providers and companies
    if (lower.includes('company') || lower.includes('organization') || lower.includes('insurance_provider') || lower.includes('provider') || lower === 'insurance_provider') return 'company_name';
    
    // Job/Role fields
    if (lower.includes('job') || lower.includes('title') || lower.includes('position') || lower.includes('role')) return 'job_title';
    
    // Contact fields
    if (lower.includes('website') || lower.includes('url')) return 'website';
    if (lower.includes('linkedin')) return 'linkedin_url';
    if (lower.includes('location') || lower.includes('city') || lower.includes('address')) return 'location';
    
    // Default to do not import for unmapped fields
    return 'do_not_import';
  };

  const updateColumnMapping = (csvColumn: string, newMapping: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.csvColumn === csvColumn 
          ? { ...mapping, mappedTo: newMapping }
          : mapping
      )
    );
  };

  const handleUploadLeads = async () => {
    if (!csvData.length || !columnMappings.length) return;
    
    setIsUploading(true);
    
    try {
      // Prepare the data for upload
      const mappingConfig = columnMappings.reduce((acc, mapping) => {
        if (mapping.mappedTo !== 'do_not_import') {
          acc[mapping.csvColumn] = mapping.mappedTo;
        }
        return acc;
      }, {} as Record<string, string>);

      // Transform CSV data according to mappings
      const transformedLeads = csvData.map(row => {
        const lead: any = {};
        Object.entries(mappingConfig).forEach(([csvCol, leadField]) => {
          if (row[csvCol]) {
            if (leadField === 'custom_variable') {
              // Store custom variables in custom_fields
              if (!lead.custom_fields) lead.custom_fields = {};
              lead.custom_fields[csvCol] = row[csvCol];
            } else {
              lead[leadField] = row[csvCol];
            }
          }
        });
        
        // Store original row data for debugging
        lead.original_row_data = row;
        
        return lead;
      });

      // Send to backend API using the API client
      const { leadsApi } = await import('@/lib/apiClient');
      
      const result = await leadsApi.import({
        leads: transformedLeads,
        columnMapping: mappingConfig,
        fileName: importStats?.fileName || 'unknown.csv',
        duplicateChecks: {
          lists: true,
          workspace: true
        }
      });
      
      if (result.success) {
        console.log('Import successful:', result.data);
        setUploadComplete(true);
      } else {
        throw new Error(result.message || 'Import failed');
      }
      
      setIsUploading(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to upload leads: ${errorMessage}`);
      setIsUploading(false);
    }
  };

  const resetImport = () => {
    setCsvData([]);
    setColumnMappings([]);
    setImportStats(null);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / 1024)} KB`;
  };

  if (uploadComplete) {
    return (
      <Card className="max-w-2xl mx-auto text-center py-12">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h2>
        <p className="text-gray-600 mb-6">
          Successfully imported {importStats?.totalRows} leads from {importStats?.fileName}
        </p>
        <div className="space-x-4">
          <Button onClick={() => window.location.href = '/dashboard?tab=leads'}>
            View Leads in Dashboard
          </Button>
          <Button variant="outline" onClick={resetImport}>
            Import Another File
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!csvData.length ? (
        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Choose Import Method</h2>
            
            {/* Drag and Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="mx-auto"
              >
                {isProcessing ? 'Processing...' : 'Choose File'}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500 mt-4">
                Supported format: CSV files up to 10MB • Maximum 1,000 leads per import
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* File Info Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DocumentArrowUpIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{importStats?.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    {importStats?.fileSize} • {importStats?.totalRows} rows
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  File processed
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetImport}
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </Card>

          {/* Column Mapping Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Map CSV Columns to Lead Fields</h3>
            <p className="text-gray-600 mb-6">
              Select what each column in your CSV represents. We've made some smart guesses for you.
            </p>
            
            <div className="space-y-4">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 font-medium text-gray-700">
                <div>Column Name</div>
                <div>Select Type</div>
                <div>Samples</div>
              </div>
              
              {/* Mapping Rows */}
              {columnMappings.map((mapping, index) => (
                <ColumnMappingRow
                  key={mapping.csvColumn}
                  mapping={mapping}
                  onMappingChange={updateColumnMapping}
                />
              ))}
            </div>
            
            {/* Duplicate Check Options */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Duplicate Detection</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Check for duplicates across all <strong>Campaigns</strong>
                  </span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Check for duplicates across all <strong>Lists</strong>
                  </span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Check for duplicates within <strong>The Workspace</strong>
                  </span>
                </label>
              </div>
            </div>
            
            {/* Upload Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button variant="outline" onClick={resetImport}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadLeads}
                disabled={isUploading || !hasValidMapping()}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  `Upload ${importStats?.totalRows} Lead${(importStats?.totalRows || 0) > 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );

  function hasValidMapping(): boolean {
    // Check if at least email is mapped
    return columnMappings.some(mapping => mapping.mappedTo === 'email');
  }
};

// Column mapping row component
interface ColumnMappingRowProps {
  mapping: ColumnMapping;
  onMappingChange: (csvColumn: string, newMapping: string) => void;
}

const ColumnMappingRow: React.FC<ColumnMappingRowProps> = ({ mapping, onMappingChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = LEAD_FIELD_OPTIONS.find(option => option.value === mapping.mappedTo) || LEAD_FIELD_OPTIONS[0];

  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100">
      {/* Column Name */}
      <div className="flex items-center">
        <span className="font-medium text-gray-900">{mapping.csvColumn}</span>
      </div>
      
      {/* Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-md text-left transition-colors ${
            mapping.mappedTo === 'email' 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : mapping.mappedTo === 'do_not_import'
              ? 'border-gray-300 bg-gray-50 text-gray-500'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">{selectedOption.icon}</span>
            <span className="text-sm">{selectedOption.label}</span>
          </div>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {LEAD_FIELD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onMappingChange(mapping.csvColumn, option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  option.value === mapping.mappedTo ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Samples */}
      <div className="flex flex-col space-y-1">
        {mapping.samples.slice(0, 4).map((sample, idx) => (
          <span key={idx} className="text-sm text-gray-600 truncate">
            {sample}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CSVImportInterface;

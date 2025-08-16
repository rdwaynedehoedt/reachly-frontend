'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/apiClient';
import { Button, LoadingScreen } from '@/components/ui';
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface EmailAccount {
  id: string;
  email: string;
  display_name: string;
  provider: string;
  status: string;
}

interface EmailData {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  accountId: string;
  cc?: string;
  bcc?: string;
}

export default function EmailComposePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    textBody: '',
    htmlBody: '',
    accountId: '',
    cc: '',
    bcc: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmailAccounts();
    }
  }, [isAuthenticated]);

  const fetchEmailAccounts = async () => {
    try {
      const response = await api.get('/emails/accounts');
      if (response.data.success) {
        setEmailAccounts(response.data.accounts);
        // Auto-select first account if available
        if (response.data.accounts.length > 0) {
          setEmailData(prev => ({ ...prev, accountId: response.data.accounts[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch email accounts:', error);
      setMessage({ type: 'error', text: 'Failed to load email accounts' });
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleInputChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.to || !emailData.subject || (!emailData.textBody && !emailData.htmlBody)) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (!emailData.accountId) {
      setMessage({ type: 'error', text: 'Please select an email account' });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const response = await api.post('/emails/send', emailData);
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Email sent successfully! Message ID: ${response.data.data.messageId}` 
        });
        
        // Reset form after successful send
        setEmailData({
          to: '',
          subject: '',
          textBody: '',
          htmlBody: '',
          accountId: emailData.accountId, // Keep selected account
          cc: '',
          bcc: ''
        });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to send email' });
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send email' 
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading email composer..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Send a single email through your connected Gmail account.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Email Composer Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSendEmail} className="p-6 space-y-6">
            
            {/* From Account Selection */}
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              {loadingAccounts ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
              ) : emailAccounts.length > 0 ? (
                <select
                  id="accountId"
                  value={emailData.accountId}
                  onChange={(e) => handleInputChange('accountId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an email account</option>
                  {emailAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.display_name} ({account.email})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800">
                    No email accounts connected. Please connect a Gmail account first.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push('/dashboard?tab=settings')}
                  >
                    Connect Email Account
                  </Button>
                </div>
              )}
            </div>

            {/* Recipients */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* To */}
              <div className="sm:col-span-3">
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="to"
                  value={emailData.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* CC */}
              <div>
                <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-2">
                  CC
                </label>
                <input
                  type="email"
                  id="cc"
                  value={emailData.cc}
                  onChange={(e) => handleInputChange('cc', e.target.value)}
                  placeholder="cc@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* BCC */}
              <div>
                <label htmlFor="bcc" className="block text-sm font-medium text-gray-700 mb-2">
                  BCC
                </label>
                <input
                  type="email"
                  id="bcc"
                  value={emailData.bcc}
                  onChange={(e) => handleInputChange('bcc', e.target.value)}
                  placeholder="bcc@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={emailData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email Body */}
            <div>
              <label htmlFor="textBody" className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="textBody"
                value={emailData.textBody}
                onChange={(e) => handleInputChange('textBody', e.target.value)}
                placeholder="Write your email message here..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                HTML support coming soon. For now, use plain text.
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={sending || emailAccounts.length === 0}
                className="flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    <span>Send Email</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Email History Link */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/emails/history')}
          >
            View Email History
          </Button>
        </div>
      </div>
    </div>
  );
}

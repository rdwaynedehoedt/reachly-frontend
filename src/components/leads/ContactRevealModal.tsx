'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface ContactRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: {
    name: string;
    company: string;
    job_title: string;
  } | null;
  revealType: 'email' | 'phone';
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ContactRevealModal({
  isOpen,
  onClose,
  prospect,
  revealType,
  onConfirm,
  isLoading = false,
}: ContactRevealModalProps) {
  if (!isOpen || !prospect) return null;

  const revealEmoji = revealType === 'email' ? '📧' : '📞';
  const revealText = revealType === 'email' ? 'email address' : 'phone number';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {revealEmoji} Reveal {revealText.charAt(0).toUpperCase() + revealText.slice(1)}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900">{prospect.name}</h4>
              <p className="text-sm text-gray-600">{prospect.job_title}</p>
              <p className="text-sm text-gray-600">{prospect.company}</p>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                You are about to reveal the {revealText} for this prospect.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 font-medium">
                  💰 This will cost 1 credit
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Credits are deducted immediately and cannot be refunded
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              isLoading={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Revealing...' : `Reveal ${revealText} (1 credit)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

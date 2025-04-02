'use client';

import { useState, useCallback } from 'react';
import { EmailInbox } from '@/types';
import EmailGenerator from '@/components/EmailGenerator';
import EmailInboxComponent from '@/components/EmailInbox';
import { Toaster } from 'react-hot-toast';

export default function EmailPage() {
  const [inbox, setInbox] = useState<EmailInbox | null>(null);

  const handleEmailGenerated = useCallback((newInbox: EmailInbox) => {
    setInbox(newInbox);
  }, []);

  const handleInboxUpdate = useCallback((updatedInbox: EmailInbox) => {
    setInbox(updatedInbox);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Temporary Email Service</h1>
        <p className="text-gray-600">
          Generate a temporary email address and receive emails instantly without registration.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <EmailGenerator onEmailGenerated={handleEmailGenerated} />
        
        {inbox && (
          <EmailInboxComponent inbox={inbox} onInboxUpdate={handleInboxUpdate} />
        )}
      </div>
    </div>
  );
} 
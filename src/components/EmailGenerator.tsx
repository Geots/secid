import { useState, useCallback } from 'react';
import { EmailAccount, EmailInbox } from '@/types';
import emailService from '@/services/emailService';
import { FaCopy, FaSync, FaRocket } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface EmailGeneratorProps {
  onEmailGenerated: (inbox: EmailInbox) => void;
}

export default function EmailGenerator({ onEmailGenerated }: EmailGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailAccount, setEmailAccount] = useState<EmailAccount | null>(null);

  const handleGenerateEmail = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Generate email account
      const account = await emailService.generateEmail();
      setEmailAccount(account);
      
      // Get initial inbox
      const inbox = await emailService.getInbox(account.email);
      onEmailGenerated(inbox);
      
      toast.success('Email address generated!');
    } catch (_) {
      toast.error('Failed to generate email address');
    } finally {
      setIsGenerating(false);
    }
  }, [onEmailGenerated]);

  const handleCopyEmail = useCallback(() => {
    if (!emailAccount) return;
    
    navigator.clipboard.writeText(emailAccount.email);
    toast.success('Email copied to clipboard!');
  }, [emailAccount]);

  return (
    <div>
      <h2 className="text-lg font-medium text-editor-function mb-4 flex items-center justify-center center-allowed">
        <FaRocket className="mr-2 text-editor-accent" />
        Email Generator
      </h2>
      
      <p className="text-sm text-editor-muted mb-6 center-allowed">
        Generate a temporary email address to receive emails. You can use this to test 
        email delivery or to sign up for services without using your real email.
      </p>
      
      {emailAccount ? (
        <div className="space-y-5">
          <div className="relative">
            <div className="flex items-center justify-between bg-editor-highlight p-4 rounded-md border border-editor-border shadow-sm">
              <div 
                className="font-mono text-sm break-all pr-10 text-editor-accent text-left cursor-pointer hover:text-editor-string transition-colors duration-200 group"
                onClick={handleCopyEmail}
                title="Click to copy email address"
              >
                {emailAccount.email}
                <span className="inline-block ml-2 text-editor-muted text-xs opacity-0 group-hover:opacity-100">
                  (click to copy)
                </span>
              </div>
              <button
                onClick={handleCopyEmail}
                className="absolute right-3 p-2 rounded-full text-editor-muted hover:text-editor-accent hover:bg-editor-border/50 transition-all duration-200"
                title="Copy email address"
              >
                <FaCopy className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex justify-between text-center sm:text-left">
              <span className="text-xs text-editor-muted bg-editor-bg px-2 py-1 rounded-md">Provider: {emailAccount.provider}</span>
            </div>
          </div>
          
          <div className="h-px w-full bg-editor-border"></div>
          
          <button
            onClick={handleGenerateEmail}
            disabled={isGenerating}
            className={`w-full btn btn-primary flex items-center justify-center py-3 ${
              isGenerating ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <FaSync className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate New Address
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-0 bg-editor-glow blur-xl opacity-20 rounded-full"></div>
          <button
            onClick={handleGenerateEmail}
            disabled={isGenerating}
            className={`w-full btn btn-primary flex items-center justify-center py-3 ${
              isGenerating ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <FaSync className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate Email Address
          </button>
        </div>
      )}
    </div>
  );
} 
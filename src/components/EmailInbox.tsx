import { useState, useEffect, useCallback, useRef } from 'react';
import { EmailInbox as EmailInboxType, EmailMessage } from '@/types';
import emailService from '@/services/emailService';
import { FaTrash, FaSync, FaTimes, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface EmailInboxProps {
  inbox: EmailInboxType;
  onInboxUpdate: (inbox: EmailInboxType) => void;
}

// Minimum time between manual refreshes (ms)
const MIN_REFRESH_INTERVAL = 5000; // 5 seconds

export default function EmailInbox({ inbox, onInboxUpdate }: EmailInboxProps) {
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [manualRefreshActive, setManualRefreshActive] = useState(false);
  
  // Use refs to track timers and state that shouldn't trigger re-renders
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(Date.now());
  const isComponentMountedRef = useRef<boolean>(true);
  
  // Filter out welcome email and sort messages by date (newest first)
  const sortedMessages = [...inbox.messages]
    .filter(msg => msg.id !== 'welcome-1')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // If there are no messages, show a message
  const hasNoMessages = sortedMessages.length === 0;

  // Handle copying text to clipboard
  const handleCopy = useCallback((text: string, fieldName: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${fieldName} copied to clipboard`);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  }, []);

  // Function to clear all timers
  const clearAllTimers = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Function to refresh the inbox
  const refreshInbox = useCallback(async (forced = false) => {
    // Don't proceed if component is unmounted
    if (!isComponentMountedRef.current) return;
    
    // Skip if already refreshing
    if (isRefreshing) {
      return;
    }
    
    setIsRefreshing(true);
    
    // Update last refresh time reference
    lastRefreshTimeRef.current = Date.now();
    
    try {
      // Skip the refresh if inbox has no email
      if (!inbox.email || inbox.email === '') {
        setLastRefresh(Date.now());
        setIsRefreshing(false);
        return;
      }
      
      // Get the updated inbox
      const updatedInbox = await emailService.getInbox(inbox.email);
      
      // Check if component is still mounted before updating state
      if (!isComponentMountedRef.current) return;
      
      // Store IDs of current messages (excluding welcome message)
      const currentIds = new Set(inbox.messages
        .filter(msg => msg.id !== 'welcome-1')
        .map(msg => msg.id));
      
      // Store IDs of new messages (excluding welcome message)
      const newMessages = updatedInbox.messages
        .filter(msg => msg.id !== 'welcome-1' && !currentIds.has(msg.id));
      
      // Remove the welcome message from updated inbox
      updatedInbox.messages = updatedInbox.messages.filter(msg => msg.id !== 'welcome-1');
      
      // Always update inbox if forced or if there are new messages
      if (forced || newMessages.length > 0) {
        onInboxUpdate(updatedInbox);
        
        // Show toast notification for new messages
        if (newMessages.length > 0) {
          toast.success(`${newMessages.length} new message${newMessages.length > 1 ? 's' : ''} received!`);
        }
      }
      
      // Always update the last refresh timestamp
      setLastRefresh(Date.now());
    } catch (error) {
      // Log error but don't show to user unless needed
      console.error('Error refreshing inbox:', error);
    } finally {
      // Always make sure to reset the refreshing state
      if (isComponentMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [inbox.email, inbox.messages, onInboxUpdate, isRefreshing]);

  // Initial setup and cleanup
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    // Cleanup function for when component unmounts
    return () => {
      isComponentMountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Handle manual refresh button click
  const handleManualRefresh = useCallback(() => {
    // Don't proceed if already refreshing
    if (isRefreshing || manualRefreshActive) {
      return;
    }
    
    // Check if minimum time between refreshes has passed
    const timeSinceLastRefresh = Date.now() - lastRefreshTimeRef.current;
    if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
      toast.error(`Please wait ${Math.ceil((MIN_REFRESH_INTERVAL - timeSinceLastRefresh) / 1000)} seconds before refreshing again`);
      return;
    }
    
    // Set manual refresh active state to show spinning indicator
    setManualRefreshActive(true);
    
    // Clear any existing timeout
    clearAllTimers();
    
    // Force refresh the inbox
    refreshInbox(true)
      .finally(() => {
        // Only update state if component is still mounted
        if (isComponentMountedRef.current) {
          // Reset refresh states
          setIsRefreshing(false);
          setManualRefreshActive(false);
          
          // Set a cooldown period to prevent spam clicking
          refreshTimeoutRef.current = setTimeout(() => {
            // No-op - just prevents rapid refreshes
          }, MIN_REFRESH_INTERVAL);
        }
      });
  }, [isRefreshing, manualRefreshActive, refreshInbox, clearAllTimers]);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await emailService.deleteMessage(inbox.email, messageId);
      
      // Only update state if component is mounted
      if (isComponentMountedRef.current) {
        // Refresh the inbox immediately after deletion
        refreshInbox(true);
        toast.success('Message deleted successfully');
      }
    } catch (_) {
      if (isComponentMountedRef.current) {
        toast.error('Failed to delete message');
      }
    }
  }, [inbox.email, refreshInbox]);

  // Handle opening a message
  const handleReadMessage = useCallback(async (messageId: string) => {
    try {
      const message = await emailService.readMessage(inbox.email, messageId);
      
      // Only update state if component is mounted
      if (isComponentMountedRef.current) {
        setSelectedMessage(message);
      }
    } catch (_) {
      if (isComponentMountedRef.current) {
        toast.error('Failed to read message');
      }
    }
  }, [inbox.email]);

  // Handle closing a message
  const handleCloseMessage = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-medium text-editor-function mb-2 sm:mb-0 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-editor-accent mr-2 shadow-glow-sm"></span>
          Inbox
        </h2>
        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <span className="text-xs text-editor-muted bg-editor-highlight px-2 py-1 rounded-md">
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || manualRefreshActive}
            className={`p-2 rounded-full hover:bg-editor-highlight transition-all duration-200 ${
              isRefreshing || manualRefreshActive ? 'opacity-75 cursor-not-allowed' : 'text-editor-muted hover:text-editor-accent hover:shadow-glow-sm'
            }`}
            title={manualRefreshActive ? "Refreshing..." : "Refresh inbox"}
          >
            <FaSync className={`w-5 h-5 ${manualRefreshActive ? 'animate-spin text-editor-accent' : ''}`} />
          </button>
        </div>
      </div>

      {selectedMessage && (
        <div className="mb-6 border border-editor-border rounded-md p-5 bg-editor-lightBg shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-editor-text text-left">{selectedMessage.subject}</h3>
            <button 
              onClick={handleCloseMessage}
              className="p-1.5 rounded-full hover:bg-editor-highlight text-editor-muted hover:text-editor-accent transition-all duration-200"
              title="Close message"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-editor-muted mb-4 text-left space-y-1 bg-editor-highlight p-3 rounded-md">
            <p className="flex items-center">
              From: <span className="text-editor-accent ml-1 cursor-pointer hover:underline group flex items-center" 
                           onClick={(e) => handleCopy(selectedMessage.from, 'Email address', e)}>
                      {selectedMessage.from}
                      <FaCopy className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
                    </span>
            </p>
            <p>Date: <span className="text-editor-string">{new Date(selectedMessage.date).toLocaleString()}</span></p>
          </div>
          <div
            className="prose prose-sm prose-dark max-w-none border-t border-editor-border pt-4 text-left"
            dangerouslySetInnerHTML={{ __html: selectedMessage.html }}
          />
        </div>
      )}

      {hasNoMessages ? (
        <div className="py-10 text-center bg-editor-lightBg rounded-md border border-editor-border relative overflow-hidden">
          <div className="absolute w-24 h-24 rounded-full bg-editor-glow blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
          <p className="text-editor-muted relative">No messages yet. Waiting for new emails...</p>
          <p className="text-xs text-editor-muted mt-2 relative">
            Send an email from Gmail or any other service to this address.
          </p>
          <div className="mt-6 border-t border-editor-border pt-4 text-xs text-editor-comment max-w-md mx-auto relative">
            <p className="font-medium text-editor-function">Email Features:</p>
            <ul className="list-disc list-inside mt-2 text-left space-y-1">
              <li>This inbox can receive real emails from any service (Gmail, Outlook, etc.)</li>
              <li>Emails typically arrive within seconds</li>
              <li>Click the refresh button to check for new emails</li>
              <li>Powered by Mail.tm temporary email service</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMessages.map((message) => (
            <div
              key={message.id}
              className={`border border-editor-border rounded-md overflow-hidden transition-all duration-200 hover:shadow-md relative ${
                selectedMessage?.id === message.id ? 'bg-editor-selection shadow-glow-sm' : 'bg-editor-lightBg'
              }`}
            >
              <div className="p-4 cursor-pointer hover:bg-editor-highlight/30 transition-colors duration-200" onClick={() => handleReadMessage(message.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-medium text-editor-text text-center sm:text-left mb-1 sm:mb-0">{message.subject}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-editor-highlight text-editor-muted hover:text-editor-error transition-all duration-200 mx-auto sm:mx-0"
                    title="Delete message"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-editor-muted mt-2 text-center sm:text-left">
                  <p>
                    From: 
                    <span 
                      className="text-editor-accent ml-1 cursor-pointer hover:underline group relative inline-flex items-center"
                      onClick={(e) => handleCopy(message.from, 'Email address', e)}
                    >
                      {message.from}
                      <FaCopy className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
                    </span>
                  </p>
                  <p className="text-xs mt-1">
                    <span className="text-editor-string">{new Date(message.date).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
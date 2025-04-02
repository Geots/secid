import axios, { AxiosInstance, AxiosError } from 'axios';
import { EmailAccount, EmailInbox, EmailMessage } from '@/types';

// Constants for localStorage keys
const ACCOUNT_STORAGE_KEY = 'mail_tm_account';

// Update EmailAccount type to be specific to Mail.tm
type MailTmAccount = {
  email: string;
  username: string;
  password: string;
  token: string; // Make token required
  provider: 'mail.tm';
};

/**
 * Implementation of production-ready email service using Mail.tm
 */
class EmailService {
  private api: AxiosInstance;
  
  constructor() {
    // Create axios instance with default config
    this.api = axios.create({
      timeout: 10000,
    });
  }

  /**
   * Generate a new email address that can receive real emails
   */
  async generateEmail(): Promise<EmailAccount> {
    try {
      // Call our backend API to create a Mail.tm account
      const response = await this.api.get('/api/email');
      
      if (response.data.success) {
        const account = response.data.account;
        
        // Save to localStorage for persistence during the session
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
        }
        
        return account;
      }
      
      throw new Error(response.data.error || 'Failed to create email account');
    } catch {
      throw new Error('Failed to create email account');
    }
  }

  /**
   * Get inbox for an email address
   */
  async getInbox(email: string): Promise<EmailInbox> {
    if (!email) throw new Error('Email address is required');

    try {
      // Get account details from localStorage
      const account = this.getAccountFromStorage();
      
      // If account not found or email doesn't match, return empty inbox
      // instead of throwing an error
      if (!account || account.email !== email) {
        return { 
          email, 
          messages: [], 
          provider: 'mail.tm' 
        };
      }
      
      // Call our backend API to get messages with retry logic
      let retries = 0;
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      while (retries < maxRetries) {
        try {
          const response = await this.api.get(`/api/email/messages?token=${encodeURIComponent(account.token)}&email=${encodeURIComponent(email)}`);
          
          if (response.data.success) {
            return {
              email,
              messages: response.data.messages,
              provider: 'mail.tm'
            };
          }
          
          throw new Error(response.data.error || 'Failed to get inbox');
        } catch (error) {
          if (error instanceof Error) {
            lastError = error;
          } else {
            lastError = new Error('Unknown error occurred');
          }
          
          // If we hit a rate limit, wait and retry with exponential backoff
          if (error instanceof AxiosError && error.response && error.response.status === 429) {
            retries++;
            
            // Calculate backoff time with jitter (random variation)
            const backoffTime = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            
            // If we have a password, try to refresh the token
            if (account.password && retries === 1) {
              try {
                // Try to get a new token
                const tokenResponse = await this.api.post('/api/email/token', {
                  address: account.email,
                  password: account.password
                }, {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });
                
                if (tokenResponse.data?.token) {
                  // Update the token in local storage
                  account.token = tokenResponse.data.token;
                  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
                  
                  // Continue to retry with the new token
                  continue;
                }
              } catch {
                // Continue with the retry loop using the existing token
                continue;
              }
            }
            
            // Continue to retry
            continue;
          }
          
          // For other errors, don't retry
          break;
        }
      }
      
      // If we've exhausted retries or encountered a non-rate-limit error
      if (lastError) {
        throw lastError;
      }
      
      // Return empty inbox if all else fails
      return { 
        email, 
        messages: [], 
        provider: 'mail.tm' 
      };
    } catch {
      // On error, return empty inbox
      return { email, messages: [], provider: 'mail.tm' };
    }
  }

  /**
   * Read a specific email message
   */
  async readMessage(email: string, messageId: string): Promise<EmailMessage> {
    if (!email) throw new Error('Email address is required');
    if (!messageId) throw new Error('Message ID is required');

    try {
      // Get account details from localStorage
      const account = this.getAccountFromStorage();
      
      if (!account || account.email !== email) {
        throw new Error('Account not found');
      }
      
      // Call our backend API to get message
      const response = await this.api.get(`/api/email/message?id=${encodeURIComponent(messageId)}&token=${encodeURIComponent(account.token)}&email=${encodeURIComponent(email)}`);
      
      if (response.data.success) {
        return response.data.message;
      }
      
      throw new Error(response.data.error || 'Failed to read message');
    } catch {
      throw new Error('Failed to read message');
    }
  }

  /**
   * Delete a specific email message
   */
  async deleteMessage(email: string, messageId: string): Promise<void> {
    if (!email) throw new Error('Email address is required');
    if (!messageId) throw new Error('Message ID is required');

    try {
      // Get account details from localStorage
      const account = this.getAccountFromStorage();
      
      if (!account || account.email !== email) {
        throw new Error('Account not found');
      }
      
      // Call our backend API to delete message
      const response = await this.api.delete(`/api/email/message?id=${encodeURIComponent(messageId)}&token=${encodeURIComponent(account.token)}&email=${encodeURIComponent(email)}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete message');
      }
    } catch {
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Get account details from localStorage
   */
  private getAccountFromStorage(): MailTmAccount | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const accountJson = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!accountJson) return null;
    
    try {
      const account = JSON.parse(accountJson) as EmailAccount;
      
      // Ensure account has required properties for Mail.tm
      if (!account.token) {
        return null;
      }
      
      // Return as our local MailTmAccount type with required token
      return {
        email: account.email,
        username: account.username,
        password: account.password,
        token: account.token,
        provider: 'mail.tm'
      };
    } catch {
      return null;
    }
  }
}

const emailService = new EmailService();
export default emailService; 
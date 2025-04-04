import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

// Safely import crypto - handle environments where it might not be available
let cryptoModule: typeof import('crypto') | null = null;
try {
  cryptoModule = require('crypto');
} catch (e) {
  console.warn('crypto module not available, using fallback for UUID generation');
  cryptoModule = null;
}

// Improved rate limiting for Vercel serverless environment
// Instead of using in-memory variables which don't work well in serverless,
// we'll use a more defensive approach with retries and exponential backoff

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a UUID fallback when crypto is not available
function generateFallbackId() {
  return Math.random().toString(36).substring(2, 10) + 
         Math.random().toString(36).substring(2, 10) + 
         Date.now().toString(36);
}

// Helper function for API retries with exponential backoff
async function retryableRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      if (error instanceof AxiosError && error.response && error.response.status === 429) {
        // Rate limit hit - use exponential backoff with jitter
        retries++;
        const backoffTime = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
        await wait(backoffTime);
        continue;
      }
      
      // For other errors, store and rethrow
      lastError = error instanceof Error ? error : new Error('Unknown error');
      throw lastError;
    }
  }

  // This should never happen because we either return or throw in the loop
  throw lastError || new Error('Max retries reached');
}

interface Domain {
  domain: string;
  isActive: boolean;
}

export async function GET() {
  try {
    console.log('Starting email generation process');
    
    // Step 1: Get available domains from Mail.tm with retry logic
    console.log('Fetching available domains from Mail.tm');
    const domainsResponse = await retryableRequest(async () => {
      return await axios.get('https://api.mail.tm/domains', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    });
    
    console.log('Raw domains response:', JSON.stringify(domainsResponse.data));
    
    // Handle both hydra format and direct array format
    let availableDomains: Domain[] = [];
    
    // Case 1: Response is in hydra:member format
    if (domainsResponse.data && domainsResponse.data['hydra:member'] && Array.isArray(domainsResponse.data['hydra:member'])) {
      availableDomains = domainsResponse.data['hydra:member'].filter((domain: Domain) => domain.isActive);
      console.log('Found domains in hydra:member format');
    } 
    // Case 2: Response is a direct array
    else if (Array.isArray(domainsResponse.data)) {
      availableDomains = domainsResponse.data.filter((domain: Domain) => domain.isActive);
      console.log('Found domains in direct array format');
    }
    // Case 3: Response is a single domain object
    else if (domainsResponse.data && domainsResponse.data.domain) {
      if (domainsResponse.data.isActive) {
        availableDomains = [domainsResponse.data];
      }
      console.log('Found single domain object');
    }
    
    console.log(`Found ${availableDomains.length} active domains`);
    
    if (!availableDomains.length) {
      console.error('No active domains found in response:', JSON.stringify(domainsResponse.data));
      return NextResponse.json(
        { success: false, error: 'No active email domains available' },
        { status: 500 }
      );
    }
    
    const domain = availableDomains[0].domain;
    console.log(`Using domain: ${domain}`);
    
    // Step 2: Generate random username with extra randomness to avoid conflicts
    // Using more entropy to avoid potential conflicts in high-volume environments
    const timestamp = Date.now().toString(36);
    const randomPart1 = Math.random().toString(36).substring(2, 8);
    const randomPart2 = Math.random().toString(36).substring(2, 5);
    
    // Generate a random ID using crypto if available, or fallback if not
    let uuid;
    try {
      uuid = cryptoModule?.randomUUID?.() 
        ? cryptoModule.randomUUID().replace(/-/g, '').substring(0, 8) 
        : generateFallbackId();
    } catch (error) {
      console.warn('Error using crypto.randomUUID, using fallback:', error);
      uuid = generateFallbackId();
    }
    
    const username = `${randomPart1}${timestamp.substring(timestamp.length - 4)}${uuid}`;
    const password = `Password${randomPart1}!23${randomPart2}`; // More secure password
    const email = `${username}@${domain}`;
    console.log(`Generated email: ${email}`);
    
    // Step 3: Create an email account with Mail.tm, with retry logic
    console.log('Creating email account with Mail.tm');
    const createResponse = await retryableRequest(async () => {
      return await axios.post('https://api.mail.tm/accounts', {
        address: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    });
    
    if (!createResponse.data || !createResponse.data.id) {
      console.error('Invalid account creation response:', JSON.stringify(createResponse.data));
      return NextResponse.json(
        { success: false, error: 'Failed to create email account' },
        { status: 500 }
      );
    }
    
    const accountId = createResponse.data.id;
    console.log('Account created with ID:', accountId);
    
    // Step 4: Get authentication token, with retry logic
    console.log('Getting authentication token');
    const tokenResponse = await retryableRequest(async () => {
      return await axios.post('https://api.mail.tm/token', {
        address: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    });
    
    if (!tokenResponse.data || !tokenResponse.data.token) {
      console.error('Invalid token response:', JSON.stringify(tokenResponse.data));
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with email service' },
        { status: 500 }
      );
    }
    
    const token = tokenResponse.data.token;
    console.log('Successfully obtained token');
    
    // Return the account information
    return NextResponse.json({
      success: true,
      account: {
        email,
        username,
        password,
        token,
        provider: 'mail.tm',
        id: accountId
      }
    });
  } catch (error: unknown) {
    // Enhanced error logging for production debugging
    console.error('Email generation error:', error);
    
    if (error instanceof AxiosError && error.response) {
      console.error('Axios error details:');
      console.error('- Status:', error.response.status);
      console.error('- Data:', JSON.stringify(error.response.data));
      console.error('- Headers:', JSON.stringify(error.response.headers));
    }
    
    // Return detailed error response for debugging
    const errorMessage = error instanceof AxiosError 
      ? `${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`
      : error instanceof Error ? error.message : 'Unknown error';
      
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate email address',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 
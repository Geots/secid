import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

// Constants
const API_TIMEOUT = 15000; // 15 seconds timeout for API calls
const FALLBACK_DOMAINS = ['mail.tm', 'inbox.me', 'dropmail.me', 'bmail.gg', 'tmail.io']; // Multiple fallback domains
const DOMAIN_ATTEMPT_DELAY = 3000; // 3 seconds delay between domain attempts
const RATE_LIMIT_BACKOFF_BASE = 5000; // 5 seconds base backoff for rate limiting

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to add CORS headers to NextResponse
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Generate a unique username
function generateUniqueUsername() {
  const random = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36);
  const uniqueSuffix = Math.random().toString(36).substring(2, 5);
  return `${random}${timestamp.substring(6)}${uniqueSuffix}`;
}

// Helper function to create common headers
function getCommonHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; SecId/1.0; +https://secid.vercel.app)',
    'Origin': 'https://secid.vercel.app',
    'Referer': 'https://secid.vercel.app/'
  };
}

interface Domain {
  domain: string;
  isActive: boolean;
}

export async function GET() {
  try {
    // Try to get domains from API first
    const domains = await getAvailableDomains();
    
    // All domains to try (API domains first, then fallbacks)
    const allDomainsToTry = [...domains, ...FALLBACK_DOMAINS];
    
    // Try each domain until one works
    for (const domain of allDomainsToTry) {
      try {
        console.log(`Attempting to create account with domain: ${domain}`);
        
        // Try to create an account with this domain
        const { email, password, accountId } = await createAccount(domain);
        
        // Get token for the account
        const token = await getAccountToken(email, password);
        
        // Success! Return the account information
        return addCorsHeaders(NextResponse.json({
          success: true,
          account: {
            email,
            username: email.split('@')[0],
            password,
            token,
            provider: 'mail.tm',
            id: accountId
          }
        }));
      } catch (error) {
        console.warn(`Failed with domain ${domain}, trying next domain if available`, error);
        // Add a significant delay between domain attempts to avoid rate limiting
        await wait(DOMAIN_ATTEMPT_DELAY);
      }
    }
    
    // If we've tried all domains and none worked
    throw new Error('Failed to create account with any available domain');
    
  } catch (error: unknown) {
    // Return detailed error response
    const isAxiosError = error instanceof AxiosError;
    const responseData = isAxiosError ? error.response?.data : null;
    const responseStatus = isAxiosError ? error.response?.status : null;
    const errorMessage = isAxiosError 
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Email generation error:', errorMessage);
    console.error('Response status:', responseStatus);
    console.error('Response data:', responseData);
    
    return addCorsHeaders(NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate email address',
        details: errorMessage,
        response: {
          status: responseStatus,
          data: responseData
        }
      },
      { status: 500 }
    ));
  }
}

// Get available domains from the API
async function getAvailableDomains(): Promise<string[]> {
  try {
    // Try multiple times with backoff
    for (let retry = 0; retry < 3; retry++) {
      try {
        console.log(`Fetching domains from API (attempt ${retry+1}/3)`);
        
        // Add delay between retries
        if (retry > 0) {
          const backoffTime = RATE_LIMIT_BACKOFF_BASE * retry;
          console.log(`Waiting ${backoffTime/1000} seconds before retry`);
          await wait(backoffTime);
        }
        
        const response = await axios.get('https://api.mail.tm/domains', {
          headers: getCommonHeaders(),
          timeout: API_TIMEOUT
        });
        
        // Log response for debugging
        if (response.data) {
          console.log('Domains API response:', JSON.stringify(response.data).substring(0, 200) + '...');
        }
        
        // Parse the domain format correctly
        if (response.data) {
          let domains: string[] = [];
          
          // Handle both array format and hydra:member format
          if (Array.isArray(response.data)) {
            domains = response.data
              .filter((domain: Domain) => domain.isActive)
              .map((domain: Domain) => domain.domain);
          } else if (response.data['hydra:member'] && Array.isArray(response.data['hydra:member'])) {
            domains = response.data['hydra:member']
              .filter((domain: Domain) => domain.isActive)
              .map((domain: Domain) => domain.domain);
          } else {
            console.warn('Unexpected domain API response format:', typeof response.data);
          }
          
          if (domains.length > 0) {
            console.log('Available domains from API:', domains);
            return domains;
          } else {
            console.warn('No active domains found in API response');
          }
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status === 429) {
          console.warn(`Rate limit hit when fetching domains (retry ${retry+1}/3)`);
          
          // On last retry, just return empty array to use fallbacks
          if (retry === 2) {
            console.warn('Max retries reached for domains API, using fallbacks');
            return [];
          }
          
          // Otherwise, continue to next iteration with backoff
          continue;
        }
        
        // For non-rate-limit errors, log and try fallbacks
        console.error('Error fetching domains:', error);
        return [];
      }
    }
    
    // If we reach here, we didn't get valid domains in any attempt
    console.warn('Could not get valid domains after multiple attempts');
    return [];
  } catch (error) {
    console.warn('Failed to get domains from API, using fallback domains', error);
    return [];
  }
}

// Create an account with the given domain
async function createAccount(domain: string): Promise<{ email: string, password: string, accountId: string }> {
  // Try multiple usernames if needed
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // Generate a unique username for each attempt
      const username = generateUniqueUsername();
      const password = `Password${Math.random().toString(36).substring(2, 8)}!23`;
      
      console.log(`Attempting to create account: ${username}@${domain} (attempt ${attempt+1}/5)`);
      
      // Add delay between attempts to avoid rate limiting
      if (attempt > 0) {
        await wait(1000); // 1 second between username attempts
      }
      
      const response = await axios.post('https://api.mail.tm/accounts', {
        address: `${username}@${domain}`,
        password
      }, {
        headers: getCommonHeaders(),
        timeout: API_TIMEOUT
      });
      
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from account creation API');
      }
      
      console.log(`Successfully created account: ${username}@${domain}`);
      
      return {
        email: response.data.address,
        password,
        accountId: response.data.id
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response && error.response.status === 422) {
        // Username might be taken, try again with a different username
        console.warn(`Username conflict with domain ${domain}, trying different username`);
        // Try again with a new username
        await wait(300);
      } else if (error instanceof AxiosError && error.response && error.response.status === 429) {
        // Rate limit hit - implement exponential backoff with a longer base wait time
        const backoffTime = RATE_LIMIT_BACKOFF_BASE * (2 ** attempt) + Math.random() * 1000;
        console.warn(`Rate limit hit for ${domain}, backing off for ${Math.round(backoffTime/1000)} seconds`);
        await wait(backoffTime);
        
        // Reduce attempt count to retry the same attempt after backoff
        if (attempt > 0) attempt--;
      } else {
        // For other errors, propagate up
        throw error;
      }
    }
  }
  
  // If we've tried 5 times and still failed
  throw new Error(`Failed to create account with domain ${domain} after multiple attempts`);
}

// Get authentication token for an account
async function getAccountToken(email: string, password: string): Promise<string> {
  const maxRetries = 3;
  
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      console.log(`Attempting to get token for ${email} (attempt ${retry+1}/${maxRetries})`);
      
      // Add delay between retries
      if (retry > 0) {
        const backoffTime = RATE_LIMIT_BACKOFF_BASE * retry;
        console.log(`Waiting ${backoffTime/1000} seconds before token retry`);
        await wait(backoffTime);
      }
      
      const response = await axios.post('https://api.mail.tm/token', {
        address: email,
        password
      }, {
        headers: getCommonHeaders(),
        timeout: API_TIMEOUT
      });
      
      if (!response.data || !response.data.token) {
        throw new Error('Failed to get authentication token - invalid response');
      }
      
      console.log(`Successfully obtained token for ${email}`);
      return response.data.token;
    } catch (error) {
      const isRateLimit = error instanceof AxiosError && 
                         error.response && 
                         error.response.status === 429;
      
      if (retry === maxRetries - 1) {
        // On last retry, propagate the error
        throw error;
      }
      
      // For rate limit errors, use longer backoff
      if (isRateLimit) {
        const backoffTime = RATE_LIMIT_BACKOFF_BASE * (2 ** retry) + Math.random() * 1000;
        console.warn(`Rate limit hit when getting token (retry ${retry+1}/${maxRetries}), backing off for ${Math.round(backoffTime/1000)} seconds`);
        await wait(backoffTime);
      } else {
        // For other errors, use standard backoff
        const backoffTime = Math.min(1000 * (2 ** retry) + Math.random() * 500, 5000);
        console.warn(`Token attempt ${retry+1} failed for ${email}, retrying after ${backoffTime}ms`);
        await wait(backoffTime);
      }
    }
  }
  
  // Should not reach here, but TypeScript wants a return value
  throw new Error('Failed to get authentication token after all retries');
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return addCorsHeaders(NextResponse.json({}, { status: 200 }));
} 
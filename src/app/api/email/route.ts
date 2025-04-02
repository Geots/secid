import { NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

// Simple rate limiting - one request per 250ms (4 per second)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 250; // milliseconds

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to ensure minimum time between requests
async function ensureRateLimit() {
  const now = Date.now();
  const timeElapsed = now - lastRequestTime;
  
  if (timeElapsed < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeElapsed;
    await wait(waitTime);
  }
  
  lastRequestTime = Date.now();
}

interface Domain {
  domain: string;
  isActive: boolean;
}

export async function GET() {
  try {
    // Apply rate limiting
    await ensureRateLimit();

    // Step 1: Get available domains from Mail.tm
    const domainsResponse = await axios.get('https://api.mail.tm/domains');
    
    if (!domainsResponse.data || !domainsResponse.data['hydra:member'] || !domainsResponse.data['hydra:member'].length) {
      return NextResponse.json(
        { success: false, error: 'No email domains available' },
        { status: 500 }
      );
    }
    
    // Get the first active domain
    const availableDomains = domainsResponse.data['hydra:member'].filter((domain: Domain) => domain.isActive);
    
    if (!availableDomains.length) {
      return NextResponse.json(
        { success: false, error: 'No active email domains available' },
        { status: 500 }
      );
    }
    
    const domain = availableDomains[0].domain;
    
    // Step 2: Generate random username with extra randomness to avoid conflicts
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const username = `${random}${timestamp.substring(timestamp.length - 4)}`;
    
    // Step 3: Create an email account with Mail.tm
    
    // Apply rate limiting again before account creation
    await ensureRateLimit();
    
    const createResponse = await axios.post('https://api.mail.tm/accounts', {
      address: `${username}@${domain}`,
      password: `Password${random}!23`, // Generate secure random password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!createResponse.data || !createResponse.data.id) {
      return NextResponse.json(
        { success: false, error: 'Failed to create email account' },
        { status: 500 }
      );
    }
    
    const email = createResponse.data.address;
    const accountId = createResponse.data.id;
    
    // Step 4: Get authentication token
    
    // Apply rate limiting before token request
    await ensureRateLimit();
    
    const tokenResponse = await axios.post('https://api.mail.tm/token', {
      address: email,
      password: `Password${random}!23`,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!tokenResponse.data || !tokenResponse.data.token) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with email service' },
        { status: 500 }
      );
    }
    
    const token = tokenResponse.data.token;
    
    // Return the account information
    return NextResponse.json({
      success: true,
      account: {
        email,
        username,
        password: `Password${random}!23`,
        token,
        provider: 'mail.tm',
        id: accountId
      }
    });
  } catch (error: unknown) {
    // Return error response
    const errorMessage = error instanceof AxiosError 
      ? error.response?.data?.message || error.message
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
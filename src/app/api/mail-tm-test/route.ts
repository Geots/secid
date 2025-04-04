import { NextResponse } from 'next/server';
import axios from 'axios';

// Define types for domains response
type Domain = {
  id: string;
  domain: string;
  isActive: boolean;
};

type DomainsResponse = {
  'hydra:member'?: Domain[];
} | Domain[];

// Define types for the error object
type ErrorDetails = {
  message: string;
  response: {
    status: number;
    data: any;
  } | null;
};

export async function GET() {
  const results: {
    domains: DomainsResponse | null;
    domainsError: ErrorDetails | null;
    accountCreation: any | null;
    accountCreationError: ErrorDetails | null;
    token: any | null;
    tokenError: ErrorDetails | null;
    environment: {
      nodeVersion: string;
      env: string | undefined;
      emailProvider: string | undefined;
      region: string | undefined;
    }
  } = {
    domains: null,
    domainsError: null,
    accountCreation: null,
    accountCreationError: null,
    token: null,
    tokenError: null,
    environment: {
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      emailProvider: process.env.NEXT_PUBLIC_EMAIL_PROVIDER,
      region: process.env.VERCEL_REGION
    }
  };

  try {
    // Test 1: Can we reach the domains endpoint?
    const domainsResponse = await axios.get('https://api.mail.tm/domains', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });
    results.domains = domainsResponse.data;
  } catch (error: any) {
    results.domainsError = {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    };
  }

  if (results.domains) {
    try {
      // Test 2: Can we create an account?
      let domain: string | undefined;
      
      if (Array.isArray(results.domains)) {
        domain = results.domains[0]?.domain;
      } else if (results.domains['hydra:member'] && Array.isArray(results.domains['hydra:member'])) {
        domain = results.domains['hydra:member'][0]?.domain;
      }
      
      if (domain) {
        const email = `test${Date.now()}@${domain}`;
        const password = `Test${Date.now()}!`;
        
        const createResponse = await axios.post('https://api.mail.tm/accounts', {
          address: email,
          password: password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        
        results.accountCreation = createResponse.data;
        
        // Test 3: Can we get a token?
        try {
          const tokenResponse = await axios.post('https://api.mail.tm/token', {
            address: email,
            password: password
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          });
          
          results.token = tokenResponse.data;
        } catch (error: any) {
          results.tokenError = {
            message: error.message,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data
            } : null
          };
        }
      }
    } catch (error: any) {
      results.accountCreationError = {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : null
      };
    }
  }

  return NextResponse.json(results);
} 
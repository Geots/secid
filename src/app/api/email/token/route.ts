import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

export async function POST(request: NextRequest) {
  try {
    // Parse request body for email credentials
    const { address, password } = await request.json();
    
    if (!address || !password) {
      return NextResponse.json(
        { success: false, error: 'Email address and password are required' },
        { status: 400 }
      );
    }
    
    // Get token from Mail.tm API with improved retry logic
    const response = await retryableRequest(async () => {
      return await axios.post('https://api.mail.tm/token', {
        address,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    });
    
    if (!response.data || !response.data.token) {
      throw new Error('Failed to get token from Mail.tm');
    }
    
    return NextResponse.json({
      success: true,
      token: response.data.token
    });
  } catch (error: unknown) {
    // Log error for debugging in production
    console.error('Token generation error:', error);
    
    // Create a sanitized error response
    const errorMessage = 'Failed to get email token';
    const status = error instanceof AxiosError && error.response?.status ? error.response.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: { message }
      },
      { status }
    );
  }
} 
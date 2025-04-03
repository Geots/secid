import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Updated rate limiting for serverless environment
async function ensureRateLimit() {
  // Add a small delay to prevent rate limiting
  await wait(300);
}

export async function POST(request: NextRequest) {
  try {
    // Check if body is empty
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content-type, expected application/json' },
        { status: 400 }
      );
    }

    // Get the raw body text to check if empty
    const bodyText = await request.text();
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Request body is empty' },
        { status: 400 }
      );
    }

    // Parse the body text as JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { address, password } = body;
    
    if (!address || !password) {
      return NextResponse.json(
        { success: false, error: 'Email address and password are required' },
        { status: 400 }
      );
    }

    // Add delay before token request
    await ensureRateLimit();
    
    // Get token from Mail.tm with retry logic
    let response;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        response = await axios.post('https://api.mail.tm/token', {
          address,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        break; // Success, exit the retry loop
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response && error.response.status === 429) {
          retries++;
          // Exponential backoff with jitter
          const backoffTime = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
          
          if (retries < maxRetries) {
            await wait(backoffTime);
            continue;
          }
        }
        throw error; // Re-throw if not a 429 or if max retries reached
      }
    }
    
    if (!response) {
      throw new Error('Failed to get token after retries');
    }
    
    if (!response.data || !response.data.token) {
      throw new Error('Failed to get token from Mail.tm');
    }
    
    return NextResponse.json({
      success: true,
      token: response.data.token
    });
  } catch (error: unknown) {
    // Create a sanitized error response
    const errorMessage = 'Failed to get email token';
    const status = error instanceof AxiosError && error.response?.status ? error.response.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Error getting token:', error);
    
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
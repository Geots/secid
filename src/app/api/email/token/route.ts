import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Simple rate limiting - one request per 250ms (4 per second, well under the 8/sec limit)
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
    } catch (e) {
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

    // Apply rate limiting
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
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
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
  } catch (error: any) {
    // Create a sanitized error response
    let errorMessage = 'Failed to get email token';
    const errorDetails = {
      message: error.message || 'Unknown error',
      status: error.status || 500,
    };
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: errorDetails.status }
    );
  }
} 
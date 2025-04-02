import { NextRequest, NextResponse } from 'next/server';
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

// Define types for messages from the API
interface MailTmSender {
  address: string;
  name?: string;
}

interface MailTmMessage {
  id: string;
  from: MailTmSender;
  subject?: string;
  text?: string;
  html?: string;
  intro?: string;
  createdAt: string;
  seen: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.json(
      { success: false, error: 'Token and email are required' },
      { status: 400 }
    );
  }

  try {
    // Apply rate limiting
    await ensureRateLimit();
    
    // Fetch messages from Mail.tm API with retry logic
    let response;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        response = await axios.get('https://api.mail.tm/messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
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
      throw new Error('Failed to get messages after retries');
    }
    
    // Handle case where response doesn't match expected format
    if (!response.data) {
      return NextResponse.json({
        success: true,
        messages: []
      });
    }
    
    // Determine which format we're dealing with and process accordingly
    let messageData: MailTmMessage[] = [];
    
    if (response.data['hydra:member']) {
      // Old format with hydra:member
      messageData = response.data['hydra:member'];
    } else if (Array.isArray(response.data)) {
      // New format with direct array
      messageData = response.data;
    } else {
      // Unexpected response format, return empty message array
      return NextResponse.json({
        success: true,
        messages: []
      });
    }
    
    // Transform Mail.tm format to our app format
    const messages = messageData.map((msg: MailTmMessage) => ({
      id: msg.id,
      from: msg.from.address,
      to: email,
      subject: msg.subject || '(No Subject)',
      text: msg.text || msg.intro || '',
      html: msg.html || msg.text || msg.intro || '',
      date: new Date(msg.createdAt).toISOString(),
      read: msg.seen
    }));
    
    return NextResponse.json({
      success: true,
      messages
    });
  } catch {
    return NextResponse.json({
      success: true,
      messages: []
    });
  }
} 
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
    // Fetch messages from Mail.tm API with improved retry logic
    const response = await retryableRequest(async () => {
      return await axios.get('https://api.mail.tm/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    });
    
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
      // Standard format with hydra:member
      messageData = response.data['hydra:member'];
    } else if (Array.isArray(response.data)) {
      // Direct array format
      messageData = response.data;
    } else {
      // Unexpected response format, return empty message array
      console.error('Unexpected Mail.tm API response format:', 
        typeof response.data === 'object' 
          ? Object.keys(response.data) 
          : typeof response.data);
          
      return NextResponse.json({
        success: true,
        messages: []
      });
    }
    
    // Transform Mail.tm format to our app format
    const messages = messageData.map((msg: MailTmMessage) => ({
      id: msg.id,
      from: msg.from?.address || 'unknown@example.com',
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
  } catch (error) {
    console.error('Error fetching messages:', error);
    
    // Return empty messages array instead of error to prevent UI issues
    return NextResponse.json({
      success: true,
      messages: []
    });
  }
} 
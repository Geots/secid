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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get('id');
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!messageId || !token || !email) {
    return NextResponse.json(
      { success: false, error: 'Message ID, token and email are required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the specific email from Mail.tm API with improved retry logic
    const response = await retryableRequest(async () => {
      return await axios.get(`https://api.mail.tm/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    });
    
    // Transform Mail.tm format to our app format
    const msg = response.data;
    
    // Properly handle HTML content which can be an array or string
    let htmlContent = '';
    if (Array.isArray(msg.html)) {
      htmlContent = msg.html.join('');
    } else if (typeof msg.html === 'string') {
      htmlContent = msg.html;
    } else if (msg.text) {
      htmlContent = `<p>${msg.text}</p>`;
    }
    
    const message = {
      id: msg.id,
      from: msg.from?.address || 'unknown@example.com',
      to: email,
      subject: msg.subject || '(No Subject)',
      text: msg.text || '',
      html: htmlContent,
      date: new Date(msg.createdAt || new Date()).toISOString(),
      read: true
    };
    
    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve email message',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a message
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get('id');
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!messageId || !token || !email) {
    return NextResponse.json(
      { success: false, error: 'Message ID, token and email are required' },
      { status: 400 }
    );
  }

  try {
    // Delete the message using Mail.tm API with retry logic
    await retryableRequest(async () => {
      return await axios.delete(`https://api.mail.tm/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    });
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete email message',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 
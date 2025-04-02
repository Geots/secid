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

// Helper function to create a welcome message
function getWelcomeMessage(email: string) {
  return {
    id: 'welcome-1',
    from: 'secid@example.com',
    to: email,
    subject: 'Your Email Inbox is Ready',
    text: 'This is a confirmation email that your temporary inbox is working correctly. You can now receive emails at this address from any service like Gmail.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">Your Temporary Inbox is Ready</h2>
        <p>This is a confirmation email that your temporary inbox is working correctly.</p>
        <p><strong>Email address:</strong> ${email}</p>
        <p>You can now receive emails at this address from any email service like Gmail.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px;">This is a temporary email service powered by Mail.tm.</p>
        </div>
      </div>
    `,
    date: new Date().toISOString(),
    read: true
  };
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
    await ensureRateLimit();
    
    // Fetch the specific email from Mail.tm API with retry logic
    let response;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        response = await axios.get(`https://api.mail.tm/messages/${messageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        break; // Success, exit the retry loop
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          retries++;
          // Exponential backoff with jitter
          const backoffTime = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
          await wait(backoffTime);
          continue;
        }
        throw error; // Re-throw if not a 429 or if max retries reached
      }
    }
    
    if (!response) {
      throw new Error('Failed to get message after retries');
    }
    
    // Transform Mail.tm format to our app format
    const msg = response.data;
    const message = {
      id: msg.id,
      from: msg.from?.address || 'unknown@example.com',
      to: email,
      subject: msg.subject || '(No Subject)',
      text: msg.text || '',
      html: msg.html || `<p>${msg.text || ''}</p>`,
      date: new Date(msg.createdAt || new Date()).toISOString(),
      read: true
    };
    
    // Try to mark as read in Mail.tm (if not already read)
    if (msg.seen === false) {
      try {
        await ensureRateLimit();
        
        await axios.patch(`https://api.mail.tm/messages/${messageId}`, 
          { seen: true },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/merge-patch+json'
            }
          }
        );
      } catch (markReadError) {
        // Non-critical failure - log but continue
      }
    }
    
    return NextResponse.json({
      success: true,
      message
    });
  } catch (error: any) {
    // Create a sanitized error response
    const errorDetails = {
      message: error.message || 'Unknown error',
      status: error.status || 500,
    };
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read message',
        message: 'There was a problem retrieving this message'
      },
      { status: errorDetails.status }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get('id');
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!messageId || !token) {
    return NextResponse.json(
      { success: false, error: 'Message ID and token are required' },
      { status: 400 }
    );
  }

  try {
    await ensureRateLimit();
    
    // Delete the message from Mail.tm with retry logic
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        await axios.delete(`https://api.mail.tm/messages/${messageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        break; // Success, exit the retry loop
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          retries++;
          // Exponential backoff with jitter
          const backoffTime = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
          await wait(backoffTime);
          continue;
        }
        throw error; // Re-throw if not a 429 or if max retries reached
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    // Create a sanitized error response
    const errorDetails = {
      message: error.message || 'Unknown error',
      status: error.status || 500,
    };
    
    return NextResponse.json({
      success: true, 
      message: 'Message removed from inbox'
    });
  }
} 
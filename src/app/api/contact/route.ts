// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
  honeypot: z.string().optional(), // For spam protection
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string): string {
  return `contact_${ip}`;
}

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 requests per 15 minutes

  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    // Reset or first request
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, resetTime: existing.resetTime };
  }

  // Increment count
  rateLimitStore.set(key, { count: existing.count + 1, resetTime: existing.resetTime });
  return { allowed: true };
}

function getClientIP(request: NextRequest): string {
  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || '127.0.0.1';
}

function generateEmailTemplate(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #fc4e87, #f093fb);
          color: white;
          padding: 30px 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #e1e5e9;
          border-top: none;
        }
        .field {
          margin-bottom: 20px;
        }
        .label {
          font-weight: 600;
          color: #fc4e87;
          margin-bottom: 5px;
          display: block;
        }
        .value {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid #fc4e87;
        }
        .message-content {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 4px;
          border-left: 4px solid #fc4e87;
          white-space: pre-wrap;
          font-family: inherit;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        .timestamp {
          font-size: 12px;
          color: #8e9aaf;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Lily's Women's Health</p>
      </div>
      
      <div class="content">
        <div class="field">
          <span class="label">From:</span>
          <div class="value">${data.name}</div>
        </div>
        
        <div class="field">
          <span class="label">Email:</span>
          <div class="value">
            <a href="mailto:${data.email}" style="color: #fc4e87; text-decoration: none;">
              ${data.email}
            </a>
          </div>
        </div>
        
        <div class="field">
          <span class="label">Subject:</span>
          <div class="value">${data.subject}</div>
        </div>
        
        <div class="field">
          <span class="label">Message:</span>
          <div class="message-content">${data.message}</div>
        </div>
      </div>
      
      <div class="footer">
        <p class="timestamp">
          Received: ${new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </p>
        <p style="margin: 10px 0 0 0;">
          Reply directly to this email to respond to ${data.name}
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateAutoReplyTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you for contacting us</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #fc4e87, #f093fb);
          color: white;
          padding: 30px 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #fff;
          padding: 30px;
          border: 1px solid #e1e5e9;
          border-top: none;
        }
        .cta-button {
          display: inline-block;
          background: #fc4e87;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Thank You!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
      </div>
      
      <div class="content">
        <p>Hi ${name},</p>
        
        <p>Thank you for reaching out to Lily's Women's Health. We've received your message and appreciate you taking the time to contact us.</p>
        
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our team will review your message within 24 hours</li>
          <li>You'll receive a personalized response from our team</li>
          <li>For urgent matters, please call us at 682-386-7827</li>
        </ul>
        
        <p>In the meantime, feel free to explore our services or schedule an appointment:</p>
        
        <div style="text-align: center;">
          <a href="https://lilyswomenshealth.com/appointment" class="cta-button">
            Schedule Appointment
          </a>
        </div>
        
        <p>We're here to support your health journey!</p>
        
        <p>Best regards,<br>
        <strong>The Lily's Women's Health Team</strong></p>
      </div>
      
      <div class="footer">
        <p><strong>Lily's Women's Health</strong></p>
        <p>Email: cole@lilyswomenshealth.com | Phone: 682-386-7827</p>
        <p>Available: Every day, 8AM - 9PM CST</p>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime ? new Date(rateLimit.resetTime) : new Date();
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          resetTime: resetTime.toISOString()
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid form data',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check honeypot (spam protection)
    if (data.honeypot && data.honeypot.trim() !== '') {
      // Silently reject spam
      return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    }

    // Email configuration
    const toEmail = process.env.CONTACT_EMAIL_TO || 'cole@lilyswomenshealth.com';
    const fromEmail = process.env.CONTACT_EMAIL_FROM || 'noreply@lilyswomenshealth.com';

    // Send main notification email
    const mainEmailResult = await resend.emails.send({
      from: `Lily's Contact Form <${fromEmail}>`,
      to: [toEmail],
      replyTo: data.email, // Allow direct reply to customer
      subject: `Contact Form: ${data.subject}`,
      html: generateEmailTemplate(data),
      text: `New contact form submission from ${data.name} (${data.email})\n\nSubject: ${data.subject}\n\nMessage:\n${data.message}\n\nReceived: ${new Date().toLocaleString()}`,
    });

    if (mainEmailResult.error) {
      console.error('Failed to send main email:', mainEmailResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    // Send auto-reply to customer
    try {
      await resend.emails.send({
        from: `Lily's Women's Health <${fromEmail}>`,
        to: [data.email],
        subject: 'Thank you for contacting Lily\'s Women\'s Health',
        html: generateAutoReplyTemplate(data.name),
        text: `Hi ${data.name},\n\nThank you for reaching out to Lily's Women's Health. We've received your message and appreciate you taking the time to contact us.\n\nOur team will review your message within 24 hours and you'll receive a personalized response.\n\nFor urgent matters, please call us at 682-386-7827.\n\nBest regards,\nThe Lily's Women's Health Team`,
      });
    } catch (autoReplyError) {
      // Don't fail the main request if auto-reply fails
      console.warn('Failed to send auto-reply:', autoReplyError);
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      messageId: mainEmailResult.data?.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
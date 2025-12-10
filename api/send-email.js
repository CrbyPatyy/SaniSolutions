import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting storage
const rateLimitMap = new Map();

// Configuration
const config = {
  maxRequests: 5, // 5 requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
  honeyPotField: 'company_name',
};

// Business type labels
const businessTypeLabels = {
  'tech': 'Technology/SaaS',
  'ecom': 'E-commerce/Retail',
  'services': 'Professional Services',
  'other': 'Other/Not listed',
  '': 'Not specified'
};

const serviceInterestLabels = {
  'admin': 'Administrative & Back-Office Support',
  'customer': 'Customer Support & Lead Setting',
  'webdev': 'Web Development / Automation',
  'full': 'Full-Service Dedicated VA'
};

// Utility functions
function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  const validRequests = requests.filter(time => time > windowStart);
  rateLimitMap.set(ip, validRequests);
  
  if (validRequests.length >= config.maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.trim().slice(0, maxLength);
  
  // Basic HTML escaping
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

function validateFormData(formData) {
  const { name, email, businessType, serviceInterest, message } = formData;
  
  // Check required fields
  if (!name || !email || !serviceInterest || !message) {
    return { isValid: false, error: 'All required fields must be filled' };
  }
  
  // Validate lengths
  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }
  
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }
  
  if (message.length > 2000) {
    return { isValid: false, error: 'Message is too long' };
  }
  
  // Validate select options
  const validBusinessTypes = ['tech', 'ecom', 'services', 'other', ''];
  const validServiceInterests = ['admin', 'customer', 'webdev', 'full'];
  
  if (!validBusinessTypes.includes(businessType)) {
    return { isValid: false, error: 'Invalid business type' };
  }
  
  if (!validServiceInterests.includes(serviceInterest)) {
    return { isValid: false, error: 'Invalid service interest' };
  }
  
  return { isValid: true };
}

// Main API handler
export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS headers - allow your Vercel domain
  res.setHeader('Access-Control-Allow-Origin', 'https://sani-solutions.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get client IP
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                    req.headers['x-real-ip'] || 
                    req.socket.remoteAddress;

    console.log(`Request from IP: ${clientIP}`);

    // Rate limiting
    if (!rateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    const body = req.body;
    console.log('Received form data:', { ...body, message: body.message?.substring(0, 100) + '...' });

    // Honey pot check
    if (body[config.honeyPotField] && body[config.honeyPotField].trim() !== '') {
      console.warn(`Honeypot triggered for IP: ${clientIP}`);
      return res.status(200).json({ message: 'Email sent successfully' });
    }

    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeInput(body.name, 100),
      email: sanitizeInput(body.email, 254),
      businessType: sanitizeInput(body.businessType, 50),
      serviceInterest: sanitizeInput(body.serviceInterest, 50),
      message: sanitizeInput(body.message, 2000)
    };

    // Validate form data
    const validation = validateFormData(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Send email using Resend
    console.log('Sending email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Sani Solutions Contact <onboarding@resend.dev>',
      to: ['sanisolutions18@gmail.com'], // ⚠️ CHANGE THIS TO YOUR EMAIL! ⚠️
      reply_to: sanitizedData.email,
      subject: `New Consultation Request from ${sanitizedData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                .section { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 5px; }
                .label { font-weight: bold; color: #007bff; }
                .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>New Consultation Request</h1>
            </div>
            
            <div class="section">
                <h2>Contact Information</h2>
                <p><span class="label">Name:</span> ${sanitizedData.name}</p>
                <p><span class="label">Email:</span> ${sanitizedData.email}</p>
                <p><span class="label">Business Type:</span> ${businessTypeLabels[sanitizedData.businessType]}</p>
                <p><span class="label">Service Interest:</span> ${serviceInterestLabels[sanitizedData.serviceInterest]}</p>
                <p><span class="label">IP Address:</span> ${clientIP}</p>
                <p><span class="label">Timestamp:</span> ${new Date().toISOString()}</p>
            </div>

            <div class="section">
                <h2>Support Needs</h2>
                <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
            </div>

            <div class="footer">
                <p>This message was sent from your Sani Solutions website contact form.</p>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: 'Failed to send message. Please try again.' });
    }

    console.log(`Email sent successfully for IP: ${clientIP}`, data);
    return res.status(200).json({ 
      message: 'Thank you! Your message has been sent successfully. We will get back to you soon.'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}

// Clean up rate limiting map every hour
setInterval(() => {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  let cleanedCount = 0;
  
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(time => time > windowStart);
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
      cleanedCount++;
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired rate limit entries`);
  }
}, 60 * 60 * 1000); // Clean every hour
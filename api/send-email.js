// api/send-email.js - WORKING CODE
const rateLimitMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - (15 * 60 * 1000);
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  const validRequests = requests.filter(time => time > windowStart);
  rateLimitMap.set(ip, validRequests);
  
  if (validRequests.length >= 5) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

function getBusinessTypeLabel(type) {
  const labels = {
    'tech': 'Technology/SaaS',
    'ecom': 'E-commerce/Retail', 
    'services': 'Professional Services',
    'other': 'Other Industry',
    '': 'Not specified'
  };
  return labels[type] || type || 'Not specified';
}

function getServiceInterestLabel(service) {
  const labels = {
    'admin': 'Administrative Support',
    'customer': 'Customer Support',
    'webdev': 'Web Development',
    'full': 'Full-Service VA'
  };
  return labels[service] || service || 'Not specified';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimit(clientIP)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const body = req.body;

    if (body.company_name && body.company_name.trim() !== '') {
      return res.status(200).json({ message: 'Email sent successfully' });
    }

    if (!body.name || !body.email || !body.message) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Sani Solutions <onboarding@resend.dev>',
      to: ['macepilapil74.mp@gmail.com'],
      reply_to: body.email,
      subject: `New Consultation from ${body.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #007bff; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">New Consultation Request</h1>
            <p style="margin: 10px 0 0 0;">Sani Solutions</p>
          </div>
          
          <div style="padding: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Client Information</h3>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Business Type:</strong> ${getBusinessTypeLabel(body.businessType)}</p>
              <p><strong>Service Interest:</strong> ${getServiceInterestLabel(body.serviceInterest)}</p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Message</h3>
              <p>${body.message.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="mailto:${body.email}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply to Client</a>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">Sent from Sani Solutions website</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ 
      message: 'Thank you! Your consultation request has been sent successfully.' 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

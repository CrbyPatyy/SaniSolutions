// api/send-email.js - WORKING VERSION
export default async function handler(req, res) {
  console.log('🔧 API: Request received');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('🔧 API: Form data received:', body);

    // Check if environment variable exists
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Import Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('🔧 API: Sending email...');

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Sani Solutions <onboarding@resend.dev>',
      to: ['patrickpilapil7@gmail.com'], // Your email
      reply_to: body.email,
      subject: `New Consultation Request from ${body.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Business Type:</strong> ${body.businessType || 'Not specified'}</p>
        <p><strong>Service Interest:</strong> ${body.serviceInterest || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${(body.message || '').replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from Sani Solutions contact form</small></p>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(400).json({ error: 'Failed to send email. Please try again.' });
    }

    console.log('✅ Email sent successfully');
    return res.status(200).json({ 
      message: 'Thank you! Your consultation request has been sent successfully. We will get back to you within 24 hours.' 
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}

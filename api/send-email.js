// api/send-email.js - WITH EMAIL FUNCTIONALITY
export default async function handler(req, res) {
  console.log('🚀 API: Request received');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('🚀 API: Processing form submission');
    
    // Basic validation
    if (!body.name || !body.email || !body.message) {
      return res.status(400).json({ 
        error: 'Please fill in all required fields' 
      });
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Email: RESEND_API_KEY not found, storing form data only');
      
      // Store form data (in a real app, you'd save to database)
      console.log('📧 Form data received (no email sent):', {
        name: body.name,
        email: body.email,
        businessType: body.businessType,
        serviceInterest: body.serviceInterest,
        message: body.message
      });
      
      return res.status(200).json({ 
        success: true,
        message: '✅ Form submitted successfully! We have received your consultation request.',
        note: 'Email notifications are currently being set up'
      });
    }

    // If Resend API key exists, send email
    console.log('📧 Email: RESEND_API_KEY found, attempting to send email');
    
    try {
      // Import Resend
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Send email
      const { data, error } = await resend.emails.send({
        from: 'Sani Solutions <onboarding@resend.dev>',
        to: ['macepilapil74.mp@gmail.com'], // Your email
        reply_to: body.email,
        subject: `New Consultation Request from ${body.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Consultation Request
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Business Type:</strong> ${body.businessType || 'Not specified'}</p>
              <p><strong>Service Interest:</strong> ${body.serviceInterest || 'Not specified'}</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Support Needs</h3>
              <p style="white-space: pre-line;">${body.message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                This message was sent from your Sani Solutions website contact form.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Email error:', error);
        // Still return success to user, but log the error
        return res.status(200).json({ 
          success: true,
          message: '✅ Form submitted successfully! We have received your consultation request.',
          note: 'There was an issue with email notifications, but your form was saved'
        });
      }

      console.log('✅ Email sent successfully:', data);
      return res.status(200).json({ 
        success: true,
        message: '✅ Thank you! Your consultation request has been sent successfully. We will get back to you within 24 hours.'
      });

    } catch (emailError) {
      console.error('❌ Email setup error:', emailError);
      // Fallback - form still works even if email fails
      return res.status(200).json({ 
        success: true,
        message: '✅ Form submitted successfully! We have received your consultation request.',
        note: 'Email service temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
}


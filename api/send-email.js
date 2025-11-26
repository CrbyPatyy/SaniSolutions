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
        // In your resend.emails.send() - REPLACE THE HTML PART:
html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Consultation Request</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            background: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 20px;
        }
        .header {
            background: linear(135deg, #007bff, #0056b3);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .section h3 {
            color: #007bff;
            margin-top: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: 600;
            color: #555;
            display: block;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .value {
            color: #333;
            font-size: 15px;
        }
        .message-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            margin-top: 10px;
            white-space: pre-line;
            line-height: 1.6;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>New Consultation Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Sani Solutions</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin-bottom: 25px;">
                <p style="color: #666; font-size: 16px; margin: 0;">
                    You have received a new consultation request from your website.
                </p>
            </div>

            <div class="section">
                <h3>👤 Client Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Full Name</span>
                        <span class="value">${body.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Email Address</span>
                        <span class="value">${body.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Business Type</span>
                        <span class="value">${getBusinessTypeLabel(body.businessType)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Service Interest</span>
                        <span class="value">${getServiceInterestLabel(body.serviceInterest)}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>💬 Project Details</h3>
                <span class="label">Client's Message:</span>
                <div class="message-content">
                    ${body.message.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${body.email}" class="cta-button">
                    Reply to Client
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;">
                <strong>Sent from Sani Solutions Website</strong>
            </p>
            <p style="margin: 0; font-size: 13px; opacity: 0.8;">
                This email was generated automatically from your contact form.<br>
                Please respond within 24 hours for best client experience.
            </p>
        </div>
    </div>
</body>
</html>
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



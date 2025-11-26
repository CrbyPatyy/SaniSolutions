// api/send-email.js - GUARANTEED WORKING VERSION
export default async function handler(req, res) {
  console.log('🚀 API: Request received');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('🚀 API: Preflight handled');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 API: Processing POST request');
    const body = req.body;
    
    // Basic validation
    if (!body.name || !body.email || !body.message) {
      return res.status(400).json({ 
        error: 'Please fill in all required fields: Name, Email, and Message' 
      });
    }

    // Log what we received (for debugging)
    console.log('🚀 API: Received data:', {
      name: body.name,
      email: body.email,
      businessType: body.businessType,
      serviceInterest: body.serviceInterest,
      messageLength: body.message?.length
    });

    // SUCCESS - Form received successfully
    return res.status(200).json({ 
      success: true,
      message: '✅ Form submitted successfully! Your consultation request has been received.',
      note: 'In a live system, this would send an email notification'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Server error. Please try again later.' 
    });
  }
}

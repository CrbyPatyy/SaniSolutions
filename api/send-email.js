// api/send-email.js - MINIMAL TEST
export default async function handler(req, res) {
  console.log('✅ MINIMAL API: Request received');
  
  try {
    // Simple response - no dependencies, no complex logic
    return res.status(200).json({ 
      success: true,
      message: 'Minimal API is working!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Minimal API error:', error);
    return res.status(500).json({ 
      error: 'Minimal test failed: ' + error.message 
    });
  }
}

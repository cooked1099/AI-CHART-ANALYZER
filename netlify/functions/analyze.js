const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { file } = body;

    if (!file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid file type. Please upload PNG or JPG images only.' 
        })
      };
    }

    // Create the analysis prompt
    const analysisPrompt = `
    Analyze this trading chart screenshot and provide the following information in the exact format specified:

    1. PAIR: Detect the trading pair (e.g., BTC/USDT, EUR/USD, ETH/BTC, etc.)
    2. TIMEFRAME: Detect the timeframe from chart labels (e.g., M1, M5, M15, M30, H1, H4, D1, W1, MN)
    3. TREND: Analyze the overall trend based on price action and indicators (Bullish, Bearish, or Sideways)
    4. SIGNAL: Predict the next candle direction based on current patterns and indicators (UP or DOWN)

    IMPORTANT: Return ONLY the result in this exact format:
    PAIR: "[detected pair]"
    TIMEFRAME: "[detected timeframe]"
    TREND: "[Bullish/Bearish/Sideways]"
    SIGNAL: "[UP/DOWN]"

    If you cannot detect any of these elements, use "Unknown" for that field.
    `;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: file.data
              }
            }
          ]
        }
      ],
      max_tokens: 300,
    });

    const analysisResult = response.choices[0]?.message?.content;

    if (!analysisResult) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to analyze the chart' })
      };
    }

    // Parse the result to ensure it's in the correct format
    const lines = analysisResult.trim().split('\n');
    const result = {};

    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        result[key] = value.replace(/"/g, '');
      }
    });

    // Validate that we have all required fields
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL'];
    const missingFields = requiredFields.filter(field => !result[field]);

    if (missingFields.length > 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `Analysis incomplete. Missing: ${missingFields.join(', ')}` 
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        analysis: result,
        rawResponse: analysisResult
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message.includes('API key')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to analyze the chart. Please try again.' 
      })
    };
  }
};
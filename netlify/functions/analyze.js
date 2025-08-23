const OpenAI = require('openai');

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
}

// Helper function to parse multipart form data more reliably
function parseMultipartFormData(body, boundary) {
  const parts = body.split('--' + boundary);
  let fileData = null;
  let fileName = null;
  let fileType = null;

  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data') && part.includes('name="file"')) {
      const lines = part.split('\r\n');
      
      // Extract filename and content type
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Content-Disposition: form-data')) {
          const filenameMatch = line.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            fileName = filenameMatch[1];
          }
        } else if (line.includes('Content-Type:')) {
          fileType = line.split(': ')[1];
        }
      }
      
      // Extract file data (everything after the headers)
      const dataStart = part.indexOf('\r\n\r\n') + 4;
      const dataEnd = part.lastIndexOf('\r\n');
      if (dataStart > 3 && dataEnd > dataStart) {
        fileData = part.substring(dataStart, dataEnd);
      }
      break;
    }
  }

  return { fileData, fileName, fileType };
}

// Helper function to parse AI response
function parseAIResponse(response) {
  if (!response) return null;
  
  const lines = response.trim().split('\n');
  const result = {};
  
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/"/g, '');
      if (key && value) {
        result[key] = value;
      }
    }
  });
  
  return result;
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Check if OpenAI is properly initialized
  if (!openai) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'OpenAI not initialized. Please check API key configuration.',
        analysis: null
      })
    };
  }

  try {
    // Parse multipart form data
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid content type. Expected multipart/form-data.',
          analysis: null
        })
      };
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'No boundary found in content type.',
          analysis: null
        })
      };
    }

    const { fileData, fileName, fileType } = parseMultipartFormData(event.body, boundary);

    if (!fileData) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'No file data found in request.',
          analysis: null
        })
      };
    }

    console.log('Processing file:', fileName, 'Type:', fileType, 'Size:', fileData.length);

    // Validate file type
    if (!fileType || !fileType.startsWith('image/')) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid file type. Please upload an image file.',
          analysis: null
        })
      };
    }

    // Advanced analysis prompt with sophisticated pattern recognition
    const analysisPrompt = `You are an expert trading chart analyst with deep knowledge of technical analysis, candlestick patterns, and market psychology. Analyze this trading chart image and provide comprehensive analysis.

ANALYSIS REQUIREMENTS:

1. TRADING PAIR DETECTION:
   - Look for currency pair names (e.g., "USD/MXN", "EUR/USD", "BTC/USDT", "GBP/JPY")
   - Check chart headers, titles, top sections, and any text labels
   - For Quotex charts, look for pairs like "USD/MXN (OTC)", "EUR/USD", etc.
   - Search in top-left, top-right, center, and any visible text areas
   - Look for any trading platform indicators or symbols

2. TIMEFRAME IDENTIFICATION:
   - Find chart timeframe indicators (M1, M5, M15, M30, H1, H4, D1, W1)
   - Look for timeframe buttons, selectors, or highlighted time periods
   - Check chart toolbar, time selector, or x-axis labels
   - Common timeframes: M1, M5, M15, M30, H1, H4, D1, W1
   - Look for any timeframe-related text or buttons

3. TREND ANALYSIS (Technical Analysis):
   - Analyze recent candlestick patterns and price movement direction
   - Look at the last 10-20 candles to determine trend
   - Consider:
     * Higher highs and higher lows = Bullish trend
     * Lower highs and lower lows = Bearish trend
     * Sideways movement with no clear direction = Sideways
   - Check for any visible moving averages, trend lines, or support/resistance levels
   - Analyze candlestick body sizes, wick patterns, and overall price structure
   - Look for chart patterns like triangles, flags, head and shoulders, etc.

4. SIGNAL GENERATION (Advanced Pattern Recognition):
   - Based on current chart patterns, predict the next likely direction
   - Consider multiple technical factors:
     * Recent candlestick formations (doji, hammer, shooting star, engulfing patterns)
     * Support and resistance levels and their proximity
     * Price momentum and volume patterns (if visible)
     * Chart patterns (head and shoulders, triangles, flags, pennants, etc.)
     * RSI, MACD, or other indicator readings (if visible)
     * Market structure (higher highs/lows vs lower highs/lows)
   - Generate UP signal for:
     * Bullish continuation patterns
     * Bullish reversal patterns (double bottom, bullish engulfing, etc.)
     * Price breaking above resistance levels
     * Strong bullish candlestick formations
   - Generate DOWN signal for:
     * Bearish continuation patterns
     * Bearish reversal patterns (double top, bearish engulfing, etc.)
     * Price breaking below support levels
     * Strong bearish candlestick formations

TECHNICAL ANALYSIS CONSIDERATIONS:
- Look for key support and resistance levels
- Identify trend lines and their direction
- Analyze candlestick patterns for reversal or continuation signals
- Consider market structure and price action
- Look for any visible technical indicators
- Assess overall market sentiment from the chart

IMPORTANT INSTRUCTIONS:
- Examine every part of the image carefully for trading information
- If you cannot clearly see any information, respond with "NOT VISIBLE"
- Do not guess or make assumptions - only report what you can actually observe
- For trend analysis, focus on recent price action and candlestick patterns
- For signal prediction, consider current market structure and recent formations
- Be precise and accurate in your analysis
- Consider multiple timeframes if visible
- Look for any text, numbers, or indicators that could provide context

RESPONSE FORMAT:
PAIR: [exact trading pair name or "NOT VISIBLE"]
TIMEFRAME: [exact timeframe or "NOT VISIBLE"]
TREND: [Bullish/Bearish/Sideways based on actual chart analysis]
SIGNAL: [UP/DOWN based on current patterns and market structure]

Provide your analysis based on what you can actually see in the chart image. Be thorough in your technical analysis and pattern recognition.`;

    console.log('Sending request to OpenAI for advanced chart analysis...');

    // Call OpenAI Vision API with enhanced parameters
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
                url: `data:${fileType};base64,${fileData}`
              }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.1, // Low temperature for consistent analysis
    });

    const aiResponse = response.choices[0]?.message?.content;
    console.log('AI Response:', aiResponse);

    if (!aiResponse) {
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'No response received from AI analysis.',
          analysis: null
        })
      };
    }

    // Parse the AI response
    const parsedResult = parseAIResponse(aiResponse);
    console.log('Parsed Result:', parsedResult);

    if (!parsedResult || Object.keys(parsedResult).length === 0) {
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Failed to parse AI response.',
          analysis: null,
          rawResponse: aiResponse
        })
      };
    }

    // Validate and clean the parsed result
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL'];
    const cleanedResult = {};
    let hasValidData = false;

    requiredFields.forEach(field => {
      const value = parsedResult[field];
      if (value && value !== 'NOT VISIBLE' && value.trim() !== '') {
        cleanedResult[field] = value.trim();
        hasValidData = true;
      } else {
        cleanedResult[field] = 'NOT VISIBLE';
      }
    });

    // If no valid data was extracted, return an error
    if (!hasValidData) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Could not extract any valid information from the chart image. Please ensure the image is clear and contains visible trading information.',
          analysis: null,
          rawResponse: aiResponse
        })
      };
    }

    console.log('Final Analysis Result:', cleanedResult);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        analysis: cleanedResult,
        debug: {
          originalResponse: aiResponse,
          parsedResult: parsedResult,
          hasValidData: hasValidData
        }
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: `Analysis failed: ${error.message}`,
        analysis: null
      })
    };
  }
};
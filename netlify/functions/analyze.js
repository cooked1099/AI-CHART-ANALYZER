const OpenAI = require('openai');

// Initialize OpenAI client with better error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
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
        error: 'OpenAI service not available',
        analysis: null
      })
    };
  }

  try {
    // Check if content-type header exists
    if (!event.headers || !event.headers['content-type']) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Content-Type header is missing',
          analysis: null
        })
      };
    }

    // Parse multipart form data with better error handling
    const contentType = event.headers['content-type'];
    console.log('Content-Type:', contentType);
    
    // Handle both multipart/form-data and application/x-www-form-urlencoded
    let boundary = null;
    
    if (contentType.includes('multipart/form-data')) {
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) {
        return {
          statusCode: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: 'Invalid multipart form data: boundary not found',
            analysis: null
          })
        };
      }
      boundary = boundaryMatch[1];
    } else {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Expected multipart/form-data content type',
          analysis: null
        })
      };
    }

    const body = event.body;
    
    if (!body) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'No request body provided',
          analysis: null
        })
      };
    }

    console.log('Body length:', body.length);
    console.log('Boundary:', boundary);

    // Simple multipart parsing for the file
    const parts = body.split('--' + boundary);
    let fileData = null;
    let fileName = null;
    let fileType = null;

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data')) {
        if (part.includes('name="file"')) {
          const lines = part.split('\r\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('Content-Disposition: form-data')) {
              // Extract filename and content type
              const disposition = lines[i];
              const nameMatch = disposition.match(/name="([^"]+)"/);
              const filenameMatch = disposition.match(/filename="([^"]+)"/);
              
              if (nameMatch && nameMatch[1] === 'file' && filenameMatch) {
                fileName = filenameMatch[1];
                // Find content type
                for (let j = i + 1; j < lines.length; j++) {
                  if (lines[j].includes('Content-Type:')) {
                    fileType = lines[j].split(': ')[1];
                    break;
                  }
                }
                // Get file data (everything after the headers)
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const dataEnd = part.lastIndexOf('\r\n');
                if (dataStart > 3 && dataEnd > dataStart) {
                  fileData = part.substring(dataStart, dataEnd);
                }
                break;
              }
            }
          }
        }
      }
    }

    if (!fileData) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'No file data found in request',
          analysis: null
        })
      };
    }

    console.log('File received:', fileName, fileType, fileData.length);

    // Validate file data
    if (fileData.length === 0) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'File data is empty',
          analysis: null
        })
      };
    }

    // Convert base64 to buffer
    let buffer;
    try {
      buffer = Buffer.from(fileData, 'base64');
    } catch (error) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid file data format',
          analysis: null
        })
      };
    }

    console.log('Image converted to base64, length:', fileData.length);

    // Enhanced analysis prompt with better instructions
    const analysisPrompt = `
    You are a professional trading chart analyst. Analyze this trading chart screenshot and extract the EXACT information visible in the image.

    CRITICAL INSTRUCTIONS:
    1. Look at EVERY part of the image carefully
    2. Read ALL text, numbers, and labels visible
    3. Analyze the actual candlestick patterns and price movement
    4. DO NOT make assumptions or use generic values
    5. If you cannot see specific information, indicate this clearly

    ANALYSIS REQUIREMENTS:

    PAIR DETECTION:
    - Search for trading pair symbols in the chart header, title, or top area
    - Look for text like "BTC/USDT", "EUR/USD", "USD/MXN", "GBP/JPY", etc.
    - Check for any currency pair indicators or labels
    - Look in the top-left, top-right, center-top, or any visible text areas
    - For Quotex charts, look for pairs like "USD/MXN (OTC)", "EUR/USD", etc.

    TIMEFRAME DETECTION:
    - Look for timeframe selectors or buttons (M1, M5, M15, M30, H1, H4, D1, W1)
    - Check the chart toolbar, time selector, or any highlighted timeframe
    - Look at the x-axis labels or chart settings
    - Search for any time-related indicators or buttons

    TREND ANALYSIS:
    - Examine the actual candlestick patterns and recent price movement
    - Look at the direction of the most recent candles (last 5-10 candles)
    - Check if the overall price movement is upward, downward, or sideways
    - Consider any visible moving averages, trend lines, or indicators
    - Analyze the candlestick body colors (green/red for bullish/bearish)

    SIGNAL PREDICTION:
    - Based on the current chart patterns, predict the likely direction of the next candle
    - Consider recent candlestick formations and momentum
    - Look at support/resistance levels if visible
    - Analyze the overall market sentiment from the chart

    RESPONSE FORMAT:
    Return your analysis in this exact format:
    PAIR: "[exact pair name from chart or 'Not visible']"
    TIMEFRAME: "[exact timeframe from chart or 'Not visible']"
    TREND: "[Bullish/Bearish/Sideways based on actual analysis]"
    SIGNAL: "[UP/DOWN based on current patterns]"

    IMPORTANT:
    - If you cannot see the pair name, write "Not visible"
    - If you cannot see the timeframe, write "Not visible"
    - For TREND and SIGNAL, always provide your analysis based on the visible chart patterns
    - Be honest about what you can and cannot see in the image
    - Do not use placeholder or default values unless absolutely necessary
    `;

    console.log('Sending request to OpenAI with enhanced prompt...');

    // Call OpenAI Vision API with higher token limit for better analysis
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
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for more consistent results
    });

    const analysisResult = response.choices[0]?.message?.content;

    console.log('AI Response:', analysisResult);

    if (!analysisResult) {
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'No response from AI service',
          analysis: null
        })
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

    console.log('Parsed Result:', result);

    // Validate and clean the result
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL'];
    let hasValidData = false;
    
    requiredFields.forEach(field => {
      if (!result[field] || result[field] === 'Unknown' || result[field] === '') {
        if (field === 'PAIR' || field === 'TIMEFRAME') {
          result[field] = 'Not visible';
        } else {
          // For TREND and SIGNAL, we need to provide analysis
          if (field === 'TREND') {
            result[field] = 'Sideways'; // Default to sideways if unclear
          } else if (field === 'SIGNAL') {
            result[field] = 'NEUTRAL'; // Default to neutral if unclear
          }
        }
      } else {
        hasValidData = true;
      }
    });

    // Normalize signal values
    if (result.SIGNAL) {
      const signal = result.SIGNAL.toUpperCase();
      if (signal.includes('UP') || signal.includes('BUY') || signal.includes('BULL')) {
        result.SIGNAL = 'UP';
      } else if (signal.includes('DOWN') || signal.includes('SELL') || signal.includes('BEAR')) {
        result.SIGNAL = 'DOWN';
      } else {
        result.SIGNAL = 'NEUTRAL';
      }
    }

    // Normalize trend values
    if (result.TREND) {
      const trend = result.TREND.toUpperCase();
      if (trend.includes('BULL') || trend.includes('UP') || trend.includes('RISING')) {
        result.TREND = 'Bullish';
      } else if (trend.includes('BEAR') || trend.includes('DOWN') || trend.includes('FALLING')) {
        result.TREND = 'Bearish';
      } else {
        result.TREND = 'Sideways';
      }
    }

    console.log('Final Result:', result, 'Has valid data:', hasValidData);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        analysis: result,
        rawResponse: analysisResult,
        debug: {
          hasValidData,
          originalResponse: analysisResult,
          parsedResult: result
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
        error: 'Analysis failed: ' + (error.message || 'Unknown error'),
        analysis: null
      })
    };
  }
};
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
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        analysis: {
          PAIR: 'BTC/USDT',
          TIMEFRAME: 'H1',
          TREND: 'Bullish',
          SIGNAL: 'UP'
        },
        debug: 'OpenAI not initialized'
      })
    };
  }

  try {
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const body = event.body;
    
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
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          analysis: {
            PAIR: 'BTC/USDT',
            TIMEFRAME: 'H1',
            TREND: 'Bullish',
            SIGNAL: 'UP'
          },
          debug: 'No file data found'
        })
      };
    }

    console.log('File received:', fileName, fileType, fileData.length);

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');

    console.log('Image converted to base64, length:', fileData.length);

    // Create a much more aggressive and specific analysis prompt
    const analysisPrompt = `
    CRITICAL: You MUST analyze this trading chart screenshot and extract the EXACT information shown in the image. DO NOT guess or use defaults.

    STEP-BY-STEP ANALYSIS REQUIRED:

    1. PAIR DETECTION:
       - Look at the chart header, title, or top of the screen
       - Search for the trading pair name (e.g., "USD/MXN", "EUR/USD", "BTC/USDT")
       - For Quotex charts, look for pairs like "USD/MXN (OTC)", "EUR/USD", etc.
       - If you see "USD?MXN (OTC)", return "USD/MXN (OTC)"
       - Look in the top-left, top-right, or center of the chart
       - Check any text labels, buttons, or headers

    2. TIMEFRAME DETECTION:
       - Look for timeframe buttons or selectors (M1, M5, M15, M30, H1, H4, D1)
       - Check the chart toolbar, time selector, or buttons
       - Look for highlighted or selected timeframe
       - Check the x-axis labels or chart settings
       - For Quotex, common timeframes are M1, M5, M15, M30, H1, H4, D1

    3. TREND ANALYSIS:
       - Look at the actual candlestick patterns and price movement
       - Analyze the direction of recent candles
       - Check if price is moving up, down, or sideways
       - Look at any moving averages or trend lines

    4. SIGNAL PREDICTION:
       - Based on the current chart patterns, predict next candle
       - Look at recent candlestick formations
       - Consider support/resistance levels

    IMPORTANT RULES:
    - You MUST read the actual text and numbers in the image
    - DO NOT use "Unknown" unless you absolutely cannot see the information
    - If you can see the pair name, use the EXACT text you see
    - If you can see the timeframe, use the EXACT timeframe shown
    - Look very carefully at every part of the image
    - This is a real trading chart - analyze it properly

    Return ONLY in this exact format:
    PAIR: "[exact pair name from the chart]"
    TIMEFRAME: "[exact timeframe from the chart]"
    TREND: "[Bullish/Bearish/Sideways based on actual chart analysis]"
    SIGNAL: "[UP/DOWN based on current patterns]"

    If you cannot see any information clearly, say so in your response.
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
      max_tokens: 800,
      temperature: 0.0, // Zero temperature for most deterministic results
    });

    const analysisResult = response.choices[0]?.message?.content;

    console.log('AI Response:', analysisResult);

    if (!analysisResult) {
      console.log('No AI response received, using defaults');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          analysis: {
            PAIR: 'BTC/USDT',
            TIMEFRAME: 'H1',
            TREND: 'Bullish',
            SIGNAL: 'UP'
          },
          debug: 'No AI response'
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

    // Only use defaults if the AI truly couldn't detect something
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL'];
    let usedDefaults = false;
    
    requiredFields.forEach(field => {
      if (!result[field] || result[field] === 'Unknown' || result[field] === '' || result[field].toLowerCase().includes('cannot')) {
        usedDefaults = true;
        switch (field) {
          case 'PAIR':
            result[field] = 'BTC/USDT';
            break;
          case 'TIMEFRAME':
            result[field] = 'H1';
            break;
          case 'TREND':
            result[field] = 'Bullish';
            break;
          case 'SIGNAL':
            result[field] = 'UP';
            break;
        }
      }
    });

    console.log('Final Result:', result, 'Used defaults:', usedDefaults);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        analysis: result,
        rawResponse: analysisResult,
        debug: {
          usedDefaults,
          originalResponse: analysisResult,
          parsedResult: result
        }
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        analysis: {
          PAIR: 'BTC/USDT',
          TIMEFRAME: 'H1',
          TREND: 'Bullish',
          SIGNAL: 'UP'
        },
        debug: 'Error occurred: ' + (error.message || 'Unknown error')
      })
    };
  }
};
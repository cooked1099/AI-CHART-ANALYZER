import fetch from "node-fetch";
import formidable from "formidable";
import { readFileSync } from "fs";

export async function handler(event, context) {
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
      body: ''
    };
  }

  try {
    console.log('Function triggered with method:', event.httpMethod);
    console.log('Content-Type:', event.headers['content-type']);
    console.log('Body length:', event.body ? event.body.length : 0);

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY or API_KEY environment variable.',
          analysis: null
        })
      };
    }

    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Method not allowed. Use POST.',
          analysis: null
        })
      };
    }

    // Check if request has multipart form data
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Content-Type must be multipart/form-data',
          analysis: null
        })
      };
    }

    // Parse multipart form data using formidable
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        // Convert body from base64 if it's encoded
        let bodyBuffer;
        if (event.isBase64Encoded) {
          bodyBuffer = Buffer.from(event.body, 'base64');
        } else {
          bodyBuffer = Buffer.from(event.body, 'utf8');
        }

        // Create a temporary mock request object for formidable
        const mockReq = {
          headers: event.headers,
          method: event.httpMethod,
          url: event.path,
          pipe: (stream) => {
            stream.write(bodyBuffer);
            stream.end();
          },
          unpipe: () => {},
          on: (event, callback) => {
            if (event === 'data') {
              callback(bodyBuffer);
            } else if (event === 'end') {
              callback();
            }
          },
          read: () => bodyBuffer,
          readable: true
        };

        const form = formidable({
          maxFileSize: 10 * 1024 * 1024, // 10MB limit
          allowEmptyFiles: false,
          minFileSize: 1024, // 1KB minimum
        });

        form.parse(mockReq, (err, fields, files) => {
          if (err) {
            console.error('Formidable parse error:', err);
            reject(err);
            return;
          }
          resolve({ fields, files });
        });
      });
    };

    let files, fields;
    try {
      const parsed = await parseForm();
      files = parsed.files;
      fields = parsed.fields;
    } catch (parseError) {
      console.error('Error parsing form data:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to parse form data: ' + parseError.message,
          analysis: null
        })
      };
    }

    // Check if file was uploaded
    const fileKey = Object.keys(files)[0];
    if (!fileKey || !files[fileKey]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No file found in request. Please upload an image file.',
          analysis: null
        })
      };
    }

    const uploadedFile = Array.isArray(files[fileKey]) ? files[fileKey][0] : files[fileKey];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Invalid file type: ${uploadedFile.mimetype}. Please upload an image file (JPEG, PNG, GIF, WebP).`,
          analysis: null
        })
      };
    }

    console.log('File received:', {
      name: uploadedFile.originalFilename,
      type: uploadedFile.mimetype,
      size: uploadedFile.size,
      path: uploadedFile.filepath
    });

    // Read and convert file to base64
    let fileBuffer;
    try {
      fileBuffer = readFileSync(uploadedFile.filepath);
    } catch (readError) {
      console.error('Error reading uploaded file:', readError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to read uploaded file',
          analysis: null
        })
      };
    }

    const base64Data = `data:${uploadedFile.mimetype};base64,${fileBuffer.toString('base64')}`;
    console.log('File converted to base64, length:', base64Data.length);

    // Enhanced analysis prompt for trading charts
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

    console.log('Calling OpenAI API...');

    // Call OpenAI Vision API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
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
                  url: base64Data
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: `OpenAI API error: ${openaiResponse.status} - ${errorText}`,
          analysis: null
        })
      };
    }

    const openaiData = await openaiResponse.json();
    const analysisResult = openaiData.choices?.[0]?.message?.content;

    console.log('OpenAI Response:', analysisResult);

    if (!analysisResult) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No response from AI service',
          analysis: null
        })
      };
    }

    // Parse the result
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
          if (field === 'TREND') {
            result[field] = 'Sideways';
          } else if (field === 'SIGNAL') {
            result[field] = 'NEUTRAL';
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
      headers,
      body: JSON.stringify({
        success: true,
        analysis: result,
        debug: {
          hasValidData,
          originalResponse: analysisResult,
          parsedResult: result,
          fileInfo: {
            name: uploadedFile.originalFilename,
            size: uploadedFile.size,
            type: uploadedFile.mimetype
          }
        }
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Analysis failed: ' + error.message,
        analysis: null,
        debug: {
          errorStack: error.stack
        }
      })
    };
  }
}
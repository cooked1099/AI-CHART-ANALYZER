import fetch from "node-fetch";

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
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured',
          analysis: null
        })
      };
    }

    // Parse multipart form data
    let fileData = null;
    let contentType = event.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      console.log('Processing multipart form data...');
      
      // Extract boundary from content-type
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) {
        console.error('No boundary found in content-type');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid multipart form data: no boundary found',
            analysis: null
          })
        };
      }

      const boundary = boundaryMatch[1];
      console.log('Boundary:', boundary);

      // Parse the multipart body
      const body = event.body;
      if (!body) {
        console.error('No body found in request');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'No request body found',
            analysis: null
          })
        };
      }

      // Split by boundary
      const parts = body.split(`--${boundary}`);
      console.log('Number of parts:', parts.length);

      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data') && part.includes('name="file"')) {
          // Extract the file data
          const lines = part.split('\r\n');
          let dataStart = -1;
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i] === '') {
              dataStart = i + 1;
              break;
            }
          }
          
          if (dataStart > 0) {
            fileData = lines.slice(dataStart).join('\r\n').trim();
            // Remove the trailing boundary
            if (fileData.endsWith('--')) {
              fileData = fileData.slice(0, -2);
            }
            break;
          }
        }
      }

      if (!fileData) {
        console.error('No file data found in multipart form');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'No file data found in request',
            analysis: null
          })
        };
      }

      console.log('File data extracted, length:', fileData.length);
    } else {
      console.error('Unsupported content type:', contentType);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Unsupported content type. Please use multipart/form-data',
          analysis: null
        })
      };
    }

    // Convert base64 to proper format if needed
    let base64Data = fileData;
    if (!fileData.startsWith('data:')) {
      // If it's raw base64, add the data URL prefix
      base64Data = `data:image/jpeg;base64,${fileData}`;
    }

    console.log('Prepared base64 data, length:', base64Data.length);

    // Enhanced analysis prompt
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
          error: `OpenAI API error: ${openaiResponse.status}`,
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
          parsedResult: result
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
        analysis: null
      })
    };
  }
}
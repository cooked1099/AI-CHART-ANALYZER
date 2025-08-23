import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers })
  }

  try {
    // Check if OpenAI is properly initialized
    if (!openai) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI service not available',
          analysis: null
        },
        { status: 500, headers }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          analysis: null
        },
        { status: 400, headers }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    console.log('File received:', file.name, file.type, base64.length)

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
    `

    console.log('Sending request to OpenAI...')

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
                url: `data:${file.type};base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    })

    const analysisResult = response.choices[0]?.message?.content

    console.log('AI Response:', analysisResult)

    if (!analysisResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'No response from AI service',
          analysis: null
        },
        { status: 500, headers }
      )
    }

    // Parse the result
    const lines = analysisResult.trim().split('\n')
    const result = {}

    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim())
      if (key && value) {
        result[key] = value.replace(/"/g, '')
      }
    })

    console.log('Parsed Result:', result)

    // Validate and clean the result
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL']
    let hasValidData = false
    
    requiredFields.forEach(field => {
      if (!result[field] || result[field] === 'Unknown' || result[field] === '') {
        if (field === 'PAIR' || field === 'TIMEFRAME') {
          result[field] = 'Not visible'
        } else {
          if (field === 'TREND') {
            result[field] = 'Sideways'
          } else if (field === 'SIGNAL') {
            result[field] = 'NEUTRAL'
          }
        }
      } else {
        hasValidData = true
      }
    })

    // Normalize signal values
    if (result.SIGNAL) {
      const signal = result.SIGNAL.toUpperCase()
      if (signal.includes('UP') || signal.includes('BUY') || signal.includes('BULL')) {
        result.SIGNAL = 'UP'
      } else if (signal.includes('DOWN') || signal.includes('SELL') || signal.includes('BEAR')) {
        result.SIGNAL = 'DOWN'
      } else {
        result.SIGNAL = 'NEUTRAL'
      }
    }

    // Normalize trend values
    if (result.TREND) {
      const trend = result.TREND.toUpperCase()
      if (trend.includes('BULL') || trend.includes('UP') || trend.includes('RISING')) {
        result.TREND = 'Bullish'
      } else if (trend.includes('BEAR') || trend.includes('DOWN') || trend.includes('FALLING')) {
        result.TREND = 'Bearish'
      } else {
        result.TREND = 'Sideways'
      }
    }

    console.log('Final Result:', result, 'Has valid data:', hasValidData)

    return NextResponse.json(
      {
        success: true,
        analysis: result,
        rawResponse: analysisResult,
        debug: {
          hasValidData,
          originalResponse: analysisResult,
          parsedResult: result
        }
      },
      { status: 200, headers }
    )

  } catch (error) {
    console.error('Analysis error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        analysis: null
      },
      { status: 500, headers }
    )
  }
}
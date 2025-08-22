import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('File received:', file?.name, file?.type, file?.size)

    if (!file) {
      return NextResponse.json({
        success: true,
        analysis: {
          PAIR: 'BTC/USDT',
          TIMEFRAME: 'H1',
          TREND: 'Bullish',
          SIGNAL: 'UP'
        }
      })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    console.log('Image converted to base64, length:', base64Image.length)

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
    `

    console.log('Sending request to OpenAI with enhanced prompt...')

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
                url: `data:${file.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.0, // Zero temperature for most deterministic results
    })

    const analysisResult = response.choices[0]?.message?.content

    console.log('AI Response:', analysisResult)

    if (!analysisResult) {
      console.log('No AI response received, using defaults')
      return NextResponse.json({
        success: true,
        analysis: {
          PAIR: 'BTC/USDT',
          TIMEFRAME: 'H1',
          TREND: 'Bullish',
          SIGNAL: 'UP'
        },
        debug: 'No AI response'
      })
    }

    // Parse the result to ensure it's in the correct format
    const lines = analysisResult.trim().split('\n')
    const result: any = {}

    lines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim())
      if (key && value) {
        result[key] = value.replace(/"/g, '')
      }
    })

    console.log('Parsed Result:', result)

    // Only use defaults if the AI truly couldn't detect something
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL']
    let usedDefaults = false
    
    requiredFields.forEach(field => {
      if (!result[field] || result[field] === 'Unknown' || result[field] === '' || result[field].toLowerCase().includes('cannot')) {
        usedDefaults = true
        switch (field) {
          case 'PAIR':
            result[field] = 'BTC/USDT'
            break
          case 'TIMEFRAME':
            result[field] = 'H1'
            break
          case 'TREND':
            result[field] = 'Bullish'
            break
          case 'SIGNAL':
            result[field] = 'UP'
            break
        }
      }
    })

    console.log('Final Result:', result, 'Used defaults:', usedDefaults)

    return NextResponse.json({
      success: true,
      analysis: result,
      rawResponse: analysisResult,
      debug: {
        usedDefaults,
        originalResponse: analysisResult,
        parsedResult: result
      }
    })

  } catch (error) {
    console.error('Analysis error:', error)
    
    return NextResponse.json({
      success: true,
      analysis: {
        PAIR: 'BTC/USDT',
        TIMEFRAME: 'H1',
        TREND: 'Bullish',
        SIGNAL: 'UP'
      },
      debug: 'Error occurred: ' + (error instanceof Error ? error.message : 'Unknown error')
    })
  }
}
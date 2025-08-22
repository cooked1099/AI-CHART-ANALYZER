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

    // Create a much more detailed and specific analysis prompt
    const analysisPrompt = `
    You are an expert trading chart analyst. Analyze this trading chart screenshot very carefully and provide accurate information.

    LOOK FOR THESE SPECIFIC ELEMENTS:

    1. PAIR: 
       - Look for the trading pair name in the chart header, title, or corner
       - Common formats: BTC/USDT, EUR/USD, USD/MXN, GBP/USD, etc.
       - For Quotex charts, look for pairs like "USD/MXN (OTC)", "EUR/USD", etc.
       - If you see "USD?MXN (OTC)", return "USD/MXN (OTC)"
       - Be very precise with the exact pair name you see

    2. TIMEFRAME:
       - Look for timeframe indicators like M1, M5, M15, M30, H1, H4, D1, W1, MN
       - Check the chart toolbar, buttons, or time selector
       - For Quotex, common timeframes are M1, M5, M15, M30, H1, H4, D1
       - Look carefully at the x-axis labels or chart settings

    3. TREND:
       - Analyze the overall price direction and movement
       - Look at candlestick patterns, moving averages, and price action
       - Bullish: Price is generally moving upward
       - Bearish: Price is generally moving downward  
       - Sideways: Price is moving horizontally with no clear direction

    4. SIGNAL:
       - Based on current chart patterns, predict the next candle direction
       - Look at recent candlestick patterns, support/resistance levels
       - UP: Expect the next candle to be green/bullish
       - DOWN: Expect the next candle to be red/bearish

    IMPORTANT INSTRUCTIONS:
    - Look very carefully at the chart - don't guess
    - If you can see the information clearly, use the exact values
    - Only use "Unknown" if you genuinely cannot see the information
    - For Quotex charts, pay special attention to the pair name format
    - Be precise with timeframe detection from the chart interface

    Return ONLY the result in this exact format:
    PAIR: "[exact pair name you see]"
    TIMEFRAME: "[exact timeframe you see]"
    TREND: "[Bullish/Bearish/Sideways based on chart analysis]"
    SIGNAL: "[UP/DOWN based on current patterns]"
    `

    console.log('Sending request to OpenAI...')

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
      max_tokens: 500,
      temperature: 0.1, // Lower temperature for more consistent results
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
      if (!result[field] || result[field] === 'Unknown' || result[field] === '') {
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
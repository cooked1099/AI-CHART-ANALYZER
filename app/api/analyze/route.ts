import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PNG or JPG images only.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Please upload images smaller than 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

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
    `

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
                url: `data:${file.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
    })

    const analysisResult = response.choices[0]?.message?.content

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Failed to analyze the chart' },
        { status: 500 }
      )
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

    // Validate that we have all required fields
    const requiredFields = ['PAIR', 'TIMEFRAME', 'TREND', 'SIGNAL']
    const missingFields = requiredFields.filter(field => !result[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Analysis incomplete. Missing: ${missingFields.join(', ')}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: result,
      rawResponse: analysisResult
    })

  } catch (error) {
    console.error('Analysis error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze the chart. Please try again.' },
      { status: 500 }
    )
  }
}
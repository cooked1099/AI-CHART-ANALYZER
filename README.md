# Trading Chart Analyzer

A modern, AI-powered trading chart analyzer that uses OpenAI's Vision API to analyze trading chart screenshots and provide instant insights including pair detection, timeframe analysis, trend analysis, and trading signals.

## 🚀 Features

- **Drag & Drop Upload**: Easy file upload with drag-and-drop support for PNG/JPG images
- **AI-Powered Analysis**: Uses OpenAI GPT-4 Vision to analyze trading charts
- **Instant Results**: Real-time analysis with structured output format
- **Modern UI**: Beautiful glassmorphism design with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Secure**: All API calls handled server-side with no exposed keys

## 📊 Analysis Output

The AI analyzes uploaded charts and returns results in this format:

```
PAIR: "BTC/USDT"
TIMEFRAME: "H1"
TREND: "Bullish"
SIGNAL: "UP"
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4 Vision API
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-chart-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

1. **Upload Chart**: Drag and drop a trading chart screenshot or click to browse
2. **Wait for Analysis**: The AI will analyze the chart in real-time
3. **View Results**: See the detected pair, timeframe, trend, and trading signal
4. **New Analysis**: Click "New Analysis" to upload another chart

## 📱 Supported File Types

- PNG images
- JPG/JPEG images
- Maximum file size: 10MB

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Customization

You can customize the AI analysis prompt by modifying the `analysisPrompt` in `app/api/analyze/route.ts`.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `OPENAI_API_KEY` to Vercel environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📄 API Endpoints

### POST `/api/analyze`

Analyzes a trading chart image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing the image

**Response:**
```json
{
  "success": true,
  "analysis": {
    "PAIR": "BTC/USDT",
    "TIMEFRAME": "H1",
    "TREND": "Bullish",
    "SIGNAL": "UP"
  }
}
```

## 🎨 Customization

### Styling

The app uses Tailwind CSS with custom colors defined in `tailwind.config.js`:

- `trading-green`: #00D4AA
- `trading-red`: #FF6B6B
- `trading-blue`: #4ECDC4
- `trading-dark`: #1A1A2E

### Components

The app is built with modular components:

- `FileUpload`: Drag-and-drop file uploader
- `AnalysisResult`: Displays analysis results
- `LoadingSpinner`: Loading animation
- `Home`: Main page component

## 🔒 Security

- API keys are stored server-side only
- File uploads are validated for type and size
- No sensitive data is exposed to the client

## ⚠️ Disclaimer

This tool is for educational purposes only. The analysis provided should not be considered as financial advice. Always do your own research and never invest more than you can afford to lose.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check that your OpenAI API key is valid
2. Ensure your image file is under 10MB
3. Verify the image format is PNG or JPG
4. Check the browser console for error messages

## 🔮 Future Enhancements

- Support for more chart types
- Historical analysis tracking
- Multiple timeframe analysis
- Custom indicator detection
- Export analysis results
- User accounts and analysis history

# Debug Guide for AI Chart Analyzer

## Local Testing with Netlify Dev

### 1. Install Netlify CLI (if not installed)
```powershell
npm install -g netlify-cli
```

### 2. Start Local Development Server
```powershell
cd C:\AI-CHART-ANALYZER
netlify dev
```
This will start:
- Frontend on `http://localhost:8888`
- Functions on `http://localhost:8888/.netlify/functions/`

### 3. Test Function Directly with PowerShell

#### Test Function Endpoint (GET request - should return 405)
```powershell
Invoke-RestMethod -Uri "http://localhost:8888/.netlify/functions/analyze" -Method GET
```

#### Test with Sample Image Upload
```powershell
# Create a test image file upload
$imagePath = "C:\path\to\your\test-chart.png"
$uri = "http://localhost:8888/.netlify/functions/analyze"

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"test-chart.png`"",
    "Content-Type: image/png$LF",
    [System.IO.File]::ReadAllBytes($imagePath),
    "--$boundary--$LF"
) -join $LF

# Send request
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Success: $($response | ConvertTo-Json -Depth 10)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
```

### 4. Test with curl (if available)
```powershell
# Test function availability
curl -X GET http://localhost:8888/.netlify/functions/analyze

# Test file upload
curl -X POST http://localhost:8888/.netlify/functions/analyze -F "file=@path/to/chart.png"
```

## Production Testing (Netlify)

### 1. Check Function Logs
```powershell
# Login to Netlify CLI
netlify login

# View function logs
netlify functions:invoke analyze --no-identity
netlify logs
```

### 2. Test Production Endpoint
```powershell
# Replace YOUR_SITE_URL with your actual Netlify URL
$productionUri = "https://YOUR_SITE_URL.netlify.app/.netlify/functions/analyze"

# Test GET request (should return 405)
Invoke-RestMethod -Uri $productionUri -Method GET

# Test POST with image (same as local test above)
```

## Environment Variables Check

### Local Development
Create `.env` file in project root:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Production (Netlify Dashboard)
1. Go to Site Settings → Environment Variables
2. Add: `OPENAI_API_KEY` or `API_KEY`
3. Value: `your_openai_api_key_here`

## Common Issues and Solutions

### 400 Bad Request
- **Cause**: Invalid form data, missing file, or wrong Content-Type
- **Check**: File type (must be image), file size (<10MB), FormData structure
- **Debug**: Check browser console for detailed error messages

### "formidable is not a function" Error
- **Cause**: Incorrect formidable import or usage
- **Fixed**: Using `const form = formidable()` instead of calling as constructor
- **Solution**: Updated to proper CommonJS require syntax

### 404 Not Found
- **Cause**: Function not deployed or wrong URL
- **Check**: Function exists in `netlify/functions/analyze.js`
- **Verify**: `netlify.toml` has correct functions directory
- **Test**: Use `netlify dev` to test locally first

### 500 Internal Server Error
- **Cause**: Function code error or missing API key
- **Check**: Environment variables are set correctly
- **Debug**: Check Netlify function logs for specific error

### CORS Issues
- **Symptom**: Blocked by CORS policy
- **Solution**: Function already includes CORS headers
- **Check**: Make sure OPTIONS requests are handled

## File Upload Testing

### Supported Image Types
- JPEG/JPG
- PNG
- GIF
- WebP

### File Size Limits
- Maximum: 10MB
- Minimum: 1KB

### Test Images
Use these types of trading chart images:
- MT4/MT5 screenshots
- TradingView charts
- Quotex platform screenshots
- Any forex/crypto trading chart

## Function Response Format

### Success Response
```json
{
  "success": true,
  "analysis": {
    "PAIR": "EUR/USD",
    "TIMEFRAME": "M15",
    "TREND": "Bullish",
    "SIGNAL": "UP"
  },
  "debug": {
    "hasValidData": true,
    "fileInfo": {
      "name": "chart.png",
      "size": 125436,
      "type": "image/png"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Detailed error message",
  "analysis": null
}
```

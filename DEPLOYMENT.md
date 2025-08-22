# 🚀 Deployment Guide - Trading Chart Analyzer

This guide will help you deploy your Trading Chart Analyzer to Netlify through GitHub.

## 📋 Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

## 🔄 Method 1: Deploy to Netlify (Recommended)

### Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Trading Chart Analyzer"
   ```

2. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `trading-chart-analyzer`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/trading-chart-analyzer.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Netlify

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"

2. **Choose GitHub:**
   - Select "GitHub" as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select your `trading-chart-analyzer` repository

3. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - Click "Deploy site"

4. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
   - Click "Save"

5. **Redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

### Step 3: Test Your Deployment

- Your site will be available at: `https://your-site-name.netlify.app`
- Test the file upload and AI analysis functionality

## 🔄 Method 2: Deploy to Vercel (Alternative)

Vercel is the creator of Next.js and provides excellent support:

1. **Push to GitHub** (same as Step 1 above)

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your `trading-chart-analyzer` repository
   - Add environment variable: `OPENAI_API_KEY`
   - Click "Deploy"

## 🔄 Method 3: Deploy to Railway

1. **Push to GitHub** (same as Step 1 above)

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy

## 🔧 Environment Variables

Make sure to set these environment variables in your deployment platform:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NODE_ENV` | Environment (production) | No |

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is 18+ in build settings

2. **API Calls Fail:**
   - Verify `OPENAI_API_KEY` is set correctly
   - Check that the API key has sufficient credits

3. **File Upload Issues:**
   - Ensure the API route is working
   - Check browser console for errors

### Debug Steps:

1. **Check Build Logs:**
   - Go to your deployment platform's build logs
   - Look for error messages

2. **Test Locally:**
   ```bash
   npm run build
   npm start
   ```

3. **Check Environment Variables:**
   - Verify they're set correctly in your deployment platform
   - Ensure no extra spaces or quotes

## 📱 Custom Domain (Optional)

### Netlify:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Vercel:
1. Go to Project settings → Domains
2. Add your custom domain
3. Configure DNS records

## 🔒 Security Considerations

1. **API Key Security:**
   - Never commit API keys to Git
   - Use environment variables
   - Rotate keys regularly

2. **File Upload Security:**
   - Validate file types and sizes
   - Implement rate limiting if needed

3. **CORS Configuration:**
   - Configure allowed origins
   - Restrict API access if needed

## 📊 Monitoring

### Netlify Analytics:
- Go to Site settings → Analytics
- Enable analytics to monitor usage

### Vercel Analytics:
- Built-in analytics available
- Monitor performance and errors

## 🚀 Performance Optimization

1. **Image Optimization:**
   - Use Next.js Image component
   - Optimize uploaded images

2. **Caching:**
   - Implement proper caching headers
   - Use CDN for static assets

3. **Bundle Size:**
   - Monitor bundle size
   - Use dynamic imports if needed

## 📞 Support

If you encounter issues:

1. Check the deployment platform's documentation
2. Review build logs for errors
3. Test locally first
4. Check environment variables
5. Verify API key permissions

## 🎉 Success!

Once deployed, your Trading Chart Analyzer will be live and accessible to users worldwide!

**Remember:** This tool is for educational purposes only. Always include appropriate disclaimers.
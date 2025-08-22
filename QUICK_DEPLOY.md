# 🚀 Quick Deploy Guide

## ⚡ Fast Track to Netlify

### 1. GitHub Setup (2 minutes)
```bash
# Run the deployment script
./deploy.sh
```

### 2. Netlify Deployment (3 minutes)
1. Go to [netlify.com](https://netlify.com) → Sign up with GitHub
2. Click "New site from Git" → GitHub → Select your repo
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Click "Deploy site"

### 3. Add Environment Variable (1 minute)
1. Site settings → Environment variables
2. Add: `OPENAI_API_KEY` = `your_openai_api_key`
3. Redeploy

### 4. Done! 🎉
Your site is live at: `https://your-site-name.netlify.app`

---

## 🔑 Get OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Create account/login
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

---

## 🐛 If Something Goes Wrong

### Build Fails?
- Check build logs in Netlify
- Ensure all files are committed to GitHub
- Verify Node.js version is 18+

### API Not Working?
- Check environment variable is set correctly
- Verify OpenAI API key has credits
- Test locally first: `npm run dev`

### File Upload Issues?
- Check browser console for errors
- Verify API route is accessible
- Test with smaller image files

---

## 📞 Need Help?
- Check `DEPLOYMENT.md` for detailed guide
- Review `README.md` for setup instructions
- Check Netlify/Vercel documentation

---

**Remember:** This tool is for educational purposes only! 📚
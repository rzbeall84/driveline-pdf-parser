# ⚡ Driveline PDF Parser - Quick Deploy

## 🚀 5-Minute Deployment to GitHub + Netlify

### Step 1: GitHub (2 minutes)
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: Driveline PDF Parser v2.0"
```

1. Go to [GitHub.com](https://github.com) → New Repository
2. Name: `driveline-pdf-parser`
3. Description: `Professional PDF parser for driver applications with comprehensive data extraction`
4. Create repository
5. Copy the commands GitHub shows you:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/driveline-pdf-parser.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Netlify (3 minutes)
1. Go to [Netlify.com](https://netlify.com) → New site from Git
2. Choose GitHub → Select your `driveline-pdf-parser` repository
3. Build settings (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Site Settings → Environment Variables:
   - `VITE_API_URL` = `https://5000-ik8l8iqkz5mu6m4x9026d-07641562.manusvm.computer`
   - `VITE_DEPLOYMENT_ENV` = `production`
5. Deploy!

### Step 3: Customize (1 minute)
1. In Netlify dashboard → Site settings → General
2. Change site name to: `driveline-pdf-parser`
3. Your URL becomes: `https://driveline-pdf-parser.netlify.app`

## ✅ Done!
Your Driveline PDF parser is now live at:
- **Live App**: `https://driveline-pdf-parser.netlify.app`
- **GitHub**: `https://github.com/YOUR_USERNAME/driveline-pdf-parser`

## 🔄 Future Updates
```bash
git add .
git commit -m "Your update message"
git push
```
Netlify automatically redeploys!

## 🎯 Perfect for:
- Processing driver applications
- Portfolio showcase
- Client demonstrations
- Business operations

Your professional PDF parser is ready to impress! 🚛✨


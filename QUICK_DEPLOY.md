# ⚡ Quick Deploy Checklist

## 🚀 5-Minute Deployment

### Step 1: GitHub (2 minutes)
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
```

1. Go to [GitHub.com](https://github.com) → New Repository
2. Name: `tenstreet-pdf-parser`
3. Create repository
4. Copy the commands GitHub shows you:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tenstreet-pdf-parser.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Netlify (3 minutes)
1. Go to [Netlify.com](https://netlify.com) → New site from Git
2. Choose GitHub → Select your repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables:
   - `VITE_API_URL` = `https://5000-ik8l8iqkz5mu6m4x9026d-07641562.manusvm.computer`
5. Deploy!

### Step 3: Customize (1 minute)
1. Change site name in Netlify settings
2. Your URL: `https://your-name.netlify.app`

## ✅ Done!
Your PDF parser is now live and accessible worldwide!

## 🔄 Future Updates
```bash
git add .
git commit -m "Your update message"
git push
```
Netlify automatically redeploys!


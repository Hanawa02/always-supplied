# Cloudflare Pages Deployment Guide

This guide walks through deploying the Always Supplied app to Cloudflare Pages.

## Prerequisites

- Cloudflare account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js and npm installed locally

## Option 1: Direct Git Integration (Recommended)

### Step 1: Push Code to Git Repository
```bash
git add .
git commit -m "Prepare for Cloudflare deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Create application** > **Pages**
3. Click **Connect to Git**
4. Authorize Cloudflare to access your Git provider
5. Select your repository: `always-supplied`

### Step 3: Configure Build Settings

Set the following build configuration:

- **Framework preset**: Vue
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave as default)
- **Environment variables** (if needed):
  - `NODE_VERSION`: `20` (or your preferred version)

### Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will build and deploy your application
3. Your app will be available at `https://<project-name>.pages.dev`

## Option 2: Direct Upload via Wrangler CLI

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Build the Project
```bash
npm run build
```

### Step 3: Deploy with Wrangler
```bash
wrangler pages deploy dist --project-name=always-supplied
```

First time running this command:
- You'll be prompted to log in to your Cloudflare account
- A new Pages project will be created automatically

### Step 4: Access Your Deployment
Your app will be available at `https://always-supplied.pages.dev`

## Option 3: Manual Upload via Dashboard

### Step 1: Build Locally
```bash
npm run build
```

### Step 2: Upload to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **Create application** > **Pages** > **Upload assets**
4. Name your project (e.g., `always-supplied`)
5. Drag and drop or select your `dist` folder
6. Click **Deploy site**

## Custom Domain Setup

### Add a Custom Domain

1. In your Pages project dashboard, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow the DNS configuration instructions:
   - For apex domain: Add CNAME record pointing to `<project>.pages.dev`
   - For subdomain: Add CNAME record pointing to `<project>.pages.dev`

### SSL/TLS

Cloudflare automatically provisions SSL certificates for your custom domain. No additional configuration needed.

## Environment Variables

If your app uses environment variables:

1. Go to your Pages project settings
2. Navigate to **Environment variables**
3. Add production variables:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_APP_VERSION=1.0.0
   ```
4. Click **Save** and trigger a new deployment

## Build Configuration

### Optimize for Production

Ensure your `vite.config.ts` is optimized for production:

```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@vueuse/core', '@unocss/reset']
        }
      }
    }
  }
})
```

### PWA Configuration

The app already has PWA support configured. Cloudflare Pages will serve the service worker and manifest correctly.

## Deployment Hooks

### Automatic Deployments

With Git integration, every push to your main branch triggers a deployment automatically.

### Preview Deployments

Pull requests automatically get preview deployments at unique URLs like:
`https://<hash>.<project>.pages.dev`

### Manual Deployments

Trigger manual deployments from the Cloudflare dashboard or via Wrangler:

```bash
wrangler pages deploy dist --project-name=always-supplied --branch=production
```

## Monitoring and Analytics

### Enable Web Analytics

1. Go to your Pages project
2. Navigate to **Analytics**
3. Enable **Web Analytics**
4. Add the provided script to your app (usually in `index.html`)

### Check Build Logs

View deployment logs in the Cloudflare dashboard:
- **Deployments** tab shows all deployments
- Click on any deployment to see detailed logs
- Monitor build times and errors

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node version compatibility
   - Ensure all dependencies are in `package.json`
   - Review build logs for specific errors

2. **404 Errors on Routes**
   - Create `_redirects` file in `public/`:
     ```
     /* /index.html 200
     ```
   - This enables SPA routing

3. **Assets Not Loading**
   - Check `base` path in `vite.config.ts`
   - Ensure build output is in `dist` folder

4. **Environment Variables Not Working**
   - Use `VITE_` prefix for client-side variables
   - Rebuild after adding new variables

### Performance Tips

1. **Enable Cloudflare Caching**
   - Set appropriate cache headers
   - Use Page Rules for static assets

2. **Optimize Images**
   - Use Cloudflare Images or Image Resizing
   - Implement lazy loading

3. **Enable Compression**
   - Cloudflare automatically compresses responses
   - Ensure Brotli compression is enabled

## Rollback Deployments

If needed, roll back to a previous deployment:

1. Go to **Deployments** in your Pages project
2. Find the previous working deployment
3. Click **⋮** menu > **Rollback to this deployment**

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: always-supplied
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Useful Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Build Configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)
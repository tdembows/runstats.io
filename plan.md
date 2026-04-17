# Production Deployment Plan: AWS S3 Static Site

## Current State Assessment

- **Build Tool**: Vite 5.x (already configured)
- **Framework**: React 18.x
- **Package**: Single-package mono-repo with `node_modules` present
- **Missing**: Production optimization configs, CI/CD pipeline

---

## Phase 1: Production Build Configuration

### Task 1.1: Configure Vite for Production Minification

**File**: `vite.config.js`

**Actions Required**:
- Add `build.rollupOptions.output` with minify enabled (default in Vite, but explicit for production)
- Add `build.ssrfalse: true` if using SSR (not needed for static SPA)
- Configure `build.minify: 'esbuild'` for faster minification
- Add sourcemaps for debug builds during dev only: `build.sourcemap: false` in production

**Why**: Ensures all JS/CSS is minified and bundled for maximum performance in production.

### Task 1.2: Create Production Build Script

**File**: `scripts/build-production.sh` (or add to `package.json`)

**Content**:
```bash
#!/bin/bash
set -e

# Run production build
npm run build

# Move to dist/ folder
mv dist dist-build

# Verify build succeeded
if [ ! -d "dist-build/index.html" ]; then
  echo "ERROR: Build failed - dist/index.html not found"
  exit 1
fi

echo "✓ Production build complete: dist-build/"
```

**Why**: Standardizes production builds and provides verification step.

---

## Phase 2: Package Cleanup

### Task 2.1: Remove Development Dependencies

**Files to Update**: `package.json`

**Actions**:
- Mark `vite` (devDependency) for removal after migration to CI/CD
- Consider removing `node_modules` from git (`.gitignore` already has this, but verify)

**Why**: Production deployment only needs built artifacts, not dev tools.

### Task 2.2: Create .gitignore for Production

**File**: `.gitignore`

**Additions if missing**:
```
# Production artifacts
dist-build/
dist/*.js
dist/*.css
dist/*.map

# Local configuration
.local
.env.*
node_modules/

# Editor files
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
npm-debug.log*
```

**Why**: Prevents accidental commit of build artifacts and sensitive files.

---

## Phase 3: AWS S3 Deployment

### Task 3.1: Create AWS S3 Bucket

**Actions Required**:
1. Create a new bucket in `us-east-1` (no subdomain needed)
2. Enable static website hosting
3. Set bucket policy to allow public read access
4. Configure CloudFront distribution (recommended for DDoS protection)

**Why**: Static site needs to be publicly accessible and protected from attacks.

### Task 3.2: Configure CloudFront Distribution

**Configuration Required**:
- **Origin**: S3 bucket with custom domain (e.g., `runstats-io.s3.amazonaws.com`)
- **Origin Protocol Policy**: Redirect HTTP to HTTPS
- **Viewer Protocol Policy**: Redirect to HTTPS only
- **WAF Rules**: Implement basic rules against SQL injection and XSS

**Why**: CloudFront provides caching, DDoS protection, and SSL/TLS termination.

### Task 3.3: Deploy Build Artifacts to S3

**Actions Required**:
- Upload entire `dist-build/` directory to S3
- Set CORS headers on bucket policy
- Verify file permissions are public

**Why**: S3 needs to host the final static site files.

### Task 3.4: Configure Custom Domain

**Actions Required**:
- Enable custom domain `runstats.io` in CloudFront
- Point DNS CNAME to CloudFront distribution
- Verify SSL certificate is provisioned (e.g., Let's Encrypt)

**Why**: Professional presence with valid HTTPS.

---

## Phase 4: Monitoring & Health Checks

### Task 4.1: Create Health Check Endpoint

**File**: `src/check-health.jsx`

**Content**:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```
*Note: Create a minimal index.html endpoint or use CloudFront Lambda@Edge for custom health checks.*

**Why**: Verify deployment is working correctly.

### Task 4.2: Set Up Monitoring (optional but recommended)

**Options**:
- Sentry for error tracking
- CloudWatch Logs for application logs
- Pingdom or Uptime Robot for uptime monitoring

**Why**: Production sites need visibility into issues.

---

## Phase 5: Continuous Integration/Deployment

### Task 5.1: Create GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Content**:
```yaml
name: Deploy to S3

on:
  push:
    branches: [dev]
  pull_request:
    branches: [dev]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # For AWS STS assumption
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build

      - name: Upload artifacts to S3
        uses: AWS/aws-sdk-js-cli@v1
        with:
          aws-profile: deploy
          command: s3 cp -r dist-build/ s3://runstats-bucket/ --recursive

      - name: Invalidate CloudFront cache
        run: # Use cf-cli or CloudFormation to invalidate
        env:
          CLOUDFRONT_KEY: ${{ secrets.CLOUDFRONT_KEY }}

      - name: Notify on success
        run: curl -X POST ${{ secrets.SLACK_WEBHOOK }}
```

**Why**: Automates deployment pipeline from dev branch to production.

### Task 5.2: Configure AWS Credentials

**Actions Required**:
- Set up GitHub Actions `aws-actions/configure-aws-credentials@v4`
- Or use IAM role assumption in EC2/CloudFront
- Store credentials in AWS Secrets Manager

**Why**: Secure authentication for S3 uploads.

---

## Phase 6: Performance Optimization

### Task 6.1: Enable Brotli Compression

**File**: `vite.config.js`

**Add**:
```javascript
import { VitePWA, VitePWAPlugin } from 'vite-plugin-pwa'

export default defineConfig({
  // ... other config
  plugins: [VitePWAPlugin],
})
```

**Why**: Better compression for faster loading.

### Task 6.2: Optimize Images (if any)

**Actions Required**:
- Use `vite-plugin-imagemin` to compress images
- Serve WebP format where supported
- Implement responsive images

**Why**: Reduces bandwidth usage and improves performance.

---

## Phase 7: Security Hardening

### Task 7.1: Implement CSP Headers

**File**: `vite.config.js`

**Add**:
```javascript
export default defineConfig({
  // ...
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    }
  }
})
```

**Why**: Prevents XSS attacks and code injection.

### Task 7.2: Sanitize User Input (if any)

**Actions Required**:
- Review all input fields for validation
- Implement proper escape sequences
- Use sanitization libraries if needed

**Why**: Prevents XSS and injection attacks.

### Task 7.3: Remove Debug/Console.log Statements

**Files to Review**: `src/App.jsx`

**Actions**:
- Remove all console.log statements
- Remove console.error if not needed in production
- Keep production-ready code paths clean

**Why**: Clean code improves performance and security.

---

## Phase 8: Testing & Validation

### Task 8.1: Build Validation Script

**File**: `scripts/validate-build.js`

**Content**:
```bash
#!/bin/bash
# Check for common issues
node -e "
  const fs = require('fs');
  const dist = JSON.parse(fs.readFileSync('dist/package.json'));
  if (!dist.version) {
    console.error('ERROR: Missing version in package.json');
    process.exit(1);
  }
"
```

**Why**: Ensures build meets basic requirements before deployment.

---

## Summary

| Phase | Task | Status | Priority |
|-------|------|--------|----------|
| 1 | Configure Vite for production | ⏳ Pending | High |
| 2 | Remove dev dependencies | ⏳ Pending | Low |
| 3 | Create S3 bucket | ⏳ Pending | Critical |
| 3 | Configure CloudFront | ⏳ Pending | Critical |
| 3 | Deploy to S3 | ⏳ Pending | Critical |
| 4 | Health check | ⏳ Pending | Medium |
| 5 | GitHub Actions workflow | ⏳ Pending | High |
| 6 | Performance optimization | ⏳ Pending | Medium |
| 7 | Security hardening | ⏳ Pending | High |
| 8 | Build validation | ⏳ Pending | Medium |

---

## Next Steps

1. **Immediate**: Run `npm run build` to verify production build works
2. **Priority 1**: Create GitHub Actions workflow
3. **Priority 2**: Set up AWS infrastructure (S3 + CloudFront)
4. **Priority 3**: Security review of code (remove console.log, CSP, etc.)
5. **Final**: Test deployment and monitor for issues

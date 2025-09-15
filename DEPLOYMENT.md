# 🚀 Jinri Deployment Guide

Deploy **Jinri** - your smart news feed with AI summaries to free cloud platforms!

## Option 1: Railway (Recommended)

Railway is the easiest and most reliable free option.

### Step 1: Prepare Your Code

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/news-feed-backend.git
   git push -u origin main
   ```

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Railway will automatically detect it's a Node.js app**

### Step 3: Add Database

1. **In your Railway project dashboard:**
2. **Click "New" → "Database" → "PostgreSQL"**
3. **Railway will create a PostgreSQL database**
4. **Copy the `DATABASE_URL` from the database service**

### Step 4: Set Environment Variables

1. **Go to your app service in Railway**
2. **Click "Variables" tab**
3. **Add these environment variables:**
   ```
   NODE_ENV=production
   NEWS_API_KEY=dfff1b70ac824c66a499b0f9ecabb4de
   ```
4. **The `DATABASE_URL` is automatically set by Railway**

### Step 5: Deploy

1. **Railway will automatically deploy when you push to GitHub**
2. **Or click "Deploy" in the dashboard**
3. **Your app will be available at `https://your-app-name.railway.app`**

---

## Option 2: Render

### Step 1: Prepare for Render

1. **Create `render.yaml` in your project root:**
   ```yaml
   services:
     - type: web
       name: news-feed-backend
       env: node
       plan: free
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: NEWS_API_KEY
           value: dfff1b70ac824c66a499b0f9ecabb4de
   ```

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your GitHub repository**
5. **Select your repository**
6. **Render will auto-detect settings**

### Step 3: Add Database

1. **In Render dashboard:**
2. **Click "New" → "PostgreSQL"**
3. **Choose "Free" plan**
4. **Copy the connection details**

### Step 4: Set Environment Variables

1. **In your web service:**
2. **Go to "Environment" tab**
3. **Add:**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   NEWS_API_KEY=dfff1b70ac824c66a499b0f9ecabb4de
   ```

---

## Option 3: Fly.io

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Or download from https://fly.io/docs/hands-on/install-flyctl/
```

### Step 2: Create fly.toml

```toml
app = "your-app-name"
primary_region = "ord"

[build]

[env]
  NODE_ENV = "production"
  NEWS_API_KEY = "dfff1b70ac824c66a499b0f9ecabb4de"

[[services]]
  http_checks = []
  internal_port = 3000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### Step 3: Deploy

```bash
flyctl auth login
flyctl launch
flyctl deploy
```

---

## Database Setup

After deployment, you need to create the database schema:

### Option A: Using Railway/Render Console

1. **Go to your database service**
2. **Click "Query" or "Console"**
3. **Run the SQL from `database/schema.sql`**

### Option B: Using psql

```bash
# Get connection string from your platform
psql "your-database-url"

# Then run:
\i database/schema.sql
```

### Option C: Add to your app startup

Add this to your `server.js` to auto-create tables:

```javascript
// Add this after database connection
const fs = require('fs');
const path = require('path');

// Auto-create tables on startup
async function createTables() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database tables created successfully');
  } catch (error) {
    console.log('Tables may already exist or error creating:', error.message);
  }
}

// Call this after the database connection is established
createTables();
```

---

## Environment Variables Summary

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Port (auto-set by platform) | No |
| `DATABASE_URL` | Database connection string | Yes |
| `NEWS_API_KEY` | Your NewsAPI key | Yes |

---

## Troubleshooting

### Common Issues:

1. **Database connection fails:**
   - Check `DATABASE_URL` is set correctly
   - Ensure database is created and running

2. **App crashes on startup:**
   - Check all environment variables are set
   - Look at the platform logs

3. **No articles loading:**
   - Check NewsAPI key is correct
   - Verify database has the articles table

### Getting Help:

- **Railway**: Check logs in dashboard
- **Render**: Check logs in dashboard
- **Fly.io**: `flyctl logs`

---

## Cost Comparison

| Platform | Free Tier | Database | Custom Domain |
|----------|-----------|----------|---------------|
| Railway | $5 credit/month | ✅ Included | ✅ Free |
| Render | 750 hours/month | ✅ Addon | ✅ Free |
| Fly.io | 3 small VMs | ✅ Addon | ✅ Free |

**Recommendation: Start with Railway - it's the easiest!**

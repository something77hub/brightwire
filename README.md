# ☀️ BrightWire - Good News Daily

An AI-powered positive news aggregator built with Nuxt 3. Automatically scrapes news from 54+ RSS feeds, uses Claude AI to filter for positive stories and rewrite them, then serves full articles on your own site — keeping users away from doom-scrolling.

**Live Demo:** [brightwire.news](https://www.brightwire.news)

---

## Features

- 🤖 **AI-Powered** — Claude AI classifies headlines (score 45+) and rewrites articles in your voice
- 📰 **54+ RSS Feeds** — BBC, NPR, Guardian, Good News Network, Science Daily, and more
- 🖼️ **Image CDN** — Images proxied through Cloudinary
- 📧 **Newsletter Ready** — Beehiiv integration + RSS feed for daily digests
- 🔍 **Search** — Full-text search across all articles
- 🎨 **Beautiful Design** — Warm, editorial aesthetic
- ⚙️ **Admin Dashboard** — Manage articles, settings, and trigger fetches
- ⏰ **Fully Automated** — Inngest cron runs every 15 minutes
- 💰 **Ad Management** — Self-managed ads + Google Ad Manager fallback
- ✏️ **Rich Text Editor** — Tiptap editor with markdown support for articles
- 📱 **Social Media Integration** — Download packages or post directly via Ayrshare
- 🔔 **Real-time Updates** — Pusher notifications when new articles arrive
- 🧹 **Auto-Cleanup** — Old articles (>7 days) automatically deleted

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Tech Stack & Costs](#tech-stack--costs)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Deploy to Vercel](#deploy-to-vercel)
6. [Admin Dashboard](#admin-dashboard)
7. [Social Media Sharing](#social-media-sharing)
8. [Newsletter Setup (Beehiiv)](#newsletter-setup-beehiiv)
9. [Real-time Updates (Pusher)](#real-time-updates-pusher)
10. [Caching Strategy](#caching-strategy)
11. [Advertising & Monetization](#advertising--monetization)
12. [Customization](#customization)
13. [Troubleshooting](#troubleshooting)

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EVERY 15 MINUTES (Inngest)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  54+ RSS    │────▶│   Filter    │────▶│  Claude AI  │────▶│   MongoDB   │
│   Feeds     │     │  Last 48h   │     │  Score 45+  │     │   Store     │
│             │     │  New Only   │     │  Rewrite    │     │   Article   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                         ┌─────────────────────────────────────────┼──────────┐
                         │                                         │          │
                         ▼                                         ▼          ▼
                  ┌─────────────┐                          ┌─────────────┐  ┌─────────┐
                  │  RSS Feed   │                          │  Your Site  │  │ Pusher  │
                  │  /feed.xml  │                          │  /article/  │  │ Notify  │
                  └─────────────┘                          └─────────────┘  └─────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Beehiiv    │
                  │   Daily     │
                  │   Digest    │
                  └─────────────┘
```

### Article Lifecycle

| Stage | What Happens |
|-------|--------------|
| **Fetch** | RSS feeds scanned, only articles from last 48 hours accepted |
| **Filter** | Skip duplicates (by GUID), skip articles with negative keywords |
| **Classify** | Claude AI scores headlines 0-100, only 45+ pass |
| **Rewrite** | Claude rewrites full article in positive tone |
| **Store** | Saved to MongoDB with category, tags, images |
| **Notify** | Pusher sends real-time notification to connected clients |
| **Cleanup** | Articles older than 7 days auto-deleted |

---

## Tech Stack & Costs

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Hosting | Free |
| **MongoDB Atlas** | Database | Free (512MB) |
| **Anthropic Claude** | AI Classification & Rewriting | ~$10-30/mo |
| **Cloudinary** | Image CDN & Proxy | Free (25GB) |
| **Inngest** | Background Jobs & Cron | Free (25k runs/mo) |
| **Mailerlite** | Newsletter | Free (1,000 subs) |
| **Formspree** | Contact/Submit Forms | Free (50/mo) |
| **Google Analytics** | Website Analytics | Free |
| **CookieYes** | Cookie Consent (GDPR) | Free (25k views/mo) |
| **Pusher** | Real-time Updates | Free (200k messages/day) |
| **Ayrshare** | Social Media Posting (optional) | $29/mo |
| **Google Ad Manager** | Programmatic Ads (optional) | Free (<90M impressions) |

**Total: $10-30/month** (only Claude API costs money, Ayrshare optional)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd brightwire
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Configure Required Variables

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/brightwire
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_SECRET=your-secure-admin-password

# Optional but recommended
CLOUDINARY_CLOUD_NAME=your-cloud-name
SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Run Inngest Dev Server (for background jobs)

In a new terminal:

```bash
npx inngest-cli@latest dev
```

### 6. Trigger First Fetch

Go to [http://localhost:3000/admin](http://localhost:3000/admin), login with your `ADMIN_SECRET`, and click **"Fetch News Now"**.

---

## Environment Variables

```env
# ============================================
# REQUIRED
# ============================================

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/brightwire

# Anthropic API key for Claude AI
ANTHROPIC_API_KEY=sk-ant-...

# Admin dashboard password
ADMIN_SECRET=your-secure-admin-password

# ============================================
# INNGEST (Auto-configured via Vercel integration)
# ============================================

# These are automatically set when you connect Inngest via Vercel
# INNGEST_EVENT_KEY=xxx
# INNGEST_SIGNING_KEY=xxx

# ============================================
# REAL-TIME UPDATES (Optional - Pusher)
# ============================================

# Get from https://pusher.com
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=us2

# ============================================
# SOCIAL MEDIA (Optional - Ayrshare)
# ============================================

# Get from https://ayrshare.com ($29/mo)
AYRSHARE_API_KEY=

# ============================================
# NEWSLETTER (Optional - Mailerlite)
# ============================================

# Get from https://dashboard.mailerlite.com
MAILERLITE_API_KEY=eyJ0eXAiOiJKV1Qi...
MAILERLITE_GROUP_ID=175213952374933349

# ============================================
# OPTIONAL
# ============================================

# Cloudinary cloud name for image proxying
CLOUDINARY_CLOUD_NAME=your-cloud-name

# Your production URL
SITE_URL=https://brightwire.news

# Google Ad Manager (for programmatic ads)
GAM_NETWORK_CODE=12345678
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your repository
4. Add environment variables (Settings → Environment Variables)
5. Deploy

### 3. Connect Inngest

1. Go to [Vercel Marketplace](https://vercel.com/integrations/inngest)
2. Add Inngest integration to your project
3. Inngest keys are automatically configured
4. The cron job runs every 15 minutes automatically

### 4. Update SITE_URL

After deployment, update `SITE_URL` to your Vercel URL.

---

## Admin Dashboard

Access at `/admin` (login with your `ADMIN_SECRET`)

### Features

| Section | Features |
|---------|----------|
| **Dashboard** | Stats, category distribution, quick actions, recent articles |
| **Articles** | View, edit, delete articles, bulk actions |
| **Ads** | Create/manage self-hosted ads with budgets and tracking |
| **Social Media** | Download packages or post directly to social platforms |
| **Settings** | Site name, social links, SEO meta, author info |

### Quick Actions

| Button | What It Does |
|--------|--------------|
| **Fetch News Now** | Triggers immediate RSS fetch + AI processing |
| **Fix Categories** | Re-classifies all articles with AI |
| **Manage Articles** | Go to article list |
| **Social Media** | Share articles to social platforms |
| **Delete All & Re-fetch** | Clears database and fetches fresh |

---

## Social Media Sharing

Two ways to share articles to social media:

### Option 1: Download Package (Free)

1. Go to Admin → Social Media
2. Select articles to share
3. Click "Download Package"
4. Get a ZIP with:
   - Pre-sized images for each platform
   - Ready-to-paste captions with hashtags
   - Article links

**Image sizes included:**

| File | Platform |
|------|----------|
| `twitter_facebook_1200x630.jpg` | Twitter, Facebook |
| `instagram_square_1080x1080.jpg` | Instagram Feed (square) |
| `instagram_portrait_1080x1350.jpg` | Instagram Feed (portrait) |
| `instagram_story_1080x1920.jpg` | Stories (IG, FB, TikTok) |
| `linkedin_1200x627.jpg` | LinkedIn |

### Option 2: Ayrshare Integration ($29/mo)

Post directly to multiple platforms from admin:

1. Sign up at [ayrshare.com](https://ayrshare.com)
2. Connect your social accounts
3. Add `AYRSHARE_API_KEY` to Vercel
4. Select articles → Click "Post to Social" → Choose platforms → Done!

**Supported platforms:** Twitter/X, Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Telegram, Pinterest, Threads, Bluesky

---

## Real-time Updates (Pusher)

Get instant notifications when new articles arrive:

### Setup

1. Create account at [pusher.com](https://pusher.com) (free tier: 200k messages/day)
2. Create a new Channels app
3. Add to Vercel:
   ```env
   PUSHER_APP_ID=your-app-id
   PUSHER_KEY=your-key
   PUSHER_SECRET=your-secret
   PUSHER_CLUSTER=us2
   ```

### How It Works

- When new articles are saved, Pusher sends notification
- Homepage shows toast: "3 new stories available"
- Click to refresh and see new content
- Falls back to 2-minute polling if Pusher not configured

---

## Caching Strategy

BrightWire uses smart caching to balance freshness and performance:

| Page/API | Cached? | Duration | Why |
|----------|---------|----------|-----|
| Homepage `/` | ❌ No | - | Needs fresh stories |
| Today `/today` | ❌ No | - | Needs fresh stories |
| Category pages | ❌ No | - | Needs fresh stories |
| Article pages `/article/*` | ✅ Yes | 1 hour | Content doesn't change |
| OG Images | ✅ Yes | 24 hours | Static assets |
| Logo | ✅ Yes | 30 days | Static assets |

**API Cache Headers:**
- `/api/stories` - No cache
- `/api/today` - No cache
- `/api/category/*` - No cache

This ensures visitors always see the latest articles on refresh.

---

## Newsletter Setup (Mailerlite)

### 1. Create Mailerlite Account

Go to [mailerlite.com](https://www.mailerlite.com) and sign up (free up to 1,000 subscribers).

### 2. Get API Credentials

1. Go to Integrations → API → Generate new token
2. Copy your **API Key**

### 3. Create Subscriber Group

1. Go to Subscribers → Groups → Create group
2. Name it "BrightWire Newsletter"
3. Click into the group - **Group ID** is in the URL

### 4. Add to Vercel

```env
MAILERLITE_API_KEY=eyJ0eXAiOiJKV1Qi...
MAILERLITE_GROUP_ID=175213952374933349
```

### 5. Set Up RSS-to-Email (Automated Daily Digest)

1. Go to **Campaigns** → **Create campaign** → **RSS campaign**
2. Add RSS feed: `https://www.brightwire.news/feed.xml`
3. Set schedule: Daily at 8:00 AM
4. Design your email template
5. Activate!

---

## RSS Sources (54 Feeds)

Organized into 6 categories:

| Category | Count | Examples |
|----------|-------|----------|
| **Positive News** | 13 | Good News Network, Positive News, Reasons to be Cheerful, Upworthy |
| **Science & Innovation** | 13 | Science Daily, Phys.org, Freethink, MIT Tech Review |
| **Environment** | 12 | Grist, CleanTechnica, Electrek, Mongabay |
| **Human Interest** | 5 | Bored Panda Good News, Mental Floss, Inspire More |
| **Mainstream (Filtered)** | 6 | BBC News, Guardian Science, HuffPost Good News |
| **YouTube** | 5 | Some Good News, Daily Dose Of Internet, Great Big Story |

---

## Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| `good-news` | ☀️ | General feel-good stories |
| `heroes` | 🦸 | People making a difference |
| `planet` | 🌍 | Environment wins, climate progress |
| `innovation` | 🚀 | Tech breakthroughs, discoveries |
| `solutions` | 💡 | Systemic fixes, effective programs |
| `kindness` | 💛 | Acts of kindness, compassion |

---

## Troubleshooting

### "No articles appearing"

1. Check Inngest dashboard: [app.inngest.com](https://app.inngest.com)
2. Check Vercel function logs
3. Manually trigger fetch from Admin dashboard
4. Click "Delete All & Re-fetch" to start fresh

### "Homepage not updating after fetch"

- Hard refresh browser (Ctrl+Shift+R)
- No caching on homepage - should show fresh immediately
- Verify articles exist in Admin → Articles

### "Images not loading"

- Set your own `CLOUDINARY_CLOUD_NAME`
- Check Cloudinary dashboard for usage limits

### "Social media download missing images"

- Some images blocked by origin servers
- ZIP includes `image_error.txt` with URL for manual download
- Use Ayrshare for automatic image handling

### "Pusher notifications not working"

- Verify all 4 Pusher env vars are set
- Falls back to 2-minute polling if not configured

---

## Advertising

See `docs/GOOGLE_AD_MANAGER_SETUP.md` for complete setup.

### Self-Managed Ads (100% Revenue)
Create in Admin → Ads with budget and impression tracking.

### Google Ad Manager (Fallback)
Add `GAM_NETWORK_CODE` for programmatic ads when no self-managed ad exists.

---

## License

MIT

---

Built with ☀️ for a brighter world.

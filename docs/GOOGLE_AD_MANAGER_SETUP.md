# Google Ad Manager (GAM) Setup Guide for BrightWire

## Overview

BrightWire supports a **hybrid ad system**:
1. **Self-managed ads** - Direct deals you manage in `/admin/ads` (100% revenue)
2. **Google Ad Manager** - Programmatic ads as fallback (~68% revenue)

Self-managed ads always take priority. GAM only shows when no self-managed ad is available.

---

## Quick Start (5 Minutes)

### 1. Create GAM Account
Go to [admanager.google.com](https://admanager.google.com) → Sign up (free for <90M impressions/month)

### 2. Get Network Code
**Admin** → **Global Settings** → Copy "Network code" (e.g., `12345678`)

### 3. Add to Environment
```env
GAM_NETWORK_CODE=12345678
```

### 4. Create Ad Units
Go to **Inventory** → **Ad units** → **New ad unit**

Create these (names must match exactly):

| Name | Sizes to Add |
|------|--------------|
| `sidebar` | 300x250, 300x600, 336x280 |
| `article_bottom` | 728x90, 300x250, 336x280, 320x50 |
| `header_banner` | 970x90, 970x250, 728x90, 320x50 |
| `article_top` | 728x90, 300x250, 320x50 |
| `in_feed` | 300x250, 336x280 |
| `category_header` | 728x90, 320x50 |

### 5. Deploy
That's it! GAM ads will now fill any placement without a self-managed ad.

---

## Controlling What Ads Show

### Block Categories
**Admin** → **Protections** → **Ad content**

Block categories like:
- Gambling & betting
- Adult content
- Political ads
- Dating
- Alcohol
- And 30+ more categories

### Block Specific Advertisers
**Admin** → **Protections** → **Advertiser URLs**

Add domains to block:
```
competitor.com
annoying-brand.com
```

### Set Price Floors
**Admin** → **Protections** → **Pricing rules**

Set minimum CPM (e.g., $2.00) - rejects low-paying ads

### Review Individual Ads
**Protections** → **Ad review center**

- See all ads before they run
- Block specific creatives
- Approve/reject individual ads

---

## Revenue Priority

```
┌─────────────────────────────────────────┐
│ 1. SELF-MANAGED ADS (Your /admin/ads)   │
│    ✅ 100% revenue to you               │
│    ✅ Full control over content         │
│    ✅ Direct sponsor relationships      │
└─────────────────────────────────────────┘
                    ↓ (if none available)
┌─────────────────────────────────────────┐
│ 2. GOOGLE AD MANAGER                    │
│    💰 ~68% revenue (Google takes ~32%)  │
│    🎯 Category & advertiser blocking    │
│    📊 Detailed analytics                │
└─────────────────────────────────────────┘
                    ↓ (if no fill)
┌─────────────────────────────────────────┐
│ 3. NOTHING (div collapses)              │
└─────────────────────────────────────────┘
```

---

## Pre-Configured Placements

The code automatically configures responsive sizes for each placement:

### Sidebar (`sidebar`)
```
Desktop (1024px+): 300x250 or 300x600
Tablet (768px+):   300x250
Mobile:            Hidden
```

### Header Banner (`header_banner`)
```
Desktop (1024px+): 970x90 or 970x250
Tablet (728px+):   728x90
Mobile:            320x50
```

### Article Bottom (`article_bottom`)
```
Desktop (728px+):  728x90 or 300x250
Mobile:            300x250 or 320x50
```

---

## Connecting AdSense (Recommended)

To get programmatic demand:

1. Go to **Admin** → **Linked accounts**
2. Link your **Google AdSense** account
3. Go to **Inventory** → **Ad units** → Select each unit
4. Enable "AdSense backfill"

This ensures you always have ads to show (even if low-paying).

---

## Testing

### Enable Debug Console
Add `?google_console=1` to any URL:
```
https://brightwire.news/?google_console=1
```

### Check Browser Console
Look for:
```
[GAM] Google Publisher Tag initialized with network: 12345678
[GAM] Defined slot: /12345678/sidebar [300, 250]
```

### Test with Sample Ads
In GAM, create a "House" campaign with test creatives to verify placements work.

---

## FAQ

### Q: Can I pick exactly which ads show?
**A:** Not for programmatic ads - that's the tradeoff. But you can:
- Block entire categories
- Block specific advertisers
- Set minimum prices
- Review and reject individual ads

For full control, use self-managed ads in `/admin/ads`.

### Q: Will GAM slow down my site?
**A:** Minimal impact because:
- Ads are lazy-loaded (only load when scrolling near)
- Empty divs collapse (no layout shift)
- Single request mode (one call for all ads)

### Q: What if I don't want GAM at all?
**A:** Just don't set `GAM_NETWORK_CODE`. Only self-managed ads will show.

### Q: How do I earn more from GAM?
**A:** 
- Add more demand sources (header bidding)
- Optimize ad placements (above the fold pays more)
- Increase traffic quality (engaged users = higher CPMs)

---

## Need Help?

- [Google Ad Manager Help Center](https://support.google.com/admanager)
- [GPT Developer Docs](https://developers.google.com/publisher-tag)
- [Ad Manager Community](https://support.google.com/admanager/community)

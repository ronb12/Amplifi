# AdSense Configuration Guide

## Your AdSense Credentials

**Publisher ID:** `pub-3565666509316178`  
**Customer ID:** `4925311126`

## Setup Instructions

### 1. Update HTML Files

Replace `ca-pub-YOUR_ADSENSE_PUBLISHER_ID` with `ca-pub-3565666509316178` in these files:
- `public/upload.html`
- `public/feed.html` 
- `public/live.html`

### 2. Create Ad Units

In your AdSense dashboard, create the following ad units and update the configuration:

#### Banner Ad Unit
- **Ad Unit ID:** `ca-pub-3565666509316178/your-banner-ad-unit-id`
- **Format:** Banner
- **Size:** Responsive

#### Interstitial Ad Unit  
- **Ad Unit ID:** `ca-pub-3565666509316178/your-interstitial-ad-unit-id`
- **Format:** Interstitial

#### In-Article Ad Unit
- **Ad Unit ID:** `ca-pub-3565666509316178/your-in-article-ad-unit-id`
- **Format:** In-Article

#### In-Feed Ad Unit
- **Ad Unit ID:** `ca-pub-3565666509316178/your-in-feed-ad-unit-id`
- **Format:** In-Feed

### 3. Update Configuration Files

Once you have your ad unit IDs, update these files:
- `public/js/adsense-config.js`
- `public/app.js`

Replace the placeholder IDs with your actual ad unit IDs.

### 4. Environment Variables (Optional)

For production deployment, consider using environment variables:

```bash
ADSENSE_PUBLISHER_ID=pub-3565666509316178
ADSENSE_CUSTOMER_ID=4925311126
ADSENSE_BANNER_ID=ca-pub-3565666509316178/your-actual-banner-id
ADSENSE_INTERSTITIAL_ID=ca-pub-3565666509316178/your-actual-interstitial-id
```

## Security Notes

- The Publisher ID and Customer ID are public and safe to include in client-side code
- Ad unit IDs should be kept secure in production environments
- Use environment variables for sensitive configuration in production

## Testing

1. Deploy to Firebase Hosting
2. Check browser console for AdSense loading
3. Verify ads appear on pages
4. Monitor AdSense dashboard for impressions

## Support

For AdSense issues, check:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Policy Center](https://support.google.com/adsense/answer/48182)
- [AdSense Implementation Guide](https://support.google.com/adsense/answer/9261309) 
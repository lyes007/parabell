# Meta Pixel Setup Guide for Para Bell E-commerce

This guide will help you set up Meta Pixel (Facebook Pixel) on your Para Bell e-commerce site to track user interactions and optimize your Facebook/Instagram advertising campaigns.

## 🚀 Quick Setup

### 1. Get Your Meta Pixel ID

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Events Manager** > **Data Sources** > **Pixels**
3. Create a new pixel or use an existing one
4. Copy your **Pixel ID** (it looks like: `123456789012345`)

### 2. Add Environment Variable

Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here
```

Replace `your_pixel_id_here` with your actual Meta Pixel ID.

### 3. Deploy Your Changes

The Meta Pixel is now integrated and will automatically start tracking events when you deploy your site.

## 📊 Tracked Events

Your Para Bell site now tracks the following Meta Pixel events:

### Core E-commerce Events

- **PageView** - Tracks when users visit any page
- **ViewContent** - Tracks when users view product pages
- **AddToCart** - Tracks when users add products to cart
- **RemoveFromCart** - Tracks when users remove products from cart
- **InitiateCheckout** - Tracks when users start the checkout process
- **Purchase** - Tracks when users complete a purchase

### Event Data Included

Each event includes relevant product information:
- Product ID and name
- Price and currency
- Category and brand
- Quantity (for cart events)
- Order total (for purchase events)

## 🔧 Advanced Configuration

### Custom Events

You can track custom events using the `metaPixelEvents` utility:

```typescript
import { metaPixelEvents } from '@/components/meta-pixel'

// Track a custom event
metaPixelEvents.trackCustomEvent('NewsletterSignup', {
  method: 'footer_form',
  value: 0,
  currency: 'TND'
})

// Track lead generation
metaPixelEvents.trackLead(50, 'TND')

// Track search
metaPixelEvents.trackSearch('vitamin c', 15)
```

### Using the Hook

For easier integration in components:

```typescript
import { useMetaPixel } from '@/components/meta-pixel'

function MyComponent() {
  const { trackCustomEvent, trackLead } = useMetaPixel()
  
  const handleNewsletterSignup = () => {
    trackLead()
    // Your signup logic here
  }
}
```

## 🧪 Testing Your Implementation

### 1. Facebook Pixel Helper

Install the [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension to verify events are firing correctly.

### 2. Events Manager

1. Go to **Events Manager** > **Test Events**
2. Enter your website URL
3. Browse your site and perform actions (view products, add to cart, etc.)
4. Verify events appear in real-time

### 3. Browser Console

Open your browser's developer console and look for Meta Pixel logs. You should see events being tracked.

## 📈 Optimization Tips

### 1. Enhanced Matching

Enable Enhanced Matching in your Meta Pixel settings to improve attribution accuracy.

### 2. Custom Conversions

Create custom conversions in Events Manager for specific actions:
- High-value purchases (>$100)
- Newsletter signups
- Product category views

### 3. Lookalike Audiences

Use your pixel data to create lookalike audiences:
- Website visitors
- Add to cart users
- Purchase completers

### 4. Dynamic Product Ads

Set up Dynamic Product Ads to retarget users with products they viewed or added to cart.

## 🔒 Privacy Considerations

### GDPR Compliance

- Ensure you have proper consent mechanisms
- Consider using Meta's Consent Mode
- Update your privacy policy to mention pixel tracking

### Data Processing

- Meta Pixel automatically processes data according to Meta's Data Processing Terms
- Review Meta's Business Tools Terms for your region

## 🚨 Troubleshooting

### Common Issues

1. **Pixel not loading**
   - Check your environment variable is set correctly
   - Verify the pixel ID is valid
   - Check browser console for errors

2. **Events not firing**
   - Ensure you're testing on the live site (not localhost)
   - Check that the pixel is properly initialized
   - Verify event tracking code is in the right components

3. **Duplicate events**
   - Check for multiple pixel implementations
   - Ensure events aren't being triggered multiple times

### Debug Mode

Enable debug mode in Events Manager to see detailed event information and troubleshoot issues.

## 📞 Support

For technical issues:
- Check [Meta's Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel/)
- Use [Meta's Business Help Center](https://www.facebook.com/business/help)

For implementation questions:
- Review the code in `components/meta-pixel.tsx`
- Check the cart context integration in `lib/cart-context.tsx`

## 🎯 Next Steps

1. Set up your Meta Pixel ID
2. Test the implementation
3. Create your first Facebook/Instagram ad campaign
4. Set up custom conversions
5. Create lookalike audiences
6. Implement Dynamic Product Ads

Your Para Bell e-commerce site is now ready for advanced Facebook advertising with comprehensive event tracking!

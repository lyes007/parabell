# Brand Logos Directory

This directory contains the brand logos for the Para Bell e-commerce website.

## Current Brand Logos

The following brand logos are configured and ready to be replaced with actual logo files:

1. **Forte Pharma** - `forte-pharma-logo.png`
   - Red banner with white "F" and black rectangle with red line
   - Should have transparent background

2. **Dermedic** - `dermedic-logo.png`
   - Should have transparent background and include brand name

3. **Clinic Way** - `clinic-way-logo.png`
   - "CLINIC WAY" text in dark pink/magenta
   - Should have transparent background

4. **Lirene** - `lirene-logo.png`
   - "Lirene" with "DERMOPROGRAM" sub-brand
   - Dark blue text with light blue/grey stripes
   - Should have transparent background

5. **MiraDent** - `miradent-logo.png`
   - Teal-blue circle with black "X" and magenta/purple arcs
   - "miradent" text with "oral care system" tagline
   - Should have transparent background

6. **Pharmaceris** - `pharmaceris-logo.png`
   - Should have transparent background and include brand name

## How to Replace Logos

1. **Replace the placeholder files** in this directory with the actual logo images
2. **Keep the same filenames** as listed above
3. **Ensure transparent backgrounds** for best visual integration
4. **Recommended format**: PNG with transparency
5. **Recommended size**: 200x150px or similar aspect ratio (4:3)

## Logo Display Features

The logos are displayed on the brands page with the following features:
- **Responsive grid layout** (1-4 columns based on screen size)
- **Hover effects** with scaling and color transitions
- **Gradient backgrounds** that complement the brand colors
- **Smooth animations** for professional appearance
- **Clickable cards** that link to individual brand pages

## Database Configuration

The logo URLs are stored in the database and can be updated using:
```bash
npx tsx scripts/update-brand-logos.ts
```

## Testing

To test the brand logos, visit:
- **Brands Page**: http://localhost:3000/brands
- **API Endpoint**: http://localhost:3000/api/brands

The logos will automatically appear once the placeholder files are replaced with actual logo images.

# HTML Structure for Scroll-Driven Video

## 📋 Detailed Steps:

### 1. Create the Component File
- File: `components/HeroScrollVideo.tsx`
- ✅ Created with proper TypeScript support

### 2. Add the Client Directive
- ✅ Added `'use client';` at the very top
- Required for React hooks and browser APIs

### 3. The Scroll Track Container
- **Purpose**: Creates a scrollable area much taller than viewport
- **Height**: `300vh` (3 times viewport height)
- **Position**: `relative`
- **Function**: Provides the "scroll track" for the sticky effect

### 4. The Sticky Wrapper
- **Purpose**: Stays fixed in viewport while parent scrolls
- **Position**: `sticky`
- **Top**: `0` (sticks to top of viewport)
- **Height**: `100vh` (full viewport height)
- **Width**: `100%` (full width)

### 5. The Video Element
- **Source**: `/hero-video.mp4`
- **Poster**: `/video-poster.jpg`
- **Attributes**:
  - `playsInline` - Essential for iOS autoplay
  - `preload="auto"` - Hints browser to start loading
  - `muted` - Essential for autoplay in most browsers
- **Styling**: `width: 100%, height: 100%, objectFit: cover`

## ✅ Do's:
- ✅ Create parent container significantly taller than 100vh (300vh)
- ✅ Set `position: sticky` on direct child of scrollable container
- ✅ Set `position: sticky` with `top: 0` for proper sticking
- ✅ Ensure video is `muted`, `playsInline`, and has `preload="auto"`
- ✅ Use `objectFit: cover` for proper video scaling

## ❌ Don'ts:
- ❌ Apply sticky positioning to the tall "scroll track" container
- ❌ Forget to set `top: 0` for the sticky element
- ❌ Try to autoplay video with sound
- ❌ Make the video element itself 300vh tall

## 🚨 Common Mistakes:
- **Wrong video height**: Video should always be 100vh, not 300vh
- **Sticky element clipping**: Parent elements with `overflow: hidden` break sticky
- **Incorrect nesting**: Sticky element must be direct child of scrollable container
- **Missing position value**: Sticky needs `top: 0` to know where to stick

## HTML Structure Breakdown:

```html
<!-- Scroll Track Container (300vh tall) -->
<div style="height: 300vh; position: relative;">
  
  <!-- Sticky Wrapper (100vh, sticks to top) -->
  <div style="position: sticky; top: 0; height: 100vh; width: 100%;">
    
    <!-- Video Element (fills sticky wrapper) -->
    <video
      src="/hero-video.mp4"
      poster="/video-poster.jpg"
      playsInline
      preload="auto"
      muted
      style="width: 100%; height: 100%; object-fit: cover;"
    />
    
  </div>
</div>
```

## How It Works:
1. **Scroll Track**: The 300vh container creates scrollable space
2. **Sticky Behavior**: The 100vh wrapper "sticks" to viewport top
3. **Video Display**: Video fills the sticky wrapper (100vh)
4. **Scroll Effect**: As user scrolls through 300vh, video stays in view
5. **Ready for Logic**: Structure is ready for scroll-driven video playback

## Next Steps:
- Add React refs for video element and container
- Implement scroll progress tracking
- Connect scroll position to video playback time
- Add content overlays and animations

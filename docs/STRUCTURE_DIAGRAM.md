# Scroll-Driven Video Structure Diagram

## Visual Representation:

```
┌─────────────────────────────────────────────────────────────┐
│                    VIEWPORT (100vh)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              STICKY WRAPPER (100vh)                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              VIDEO ELEMENT                  │   │   │
│  │  │                                             │   │   │
│  │  │        /hero-video.mp4                      │   │   │
│  │  │        poster="/video-poster.jpg"           │   │   │
│  │  │        playsInline muted preload="auto"     │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│                    SCROLL TRACK (300vh)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              STICKY WRAPPER (100vh)                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              VIDEO ELEMENT                  │   │   │
│  │  │                                             │   │   │
│  │  │        Video stays in viewport              │   │   │
│  │  │        while user scrolls                   │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              STICKY WRAPPER (100vh)                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │              VIDEO ELEMENT                  │   │   │
│  │  │                                             │   │   │
│  │  │        Video continues to play              │   │   │
│  │  │        frame by frame                       │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Relationships:

### 1. Scroll Track Container
- **Height**: 300vh (3x viewport height)
- **Position**: relative
- **Purpose**: Creates scrollable space

### 2. Sticky Wrapper
- **Height**: 100vh (viewport height)
- **Position**: sticky, top: 0
- **Purpose**: Stays fixed in viewport

### 3. Video Element
- **Size**: 100% width, 100% height
- **Object-fit**: cover
- **Purpose**: Fills sticky wrapper

## Scroll Behavior:

```
User Scroll Position    Video Playback
────────────────────    ──────────────
0% (top)               → Frame 0 (start)
25%                    → Frame 25%
50%                    → Frame 50%
75%                    → Frame 75%
100% (bottom)          → Frame 100% (end)
```

## CSS Properties Breakdown:

```css
/* Scroll Track */
.scroll-track {
  height: 300vh;           /* 3x viewport height */
  position: relative;      /* Establishes positioning context */
}

/* Sticky Wrapper */
.sticky-wrapper {
  position: sticky;        /* Sticks to viewport */
  top: 0;                  /* Sticks to top of viewport */
  height: 100vh;           /* Full viewport height */
  width: 100%;             /* Full width */
}

/* Video Element */
.video-element {
  width: 100%;             /* Fill container width */
  height: 100%;            /* Fill container height */
  object-fit: cover;       /* Scale to cover, maintain aspect ratio */
}
```

## Browser Compatibility:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (with playsInline)
- ✅ Mobile: Full support (with playsInline and muted)

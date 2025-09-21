# Video Assets Directory

## Required Files:
- `hero-video.mp4` - Main video file (optimized, under 10MB)
- `video-poster.jpg` - Poster image (high-quality frame from video)

## File Specifications:

### hero-video.mp4:
- **Format**: MP4
- **Codec**: H.264 (x264)
- **Resolution**: 1920x1080 (1080p)
- **Framerate**: 30 or 60 FPS
- **Duration**: 5-10 seconds
- **Size**: Under 10MB (ideally under 5MB)
- **Quality**: Constant Quality (RF 22-24)
- **Web Optimized**: Yes (metadata at beginning)

### video-poster.jpg:
- **Format**: JPG or WebP
- **Resolution**: 1920x1080
- **Size**: Under 500KB
- **Content**: High-quality frame from video
- **Purpose**: Placeholder while video loads

## Optimization Tools:
- **HandBrake**: Free GUI tool for video compression
- **FFmpeg**: Command-line tool for advanced optimization
- **TinyPNG**: Online tool for image compression

## Implementation:
Once files are placed here, update `components/hero-section.tsx` to import and use `HeroScrollVideo` component.

## Testing:
- Test on mobile devices
- Check loading performance
- Verify smooth scroll-driven playback
- Ensure poster image displays correctly

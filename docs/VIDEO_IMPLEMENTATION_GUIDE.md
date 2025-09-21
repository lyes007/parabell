# Scroll-Driven Video Hero Section Implementation Guide

## Task 1: Asset Preparation and Optimization

### 📋 Detailed Steps:

#### 1. Choose the Right Clip
- Select a video clip that works well when scrubbed
- **Ideal content**: Slow, smooth, continuous motions
  - Product rotating
  - Liquid pouring
  - Ingredients growing
  - Gentle camera movements
- **Avoid**: Fast cuts, shaky footage, or rapid scene changes

#### 2. Trim and Edit
- Cut video to exact length needed
- **Recommended duration**: 5-10 seconds
- Ensure smooth loop points if needed

#### 3. Resolution Optimization
- **Target resolution**: 1920x1080 (1080p)
- **Avoid**: 4K videos (overkill for web)
- **Mobile consideration**: 1080p works well on most devices

#### 4. Compression Settings
- **Tool**: HandBrake (free) or ffmpeg
- **Codec**: H.264 (x264)
- **Format**: .mp4
- **Framerate**: 30 or 60 FPS
  - 60 FPS = smoother scrubbing, larger file
  - 30 FPS = smaller file, still smooth
- **Quality**: Constant Quality setting (RF 22-24 in HandBrake)
- **Web Optimized**: Enable this setting

#### 5. File Size Targets
- **Ideal**: Under 5MB
- **Maximum**: Under 10MB
- **Critical**: Never use raw, uncompressed files

#### 6. Poster Image Creation
- Export high-quality frame from video
- **Format**: .jpg or .webp
- **Compression**: Use TinyPNG or similar
- **Purpose**: Placeholder while video loads

#### 7. File Placement
- **Video**: `/public/hero-video.mp4`
- **Poster**: `/public/video-poster.jpg`
- **Never**: Import as JS modules

### ✅ Do's:
- Aim for final video size under 10MB, ideally under 5MB
- Use H.264 codec in .mp4 container
- Place assets in /public folder
- Enable "Web Optimized" setting
- Create a poster image
- Test on mobile devices

### ❌ Don'ts:
- Use raw, uncompressed video files
- Use formats like .mov or .avi
- Import video as JS modules
- Use 4K videos for web
- Forget the poster attribute
- Place assets in wrong folders

### 🚨 Common Mistakes:
- Using massive 4K, 100MB videos
- Forgetting poster attribute (causes blank/black box)
- Placing assets in /src or /app folders
- Not optimizing for mobile performance

## Next Steps:
1. Prepare your video assets following these guidelines
2. Place optimized files in `/public/` directory
3. Implement the scroll-driven video component
4. Test performance and user experience

## File Structure:
```
public/
├── hero-video.mp4      # Optimized video file
└── video-poster.jpg    # Poster image
```

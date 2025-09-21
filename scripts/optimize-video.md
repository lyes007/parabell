# Video Optimization Scripts

## Using FFmpeg (Command Line)

### Basic Optimization
```bash
ffmpeg -i input-video.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart hero-video.mp4
```

### Advanced Optimization for Web
```bash
ffmpeg -i input-video.mp4 \
  -c:v libx264 \
  -crf 22 \
  -preset slow \
  -profile:v high \
  -level 4.0 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  hero-video.mp4
```

### Extract Poster Frame
```bash
ffmpeg -i hero-video.mp4 -ss 00:00:01 -vframes 1 -q:v 2 video-poster.jpg
```

## Using HandBrake (GUI)

### Recommended Settings:
- **Format**: MP4
- **Codec**: H.264 (x264)
- **Quality**: Constant Quality (RF 22-24)
- **Framerate**: 30 or 60 FPS
- **Resolution**: 1920x1080
- **Web Optimized**: ✅ Enabled
- **Audio**: AAC, 128kbps

## File Size Targets:
- **Ideal**: Under 5MB
- **Acceptable**: Under 10MB
- **Maximum**: Under 15MB

## Testing Commands:
```bash
# Check file size
ls -lh public/hero-video.mp4

# Check video info
ffprobe -v quiet -print_format json -show_format -show_streams public/hero-video.mp4
```

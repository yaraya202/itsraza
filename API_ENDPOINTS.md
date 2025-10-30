# API Endpoints Documentation

## Base URL
```
http://localhost:5000
```
Or your deployed URL (e.g., `https://your-app.replit.dev`)

---

## 1. Search Videos

**Endpoint:** `/api/search`

**Method:** `GET`

**Query Parameters:**
- `q` (required) - Search query string

**Example Request:**
```
GET /api/search?q=saiyaara
```

**Example Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "VIDEO_ID",
      "title": "Video Title",
      "thumbnail": "https://...",
      "channel": "Channel Name",
      "duration": "4:30",
      "views": "1M views",
      "uploadDate": "2 days ago"
    }
  ]
}
```

**cURL Example:**
```bash
curl "http://localhost:5000/api/search?q=saiyaara"
```

---

## 2. Download Audio

**Endpoint:** `/api/download/audio`

**Method:** `GET`

**Query Parameters:**
- `url` (required) - Full YouTube video URL

**Example Request:**
```
GET /api/download/audio?url=https://www.youtube.com/watch?v=VIDEO_ID
```

**Response:**
- Returns audio file stream (format depends on YouTube source: mp4, webm, etc.)
- Headers include `Content-Disposition` for automatic download with correct file extension
- Mime type matches the actual audio format

**cURL Example:**
```bash
curl "http://localhost:5000/api/download/audio?url=https://youtu.be/Hl-qE48I8fo" -o audio.mp4
```

**Browser Example:**
```javascript
window.open('/api/download/audio?url=https://youtu.be/Hl-qE48I8fo', '_blank');
```

---

## 3. Download Video (MP4)

**Endpoint:** `/api/download/video`

**Method:** `GET`

**Query Parameters:**
- `url` (required) - Full YouTube video URL

**Example Request:**
```
GET /api/download/video?url=https://www.youtube.com/watch?v=VIDEO_ID
```

**Response:**
- Returns video file stream (MP4 format)
- Headers include `Content-Disposition` for automatic download

**cURL Example:**
```bash
curl "http://localhost:5000/api/download/video?url=https://youtu.be/Hl-qE48I8fo" -o video.mp4
```

**Browser Example:**
```javascript
window.open('/api/download/video?url=https://youtu.be/Hl-qE48I8fo', '_blank');
```

---

## Error Responses

All endpoints return JSON error responses:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error (download/search failed)

---

## Testing Examples

### Test Search:
```bash
curl "http://localhost:5000/api/search?q=saiyaara"
```

### Test Audio Download:
```bash
curl "http://localhost:5000/api/download/audio?url=https://youtu.be/Hl-qE48I8fo" -o test_audio.mp4
```

### Test Video Download:
```bash
curl "http://localhost:5000/api/download/video?url=https://youtu.be/Hl-qE48I8fo" -o test_video.mp4
```

---

## Notes

1. **URL Encoding**: Always encode the YouTube URL in query parameters
2. **CORS**: CORS is enabled for all origins
3. **File Names**: Downloaded files use the video title as filename
4. **Audio Format**: Audio downloads are in the native YouTube format (typically mp4 or webm), not transcoded to MP3
5. **File Extensions**: The server automatically detects and applies the correct file extension based on the actual format
6. **Supported URLs**: 
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - Short URLs with query parameters are also supported

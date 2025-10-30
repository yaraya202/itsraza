# YouTube Search & Download API

## Overview
A Python Flask-based web application that allows users to search for YouTube videos and download them as audio (MP3) or video (MP4) files. The application features a clean, modern interface with a purple gradient design and provides three backend API endpoints.

## Project Architecture

### Technology Stack
- **Backend**: Python 3.11 with Flask
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **YouTube Search**: youtube-search-python (no API key required)
- **YouTube Download**: pytubefix (actively maintained)
- **CORS**: flask-cors for cross-origin requests
- **Production Server**: Gunicorn

### File Structure
```
.
├── main.py              # Flask server with API endpoints
├── public/
│   └── index.html       # Frontend web interface
├── requirements.txt     # Python dependencies
├── pyproject.toml       # Project metadata
├── API_ENDPOINTS.md     # API documentation
└── replit.md           # Project documentation
```

## API Endpoints

### 1. Search Endpoint
- **URL**: `/api/search`
- **Method**: GET
- **Query Parameters**: `q` (search query)
- **Response**: JSON array of top 10 video results with metadata
- **Example**: `/api/search?q=Saiyaara`

### 2. Audio Download Endpoint
- **URL**: `/api/download/audio`
- **Method**: GET
- **Query Parameters**: `url` (YouTube video URL)
- **Response**: Audio file stream (MP3)
- **Example**: `/api/download/audio?url=https://youtu.be/CcoKjQK9QIA`

### 3. Video Download Endpoint
- **URL**: `/api/download/video`
- **Method**: GET
- **Query Parameters**: `url` (YouTube video URL)
- **Response**: Video file stream (MP4)
- **Example**: `/api/download/video?url=https://youtu.be/CcoKjQK9QIA`

## Features
- Search for YouTube videos with real-time results
- Display top 10 search results with thumbnails, titles, and metadata
- Download audio (MP3) or video (MP4) with one click
- Responsive design that works on desktop and mobile
- No API key required for searching
- Clean, modern UI with gradient background
- CORS enabled for cross-origin requests

## Deployment

### Replit Deployment
The application is configured for Replit's Autoscale deployment:
- **Run Command**: `python main.py`
- **Port**: 5000 (bound to 0.0.0.0 for external access)
- **Deployment Type**: Autoscale

### Vercel Deployment
The project can be deployed to Vercel using the `vercel.json` configuration.

### Render Deployment
The project can be deployed to Render using the included configuration.

### Manual Deployment
```bash
pip install -r requirements.txt
python main.py
```

### Production Deployment
```bash
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 main:app
```

## Dependencies
- `Flask==3.0.0` - Web framework
- `flask-cors==4.0.0` - Enable CORS
- `pytubefix==10.1.1` - YouTube video downloader
- `youtube-search-python==1.6.6` - YouTube search without API key
- `httpx==0.27.2` - HTTP client (pinned for compatibility)
- `gunicorn==21.2.0` - Production WSGI server

## Testing
- **Search test**: "Saiyaara"
- **Download test URL**: https://youtu.be/CcoKjQK9QIA

## Recent Changes
- **October 30, 2025**: Migrated from Node.js to Python
  - Converted to Flask-based backend
  - Fixed httpx compatibility issues
  - Updated to latest pytubefix for YouTube downloads
  - Configured for multi-platform deployment
  - Created comprehensive API documentation

## User Preferences
- Language: Hindi/English mix
- Framework: Python-only (Flask)
- Deployment: Multi-platform (Replit, Vercel, Render, etc.)

# YouTube Search & Download Application

## Overview
A Node.js-based web application that allows users to search for YouTube videos and download them as audio or video files. The application features a clean, modern interface with a purple gradient design and provides three backend API endpoints for search and download functionality.

## Project Architecture

### Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **YouTube Search**: youtube-search-api (no API key required)
- **YouTube Download**: @distube/ytdl-core (actively maintained fork)
- **CORS**: Enabled for cross-origin requests

### File Structure
```
.
├── index.js              # Express server with API endpoints
├── public/
│   └── index.html        # Frontend web interface
├── package.json          # Node.js dependencies and scripts
└── replit.md            # Project documentation
```

## API Endpoints

### 1. Search Endpoint
- **URL**: `/api/search`
- **Method**: GET
- **Query Parameters**: `q` (search query)
- **Response**: JSON array of top 10 video results with metadata
- **Example**: `/api/search?q=saiyaara`

### 2. Audio Download Endpoint
- **URL**: `/api/download/audio`
- **Method**: GET
- **Query Parameters**: `url` (YouTube video URL)
- **Response**: Audio file stream (MP3)
- **Example**: `/api/download/audio?url=https://youtu.be/Hl-qE48I8fo`

### 3. Video Download Endpoint
- **URL**: `/api/download/video`
- **Method**: GET
- **Query Parameters**: `url` (YouTube video URL)
- **Response**: Video file stream (MP4)
- **Example**: `/api/download/video?url=https://youtu.be/Hl-qE48I8fo`

## Features
- Search for YouTube videos with real-time results
- Display top 10 search results with thumbnails, titles, and metadata
- Download audio (MP3) or video (MP4) with one click
- Responsive design that works on desktop and mobile
- No API key required for searching
- Clean, modern UI with gradient background

## Deployment

### Replit Deployment
The application is configured for Replit's Autoscale deployment:
- **Run Command**: `node index.js`
- **Port**: 5000 (bound to 0.0.0.0 for external access)
- **Deployment Type**: Autoscale (automatically adjusts resources)

### Manual Deployment
The application can be deployed anywhere Node.js is supported:
```bash
npm install
npm start
```

## Recent Changes
- **October 30, 2025**: Initial project setup
  - Created Express.js server with three API endpoints
  - Implemented YouTube search functionality
  - Added audio and video download capabilities
  - Created responsive frontend interface
  - Configured Replit deployment settings

## Dependencies
- `express`: ^5.1.0 - Web framework
- `@distube/ytdl-core`: ^4.16.12 - YouTube video downloader
- `youtube-search-api`: ^2.0.1 - YouTube search without API key
- `cors`: ^2.8.5 - Enable CORS
- `@types/node`: ^22.13.11 - TypeScript type definitions

## Testing
- Search test query: "saiyaara"
- Download test URL: https://youtu.be/Hl-qE48I8fo?si=qecGVJ3NOoLJNJlL

## User Preferences
- Language: Hindi/English mix
- Framework: Node.js only (no Python)
- Deployment: Should work anywhere (Replit, Heroku, etc.)

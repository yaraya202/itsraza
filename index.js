
const express = require('express');
const cors = require('cors');
const youtubesearchapi = require('youtube-search-api');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;

const execAsync = promisify(exec);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await youtubesearchapi.GetListByKeyword(query, false, 10);

    const videos = results.items.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail.thumbnails[0].url,
      channel: item.channelTitle,
      duration: item.length?.simpleText || 'N/A',
      views: item.viewCount?.text || 'N/A',
      uploadDate: item.uploadDate || 'N/A'
    }));

    res.json({ success: true, videos });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

app.get('/api/download/audio', async (req, res) => {
  try {
    const videoUrl = req.query.url;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const videoIdMatch = videoUrl.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    const videoId = videoIdMatch[1];

    // Get video info first
    const { stdout: infoJson } = await execAsync(
      `yt-dlp --dump-json "https://www.youtube.com/watch?v=${videoId}"`
    );
    
    const info = JSON.parse(infoJson);
    const title = info.title.replace(/[^\w\s]/gi, '').substring(0, 100);

    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    // Stream audio directly
    const ytdlp = exec(
      `yt-dlp -f bestaudio -o - "https://www.youtube.com/watch?v=${videoId}" | ffmpeg -i pipe:0 -f mp3 -ab 192k pipe:1`,
      { maxBuffer: 1024 * 1024 * 50 }
    );

    ytdlp.stdout.pipe(res);

    ytdlp.on('error', (err) => {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

    ytdlp.on('exit', (code) => {
      if (code !== 0 && !res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Audio download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download audio. Please try again.' });
    }
  }
});

app.get('/api/download/video', async (req, res) => {
  try {
    const videoUrl = req.query.url;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const videoIdMatch = videoUrl.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    const videoId = videoIdMatch[1];

    // Get video info first
    const { stdout: infoJson } = await execAsync(
      `yt-dlp --dump-json "https://www.youtube.com/watch?v=${videoId}"`
    );
    
    const info = JSON.parse(infoJson);
    const title = info.title.replace(/[^\w\s]/gi, '').substring(0, 100);

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.header('Content-Type', 'video/mp4');

    // Stream video directly
    const ytdlp = exec(
      `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o - "https://www.youtube.com/watch?v=${videoId}"`,
      { maxBuffer: 1024 * 1024 * 100 }
    );

    ytdlp.stdout.pipe(res);

    ytdlp.on('error', (err) => {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

    ytdlp.on('exit', (code) => {
      if (code !== 0 && !res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Video download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download video. Please try again.' });
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

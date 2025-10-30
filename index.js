
const express = require('express');
const cors = require('cors');
const youtubesearchapi = require('youtube-search-api');
const path = require('path');

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

    const Innertube = require('youtubei.js');
    
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);
    
    const title = info.basic_info.title.replace(/[^\w\s]/gi, '').substring(0, 100);
    
    const format = info.chooseFormat({ 
      type: 'audio',
      quality: 'best'
    });

    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    const stream = await info.download({ 
      type: 'audio',
      quality: 'best',
      format: 'mp3'
    });

    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Download error:', err);
      if (!res.headersSent) {
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



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

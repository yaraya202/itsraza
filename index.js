const express = require('express');
const cors = require('cors');
const { Innertube, Platform } = require('youtubei.js');
const youtubesearchapi = require('youtube-search-api');
const path = require('path');

Platform.shim.eval = async (data, env) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;
  return new Function(code)();
};

const app = express();
const PORT = 5000;

let youtube = null;

async function getYouTubeClient() {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
}

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

    const yt = await getYouTubeClient();
    const info = await yt.getInfo(videoId);
    
    const title = info.basic_info.title.replace(/[^\w\s]/gi, '');
    
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    
    if (!format || !format.decipher) {
      return res.status(500).json({ error: 'Could not find suitable audio format' });
    }

    const url = await format.decipher(yt.session.player);

    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    response.body.pipe(res);

  } catch (error) {
    console.error('Audio download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download audio: ' + error.message });
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

    const yt = await getYouTubeClient();
    const info = await yt.getInfo(videoId);
    
    const title = info.basic_info.title.replace(/[^\w\s]/gi, '');
    
    const format = info.chooseFormat({ type: 'video+audio', quality: 'best' });
    
    if (!format || !format.decipher) {
      return res.status(500).json({ error: 'Could not find suitable video format' });
    }

    const url = await format.decipher(yt.session.player);

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.header('Content-Type', 'video/mp4');

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    response.body.pipe(res);

  } catch (error) {
    console.error('Video download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download video: ' + error.message });
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

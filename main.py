
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import yt_dlp
import io
import re
import os

app = Flask(__name__, static_folder='public')
CORS(app)

# Path to cookies file
COOKIES_FILE = 'cookies.txt'

# yt-dlp options
def get_ydl_opts(download_type='audio', quality='360p'):
    opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'nocheckcertificate': True,
        'no_color': True,
        # Let yt-dlp automatically choose best working client - this bypasses YouTube restrictions
    }
    
    # Add cookies if file exists  
    if os.path.exists(COOKIES_FILE):
        opts['cookiefile'] = COOKIES_FILE
    
    if download_type == 'audio':
        # Download best audio and convert to M4A with AAC codec at 128kbps
        opts['format'] = 'bestaudio/best'
        opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
            'preferredquality': '128',
        }]
        # Ensure final output is M4A
        opts['outtmpl'] = 'temp_audio.%(ext)s'
        opts['postprocessor_args'] = [
            '-ar', '44100',  # Sample rate 44.1kHz
            '-ac', '2',      # Stereo
        ]
    else:
        # Accept any video format for specified quality
        if quality == '360p':
            opts['format'] = 'worst[height<=360]/best[height<=360]/best[height<=480]/best'
        elif quality == '720p':
            opts['format'] = 'best[height<=720]/best[height<=1080]/best'
        else:
            opts['format'] = 'best'
    
    return opts

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/search', methods=['GET'])
def search_videos():
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        # Use yt-dlp for searching - don't use extract_flat to get thumbnails
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'extract_flat': 'in_playlist',
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_results = ydl.extract_info(f'ytsearch10:{query}', download=False)
            
            videos = []
            if search_results and 'entries' in search_results:
                for item in search_results['entries']:
                    if item:
                        # Get best thumbnail
                        thumbnail_url = ''
                        if item.get('thumbnails'):
                            thumbnail_url = item['thumbnails'][-1].get('url', '')
                        elif item.get('thumbnail'):
                            thumbnail_url = item['thumbnail']
                        
                        # Fallback to YouTube thumbnail URL
                        if not thumbnail_url and item.get('id'):
                            thumbnail_url = f"https://i.ytimg.com/vi/{item['id']}/mqdefault.jpg"
                        
                        videos.append({
                            'id': item.get('id', ''),
                            'title': item.get('title', 'Unknown'),
                            'thumbnail': thumbnail_url,
                            'channel': item.get('uploader', item.get('channel', 'Unknown')),
                            'duration': format_duration(item.get('duration', 0)),
                            'views': format_views(item.get('view_count', 0)),
                            'uploadDate': item.get('upload_date', 'N/A')
                        })

        return jsonify({'success': True, 'videos': videos})
    except Exception as e:
        print(f'Search error: {e}')
        return jsonify({'error': 'Failed to search videos'}), 500

def format_duration(seconds):
    if not seconds:
        return 'N/A'
    minutes, secs = divmod(int(seconds), 60)
    hours, minutes = divmod(minutes, 60)
    if hours > 0:
        return f'{hours}:{minutes:02d}:{secs:02d}'
    return f'{minutes}:{secs:02d}'

def format_views(views):
    if not views:
        return 'N/A'
    if views >= 1000000:
        return f'{views/1000000:.1f}M views'
    elif views >= 1000:
        return f'{views/1000:.1f}K views'
    return f'{views} views'

@app.route('/api/download/audio', methods=['GET'])
def download_audio():
    try:
        video_url = request.args.get('url')
        if not video_url:
            return jsonify({'error': 'Video URL is required'}), 400

        ydl_opts = get_ydl_opts('audio')
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            title = re.sub(r'[^\w\s-]', '', info['title'])[:100]
            
            # After post-processing, the file will be temp_audio.m4a
            filename = 'temp_audio.m4a'
            
            # Read file into memory
            with open(filename, 'rb') as f:
                buffer = io.BytesIO(f.read())
            
            # Delete temp file
            if os.path.exists(filename):
                os.remove(filename)
            
            buffer.seek(0)
            
            return Response(
                buffer,
                mimetype='audio/m4a',
                headers={
                    'Content-Disposition': f'attachment; filename="{title}.m4a"'
                }
            )
    except Exception as e:
        print(f'Audio download error: {e}')
        return jsonify({'error': f'Failed to download audio: {str(e)}'}), 500

@app.route('/api/download/video', methods=['GET'])
def download_video():
    try:
        video_url = request.args.get('url')
        if not video_url:
            return jsonify({'error': 'Video URL is required'}), 400
        
        # Get quality parameter - default 360p for API, 720p for web page
        quality = request.args.get('quality', '360p')
        
        # Validate quality
        if quality not in ['360p', '720p']:
            quality = '360p'

        ydl_opts = get_ydl_opts('video', quality)
        ydl_opts['outtmpl'] = 'temp_video.%(ext)s'
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            filename = ydl.prepare_filename(info)
            title = re.sub(r'[^\w\s-]', '', info['title'])[:100]
            
            # Read file into memory
            with open(filename, 'rb') as f:
                buffer = io.BytesIO(f.read())
            
            # Delete temp file
            if os.path.exists(filename):
                os.remove(filename)
            
            buffer.seek(0)
            # Get actual file extension from downloaded file
            file_ext = filename.split('.')[-1]
            
            return Response(
                buffer,
                mimetype=f'video/{file_ext}',
                headers={
                    'Content-Disposition': f'attachment; filename="{title}.{file_ext}"'
                }
            )
    except Exception as e:
        print(f'Video download error: {e}')
        return jsonify({'error': f'Failed to download video: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

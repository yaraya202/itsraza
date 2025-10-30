
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from pytubefix import YouTube
from youtubesearchpython import VideosSearch
import io
import re
import os

app = Flask(__name__, static_folder='public')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/search', methods=['GET'])
def search_videos():
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        videos_search = VideosSearch(query, limit=10)
        results = videos_search.result()

        videos = []
        for item in results['result']:
            videos.append({
                'id': item['id'],
                'title': item['title'],
                'thumbnail': item['thumbnails'][0]['url'] if item.get('thumbnails') else '',
                'channel': item.get('channel', {}).get('name', 'Unknown'),
                'duration': item.get('duration', 'N/A'),
                'views': item.get('viewCount', {}).get('short', 'N/A'),
                'uploadDate': item.get('publishedTime', 'N/A')
            })

        return jsonify({'success': True, 'videos': videos})
    except Exception as e:
        print(f'Search error: {e}')
        return jsonify({'error': 'Failed to search videos'}), 500

@app.route('/api/download/audio', methods=['GET'])
def download_audio():
    try:
        video_url = request.args.get('url')
        if not video_url:
            return jsonify({'error': 'Video URL is required'}), 400

        yt = YouTube(video_url)
        stream = yt.streams.filter(only_audio=True).first()
        
        if not stream:
            return jsonify({'error': 'No audio stream available'}), 404

        # Get the actual mime type and file extension from the stream
        mime_type = stream.mime_type or 'audio/mp4'
        file_extension = stream.subtype or 'mp4'
        
        # Safe filename with correct extension
        title = re.sub(r'[^\w\s-]', '', yt.title)[:100]
        
        # Download to memory
        buffer = io.BytesIO()
        stream.stream_to_buffer(buffer)
        buffer.seek(0)

        return Response(
            buffer,
            mimetype=mime_type,
            headers={
                'Content-Disposition': f'attachment; filename="{title}.{file_extension}"'
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

        yt = YouTube(video_url)
        stream = yt.streams.filter(progressive=True, file_extension='mp4').get_highest_resolution()
        
        if not stream:
            return jsonify({'error': 'No video stream available'}), 404

        # Safe filename
        title = re.sub(r'[^\w\s-]', '', yt.title)[:100]
        
        # Download to memory
        buffer = io.BytesIO()
        stream.stream_to_buffer(buffer)
        buffer.seek(0)

        return Response(
            buffer,
            mimetype='video/mp4',
            headers={
                'Content-Disposition': f'attachment; filename="{title}.mp4"'
            }
        )
    except Exception as e:
        print(f'Video download error: {e}')
        return jsonify({'error': f'Failed to download video: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

import json
import yt_dlp
import os
import dropbox
import glob
from flask import Flask, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


ydl_opts = {
    'format': 'bestaudio/best',
    'output': '/tmp',
}


def get_filename():
    list_of_files = glob.glob('/tmp/*') # * means all if need specific format then *.csv
    latest_file = max(list_of_files, key=os.path.getctime)
    print(latest_file)
    return latest_file


def get_mp3(query):
    # Change directory so yt-dlp can write
    os.chdir('/tmp')
    
    # Print yt-dlp version
    print('Using the following version:')
    print(yt_dlp.version.__version__)
    
    # Download with options
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([query])
        
        # Get the filename with path, then without path
        filename = get_filename()
        split_filename = filename.split('/')[2]
        
        # Get a safe filename for dropbox (ascii only)
        safe_filename = "/" + str(split_filename.encode('utf-8').decode('ascii', 'ignore'))
        
        # Once that's done, upload to dropbox
        dbx = dropbox.Dropbox(os.environ.get("DROPBOX_KEY"))
        print('dropbox ok')
        with open(filename, 'rb') as f:
            dbx.files_upload(f.read(), path=safe_filename)
        
        # Return success    
        return {
            'statusCode': 200,
            'body': json.dumps({"event": 'ok', "url": query})
        }


@app.route('/', methods=['GET'])
def index():
    q = request.args.get('q', default = "", type = str)

    if q == "":
        return 'No query provided'
    else:
        return get_mp3(q)


if __name__ == '__main__':
    app.run(debug=False)
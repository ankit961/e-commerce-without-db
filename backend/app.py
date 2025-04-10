from flask import Flask, request, jsonify,Response, send_from_directory
from uuid import uuid4
from collections import defaultdict
import os

app = Flask(__name__)


# === Serve Frontend Files ===

FRONTEND_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')



# === Run App ===

if __name__ == '__main__':
    app.run(debug=True)

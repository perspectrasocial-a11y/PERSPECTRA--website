"""Preview the website at http://localhost:8000."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    print("PERSPECTRA preview: http://localhost:8000")
    ThreadingHTTPServer(("127.0.0.1", 8000), partial(SimpleHTTPRequestHandler, directory=str(root))).serve_forever()

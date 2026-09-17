import os
import sys
from livereload import Server

root = sys.argv[1]
# Prefer the PORT injected by the preview harness (autoPort); fall back to the CLI arg, then 8743.
port = int(os.environ.get("PORT") or (sys.argv[2] if len(sys.argv) > 2 else 8743))

server = Server()
server.watch(root + '/**/*.html')
server.watch(root + '/css/*.css')
server.watch(root + '/js/*.js')
server.watch(root + '/assets/**/*')
server.serve(root=root, port=port, host='0.0.0.0', debug=False)

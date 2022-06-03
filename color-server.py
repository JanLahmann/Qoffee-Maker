from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import subprocess

HOSTNAME = "localhost"
PORT = 8884

DEFAULT_COLOR = "blue"
BACK_TO_DEFAULT_TIMEOUT = 2000.0

def set_color(color):
    if color == "blue":
        subprocess.call(["sudo", "python3", "/home/pi/RasQberry/demos/bin/RasQ-LED-display.py", "1"*128])
    elif color == "red": 
        subprocess.call(["sudo", "python3", "/home/pi/RasQberry/demos/bin/RasQ-LED-display.py", "0"*128])
    else:
        subprocess.call(["sudo", "python3", "/home/pi/RasQberry/demos/bin/RasQ-LED-display.py", "0", "-c"])
    return True

class RasqberryColorServer(BaseHTTPRequestHandler):
    def do_GET(self):
        # always return good status code
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        # set color
        set_color(self.path.replace("/", ""))
        time.sleep(BACK_TO_DEFAULT_TIMEOUT / 1000)
        set_color(DEFAULT_COLOR)
        

if __name__ == "__main__":        
    webServer = HTTPServer((HOSTNAME, PORT), RasqberryColorServer)
    print("Server started http://%s:%s" % (HOSTNAME, PORT))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
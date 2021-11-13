#!/bin/bash
#
echo; echo; echo "Qoffee-Maker"
cd ~

[ -f /home/pi/nohup.out ] && rm -f /home/pi/nohup.out
setsid nohup chromium-browser --start-fullscreen --enable-webgl --ignore-gpu-blacklist  http://localhost:8887/notebooks/qoffee.ipynb &
sleep 6

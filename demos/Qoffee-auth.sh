#!/bin/bash
#
echo; echo; echo "Qoffee-Maker API authorization"
cd ~

[ -f /home/pi/nohup.out ] && rm -f /home/pi/nohup.out
setsid nohup chromium-browser  --enable-webgl --ignore-gpu-blacklist  http://localhost:8887/auth &
sleep 6

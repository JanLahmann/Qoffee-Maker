#!/bin/bash
#
echo; echo; echo "start jupyter notebook for Qoffee-Maker"
cd /home/pi/Qoffee-Maker

[ -f /home/pi/nohup.out ] && rm -f /home/pi/nohup.out
setsid nohup jupoyter notebook &
sleep 6

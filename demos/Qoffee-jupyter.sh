#!/bin/bash
#
echo; echo; echo "start/stop jupyter notebook for Qoffee-Maker"
cd /home/pi/Qoffee-Maker

if [ -f /home/pi/Qoffee-Maker/.is_running_jupyter ]; then
  kill -15 `cat /home/pi/Qoffee-Maker/.is_running_jupyter`
  rm /home/pi/Qoffee-Maker/.is_running_jupyter
else
  [ -f /home/pi/nohup.out ] && rm -f /home/pi/nohup.out
  setsid nohup jupyter notebook qoffee.ipynb &
  echo $! > /home/pi/Qoffee-Maker/.is_running_jupyter
  sleep 6
fi

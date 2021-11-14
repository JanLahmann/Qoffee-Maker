# Qoffee-Maker

### Installation on RasQberry (draft):
#### Install RasQberry (system update, initial config, Qiskit latest, "Config & Demos" (for Jupyter environment) and enable vnc in raspi-config)
```
pip install getgist
.local/bin/getgist JanLahmann RasQ-init.sh
. ./RasQ-init.sh

pip3 install numpy==1.21.* # vor qiskit install

sudo apt -y install matchbox-keyboard
mkdir  /home/pi/.matchbox/
cp /usr/share/matchbox-keyboard/keyboard.xml /home/pi/.matchbox/
mkdir -p /home/pi/.config/pcmanfm/LXDE-pi/
cp /home/pi/RasQberry/bin/rq_desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf

```
(reboot)

#### Install Qoffee-Maker:
```
git clone https://github.com/JanLahmann/Qoffee-Maker
cp -R /home/pi/Qoffee-Maker/desktop-icons/* /home/pi/.local/share/applications/
cp -R /home/pi/Qoffee-Maker/desktop-icons/* /home/pi/Desktop/

cd Qoffee-Maker/
pip3 install ibm_quantum_widgets jupyter_packaging python-dotenv
jupyter nbextension enable --py widgetsnbextension
jupyter nbextension enable --py ibm_quantum_widgets

pip3 install ./qoffeeapi

cd appwidgets/
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt-get install -y nodejs

npm install yarn  # cf output of previous command
#npm install --no-package-lock yarn
#curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
#echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
#sudo apt-get update && sudo apt-get install yarn

node_modules/yarn/bin/yarn build:prod
cd ..
pip3 install ./appwidgets
jupyter nbextension install --user  --overwrite --py appwidgets
jupyter nbextension enable appwidgets --user --py
jupyter nbextension install ./qoffeefrontend --user
jupyter nbextension enable qoffeefrontend/app

vi .env
cp .env ../.local/lib/

jupyter notebook
http://localhost:8887/auth
http://localhost:8887/
```


#### Update of the Qoffee-Maker app

cd Qoffee-Maker/
git fetch --all
git reset --hard HEAD
git pull origin

pip3 install ./qoffeeapi

cd appwidgets/
node_modules/yarn/bin/yarn build:prod
cd ..
pip3 install ./appwidgets

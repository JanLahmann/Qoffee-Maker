# Qoffee-Maker

### Installation on RasQberry (draft):
#### Install RasQberry (with Qiskit 0.29, "Config & Demos" (for Jupyter environment) and enable vnc)
```
pip install getgist
.local/bin/getgist JanLahmann RasQ-init.sh
. ./RasQ-init.sh

sudo apt -y install matchbox-keyboard
cp -R /home/pi/RasQberry/desktop-icons/* /home/pi/.local/share/applications/

```
(reboot)

#### Install Qoffee-Maker:
```
git clone https://github.com/JanLahmann/Qoffee-Maker
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

# alternatively:
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install --no-install-recommends -y yarn # install yarn only
sudo apt install -y yarn # install with node.js

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

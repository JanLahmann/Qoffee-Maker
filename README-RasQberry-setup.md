# Qoffee-Maker

### Installation on RasQberry (draft):
#### Install RasQberry (with Qiskit 0.29, "Config & Demos" (for Jupyter environment) and enable vnc)
```
pip install getgist
.local/bin/getgist JanLahmann RasQ-init.sh
. ./RasQ-init.sh
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




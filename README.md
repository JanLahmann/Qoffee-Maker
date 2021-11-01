# Qoffee-Maker

Installation on RasQberry (draft; will be improved):
1. setup RasQberry with Qiskit 0.31, "Bloch Autostart" (for VNC and screen config) and "Config & Demos" (for Jupyter environment)
1. git clone https://github.com/JanLahmann/Qoffee-Maker
2. connect via vnc:2 to the raspberry; or remote connection to jupyter server
3. cd Qoffee-Maker/
4. pip3 install appmode dotenv
5. jupyter nbextension enable --py --user appmode
7. jupyter serverextension enable --py --user appmode
8. jupyter notebook qoffee.ipynb
9. (... to be continued ...)

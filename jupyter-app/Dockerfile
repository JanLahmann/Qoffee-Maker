FROM jupyter/base-notebook:latest

WORKDIR /home/jovyan/work

# setup python environment
COPY requirements.txt .
RUN pip install -r requirements.txt && \
    jupyter nbextension enable --py widgetsnbextension && \
    jupyter nbextension enable --py ibm_quantum_widgets

# install extensions
COPY qoffee-extension qoffee-extension
RUN jupyter nbextension install ./qoffee-extension --user && \
    jupyter nbextension enable qoffee-extension/reactive && \
    jupyter nbextension enable qoffee-extension/app && \
    jupyter nbextension enable qoffee-extension/qoffee

# copy notebooks
COPY *.ipynb .








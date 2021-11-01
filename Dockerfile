FROM node:14 AS build-frontend

COPY appwidgets appwidgets
RUN cd appwidgets && \
    npm install yarn && \
    yarn build:prod



FROM jupyter/base-notebook:latest

WORKDIR /home/jovyan/work

COPY jupyter_notebook_config.py /home/jovyan/.jupyter/jupyter_notebook_config.py

# setup python environment
RUN pip install ibm_quantum_widgets jupyter_packaging && \
    jupyter nbextension enable --py widgetsnbextension && \
    jupyter nbextension enable --py ibm_quantum_widgets

COPY qoffeeapi qoffeeapi
RUN pip install ./qoffeeapi --user

COPY --from=build-frontend /appwidgets appwidgets
RUN pip install ./appwidgets --user && \
    jupyter nbextension install --sys-prefix --overwrite --py appwidgets && \
    jupyter nbextension enable --sys-prefix --py appwidgets

COPY qoffeefrontend qoffeefrontend
RUN jupyter nbextension install ./qoffeefrontend --user && \
    jupyter nbextension enable qoffeefrontend/app 

EXPOSE 8887

COPY css css
COPY *.ipynb .


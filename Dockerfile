FROM node:14 AS build-frontend

COPY appwidgets appwidgets
RUN cd appwidgets && \
    npm install yarn && \
    yarn build:prod



FROM jupyter/base-notebook:notebook-6.4.5

WORKDIR /home/jovyan/work

COPY jupyter_notebook_config.py /home/jovyan/.jupyter/jupyter_notebook_config.py

# setup python environment
RUN pip install ibm_quantum_widgets jupyter_packaging && \
    jupyter nbextension enable --py widgetsnbextension && \
    jupyter nbextension enable --py ibm_quantum_widgets

COPY --chown=jovyan:jovyan qoffeeapi qoffeeapi
RUN pip install -e ./qoffeeapi --user

COPY --from=build-frontend --chown=jovyan:jovyan /appwidgets appwidgets
RUN pip install ./appwidgets --user && \
    jupyter nbextension install --sys-prefix --overwrite --py appwidgets && \
    jupyter nbextension enable --sys-prefix --py appwidgets

COPY --chown=jovyan:jovyan qoffeefrontend qoffeefrontend
RUN jupyter nbextension install ./qoffeefrontend --user && \
    jupyter nbextension enable qoffeefrontend/app 

EXPOSE 8887

COPY css css
COPY *.ipynb .


# Qoffee-Maker

<img src="css/QoffeeMug.png">

## User Instructions

Find user instructions on the project github pages: http://qoffee-maker.org

## Installation

For installation instructions on a RasQberry, read below.

1. Build container image from Dockerfile: `docker build -t qoffee .`
2. Create a `.env` file with the following variables:
    - `HOMECONNECT_API_URL`: base URL for HomeConnect API (simulator or real API)
    - `HOMECONNECT_CLIENT_ID`: Client ID of application for HomeConnect
    - `HOMECONNECT_CLIENT_SECRET`: Client Secret of application for HomeConnect
    - `HOMECONNECT_REDIRECT_URL`: Callback URL for HomeConnect. This must be registered in your application in HomeConnect. On localhost this is `http://localhost:8887/auth/callback` (the port is determined by Jupyter, `/auth/callback` is fixed)
    - `IBMQ_API_KEY`: the API Key for IBM Quantum
3. Run the container image with the specified environment variables: `docker run --name qoffee --rm -p 8887:8887 --env-file .env qoffee`

## Installation on RasQberry (draft):

First draft for installation procedure on RasQberry (http://rasqberry.org) can be found at [README-RasQberry-setup.md](README-RasQberry-setup.md)
 

# qoffee-machine-orchestrator

## Installation

- create `.env` file in root directory (ask Max for content)
- install npm / node.js on the Raspberry: `curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -` and `sudo apt-get install -y nodejs`
- install all dependencies: `npm install`
- start server: `npm run start`

## Routes

- `GET /auth`: Redirect to Homeconnect Login Page
- `GET /auth/refresh`: Refresh the access token manually
- `GET /coffeemachine/config`: Get the current coffeemachine configuration
- `POST /coffeemachine/config`: Post a new coffeemachine configuration to update it
- `GET /coffeemachine/state`: Get the current state of the coffeemachine
- `POST /coffeemachine/drink/:drink`: Request a new drink from the coffeemachine. The list of available `drink` specifiers, see `GET /coffeemachine/config`

# Qoffeeapi

This Python package is intended to extend the Jupyter Notebook API to communicate with the HomeConnect API. The endpoints mentioned below are available on base URL of the Jupyter Server.

## Installation

Install the qoffeeapi using
```
pip install ./qoffeeapi --user
```

## Usage

The package exposes the following endpoints in the Jupyter API. All endpoints prefixed with 🔑 require autentication. For a sample implementation on how to call these endpoints, see [qoffeefrontend/app.js : requestDrink](../qoffeefrontend/app.js). 

### Authentication

- `GET /auth` : redirect user to login page of HomeConnect OAuth Service
- `GET /auth/callback` : used by HomeConnect OAuth Service on successful login. Should not be called by user
- `GET /auth/refresh` : refresh the current access token using the stored refresh token. Access tokens must be refreshed every 24h.

For easier development, the OAuth tokens are stored in a JSON file in `.user/oauth-token.json` which will be loaded during startup (if existent).

### Machine Details

- `🔑 GET /machine` : return haId and enumber of current coffee machine
- `🔑 POST /machine` : set the current coffee machine using its enumber. If no enumber is provided, the first coffee machine in the list of machines associated to the account is used.
- `🔑 GET /machines` : get a list of coffee machines associated to the current account.
- `🔑 GET /machine/state` : get the operation state (`BSH.Common.Status.OperationState`) of the coffee machine
- `🔑 GET /machine/power` : get the power state (`BSH.Common.Setting.PowerState`) of the coffee machine (`On` or `Standby`)
- `🔑 POST /machine/power` : set the power state of the coffee machine to `On`, i.e. wake it up

### Drink

- `🔑 POST /machine/drink` : order a drink from the coffee machine, i.e. activate a program with a set of options. An example request body could look like:
`{"key": <program identifier>, "options": {<program option identifier>: <program option value>, ... }}`. A list of available programs and corresponding options can be retrieved from the coffee machine () or from [./options.md](options.md).
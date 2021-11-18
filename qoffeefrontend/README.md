# Qoffeefrontend

This is a Jupyter Notebook Extension which bundles JavaScript functions and CSS Code required for the Qoffee functionality and app experience.

## App Mode

The extension enables an application mode. In this mode everything is hidden except for the output of code cells marked with `### APP`. This allows you to build hide all Jupyter Notebook related stuff and to just show your application, e.g. using [AppBox from appwidgets package](../appwidgets/appwidgets/switchbox.py). The CSS code for this is located in [](app.css) and is loaded on startup.

To activate the application, click on the rocket in the toolbar (or programatically trigger the action `app-activate`). To deactivate the application mode, press ESC (or programatically trigger the action `app-deactivate`). To restart the application, press restart on the bottom right of the screen. This will restart the Jupyter Kernel and execute all cells.

## QR Codes

To present a QR Code in an overlay, use `window.openQRCode(<url>, text="")`. You can also specify a text which is displayed above the QR Code.

To generate a QR Code that points to IBM Quantum Composer, use `window.openQRCodeIBMQ(<circuit qasm code>)`. The function will compress the QASM code of the circuit and build a suitable URL.

## Coffee Machine

The following functions are called from Python but are implemented in JavaScript because the authorization against the Jupyter API is much easier in JavaScript (we can just reuse the token stored in the cookie).

### Refreshing Authorization to HomeConnect API 

To manually refresh the access token for the HomeConnect API (must be done every 24h), use `window.refreshAuth()` or click on _Refresh Auth_ on the bottom right. If an authentication error occurs, this will redirect you to the login page. If nothing happens, everything is fine.

### Activate Coffee Machine

To activate the coffee machine (i.e. switch from Standby to On) use `window.activateCoffeeMachine()`.

### Request a drink from the Coffee Machine

To request a drink from the coffee machine use `window.requestDrink(<programm key>, <map of programm options>)`. The available programs are stored in the Jupyter Notebook.
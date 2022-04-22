# Qoffee-Maker

<img src="css/QoffeeMug.png">

## User Instructions

Find user instructions on the project github pages: http://qoffee-maker.org

## Installation

As an example, we will install the Qoffee Maker Graphical User Interface (GUI) to be accessed under `https://localhost:8887`. It is also possible to choose another URL that you want to access the GUI from.
### Prerequisites

- Home Connect enabled coffee machine
- Android Phone or iPhone
- Computer

### Install Home Connect
1. Install the Home Connect [iOS App](https://app.adjust.com/gdi5c03?campaign=germany&redirect_macos=https%3A%2F%2Fapps.apple.com%2Fde%2Fapp%2Fhome-connect-app%2Fid901397789&redirect_windows=https%3A%2F%2Fapps.apple.com%2Fde%2Fapp%2Fhome-connect-app%2Fid901397789) or [Android App](https://app.adjust.com/gdi5c03?campaign=germany&redirect_macos=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.bshg.homeconnect.android.release%26hl%3Dde&redirect_windows=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.bshg.homeconnect.android.release%26hl%3Dde)

2. Add your Coffee Machine appliance to the Home Connect App

First, you need to create a Home Connect User Account. Then you can connect your Coffee Machine under _Appliances_ in the App.

3. [Sign up for a Home Connect Developer Account](https://developer.home-connect.com/user/register)

Make sure to set your _Default Home Connect User Account for Testing_ to the account name (mail address) created in the previous step.

Tipp: It is not crucial to provided meaningful _Additional Information_.

4. [Register a new Home Connect Appliance](https://developer.home-connect.com/applications/add)

Set an _Application ID_ of your choice. Using localhost, the _Redirect URI_ is set to `http://localhost:8887/auth/callback`. Keep the default settings for the remaining boxes and create the appliance.

### Install the Qoffee Maker GUI
Install the Qoffee Maker GUI in three steps:

1. Create a `.env` file with the following variables:
    - `HOMECONNECT_API_URL`: `https://api.home-connect.com/` (Home Connect API) or `https://simulator.home-connect.com/` (simulator API)
    - `HOMECONNECT_CLIENT_ID`: Client ID of the Home Connect Appliance
    - `HOMECONNECT_CLIENT_SECRET`: Client Secret of the Home Connect Appliance
    - `HOMECONNECT_REDIRECT_URL`: Callback URL for HomeConnect as registered in your application in HomeConnect. On localhost this is `http://localhost:8887/auth/callback` (the port is determined by Jupyter, `/auth/callback` is fixed)
    - `IBMQ_API_KEY`: the API Key for [IBM Quantum](https://quantum-computing.ibm.com/account)

2. Run the container image with the specified environment variables: `docker run --name qoffee --rm -itp 8887:8887 --env-file .env ghcr.io/tbrodbeck/qoffee-maker`

3. Now you can start using the Qoffee Maker GUI under http://localhost:8887 (the login token is shown in the StdOut of the docker container). After logging in to Jupyter, you have to select _qoffee.ipynb_ and then you have to click the rocket icon to _Activate App Mode_.

Enjoy your Quantum Coffee. ☕️

## Installation on RasQberry (draft):

First draft for installation procedure on RasQberry (http://rasqberry.org) can be found at [README-RasQberry-setup.md](README-RasQberry-setup.md)


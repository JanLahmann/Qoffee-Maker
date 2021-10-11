var express = require('express');
var ClientOAuth2 = require('client-oauth2');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const crypto = require("crypto");

const app = express();
app.use(express.json());

const apiBaseUrl = process.env.API_URL;
var qoffeeUser = null;

const token = (process.env.TOKEN) ? process.env.TOKEN : crypto.randomBytes(32).toString('hex');

var coffeeMachineConfiguration = {
    haId: process.env.HA_ID,
    drinks: {
        'espresso': {
            key: 'ConsumerProducts.CoffeeMaker.Program.Beverage.Espresso',
            options: {}
        },
        'espressomacchiato': {
            key: 'ConsumerProducts.CoffeeMaker.Program.Beverage.EspressoMacchiato',
            options: {}
        },
        'coffee': {
            key: 'ConsumerProducts.CoffeeMaker.Program.Beverage.Coffee',
            options: {}
        },
        'cappucino': {
            key: 'ConsumerProducts.CoffeeMaker.Program.Beverage.Cappuccino',
            options: {}
        },
        'lattemacchiato': {
            key: 'ConsumerProducts.CoffeeMaker.Program.Beverage.LatteMacchiato',
            options: {}
        },
        'caffeelatte': {
            key: 'ConsumerProducts.CoffeeMaker.Program.Beverage.CaffeLatte',
            options: {}
        }
    }
}
 
const qoffeeAuth = new ClientOAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    accessTokenUri: apiBaseUrl+'/security/oauth/token',
    authorizationUri: apiBaseUrl+'/security/oauth/authorize',
    redirectUri: process.env.REDIRECT_URL,
    scopes: ['IdentifyAppliance', 'CoffeeMaker']
})

/*
    Export user to file
*/
function exportUser() {
    if(!qoffeeUser) {
        throw new Error("qoffeeUser does not exist");
    }
    const data = qoffeeUser.data;
    data._expires = qoffeeUser.expires;
    fs.writeFileSync("./qoffeeUser.json", JSON.stringify(data));
}

/*
    Load user from file
*/
function loadUser() {
    if(qoffeeUser) {
        throw new Error("qoffeeUser already exists");
    }
    if(!fs.existsSync("./qoffeeUser.json")) {
        console.debug("No user data found, do not load user");
        return;
    }
    const userData = JSON.parse(fs.readFileSync("./qoffeeUser.json"));
    const expireDate = new Date(userData._expires);
    const now = new Date();
    // check if expired
    if(now > expireDate) {
        console.log("The user object has expired, can not load the user from file", expireDate);
        fs.rmSync("./qoffeeUser.json");
        return;
    }
    delete userData._expires;
    qoffeeUser = qoffeeAuth.createToken(userData);
    refreshUser();
    enableAutoRefresh();
}

/*
    Refresh user
*/
function refreshUser() {
    return new Promise((resolve, reject) => {
        console.debug("Refresh user access token");
        qoffeeUser.refresh().then(() => {
            console.debug("User refreshed");
            exportUser();
            resolve(true);
        }, error => {
            reject(error);
        })
    }) 
}

/*
    Automatically refresh users
*/
var autoRefreshInterval = null;
function enableAutoRefresh() {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        refreshUser();
    }, (qoffeeUser.data.expires_in - 300)*1000);
}

/*
    Middleware to enforce authentication
*/
function withAuthenticatedUser(req, res, next) {
    if(!qoffeeUser) {
        res.sendStatus(401).send("No user authenticated.");
    } else {
        next();
    }
}

/*
    Middleware to check for API token
*/
function withToken(req, res, next) {
    if(!req.headers.authorization || req.headers.authorization != 'Bearer '+token) {
        res.sendStatus(401).send("Wrong token");
    } else {
        next();
    }
}

/*
    Send user to authentication interface
*/
app.get('/auth', function (req, res) {
  var uri = qoffeeAuth.code.getUri()
  res.redirect(uri);
});

/*
    Handle callback from authentication server
*/
app.get("/auth/callback", function(req, res) {
    console.log("Original URL", req.originalUrl);
    qoffeeAuth.code.getToken(req.originalUrl).then(user => {
        console.debug("Authentication succeeded", user);
        // set user (persistent)
        qoffeeUser = user;
        exportUser();
        // set interval to refresh user (5min before expires)
        enableAutoRefresh();
        res.send(true);
    })
})

/*
    Refresh access token
*/
app.get("/auth/refresh", withToken, withAuthenticatedUser, function(req, res) {
    refreshUser().then(result => {
        res.send(result);
    })
})

/*
    Get current coffeemachine config
*/
app.get("/coffeemachine/config", withToken, async (req, res) => {
    res.send(coffeeMachineConfiguration);
})

/*
    set coffeemachine config
*/
app.post("/coffeemachine/config", withToken, async (req, res) => {
    console.debug("Set configuration to", req.body);
    coffeeMachineConfiguration = req.body;
    res.send(true);
})

/*
    Fetch the current state of the machine
*/
app.get("/coffeemachine/state", withToken, withAuthenticatedUser, async (req, res) => {
    console.debug("Fetch latest machine state");
    const machineState = await fetch(apiBaseUrl+"/api/homeappliances/"+coffeeMachineConfiguration.haId+"/status/BSH.Common.Status.OperationState", {
        headers: {
            "Authorization": "Bearer "+qoffeeUser.accessToken
        }
    });
    const data = await machineState.json();
    console.debug("Machine state is", data);
    res.send(data);
})

/*
    Request a drink from the coffeemachine
*/
app.post("/coffeemachine/drink/:drink", withToken, withAuthenticatedUser, async (req, res) => {
    const drinkOptions = coffeeMachineConfiguration.drinks[req.params.drink];
    console.debug("Request drink", req.params.drink, drinkOptions);
    await fetch(apiBaseUrl+"/api/homeappliances/"+coffeeMachineConfiguration.haId+"/programs/active", {
        headers: {
            "Authorization": "Bearer "+qoffeeUser.accessToken,
            "Content-Type": "application/vnd.bsh.sdk.v1+json"
        },
        method: "put",
        body: JSON.stringify({
            data: {
                key : drinkOptions.key,
                // TODO: merge options from drinkOptions
                options: [
                    {
                             "key": "ConsumerProducts.CoffeeMaker.Option.BeanAmount",
                             "value": "ConsumerProducts.CoffeeMaker.EnumType.BeanAmount.Strong"
                    }
                ]
            }
        })
    });
    res.send(true);
})


const port = 8000
loadUser();
app.listen(port, () => {
    console.log(`The app listens to port ${port} with bearer token ${token}`);
});
var express = require('express');
var ClientOAuth2 = require('client-oauth2');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());

const apiBaseUrl = process.env.API_URL;
var qoffeeUser = null;

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

function withAuthenticatedUser(req, res, next) {
    if(!qoffeeUser) {
        res.sendStatus(401).send("No user authenticated.");
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
    qoffeeAuth.code.getToken(req.originalUrl).then(user => {
        console.debug("Authentication succeeded", user);
        qoffeeUser = user;
        res.send(true);
    })
})

/*
    Refresh access token
*/
app.get("/auth/refresh", withAuthenticatedUser, function(req, res) {
    console.debug("Refresh user access token");
    qoffeeUser.refresh().then(() => {
        console.debug("User refreshed");
        res.send(true);
    })
})

/*
    Get current coffeemachine config
*/
app.get("/coffeemachine/config", async (req, res) => {
    res.send(coffeeMachineConfiguration);
})

/*
    set coffeemachine config
*/
app.post("/coffeemachine/config", async (req, res) => {
    console.debug("Set configuration to", req.body);
    coffeeMachineConfiguration = req.body;
    res.send(true);
})

/*
    Fetch the current state of the machine
*/
app.get("/coffeemachine/state", withAuthenticatedUser, async (req, res) => {
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
app.post("/coffeemachine/drink/:drink", withAuthenticatedUser, async (req, res) => {
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
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
from notebook.base.handlers import IPythonHandler
from qoffeeapi.homeconnect import get_connector
from qoffeeapi.utils import proxy
from tornado import web
import os
import dotenv
dotenv.load_dotenv()

# machine HAID, can be overwritten
MACHINE_HA_ID = os.getenv("MACHINE_HAID")


# fetch the current state of the machine from the API
class OrchestratorMachineStateHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        connector = get_connector()
        proxy(
            self,
            connector.get("/api/homeappliances/"+MACHINE_HA_ID+"/status/BSH.Common.Status.OperationState")
        )

# get/set the HAID of the machine to use
class OrchestratorMachineHaIdHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        self.finish({
            "haid": MACHINE_HA_ID
        })
    @web.authenticated
    def post(self):
        global MACHINE_HA_ID
        body = self.get_json_body()
        if "haid" in body:
            MACHINE_HA_ID = body['haid']
        self.finish({
            "haid": MACHINE_HA_ID
        })

# send a request to the coffee machine to create a drink
class OrchestratorDrinkRequestHandler(IPythonHandler):
    @web.authenticated
    def post(self):
        connector = get_connector()
        body = self.get_json_body()
        drinkKey = body['key']
        # merge drink options with options from request
        drinkOptions = body['options']
        # convert to required format
        drinkOptionsList = list(map(lambda x: {
            'key': x,
            'value': drinkOptions[x]
        }, drinkOptions.keys()))

        # send put request
        proxy(
            self,
            connector.put("/api/homeappliances/"+MACHINE_HA_ID+"/programs/active", {
                "data": {
                    "key": drinkKey,
                    "options": drinkOptionsList
                }
            })
        )

from notebook.base.handlers import IPythonHandler
from qoffeeapi.hc_connector import get_connector
from qoffeeapi.utils import proxy
from tornado import web
import dotenv
dotenv.load_dotenv()

# fetch the current state of the machine from the API
class OrchestratorMachineStateHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        connector = get_connector()
        proxy(
            self,
            connector.get("/api/homeappliances/{}/status/BSH.Common.Status.OperationState".format(connector.machine["haId"]))
        )

# get power state and turn on machine from the API
class OrchestratorMachinePowerHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        connector = get_connector()
        proxy(
            self,
            connector.get("/api/homeappliances/{}/settings/BSH.Common.Setting.PowerState".format(connector.machine["haId"]))
        )

    @web.authenticated
    def post(self):
        connector = get_connector()
        proxy(
            self,
            connector.put("/api/homeappliances/{}/settings/BSH.Common.Setting.PowerState".format(connector.machine["haId"]), {
                "data": {
                    "key": "BSH.Common.Setting.PowerState",
                    "value": "BSH.Common.EnumType.PowerState.On"
                }
            })
        )

# get/set the the machine using enumber
class OrchestratorMachineHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        connector = get_connector()
        self.finish(connector.machine)

    @web.authenticated
    def post(self):
        body = self.get_json_body()
        connector = get_connector()
        enumber = None if (body is None or "enumber" not in body) else body["enumber"]
        connector.set_machine(enumber)
        self.finish(connector.machine)

# get all machines associated to the current account
class OrchestratorAllMachinesHandler(IPythonHandler):
    @web.authenticated
    def get(self):
        connector = get_connector()
        self.finish({
            "machines": connector.get_machines()
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
            connector.put("/api/homeappliances/{}/programs/active".format(connector.machine["haId"]), {
                "data": {
                    "key": drinkKey,
                    "options": drinkOptionsList
                }
            })
        )

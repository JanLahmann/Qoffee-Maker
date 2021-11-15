from requests.api import get
from notebook.utils import url_path_join
from qoffeeapi.hc_connector import get_connector
from qoffeeapi.api_auth import HomeconnectLoginHandler, HomeconnectCallbackHandler, HomeconnectRefreshHandler
from qoffeeapi.api_orchestrator import OrchestratorAllMachinesHandler, OrchestratorDrinkRequestHandler, OrchestratorMachineStateHandler, OrchestratorMachineHandler, OrchestratorMachinePowerHandler

def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """

    connector = get_connector()

    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    
    ### authentication
    route_pattern = url_path_join(web_app.settings['base_url'], '/auth')
    web_app.add_handlers(host_pattern, [(route_pattern, HomeconnectLoginHandler)])
    route_pattern = url_path_join(web_app.settings['base_url'], '/auth/callback')
    web_app.add_handlers(host_pattern, [(route_pattern, HomeconnectCallbackHandler)])
    route_pattern = url_path_join(web_app.settings['base_url'], '/auth/refresh')
    web_app.add_handlers(host_pattern, [(route_pattern, HomeconnectRefreshHandler)])

    ### orchestrator configuration
    route_pattern = url_path_join(web_app.settings['base_url'], '/machine')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorMachineHandler)])
    route_pattern = url_path_join(web_app.settings['base_url'], '/machines')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorAllMachinesHandler)])
    route_pattern = url_path_join(web_app.settings['base_url'], '/machine/state')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorMachineStateHandler)])
    route_pattern = url_path_join(web_app.settings['base_url'], '/machine/power')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorMachinePowerHandler)])
    

    ### requesting a drink
    route_pattern = url_path_join(web_app.settings['base_url'], '/drink')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorDrinkRequestHandler)])
    




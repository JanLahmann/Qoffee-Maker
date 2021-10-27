from requests.api import get
from notebook.utils import url_path_join
from qoffeeapi.homeconnect import get_connector, HomeconnectLoginHandler, HomeconnectCallbackHandler, HomeconnectRefreshHandler
from qoffeeapi.orchestrator import OrchestratorDrinkRequestHandler, OrchestratorMachineStateHandler, OrchestratorMachineHaIdHandler

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
    route_pattern = url_path_join(web_app.settings['base_url'], '/machine/haid')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorMachineHaIdHandler)])
    route_pattern = url_path_join(web_app.settings['base_url'], '/machine/state')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorMachineStateHandler)])
    
    ### requesting a drink
    route_pattern = url_path_join(web_app.settings['base_url'], '/drink')
    web_app.add_handlers(host_pattern, [(route_pattern, OrchestratorDrinkRequestHandler)])
    




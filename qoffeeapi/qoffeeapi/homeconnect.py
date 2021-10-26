import os
from qoffeeapi.oauth2 import PersistentOAuth2Connector
from notebook.base.handlers import IPythonHandler
from qoffeeapi.utils import proxy

# singleton
_HOMECONNECT_CONNECTOR = None

def get_connector():
    """
    Get the connector object initialized from environment variables
    """
    global _HOMECONNECT_CONNECTOR
    if _HOMECONNECT_CONNECTOR is not None:
        return _HOMECONNECT_CONNECTOR
    ### create a singleton from environment
    api_base_url = os.getenv("HOMECONNECT_API_URL")
    _HOMECONNECT_CONNECTOR = PersistentOAuth2Connector(
        api_base_url=api_base_url,
        authorize_url=api_base_url+"/security/oauth/authorize",
        token_url=api_base_url+"/security/oauth/token",
        client_id=os.getenv("HOMECONNECT_CLIENT_ID"),
        client_secret=os.getenv("HOMECONNECT_CLIENT_SECRET"),
        callback_uri=os.getenv("HOMECONNECT_REDIRECT_URL"),
        scopes=["IdentifyAppliance", "CoffeeMaker"],
        path="oauth-token.json"
    )
    # unset environment variables to hide them in notebooks
    os.environ["HOMECONNECT_CLIENT_ID"] = "<hidden>"
    os.environ["HOMECONNECT_CLIENT_SECRET"] = "<hidden>"
    return _HOMECONNECT_CONNECTOR

## Redirect to login page
class HomeconnectLoginHandler(IPythonHandler):    
    def get(self):
        connector = get_connector()
        authorization_redirect_url = connector.get_authorization_url()
        self.redirect(authorization_redirect_url)


## Get authorization code and request an access_token
class HomeconnectCallbackHandler(IPythonHandler):
    def get(self):
        connector = get_connector()
        authorization_code = self.request.query_arguments['code'][0].decode()
        proxy(self, connector.request_access_token(authorization_code))


## Refresh an access_token
class HomeconnectRefreshHandler(IPythonHandler):
    def get(self):
        connector = get_connector()
        proxy(self, connector.refresh_access_token())
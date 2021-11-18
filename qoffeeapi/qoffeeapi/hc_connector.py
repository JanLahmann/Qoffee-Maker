import os
from qoffeeapi.oauth2 import PersistentOAuth2Connector


class HomeconnectConnector(PersistentOAuth2Connector):
    

    machine = {
        "haId": None,
        "enumber": None
    }


    def get_machines(self):
        """
        Fetch all machines associated to the current account from homeconnect
        """
        status_code, response_body = self.get("/api/homeappliances")
        # handle errors
        if status_code >= 300:
            raise RuntimeError("Could not set machine" + str(status_code) + str(response_body))
        machines = response_body["data"]["homeappliances"]
        return machines
    

    def set_machine(self, enumber=None):
        """
        Set the current machine by enumber or - if enumber is not given - just use the first one in the account
        """
        machines = self.get_machines()
        machine = next(
            filter(
                lambda x: (
                    (enumber is None) and (x["type"] == "CoffeeMaker")) or 
                    (enumber is not None and x["enumber"].startswith(enumber)), 
                machines
            )
        )
        self.machine = {
            "haId": machine["haId"],
            "enumber": machine["enumber"]
        }
        self.save_config()


    def save_config(self):
        # overwrite super function to also load machine details from file
        return self._save_config_to_file({
            "auth": self.tokens,
            "machine": self.machine
        })


    def load_config(self, config):
        if "machine" in config:
            self.machine = config["machine"]
        super().load_config(config)
        


# singleton
_HOMECONNECT_CONNECTOR = None

def get_connector():
    """
    Get the connector object initialized from environment variables
    """
    global _HOMECONNECT_CONNECTOR
    if _HOMECONNECT_CONNECTOR is not None:
        return _HOMECONNECT_CONNECTOR
    # create folder if not exists
    if not os.path.isdir(".user"):
        os.mkdir(".user")
    ### create a singleton from environment
    api_base_url = os.getenv("HOMECONNECT_API_URL")
    _HOMECONNECT_CONNECTOR = HomeconnectConnector(
        api_base_url=api_base_url,
        authorize_url=api_base_url+"/security/oauth/authorize",
        token_url=api_base_url+"/security/oauth/token",
        client_id=os.getenv("HOMECONNECT_CLIENT_ID"),
        client_secret=os.getenv("HOMECONNECT_CLIENT_SECRET"),
        callback_uri=os.getenv("HOMECONNECT_REDIRECT_URL"),
        scopes=["IdentifyAppliance", "CoffeeMaker"],
        path=".user/oauth-token.json"
    )
    # unset environment variables to hide them in notebooks
    os.environ["HOMECONNECT_CLIENT_ID"] = "<hidden>"
    os.environ["HOMECONNECT_CLIENT_SECRET"] = "<hidden>"
    return _HOMECONNECT_CONNECTOR

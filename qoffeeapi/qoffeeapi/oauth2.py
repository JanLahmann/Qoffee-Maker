from json.decoder import JSONDecodeError
import requests
import json
import os


class OAuth2Connector:

    api_base_url = None
    authorize_url = None
    token_url = None
    client_id = None
    client_secret = None
    callback_uri = None
    scopes = []

    tokens = None

    def __init__(self, **kwargs):
        # initialize
        self.api_base_url = kwargs['api_base_url']
        self.authorize_url = kwargs['authorize_url']
        self.token_url = kwargs['token_url']
        self.client_id = kwargs['client_id']
        self.client_secret = kwargs['client_secret']
        self.callback_uri = kwargs['callback_uri']
        self.scopes = kwargs['scopes']


    def set_tokens(self, tokens):
        """
        Save new set of tokens
        """
        self.tokens = tokens


    def _parse_access_token_response(self, response):
        """
        Process the response form token_url requests
        """
        status, result = self._handle_response(response)
        if "access_token" in result:
            self.set_tokens(result)
            return status, {"success": True}
        else:
            return status, result


    def refresh_access_token(self):
        """
        Refresh the current access_token using the refresh_token, if available
        """
        if not self.tokens or 'refresh_token' not in self.tokens:
            return 401, {'error': 'no refresh token set'}
        data = {'grant_type': 'refresh_token', 'refresh_token': self.tokens['refresh_token']}
        access_token_response = requests.post(self.token_url, data=data, verify=False, allow_redirects=False, auth=(self.client_id, self.client_secret))
        return self._parse_access_token_response(access_token_response)


    def request_access_token(self, code):
        """
        Request an access_token using an authorization_code
        """
        data = {'grant_type': 'authorization_code', 'code': code, 'valid_for': 86400, 'redirect_uri': self.callback_uri}
        access_token_response = requests.post(self.token_url, data=data, verify=False, allow_redirects=False, auth=(self.client_id, self.client_secret))
        return self._parse_access_token_response(access_token_response)


    def _handle_response(self, request_response):
        """
        Try to parse the response and return tuple of (statusCode, body)
        """
        data = {}
        try:
            data = json.loads(request_response.text)
        except JSONDecodeError:
            data = {
                "response_text": request_response.text
            }
        status = request_response.status_code
        return status, data


    def get(self, endpoint):
        """
        Make an authenticated GET request to the API
        """
        if not self.tokens or 'access_token' not in self.tokens:
            raise RuntimeError("Not authenticated. Call GET /auth first.")
        request_response = requests.get(self.api_base_url+endpoint, 
            headers={
                'Authorization': 'Bearer '+self.tokens['access_token']
            },
            verify=False
        )
        return self._handle_response(request_response)


    def put(self, endpoint, data):
        """
        Make an authenticated PUT request to the API
        """
        if not self.tokens or 'access_token' not in self.tokens:
            raise RuntimeError("Not authenticated. Call GET /auth first.")
        request_response = requests.put(self.api_base_url+endpoint,
            json=data,
            headers={
                'Authorization': 'Bearer '+self.tokens['access_token'],
                "Content-Type": "application/vnd.bsh.sdk.v1+json"
            },
            verify=False
        )
        return self._handle_response(request_response)


    def get_authorization_url(self):
        """
        Get the URL to login at the provider
        """
        return self.authorize_url + '?response_type=code&client_id=' + self.client_id + '&redirect_uri=' + self.callback_uri + '&scope='+" ".join(self.scopes)



class PersistentOAuth2Connector(OAuth2Connector):

    path = None

    def __init__(self, **kwargs):
        # init and save path
        super().__init__(**kwargs)
        self.path = kwargs['path']
        self._load_config_from_file()

    def set_tokens(self, tokens):
        # overwrite set_tokens, also save to file
        super().set_tokens(tokens)
        self.save_config()

    def _save_config_to_file(self, config):
        """
        Save config to file
        """
        with open(self.path, "w") as f:
            json.dump(config, f)
    
    def _load_config_from_file(self):
        """
        Load config from file
        """
        try:
            if os.path.isfile(self.path):
                with open(self.path) as f:
                    fc = json.load(f)
                    self.load_config(fc)
        except Exception as e:
            print("Not able to load tokens from file", str(e))

    def load_config(self, config):
        if 'auth' not in config or 'access_token' not in config['auth']:
            raise RuntimeError("No Access Token found, do not load from file")
        self.set_tokens(config['auth'])
        refresh_result = self.refresh_access_token()
        if 'success' not in refresh_result[1]:
            raise RuntimeError("Not able to refresh access_token", refresh_result)

    def save_config(self):
        return self._save_config_to_file({
            "auth": self.tokens
        })
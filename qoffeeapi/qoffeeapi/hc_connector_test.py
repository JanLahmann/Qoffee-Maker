from unittest import mock, TestCase
from qoffeeapi import hc_connector

class UnitTests(TestCase):
    @mock.patch('os.getenv')
    def test_get_connector(self, os_getenv):
        os_getenv.return_value = 'https://example.com/'
        HomeconnectConnector = hc_connector.get_connector()
        assert HomeconnectConnector.authorize_url == 'https://example.com/security/oauth/authorize'
        assert HomeconnectConnector.token_url == 'https://example.com/security/oauth/token'
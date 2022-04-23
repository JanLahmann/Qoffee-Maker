def joinUrl(*pieces):
    """
    Join a parameter list of strings into a url
    """
    strippedPieces = [s.strip('/') for s in pieces]
    return '/'.join(strippedPieces)

def proxy(handler, response):
    """
    extract tuple of status code and response body, use handler to send response to requester
    """
    status_code, response_body = response
    handler.set_status(status_code)
    if status_code != 204:
        handler.finish(response_body)
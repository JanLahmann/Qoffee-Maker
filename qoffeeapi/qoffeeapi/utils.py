def proxy(handler, response):
    """
    extract tuple of status code and response body, use handler to send response to requester
    """
    status_code, response_body = response
    handler.set_status(status_code)
    if status_code != 204:
        handler.finish(response_body)
#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Max Simon.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import Widget
from traitlets import Unicode, Any
from ._frontend import module_name, module_version
from random import randint

class JsPyWidget(Widget):
    """
    The widget renders a HTML string and replaces placeholders in
    the HTML code dynamically.
    """
    _model_name = Unicode('JsPyModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)

    _callback_index = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.comm.on_msg(self.message_handler)


    def message_handler(self, msg):
        if msg['content']['data']['method'] == 'custom':
            content = msg['content']['data']['content']
            msg_type = content['type']
            if msg_type == 'exec_js_result':
                exec_id = content['exec_id']
                if exec_id in self._callback_index and self._callback_index[exec_id] is not None:
                    self._callback_index[exec_id](content)
                    del self._callback_index[exec_id]


    def execute_js(self, jscode, callback=None):

        # save callback
        exec_id = 'exec_'+str(randint(0, 5000))
        self._callback_index[exec_id] = callback

        # send request to execute js
        self.send({
            'type': 'exec_js',
            'code': jscode,
            'exec_id': exec_id
        })
        

    

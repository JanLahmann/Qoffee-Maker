#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Max Simon.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import DOMWidget, link
from traitlets import Unicode, Any
import re, os
from ._frontend import module_name, module_version
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from base64 import b64decode, b64encode

class ReactiveHtmlWidget(DOMWidget):
    """
    The widget renders a HTML string and replaces placeholders in
    the HTML code dynamically.
    """
    _model_name = Unicode('ReactiveHtmlModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('ReactiveHtmlView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    _rendered = Unicode('<p>Hello World</p>').tag(sync=True)
    _css = Unicode('').tag(sync=True)

    def __init__(self, html, data_model=None, **kwargs):
        super().__init__(**kwargs)
        # save original html string
        self._html = html
        # save data model
        self._data_model = data_model
        # init value with raw html string
        self._rendered = html
        
        # extract all variable names used in html string
        var_names_raw = set(
            re.findall(
                "\$\{[a-zA-Z_]\w*\}", 
                html
            )
        )

        data_model_observed_vars = []  # gather all variable names we need to observe from data model
        traits_to_create = []  # gather all variable names we need to create a trait for
        self._var_names = []  # save all variable names

        # loop variable names
        for var_name_raw in var_names_raw:
            var_name = var_name_raw[2:-1]  # remove ${ and }
            self._var_names.append(var_name)
            # if var_name present in data model...
            if hasattr(self._data_model, var_name):
                data_model_observed_vars.append(var_name)
            # ... else create a new trait
            else:
                traits_to_create.append(var_name)

        # create new traits
        self.add_traits(**{
            var_name: Any('').tag(sync=True) for var_name in traits_to_create
        })

        # set observer for data model vars
        if len(data_model_observed_vars) > 0:
            self._data_model.observe(self.render_html, names=data_model_observed_vars)
        # set observer for newly created traits
        self.observe(self.render_html, names=traits_to_create)

        # render
        self.render_html()

    def _get_value(self, key):
        # if key is defined on self._data_model use this,
        # else look on self
        if self._data_model is not None and hasattr(self._data_model, key):
            return getattr(self._data_model, key)
        else:
            return getattr(self, key)


    def _populate_template(self, template_string, quote_strings=False):
        rendered = template_string
        for var_name in self._var_names:
            # get current value
            value = self._get_value(var_name)
            # add quotes if it is a string
            value_sanitized = '"'+value+'"' if quote_strings and type(value) is str else value
            # replace all occurances
            rendered = rendered.replace('${'+var_name+'}', str(value_sanitized))
        return rendered


    def render_html(self, *args):

        rendered = self._html

        # find all compute statements
        computes_raw = re.findall(
            "\{\{.+\}\}", 
            rendered
        )
        for compute_raw in computes_raw:
            try: # try to compute expression
                compute = self._populate_template(compute_raw[2:-2], quote_strings=True)
                eval_result = eval(compute)
                # replace expression with result
                rendered = rendered.replace(compute_raw, str(eval_result))
            except (NameError, SyntaxError):
                pass  # TODO

        # allow if/else templating
        soup = BeautifulSoup(rendered, "html.parser")
        elements_if = soup.find_all(attrs={"data-rh-if": re.compile(".*")})
        for element in elements_if:
            condition = self._populate_template(element.attrs['data-rh-if'], quote_strings=True)
            try:
                if not eval(condition):
                    element.decompose()
            except (NameError, SyntaxError):
                pass  # TODO
        rendered = str(soup)

        # replace all the values
        rendered = self._populate_template(rendered, quote_strings=False)
        
        # update
        self._rendered = rendered

    
    def set_state(self, sync_data):
        # set also the state of _data_model
        super().set_state(sync_data)
        if self._data_model is not None:
            self._data_model.set_state(sync_data)


    def load_css(self, path, encapsulated=True):
        # load css from file
        csslines = ""
        with open(path) as f:
            csslines = f.readlines()
        # allow for view encapsulation
        css = ""
        for line in csslines:
            if line.strip().startswith("@"):
                css += "\n"+line
            elif encapsulated and "{" in line:
                css += "\n"+".<<VIEW_ID>>"+" "+line
            else:
                css += "\n"+line
            
        self._css = css
        

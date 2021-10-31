from ipywidgets import DOMWidget, Box
from traitlets import Unicode, Dict, Any
from ._frontend import module_name, module_version
import xml.etree.ElementTree as ET

class SwitchBox(Box):
    """
    
    """
    _model_name = Unicode('BoxModel').tag(sync=True)
    _view_name = Unicode('BoxView').tag(sync=True)


    def __init__(self, children=(), trait_names=[], observe_children=False, **kwargs):
        # get all children widgets
        children_widgets = list([
            cc[0] for cc in children
        ])
        # initialize parent
        kwargs['children'] = children_widgets
        super().__init__(**kwargs)
        # get all callbacks
        self._children_conditions = list([
            cc[1] for cc in children
        ])
        self._children_widgets = children_widgets

        if observe_children:
            for widget in self._children_widgets:
                widget.observe(self.update_children)
        self.add_traits(**{
            name: Any('').tag(sync=True) for name in trait_names
        })

        self.on_trait_change(self.update_children)
        self.update_children(None)


    def update_children(self, event):
        new_set_children = []
        for i, widget in enumerate(self._children_widgets):
            if self._children_conditions[i](self, widget):
                new_set_children.append(widget)
        self.children = new_set_children




class AppBox(SwitchBox):
    
    def __init__(self, init_view="start", **kwargs):
        super().__init__(children=(), trait_names=['view'], **kwargs)
        self.view = init_view
        self._view_index = {}
        self.add_class("app-appbox")
    
    def add_widget(self, key, widget):
        self._view_index[key] = widget
        # get current view ids (to fix order)
        view_ids = list(self._view_index.keys())
        # set the widgets in order
        self._children_widgets = list([
            self._view_index[key] for key in view_ids
        ])
        def get_condition_fn(target_view_id):
            target_view_id_fix = target_view_id+""  # this is required, otherwise we are always comparing against the last
            def condition_fn(s, w):
                return s.view == target_view_id_fix
            return condition_fn

        # set the conditions in order
        self._children_conditions = list([
            get_condition_fn(key) for key in view_ids
        ])
        # update view
        self.update_children(None)


        # widx = len(self._children_widgets)
        # self._children_widgets.append(widget)
        # self._children_conditions.append(lambda s, w: s.wIdx == widx)
        # self.update_children(None)
    

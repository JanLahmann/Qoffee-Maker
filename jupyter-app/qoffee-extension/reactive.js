define([
    'base/js/namespace',
    'jquery', 
    'require'
], function(
    jupyter, $, requirejs
) {

    function parse(str) {
        return Function(`'use strict'; return (${str})`)();
    }

    /* 
        renderTemplateStr
    */
    function renderTemplateStr(templateStr, asJson=false) {
        const templateVars = templateStr.match(/\$\{[^\}]+\}/g);
        if(!templateVars) { return templateStr; }
        // init rendered
        let rendered = templateStr;
        // loop placeholders, replace occurances with current value
        templateVars.map(templateVar => {
            const templateVarName = templateVar.slice(2, -1);
            let templateVarValue = window.state.get(templateVarName);
            if(asJson) {
                templateVarValue = JSON.stringify(templateVarValue);
            }
            rendered = rendered.replaceAll(templateVar, templateVarValue);
        });
        return rendered;
    }

    /* 
        renderHtml
    */
    function renderHtml(obj) {
        if(!obj.dataset.qHtml) { return; }
        const renderedHtml = renderTemplateStr(obj.dataset.qHtml);
        $(obj).html(renderedHtml);
    }

    /*
        renderClassList
    */
    function renderClassList(obj) {
        if(!obj.dataset.qClassList) { return; }
        const renderedStr = renderTemplateStr(obj.dataset.qClassList, true);
        const classList = parse(renderedStr);
        Object.keys(classList).map(className => {
            if(classList[className]) {
                $(obj).addClass(className);
            } else {
                $(obj).removeClass(className);
            }
        })
    }

    /* 
        renderClasses
    */
    function renderClasses(obj) {
        if(!obj.dataset.qClass) { return; }
        // remove old classes
        let classNames = obj.className;
        const currentClasses = classNames.split(" ");
        // remove all classes, that start with _qcl- and the corresponding class without _qcl-
        currentClasses.map(className => {
            if(className.startsWith("_qcl-")) {
                classNames = classNames.replace(className, "").replace(className.replace("_qcl-", ""), "");
            }
        })
        obj.className = classNames;
        // add new classes
        const classTemplates = obj.dataset.qClass.split(",");
        classTemplates.map(templ => {
            const renderedClass = renderTemplateStr(templ.trim());
            $(obj).addClass(renderedClass+" _qcl-"+renderedClass); // add both, the renderedClass and _qcl-renderedClass so that we know which to remove later
        })
    }

    /*
        renderIf
    */
    function renderIf(obj) {
        if(!obj.dataset.qIf) { return; }
        const renderedStr = renderTemplateStr(obj.dataset.qIf, true);
        const shouldShow = parse(renderedStr);
        if(shouldShow) {
            $(obj).removeClass("_qif-hide");
        } else {
            $(obj).addClass("_qif-hide");
        }
    }

    /*
        initDataBinding
    */
    function initDataBinding() {
        $("*[data-q-html]").each(function() {
            // if data-app-binding is empty, fill with current text
            if(!this.dataset.qHtml || this.dataset.qHtml.length == 0) {
                $(this).attr("data-q-html", $(this).html());
            }
            // render template and put as text
            renderHtml(this);
        });

        $("*[data-q-class-list]").each(function() {
            renderClassList(this);
        });

        $("*[data-q-class]").each(function() {
            renderClasses(this);
        });

        $("*[data-q-if]").each(function() {
            renderIf(this);
        });
    }

    let loadFunctionCalled = false;
    function load_ipython_extension() {

        // avoid double loading
        if(loadFunctionCalled) {
            return;
        }
        loadFunctionCalled = true;

        // load CSS file
        $('<link/>').attr({
            id: 'qoffee_reactive_css',
            rel: 'stylesheet',
            type: 'text/css',
            href: requirejs.toUrl('./reactive.css')
        }).appendTo('head');

        // set up a very simple state object with subscription feature
        const _state = {};
        const _stateSubscriber = {};

        window.state = {
            get: function(key) { // get value from _state
                return _state[key];
            },
            set: function(key, value) { // set a value
                _state[key] = value; // set
                Object.values(_stateSubscriber).map(callback => callback(key, value)); // loop callbacks
                jupyter.notebook.kernel.execute("JsWindowState._state_dict['"+key+"'] = json.loads('"+JSON.stringify(value)+"')")
            },
            subscribe: function(subscriberId, callback) {
                _stateSubscriber[subscriberId] = callback;
            },
            unsubscribe: function(subscriberId) {
                delete _stateSubscriber[subscriberId];
            }
        }

        // subscribe to state object for reactive updates
        window.state.subscribe('_q-binding', (key, value) => {
            // handle content bindings
            $("*[data-q-html*='"+key+"']").each(function() {
                renderHtml(this);
            });

            // handle class bindings
            $("*[data-q-class-list*='"+key+"']").each(function() {
                renderClassList(this);
            });

            // handle class bindings
            $("*[data-q-class*='"+key+"']").each(function() {
                renderClasses(this);
            });

            // handle if bindings
            $("*[data-q-if*='"+key+"']").each(function() {
                renderIf(this);
            });
        })
        
        // trigger reload on output change
        $(jupyter.events).on("output_appended.OutputArea", event => {
            setTimeout(() => { // need some delay
                initDataBinding();
            }, 100);
        });
        // initial loading
        initDataBinding();

        // allow to set state with click
        $(document).on("click", "*[data-q-set]", event => {
            const [key, value] = event.target.dataset.qSet.split("=");
            window.state.set(key, value);
        })

        // create a windowState singleton in python to interact with JavaScript
        $(jupyter.events).on("kernel_ready.Kernel", event => {
            jupyter.notebook.kernel.execute(`
import json
from IPython.display import display, Javascript

class JsWindowState:

    _state_dict = {}
                
    def set(key, value):
        valueRepr = json.dumps(value)
        display(Javascript("window.state && window.state.set('"+key+"', "+valueRepr+")"))
        JsWindowState._state_dict[key] = value  # will be updated by JS as well, but in this way it is immediately available
                
    def get(key):
        return JsWindowState._state_dict[key]
`
            )
        })
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
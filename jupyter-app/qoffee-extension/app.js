define([
    'base/js/namespace',
    'jquery',
    'require'
], function(
    jupyter, $, requirejs
) {

    // index for viewId -> cell idx
    const viewIdIdx = {};

    /*
        loadView
        Function to display all cells with a given viewId
    */
    function loadView(viewId) {
        if(!viewId) { // null safe
            return;
        }
        // set correct app-view to active
        $(".app-view").removeClass("active");
        $(".app-view-"+viewId).addClass("active");
        $(".app-view").removeClass("selected");
    }

    /*
        executeView
        Function to execute all cells with a given viewId
    */
    function executeView(viewId) {
        if(!viewId) { // null safe
            return;
        }
        // execute the cells
        jupyter.notebook.execute_cells(viewIdIdx[viewId]);
    }

    /*
        handleViewRouting
        Function to route app to a given view id
    */
    function handleViewRouting(event) {
        // check if it has data-q-code attribute which must be executed first
        if(event.target.dataset.qCode) {
            handlePythonExecution(event, true);
        }
        // get all target view ids
        const targetViewIds = event.target.dataset.qTarget.split(",");
        // execute all target view ids
        targetViewIds.map(targetViewId => {
            executeView(targetViewId.trim());
        });
        // display the last view id
        loadView(targetViewIds[targetViewIds.length - 1].trim());
    }

    /*
        handlePythonCellExecution
        Function to execute a cell by view id
    */
        function handlePythonCellExecution(event) {
            // check if it has data-q-execute attribute and execute this cell
            if(event.target.dataset.qExecute) {
                console.debug("Execute cell", event.target.dataset.qExecute);
                executeView(event.target.dataset.qExecute);
            }
        }

    /*
        handlePythonExecution
        Function to execute Python Code in the Kernel
    */
    function handlePythonExecution(event, force=false) {
        // if it has data-q-target attribute and not force skip,
        // because handler will be executed again by handleViewRouting
        if(!force && event.target.dataset.qTarget) {
            console.debug("found python code", event.target.dataset.qCode, "but will not execute for now because waiting for routing");
            return;
        }
        // get code and execute
        pythonCode = event.target.dataset.qCode;
        console.log("Execute Python Code", pythonCode);
        jupyter.notebook.kernel.execute(pythonCode);
    }

    /*
        handleCellSelection
        Function to remove selected class from cell up on selection
    */
    function handleCellSelection() {
        $(".app-view").removeClass("selected");
    }

    /*
        handleWindowFn
        Function to handle execution of functions on window
    */
   function handleWindowFn(event) {
       const name = event.target.dataset.qFn;
       if(window[name]) {
           window[name]();
       }
       else {
           console.error("Can not execute function", name, window[name]);
       }
   }

    /*
        activateApp
        Prepare the UI to be in app mode
    */
    function activateApp() {

        // add class to body to make CSS rules apply
        $("body").addClass("app-mode");

        // run all cells
        jupyter.actions.call('jupyter-notebook:run-all-cells');

        //
        // loop cells, get their viewIds and add corresponding classes
        //
        // keep track of very first view (default)
        let firstViewId = null;
        jupyter.notebook.get_cells().map((cell, idx) => {
            const cellContent = cell.get_text();
            // if it is a view cell
            if(cellContent.startsWith("### VIEW")) {
                // get view id using regexp
                const regexRes = cellContent.match(/VIEW: [^\s]+/g);
                // skip if nothing found
                if(regexRes.length == 0) {
                    return;
                }
                const viewId = regexRes[0].replace("VIEW: ", "");
                // save if it is the first view
                if(!firstViewId) {
                    firstViewId = viewId;
                }
                // add cell index to viewId index
                if(!viewIdIdx[viewId]) {
                    viewIdIdx[viewId] = [];
                }
                viewIdIdx[viewId].push(idx);
                // add CSS classes to cells
                $(cell.element).addClass("app-view app-view-"+viewId);
            }
        });
        // load the very first view
        loadView(firstViewId);

        // initialize routing system
        $(document).on("click", "*[data-q-target]", handleViewRouting);

        // initialize custom python execution function
        $(document).on("click", "*[data-q-code]", handlePythonExecution);

        // initialize execution of python cell
        $(document).on("click", "*[data-q-execute]", handlePythonCellExecution);

        // initialize execution of window functions
        $(document).on("click", "*[data-q-fn]", handleWindowFn);

        // disable selection of cells
        $(jupyter.events).on("select.Cell", handleCellSelection);

    }

    /* 
        deactivateApp
        Function to remove all changes made for app view
    */
    function deactivateApp() {
        // remove class from body
        $("body").removeClass("app-mode");
        // deactivate routing
        $(document).off("click", "*[data-q-target]", handleViewRouting);
        // deactivate python execution
        $(document).off("click", "*[data-q-code]", handlePythonExecution);
        // deactivate python cell execution
        $(document).off("click", "*[data-q-execute]", handlePythonExecution);
        // deactivate execution of window functions
        $(document).off("click", "*[data-q-fn]", handleWindowFn);
        // enable selection of cells
        $(jupyter.events).off("select.Cell", handleCellSelection);
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
            id: 'qoffee_app_css',
            rel: 'stylesheet',
            type: 'text/css',
            href: requirejs.toUrl('./app.css')
        }).appendTo('head');

        // add button to toolbar to start app mode
        jupyter.toolbar.add_buttons_group([
            jupyter.actions.register({
                icon: 'fa-rocket',
                help: 'Activate App Mode',
                handler : activateApp
            }, 'app-activate', 'simple-app')
        ]);

        // add keyboard shortcut to leave app mode
        jupyter.actions.register({
            icon: 'fa-times',
            help: 'Deactivate App Mode',
            handler : deactivateApp
        }, 'app-deactivate', 'simple-app');
        jupyter.keyboard_manager.command_shortcuts.add_shortcut('esc', 'simple-app:app-deactivate');

        // allow to activate/deactivate from console
        window.appActivate = activateApp;
        window.appDeactivate = deactivateApp;
        window.appLoadView = loadView;
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
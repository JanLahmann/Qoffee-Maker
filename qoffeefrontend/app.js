define([
    'base/js/namespace',
    'jquery',
    'require',
    'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js',
    'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js',
], function(
    jupyter, $, requirejs, lzs, qrc
) {

    /** is app mode active */
    let appActive = false;

    /**
     * Handler to be called when a cell is selected. Just unselect it.
     * @function handleCellSelection
     */
    function handleCellSelection() {
        if(!appActive) { // disable
            return;
        }
        $(".app-view").removeClass("selected");
    }

    /**
     * Activate the app mode, build viewId index and initialize event listeners
     * @function activateApp
     */
    function activateApp() {
        appActive = true;
        // add class to body to make CSS rules apply
        $("body").addClass("app-mode");

        //
        // loop cells, get their viewIds and add corresponding classes
        //
        // keep track of very first view (default)
        jupyter.notebook.get_cells().map((cell, idx) => {
            const cellContent = cell.get_text();
            // if it is a view cell
            if(cellContent.startsWith("### APP")) {
                // add CSS classes to cells
                $(cell.element).addClass("app-view");
            }
        });
        // disable selection of cells
        $(jupyter.events).on("select.Cell", handleCellSelection);
        // automatically restart
        restart();
    }

    /**
     * Deactivate the app mode, remove event listeners
     * @function deactivateApp
     */
    function deactivateApp() {
        appActive = false;
        // remove class from body
        $("body").removeClass("app-mode");
        // enable selection of cells
        $(jupyter.events).off("select.Cell", handleCellSelection);
    }

    /**
     * Restart kernel, execute all cells and block view with an overlay during this time
     * @function restart
     */
    function restart() {
        // add an overlay
        $("body").prepend('<div id="restart-overlay"><h1>Reloading</h1></div>');
        // restart kernel and execute all cells
        jupyter.actions.call("jupyter-notebook:restart-kernel-and-run-all-cells");
        // periodically check when the notebook is ready
        setTimeout(() => {
            var restartInterval = setInterval(() => {
                if(!jupyter.notebook.kernel_busy) {
                    clearInterval(restartInterval);
                    $("#restart-overlay").remove(); // remove overlay
                }
            }, 1000)
        }, 1000)
    }

    /**
     * Call backend to refresh authentication i.e. access tokens
     * @function refreshAuth
     */
    function refreshAuth() {
        console.log("Start refreshing auth key")
        return new Promise((resolve, reject) => {
            // do POST request to Jupyter backend
            fetch("/auth/refresh", {
                method: 'get',
                credentials: 'same-origin',
                headers: {
                    'X-XSRFToken': document.cookie.replace("_xsrf=", "")
                }
            }).then(response => {
                // if fail, alert and go to welcome
                if(!response.ok) {
                    alert("Could not refresh auth");
                    window.open('/auth', '_blank');
                    reject();
                }
                // if succeed to to success
                else {
                    resolve();
                }
            }, error => {
                alert("Could not refresh auth");
                window.open('/auth', '_blank');
                console.error(error);
                reject(error);
            })
        })
    }

    /**
     * Call backend to activate the coffee machine i.e. to set the power state to on
     * @function refreshAuth
     */
    function activateCoffeeMachine() {
        console.log("Activating coffee machine")
        return new Promise((resolve, reject) => {
            // do POST request to Jupyter backend
            fetch("/machine/power", {
                method: 'post',
                credentials: 'same-origin',
                headers: {
                    'X-XSRFToken': document.cookie.replace("_xsrf=", "")
                }
            }).then(response => {
                // if fail, alert and go to welcome
                if(!response.ok) {
                    alert("Could not activate coffee machine");
                    reject();
                }
                // if succeed to to success
                else {
                    resolve();
                }
            }, error => {
                alert("Could not activate coffee machine");
                console.error(error);
                reject(error);
            })
        })
    }

    /**
     * Request a drink from the coffee machine
     * @function requestDrink
     * @param {string} drinkKey A valid programme for the coffee machine
     * @param {Object} drinkOptions A map of valid programm options with the corresponding values
     */
    function requestDrink(drinkKey, drinkOptions) {
        console.log("Start requesting", drinkKey, "with options", drinkOptions)
        return new Promise((resolve, reject) => {
            // tea is not supported by API
            if(drinkKey == "NotImplemented") {
                alert("Unfortunately, the Coffee Machine does not implement this beverage. Please start by hand.");
                resolve();
                return;
            }
            // do POST request to Jupyter backend
            fetch("/drink", {
                method: 'post',
                credentials: 'same-origin',
                headers: {
                    'X-XSRFToken': document.cookie.replace("_xsrf=", "")
                },
                body: JSON.stringify({
                    key: drinkKey,
                    options: drinkOptions
                })
            }).then(response => {
                // if fail, alert and go to welcome
                if(!response.ok) {
                    alert("Could not get drink "+drinkKey+"\n"+response.statusText);
                    reject();
                }
                // if succeed to to success
                else {
                    resolve();
                }
            }, error => {
                alert("Could not get drink "+drinkKey+"\n"+error);
                console.error(error);
                reject(error);
            })
        })
    }

    /**
     * Open an overlay which displays a QR Code
     * @function openQRCode
     * @param {string} url URL to encode into a QR Code
     * @param {string} text Text to show above the QR Code
     */
    function openQRCode(url, text="") {
        // clear previous qr code
        $("#qrcode").empty();
        $("#qrcode-container a").remove();
        $("#qrcode-container p").remove();
        // create qrcode
        const qrcode = new QRCode(document.getElementById("qrcode"), {
            text: url,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff"
        });
        $("#qrcode-container").addClass("active");
        if(text != "") {
            $("#qrcode-container").prepend('<p class="qrcode-text">'+text+'</p>')
        }
        $("#qrcode-container").append('<a href="'+url+'" target="_blank">Open</a>')
    }

    /**
     * Export a circuit to IBM Quantum Composer using URL
     * @function openQRCodeIBMQ
     * @param {string} circuitQasm QASM Code of the current circuit
     */
    function openQRCodeIBMQ(circuitQasm) {
        // setup data to transfer
        const data = {
            title: 'Qoffee Maker - ' +(new Date()).toLocaleString(),
            description: '',
            qasm: circuitQasm
        }
        // encode data and add to URL
        const qantumComposerComponent = encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(data)));
        const url = "https://quantum-computing.ibm.com/composer/files/new?initial="+qantumComposerComponent;
        // show QR Code
        openQRCode(url);
    }

    //
    // Ipython Extension code
    //

    // state variable to avoid double loading
    let loadFunctionCalled = false;
    // interval for refreshing auth
    let intervalAuthRefresh = null;
    function load_ipython_extension() {
        // avoid double loading
        if(loadFunctionCalled) {
            return;
        }
        loadFunctionCalled = true;

        // load CSS file
        $('<link/>').attr({
            id: 'app_css',
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

        // publish methods by putting them onto window
        window.requestDrink = requestDrink
        window.openQRCodeIBMQ = openQRCodeIBMQ
        window.openQRCode = openQRCode
        window.refreshAuth = refreshAuth
        window.activateCoffeeMachine = activateCoffeeMachine

        // set interval to refresh auth token
        clearInterval(intervalAuthRefresh)
        intervalAuthRefresh = setInterval(() => {
            refreshAuth();
        }, 40*60*1000)  // every 40min

        // add a button to UI which restarts the app
        $("body").append('<div id="restart-button-container" class="emergency-button-container"><button type="button" id="restart-button">Restart</button></div>')
        $(document).on("click", "#restart-button", restart);

        // add a button to UI which refreshs auth manually
        $("body").append('<div id="refreshauth-button-container" class="emergency-button-container"><button type="button" id="refreshauth-button">Refresh Auth</button></div>')
        $(document).on("click", "#refreshauth-button", refreshAuth);

        /*
            Add QR Code Container
        */
        // add container to render QRCode
        $('body').append('<div id="qrcode-container"><div id="qrcode"></div></div>');
        // add listener to close on click
        $("#qrcode-container").on("click", "*", event => {
            $("#qrcode-container").removeClass("active");
        })
        $("#qrcode-container").on("click", event => {
            $("#qrcode-container").removeClass("active");
        })
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
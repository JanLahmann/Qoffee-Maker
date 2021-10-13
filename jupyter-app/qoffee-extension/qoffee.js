define([
    'base/js/namespace',
    'jquery',
    'require',
    './reactive',
    'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js',
    'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js',
], function(
    jupyter, $, requirejs, qer, qed, qef
) {

    const drinkMap = {
        "00": {
            id: "coffee",
            name: "Coffee"
        },
        "01": {
            id: "cappucino",
            name: "Cappucino"
        },
        "10": {
            id: "espresso",
            name: "Espresso"
        },
        "11": {
            id: "lattemacchiato",
            name: "Latte Macchiato"
        }
    }

    function updateProbabilities() {
        const currentMax = {
            key: null,
            value: 0
        };
        ["00", "01", "10", "11"].map(key => {
            const prob = Math.round(window.state.get("editor-circuit-bit-"+key)*100);
            $(".editor-circuit-probbar-"+key+" .progress-bar").css({
                'width': prob+"%",
                'aria-valuenow': prob
            });
            $(".editor-circuit-probtext-"+key).text(prob+"%");
            if(prob > currentMax.value) {
                currentMax.key = key;
                currentMax.value = prob;
            }
        })
        if(currentMax.key) {
            $(".editor-circuit-max-name").text(drinkMap[currentMax.key].name);
            $(".editor-circuit-max-id").attr("data-q-drink", drinkMap[currentMax.key].id);
        }
    }

    function requestDrink(drinkName) {
        fetch("http://localhost:8000/coffeemachine/drink/"+drinkName, {
            method: 'post',
            headers: {
                "Authorization": "Bearer qoffee"
            }
        }).then(response => {
            if(!response.ok) {
                alert("Could not get drink "+drinkName+"\n"+response.statusText);
            }
            else {
                window.appLoadView("success");
            }
        }, error => {
            alert("Could not get drink "+drinkName+"\n"+error);
            console.error(error);
        })
    }

    function openCircuitInQuantumComposer(stateVarName) {
        const circuitQasm = window.state.get(stateVarName);
        console.log("Found qasm", circuitQasm);
        const data = {
            title: 'Qoffee Maker',
            description: '',
            qasm: circuitQasm
        }
        const qantumComposerComponent = encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(data)));
        const url = "https://quantum-computing.ibm.com/composer/files/new?initial="+qantumComposerComponent;
        // clear previous qr code
        $("#qrcode").empty();
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: url,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff"
        });
        $("#qrcode-container").addClass("active");
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
            id: 'qoffee_qoffee_css',
            rel: 'stylesheet',
            type: 'text/css',
            href: requirejs.toUrl('./qoffee.css')
        }).appendTo('head');

        // subscribe to state object for reactive updates
        window.state.subscribe('qoffee-progress', (key, value) => {
            updateProbabilities();
        })

        window.requestDrink = requestDrink;
        
        $(document).on("click", "*[data-q-drink]", event => {
            const drinkId = event.target.dataset.qDrink;
            console.log("Alright, lets get a ", drinkId);
            requestDrink(drinkId);
        })

        $(document).on("click", "*[data-q-open-external]", event => {
            const circuitName = event.target.dataset.qOpenExternal;
            openCircuitInQuantumComposer(circuitName);
        })

        $('body').append('<div id="qrcode-container"><div id="qrcode"></div></div>');
        $(document).on("click", "#qrcode-container", event => {
            $(event.target).removeClass("active");
        })
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
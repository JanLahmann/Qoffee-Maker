define([
    'base/js/namespace',
    'jquery',
    './reactive'
], function(
    jupyter, $, qer
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
            const prob = Math.round(window.state.get("bit-"+key)*100);
            console.log("Set", key, "to", prob);
            $(".progress-bar-"+key+" .progress-bar").css({
                'width': prob+"%",
                'aria-valuenow': prob
            });
            $(".progress-text-"+key).text(prob+"%");
            if(prob > currentMax.value) {
                currentMax.key = key;
                currentMax.value = prob;
            }
        })
        if(currentMax.key) {
            $(".current-max-name").text(drinkMap[currentMax.key].name);
            $(".current-max-id").attr("data-q-drink", drinkMap[currentMax.key].id);
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
            console.error(error);
        })
    }

    let loadFunctionCalled = false;
    function load_ipython_extension() {

        // avoid double loading
        if(loadFunctionCalled) {
            return;
        }
        loadFunctionCalled = true;

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
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
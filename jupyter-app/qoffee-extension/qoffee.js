define([
    'base/js/namespace',
    'jquery',
    './reactive'
], function(
    jupyter, $, qer
) {

    function updateProbabilities() {
        ["00", "01", "10", "11"].map(key => {
            const prob = Math.round(window.state.get("bit-"+key)*100);
            console.log("Set", key, "to", prob);
            $(".progress-bar-"+key+" .progress-bar").css({
                'width': prob+"%",
                'aria-valuenow': prob
            });
            $(".progress-text-"+key).text(prob+"%");
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
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
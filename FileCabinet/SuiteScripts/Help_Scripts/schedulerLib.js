define(['N/https', 'N/url'],

function(https, url) {

    /**
     * Definition - Async function for checking on the status of the scheduled script.
     */
    function checkStatus(scriptID, attempts){
        var output = url.resolveScript({
            scriptId: 'customscript_wo_fix_scheduler',
            deploymentId: 'customdeploy_wo_fix_scheduler',
            params: {'requestStatus': scriptID}
        });
        var response = https.get({
            url: output
        });
        var status = response.body;

        if (status == 'COMPLETE') {
            return true;
        } else if (status == 'FAILED' || attempts > 17) {
            throw 'Scheduled Script Failed.';
        } else {
            setTimeout(function () {
                checkStatus(scriptID, ++attempts);
            }, 5000);
        }
    }

    return {
        checkStatus: checkStatus
    };
    
});

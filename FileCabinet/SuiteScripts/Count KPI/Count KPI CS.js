/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message', './Count KPI Fields.js', 'N/url', 'N/https', 'SuiteScripts/Help_Scripts/schedulerLib.js'],
/**
 * @param{search} search
 * @param{message} message
 * @param{countFields} field library for Count KPI
 */
function(search, message, countFields, https, schedulerLib) {

    /**
     *Helper Function to Display Message to User that an Unknown Error Has Occured
     */
    function errorMessage(){
        message.create({
            type: message.Type.ERROR,
            duration: 30000,
            title: 'Critical Error',
            message: 'There has been an unexpected error. Contact your administrator.'
        }).show();
    }

    /**
     *Function for Calling Scheduler Suitelet Through Promise
     */
    function executeScript(){
        try{
            //Creating promise
            var promiseWork = new Promise((resolve, reject) => {
                //Creating scheduled script and submitting
                var output = url.resolveScript({
                    scriptId: 'customscript_wo_fix_scheduler',
                    deploymentId: 'customdeploy_wo_fix_scheduler',
                    params: {'custscript_wo_schedule_id' :'TRUE'}
                });
                var response = https.get({
                    url: output
                });
                //Resolving scheduled script id
                var scriptID = response.body;

                resolve(scriptID);
            });

            //Executing Promise Chain
            promiseWork.then((output) => {
                schedulerLib.checkStatus(output, 0);
            }).catch(function (reason) {
                errorMessage();
                log.error({title: 'Critical error', details: reason});
            });
        }
        catch(error){
            errorMessage();
            log.audit({title: 'Critical Error in executeScript', details: error});
        }
    }

    function pageInit(scriptContext) {
        try{
            //Message Displaying Defaults & Letting User Know How to Change Them
            message.create({
                duration: 30000,
                type: message.Type.INFORMATION,
                title: 'Count KPI',
                message: 'Cycle Count Tolerance set to 5%. Value Tolerance set to $100.00. Date range set to previous 3 weeks. See administrator to update.'
            }).show();
        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    /**
     * Function for managing the count kpi execution
     */
    function fireKPI(){
        try{
            //Displaying Message That Execution is Underway
            message.create({
                duration: 30000,
                type: message.Type.INFORMATION,
                title: 'Execution Underway.',
                message: 'Gathering results, please be patient.'
            }).show();

            //Calling Scheduler to Execute Script
            executeScript();
        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    return {
        pageInit: pageInit
    };
    
});

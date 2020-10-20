/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/https'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord, url, https) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    /**
     * Function attached to button for reopening the work-order
     */
    function reOpen() {
        try {
            //retrieving record and other variables to necessary for work to proceed
            var workOrder = currentRecord.get().id;

            //calling suitlet to preform the work
            var output = url.resolveScript({
                scriptId: 'customscript_reopen_wo_slet',
                deploymentId: 'customdeploy_reopen_wo_slet',
                params: {'workorder' : workOrder}
            });
            var response = https.get({
                url: output
            });
            window.location.reload();
        }
        catch (error) {
            log.error({title: 'Critical Error in reOpen', details: error});
            throw error;
        }
    }


    return {
        pageInit: pageInit,
        reOpen: reOpen
    };
    
});

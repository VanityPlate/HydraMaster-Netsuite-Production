/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/https'],

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
     * Function for compiling records to be updated and submitting them to a scheduled task to the the
     * work.
     */
    function submitSelection(){
        try {
            //grabbing record
            var listPage = currentRecord.get();

            //collecting records for updating
            var updates = '';
            var lines = listPage.getLineCount({sublistId: 'custpage_transactions'});
            for(var x = 0; x < lines; x++){
                if(listPage.getSublistValue({sublistId: 'custpage_transactions', fieldId: 'custpage_confirm', line: x})){
                    updates = updates + '^^^' + listPage.getSublistValue({sublistId: 'custpage_transactions', fieldId: 'id', line: x});
                }
            }

            //sending request to schedule task for mass update
            var output = url.resolveScript({
                scriptId: 'customscript_mass_in_transit',
                deploymentId: 'customdeploy_mass_in_transit',
                params: {results : updates}
            });
            var response = https.get({
                url: output
            });
        }
        catch(error){
            log.error({title: 'Critical Error in submitSelection', details: error});
        }
    }

    return {
        pageInit: pageInit,
        submitSelection : submitSelection
    };
    
});

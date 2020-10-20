/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget'],
/**
 * @param{record} record
 * @param{serverWidget} serverWidget
 */
function(record, serverWidget) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        try {
            //Validating work order is in correct state to add the button
            if ((scriptContext.type == 'view' || scriptContext.type == 'edit')  && scriptContext.newRecord.getValue({fieldId: 'status'}) == 'Closed'){
                //Attaching Button and client script for reopening the work order
                var woForm = scriptContext.form;
                woForm.clientScriptModulePath = 'SuiteScripts/Work Order Scripts/Reopen WO CS.js';
                woForm.addButton({
                    id: 'custpage_reopen',
                    label: 'Reopen WO',
                    functionName: 'reOpen'
                });
            }
        }
        catch(error){
            log.error({title: 'Critical Error in beforeLoad', details: error});
        }
    }

    return {
        beforeLoad: beforeLoad
    };
    
});

/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * Sending email to task creator when task has been completed
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/email'],

function(email) {


    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
        try{
            if(scriptContext.newRecord.getValue({fieldId: 'status'}) === 'COMPLETE'){
                var recordObj = scriptContext.newRecord;
                var sender = recordObj.getValue({fieldId: 'owner'});
            }
        }
        catch(error){
            log.error({title: 'Critical error in afterSubmit', details: error});
        }
    }

    return {
        afterSubmit: afterSubmit
    };
    
});

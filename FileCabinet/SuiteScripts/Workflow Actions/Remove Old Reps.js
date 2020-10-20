/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record'],

function(record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
        try {
            scriptContext.newRecord.setValue({fieldId: 'salesrep', value: -1})
        }
        catch(error){
            log.error({title: 'Critical Error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

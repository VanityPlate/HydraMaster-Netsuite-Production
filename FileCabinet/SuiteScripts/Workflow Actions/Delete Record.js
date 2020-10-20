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
        try{
            var recordID = scriptContext.newRecord.id;
            var recordType = scriptContext.newRecord.type;
            var recordDeleted = record.delete({
               type: recordType,
               id: recordID
            });
            log.audit({title: 'Record Deleted', details: recordDeleted});
        }
        catch(error){
            log.error({title: 'Critical Error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

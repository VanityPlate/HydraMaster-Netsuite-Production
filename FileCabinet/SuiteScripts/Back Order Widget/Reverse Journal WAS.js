/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record'],
/**
 * @param{currentRecord} currentRecord
 * @param{record} record
 */
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
            if(!scriptContext.newRecord.getValue({fieldId: 'reversaldate'})) {
                //Getting journal entry for reversal
                var entryId = scriptContext.newRecord.getValue({fieldId: 'custbody_bo_journal_entry'});

                //Loading Journal Entry
                var journal = record.load({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true,
                    id: entryId
                });

                //Updating Reversal Day
                journal.setValue({fieldId: 'reversaldate', value: new Date()});

                //Saving Journal
                journal.save();
            }
        }
        catch(error){
            log.error({title: 'Critical Error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

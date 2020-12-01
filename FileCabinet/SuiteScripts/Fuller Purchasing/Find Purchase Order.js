/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/runtime'],
/**
 * @param{search} search
 */
function(search, runtime) {
   
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
            //Refactor Testing
            log.audit({title: 'testing workflow field', details: runtime.getCurrentScript().getParameter({name: 'custscript_sales_id_find'})});
            var purchaseID = search.create({
                type: 'purchaseorder',
                filters:
                [
                    ['type', 'anyof', 'PurchOrd'],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['createdfrom.internalid', 'anyof', runtime.getCurrentScript().getParameter({name: 'custscript_sales_id_find'})]
                ],
                columns: []
            }).run().getRange({start: 0, end: 1})[0].id;

            //Refactor Testing
            log.audit({title: 'Testing Return', details: purchaseID});

            return parseInt(purchaseID, 10);
        }
        catch(error){
            log.audit({title: 'Critical error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

/**
 *
 * @copyright Alex S. Ducken 2020 Hydramaster LLC
 *
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
            //Getting Purchase Order Document/ID
            var purchaseOrder = runtime.getCurrentScript().getParameter({name: 'custscript_purchase_order_doc_id'});

            //Finding Sales Order
            var salesId = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["poastext","contains", purchaseOrder],
                        "AND",
                        ["mainline","is","T"]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"})
                    ]
            }).run().getRange({start: 0, end: 1})[0].getValue({name: 'internalid'});

            //Refactor Testing
            log.audit({title: 'Testing salesId', details: salesId});

            return parseInt(salesId, 10);
        }
        catch(error){
            log.audit({title: 'Critical error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

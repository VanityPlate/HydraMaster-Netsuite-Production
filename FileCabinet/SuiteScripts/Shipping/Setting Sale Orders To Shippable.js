/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search'],
/**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
function(log, record, search) {


    function shouldSave(saleOrder, ship, ltl){
        if(ship != saleOrder.getValue(
            {fieldId: 'custbody_ready_to_ship'}) ||
            ltl != saleOrder.getValue({fieldId: 'custbody_ltl_sales_order'})){

            log.audit({title: 'Setting and Saving'});

            saleOrder.setValue({fieldId: 'custbody_ltl_sales_order', value: ltl});
            saleOrder.setValue({fieldId: 'custbody_ready_to_ship', value: ship});
            saleOrder.save({ignoreMandatoryFields: true, enableSourcing: false});
        }
    }

    function loadRecord(saleOrderId){
        try{
            return record.load({
                type: record.Type.SALES_ORDER,
                id: saleOrderId,
                isDynamic: false
            });
        }
        catch(error){
            return record.load({
                type: record.Type.TRANSFER_ORDER,
                id: saleOrderId,
                isDynamic: false
            });
        }
    }

    function testingIfReadyToShip(saleOrderId){

        var saleOrder = loadRecord(saleOrderId);

        var shipReady = false;
        var ltl = false;

        var lines = saleOrder.getLineCount({sublistId: 'item'});

        for(var x = 0; x < lines; x++){
            var quantity = saleOrder.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: x});
            var fulfilled = saleOrder.getSublistValue({sublistId: 'item', fieldId: 'quantityfulfilled', line: x});
            var available = saleOrder.getSublistValue({sublistId: 'item', fieldId: 'quantityavailable', line: x});
            var committed = saleOrder.getSublistValue({sublistId: 'item', fieldId: 'quantitycommitted', line: x});
            if(saleOrder.getSublistValue({sublistId: 'item', fieldId: 'custcol_hm_ltl_shipping', line: x}))
                ltl = true;

            if(!isNaN(parseInt(quantity))){
                if(saleOrder.getValue({fieldId: 'shipcomplete'})){
                    shipReady = true;
                    if(!((available + committed) >= (quantity - fulfilled))){
                        shouldSave(saleOrder, false, ltl);
                        return;
                    }
                }
                else{
                    if((quantity - fulfilled) > 0 && available + committed > 0)
                        shipReady = true;
                }
            }
        }
        shouldSave(saleOrder, shipReady, ltl);
    }

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try {
            var results = search.load({id: 'customsearch_orders_ready_ship'}).run().getRange({
                start: 0,
                end: 500
            });
            results.forEach(function (result) {
                testingIfReadyToShip(result.getValue({name: 'internalid', summary: search.Summary.GROUP}));

            });
        }
        catch(error){
            log.audit({title: "Critical Error in execute", details: error});
        }
    }

    return {
        execute: execute
    };
    
});

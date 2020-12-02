/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/search', 'SuiteScripts/Fuller Purchasing/Fuller Library.js'],

function(record, search, fullerLib) {

    /**
     * Enum Containing Environment Specific Values
     */
    const ENVIRONMENT = {
        customer    :   20782,
        contact     :   20808,
        addressHMK  :   17022,
        addressHMM  :   17023,
        shipPay     :   3,
        subsidiary  :   3
    };

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
            //Creating Drop-Ship Sales Order
            var saleObj = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });

            //Capturing Values For Use
            var purchaseOrder = scriptContext.newRecord.getValue({fieldId: 'tranid'});
            var location = scriptContext.newRecord.getValue({fieldId: 'shipaddresslist'});
            var poShipMethod = scriptContext.newRecord.getValue({fieldId: 'shipmethod'}).toString();

            //Setting Values
            //Refactor Testing
            log.audit({title: 'Testing Stuff', details: ENVIRONMENT.customer})
            saleObj.setValue({fieldId: 'entity', value: ENVIRONMENT.customer});
            saleObj.setValue({fieldId: 'custbody_pcg_contact_name', value: ENVIRONMENT.contact});
            saleObj.setValue({fieldId: 'otherrefnum', value: purchaseOrder});
            saleObj.setValue({fieldId: 'memo', value: 'Auto Generated for ' + purchaseOrder + '.'});
            saleObj.setValue({fieldId: 'custbody_shipping_payment_method', value: ENVIRONMENT.shipPay});
            saleObj.setValue({fieldId: 'shipaddresslist', value: location});
            saleObj.setValue({fieldId: 'shipcarrier', value: fullerLib.poso[poShipMethod].carrier});
            saleObj.setValue({fieldId: 'shipmethod', value: fullerLib.poso[poShipMethod].method});
            saleObj.setValue({fieldId: 'shippingcost', value: 0});

            //Setting Line Items
            var items = scriptContext.newRecord.getLineCount({sublistId: 'item'});
            for(var x = 0; x < items; x++){
                //Gathering Values
                var itemDisplay = scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'item_display', line: x});
                var itemCount = scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: x});
                //Refactor Testing
                log.audit({title: 'Checking Line Items', details: itemDisplay+itemCount});
                //Find Correct Inventory Item
                var inventoryItemsaleObj = search.create({
                    type: 'inventoryitem',
                    filters: [
                        ['type', 'anyof', 'InvtPart'],
                        'AND',
                        ['name', 'haskeywords', itemDisplay],
                        'AND',
                        ['subsidiary', 'anyof', ENVIRONMENT.subsidiary]
                    ],
                    columns: []
                }).run().getRange({start: 0, end: 1})[0].id;
                //Adding Line
                saleObj.selectNewLine({sublistId: 'item'});
                saleObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: inventoryItemsaleObj});
                saleObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: itemCount});
                saleObj.commitLine({sublistId: 'item'});
            }

            //Saving Record
            var salesID = saleObj.save();
            //Refactor Testing
            log.audit({title: 'Testing Sales ID', details: salesID});
            return parseInt(salesID, 10);
            
        }
        catch(error){
            log.error({title: 'Critical error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };

});

/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/search', 'SuiteScripts/Fuller Purchasing/Fuller Library.js', 'N/format'],

function(record, search, fullerLib, format) {

    /**
     * Enum Containing Environment Specific Values
     */
    const ENVIRONMENT = {
        customer    :   20782,
        contact     :   20941,
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

            //Refactor Testing
            log.audit({title: 'poShipMethod', details: poShipMethod});

            //Setting Values
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

            //Finding purchase order created from sales order
            var poSearch = search.create({
                type: "purchaseorder",
                filters:
                    [
                        ["type","anyof","PurchOrd"],
                        "AND",
                        ["createdfrom.internalid","anyof", parseInt(salesID, 10)]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"})
                    ]
            }).run().getRange({start: 0, end: 1});
            var poId = parseInt(poSearch[0].getValue({name: 'internalid'}), 10);

            //Editing receipt dates and bill to address
            var poRecord = record.load({type: record.Type.PURCHASE_ORDER, id: poId, isDynamic: true});
            var billAddress = 'HydraMaster, LLC (FP)\n11-15 47th Ave West\nMukilteo WA 98275\nUnited States';
            poRecord.setValue({fieldId: 'custbody_hm_bill_to', value: billAddress});
            for(var x = 0; x < items; x++){
                poRecord.selectLine({sublistId: 'item', line: x});
                var date = scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'expectedreceiptdate', line: x});
                date = format.parse({value: date, type: format.Type.DATE});
                poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'expectedreceiptdate', value: date, ignoreFieldChange: true});
                poRecord.commitLine({sublistId: 'item'});
            }

            //Saving po record
            poRecord.save();

            //Returning sale order id
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

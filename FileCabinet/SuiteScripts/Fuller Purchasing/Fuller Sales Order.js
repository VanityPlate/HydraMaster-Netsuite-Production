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
     * Tests the address validity for ship to if not found adds the address to the customer record
     *
     * @param {Record} The address record
     * @return {String} The internal id of the address record
     */
    function testAddress(saleObj, location){
        try{
            if(location == fullerLib.environment.addressHMK || location == fullerLib.environment.addressHMM){
                saleObj.setValue({fieldId: 'shipaddresslist', value: location});
            }
            else {
            }
        }
        catch(error){
            log.error({title: 'Critical error in testAddress', details: error});
        }
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
            var location = scriptContext.newRecord.getValue({fieldId: 'shipaddresslist'})
            var poShipMethod = scriptContext.newRecord.getValue({fieldId: 'shipmethod'}).toString();
            var shipPaymentMethod = scriptContext.newRecord.getValue({fieldId: 'custbody_shipping_payment_method'});
            var shipInstructions = scriptContext.newRecord.getValue({fieldId: 'custbody_hm_po_ship_instructions'});
            var createdFrom = scriptContext.newRecord.getValue({fieldId: 'createdfrom'});

            //Testing Ship To Address Validity
            location = testAddress(saleObj, location);

            //Setting Values
            saleObj.setValue({fieldId: 'entity', value: fullerLib.environment.customer});
            saleObj.setValue({fieldId: 'custbody_pcg_contact_name', value: fullerLib.environment.contact});
            saleObj.setValue({fieldId: 'otherrefnum', value: purchaseOrder});
            saleObj.setValue({fieldId: 'memo', value: 'Auto Generated for ' + purchaseOrder + '.'});
            saleObj.setValue({fieldId: 'shipcarrier', value: fullerLib.poso[poShipMethod].carrier});
            saleObj.setValue({fieldId: 'shipmethod', value: fullerLib.poso[poShipMethod].method});
            saleObj.setValue({fieldId: 'custbody_shipping_payment_method', value: shipPaymentMethod});
            saleObj.setValue({fieldId: 'custbody_pcg_to_be_emailed_sales', value: true});
            saleObj.setValue({fieldId: 'custbody_pcg_ship_instructions', value: shipInstructions});
            saleObj.setValue({fieldId: 'shippingcost', value: 0});

            //Setting Line Items
            var items = scriptContext.newRecord.getLineCount({sublistId: 'item'});
            for(var x = 0; x < items; x++){
                //Gathering Values
                var itemDisplay = scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'item_display', line: x});
                var itemCount = scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: x});
                //Find Correct Inventory Item
                var inventoryItemsaleObj = search.create({
                    type: 'inventoryitem',
                    filters: [
                        ['type', 'anyof', 'InvtPart'],
                        'AND',
                        ['name', 'haskeywords', itemDisplay],
                        'AND',
                        ['subsidiary', 'anyof', fullerLib.environment.subsidiary]
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
            poRecord.setValue({fieldId: 'custbody_hm_bill_to', value: fullerLib.billTo});
            items = poRecord.getLineCount({sublistId: 'item'});
            //Syncing Ship Dates if Created from Sales Order
            if(createdFrom){
                var saleRecord = record.load({type: record.Type.SALES_ORDER, id: createdFrom, isDynamic: true});
                for(var x = 0; x < items; x++) {
                    poRecord.selectLine({sublistId: 'item', line: x});
                    var itemLine = saleRecord.findSublistLineWithValue({
                        fieldId: 'item',
                        sublistId: 'item',
                        value: poRecord.getCurrentSublistValue({fieldId: 'item', sublistId: 'item'})
                    });
                    if (itemLine != -1) {
                        var date = saleRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_hm_expected_ship_date',
                            line: itemLine
                        });
                        if (date) {
                            date = format.parse({value: date, type: format.Type.DATE});
                            poRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'expectedreceiptdate',
                                value: date,
                                ignoreFieldChange: true
                            })
                            poRecord.commitLine({sublistId: 'item'});
                        }
                    }
                }
            }
            else {
                for (var x = 0; x < items; x++) {
                    poRecord.selectLine({sublistId: 'item', line: x});
                    var date = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'expectedreceiptdate',
                        line: x
                    });
                    date = format.parse({value: date, type: format.Type.DATE});
                    poRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'expectedreceiptdate',
                        value: date,
                        ignoreFieldChange: true
                    });
                    poRecord.commitLine({sublistId: 'item'});
                }
            }

            //Setting PO to be emailed
            poRecord.setValue({fieldId: 'tobeemailed', value: true});

            //Setting Ship To Address
            log.audit({title: 'testing shiptoaddress', details: scriptContext.newRecord.getValue({fieldId: 'shipaddress'})});
            poRecord.setValue({fieldId: 'shipaddress', value: scriptContext.newRecord.getValue({fieldId: 'shipaddress'})});

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

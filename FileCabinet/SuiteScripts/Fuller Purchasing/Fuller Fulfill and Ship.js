/**
 *
 * @copyright Alex S. Ducken 2020 Hydramaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/record'],

function(runtime, record) {

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
            //Getting Parameters
            var salesID = runtime.getCurrentScript().getParameter({name: 'custscript_sales_id'});

            //Refactor
            log.audit({title: 'testing salesID', details: salesID});

            //values for handling new receipts
            var receipt = false;
            var itemsQuantity = [];
            var salesObj = record.load({type: record.Type.SALES_ORDER, id: salesID});
            var poLines = scriptContext.newRecord.getLineCount({sublistId: 'item'});

            //Helper functions
            var getItem = function (x) {return scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'itemname', line: x})};
            var getPOReceived = function (x) {return scriptContext.newRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: x})};
            var getSaleFulfilled = function (x) {return salesObj.getSublistValue({sublistId: 'item', fieldId: 'quantityfulfilled', line: x})};

            //gathering different amounts
            for(var x = 0; x < poLines; x++){
                var salesLine = salesObj.findSublistLineWithValue({sublistId: 'item', fieldId: 'item_display', value: '*' + getItem(x)});
                var differance = Math.abs(getPOReceived(x) - getSaleFulfilled(salesLine));
                //Refactor Testing
                log.audit({title: 'Testing Ouput', details: getPOReceived(x) + ' ' + getSaleFulfilled(salesLine)});
                if(differance != 0){
                    itemsQuantity.push('*' + getItem(x));
                    itemsQuantity.push(differance);
                    receipt = true;
                }
            }

            //If new items have been received update the sale and purchase orders
            if(receipt) {
                //Refactor Testing
                log.audit({title: 'Testing differance array', details: itemsQuantity});
                //Fulfilling Order
                var itemFulfillment = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: salesID,
                    toType: record.Type.ITEM_FULFILLMENT,
                    isDynamic: true
                });

                //Removing line items
                var lines = itemFulfillment.getLineCount({sublistId: 'item'});
                for (var x = lines; x > 0; x--) {
                    itemFulfillment.selectLine({sublistId: 'item', line: x - 1});
                    itemFulfillment.setCurrentSublistValue({sublistId: 'item', value: false, fieldId: 'itemreceive'});
                    itemFulfillment.commitLine({sublistId: 'item'});
                }

                //Adding new items
                for(var x = itemsQuantity.length / 2; x > 0; x--){
                    var line = itemFulfillment.findSublistLineWithValue({sublistId: 'item', fieldId: 'itemname', value: itemsQuantity[(x*2)-2]});
                    itemFulfillment.selectLine({sublistId: 'item', line: line});
                    itemFulfillment.setCurrentSublistValue({sublistId: 'item', value: true, fieldId: 'itemreceive', line: line});
                    itemFulfillment.setCurrentSublistValue({sublistId: 'item', value: itemsQuantity[(x*2)-1], fieldId: 'quantity', line: line});
                    itemFulfillment.commitLine({sublistId: 'item'});
                }

                //Setting
                itemFulfillment.setValue({fieldId: 'shipstatus', value: 'C'});
                itemFulfillment.setValue({fieldId: 'shippingcost', value: 0});
                itemFulfillment.save();
            }

        }
        catch(error){
            log.error({title: 'Critical error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

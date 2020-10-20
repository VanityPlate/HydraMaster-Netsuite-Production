/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/log'],
/**
 * @param{currentRecord} currentRecord
 * @param{log} log
 */
function(currentRecord, log) {

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {
        try{
            var sublistName = scriptContext.sublistId;
            var salesOrderObj = scriptContext.currentRecord;
            if(sublistName === 'item'){

            }
            else{
                return true;
            }
        }
        catch(error){
            log.error({title: 'Critical error in validateInsert', details: error});
        }
    }
   
    function saveRecord(scriptContext) {
        try {
            //No need to check if order ready to ship
            if (scriptContext.currentRecord.getValue({fieldId: 'orderstatus'}) != ("D" || "E" || "B")) {
                return true;
            }

            var shipReady = false;

            var lines = scriptContext.currentRecord.getLineCount({sublistId: 'item'});

            for (var x = 0; x < lines; x++) {
                var quantity = scriptContext.currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: x
                });
                var fulfilled = scriptContext.currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantityfulfilled',
                    line: x
                });
                var available = scriptContext.currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantityavailable',
                    line: x
                });
                var committed = scriptContext.currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantitycommitted',
                    line: x
                });
                if (scriptContext.currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_hm_ltl_shipping',
                    line: x
                }))
                    scriptContext.currentRecord.setValue({
                        fieldId: 'custbody_ltl_sales_order',
                        value: true
                    });

                if (!isNaN(parseInt(quantity))) {
                    if (scriptContext.currentRecord.getValue({fieldId: 'shipcomplete'})) {
                        shipReady = true;
                        if (!((available + committed) >= (quantity - fulfilled))) {
                            scriptContext.currentRecord.setValue({
                                fieldId: 'custbody_ready_to_ship',
                                value: false
                            });
                            return true;
                        }
                    } else {
                        if ((quantity - fulfilled) > 0 && available + committed > 0)
                            shipReady = true;
                    }
                }
            }
            scriptContext.currentRecord.setValue({
                fieldId: 'custbody_ready_to_ship',
                value: shipReady
            });
            return true;
        }
        catch(error){
            log.error({title: 'Critical Error in saveRecord', details: error});
        }
    }

    return {
        validateInsert: validateInsert,
        saveRecord: saveRecord
    };
    
});

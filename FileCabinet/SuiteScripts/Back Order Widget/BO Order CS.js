/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message'],

function(currentRecord, message) {

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        try{
            var salesObj = scriptContext.currentRecord.getValue({fieldId: 'custpage_sales'});
            var fulfillmentObj = scriptContext.currentRecord.getValue({fieldId: 'custpage_fulfillment'});
            if((salesObj && !fulfillmentObj) || (!salesObj && fulfillmentObj)){
                return true;
            }
            else{
                var errorMessage = message.create({
                    title: 'Error',
                    message: 'Please select either a sales order or an item fulfillment',
                    type: message.Type.ERROR
                });
                errorMessage.show({duration: 25000});
            }
        }
        catch(error){
            log.error({title: 'Critical Error in saveRecord', details: error});
        }
    }

    return {
        saveRecord: saveRecord
    };
    
});

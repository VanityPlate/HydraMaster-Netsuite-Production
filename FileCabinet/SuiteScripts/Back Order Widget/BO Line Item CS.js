/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message'],

function(message) {

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
            var lines = scriptContext.currentRecord.getLineCount({sublistId: 'custpage_lineitems'});
            if(lines == 0){
                var linesError = message.create({
                    type: message.Type.ERROR,
                    title: 'Error',
                    message: 'You must include at minimum one line item.',
                });
                linesError.show({duration: 25000});
            }
            else{
                var next = true;
                for(var x = 0; x < lines; x++){
                    var quantity = scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_lineitems', fieldId: 'custpage_quantity', line: x});
                    if(!quantity || parseInt(quantity, 10) <= 0){
                        next = false;
                    }
                }
                if(next) {
                    return true;
                }
                else{
                    var quantityError = message.create({
                        type: message.Type.ERROR,
                        title: 'Error',
                        message: 'Each line item must have a quantity one or greater.'
                    });
                    quantityError.show({duration: 25000});
                }
            }
        }
        catch (error) {
            log.error({title: 'Critical Error in saveRecord', details: error});
        }
    }

    return {
        saveRecord: saveRecord
    };
    
});

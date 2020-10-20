/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord, message) {

    /**
     * Constant representing the acceptable deviation from payment amount
     */
    const deviation = 1.05;

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try {
            if (scriptContext.fieldId === 'custbody_pay_amount') {
                //Gathering variables
                var payment = scriptContext.currentRecord;
                var amountToPay = payment.getValue({fieldId: 'custbody_pay_amount'});
                var amountPaid = 0;
                var bills = payment.getLineCount({sublistId: 'apply'});

                //Sending alert to user
                var messageObj  = message.create({
                    type: message.Type.INFORMATION,
                    title: 'Apply Payment',
                    message: 'Applying Payment amount to individual invoices. Oldest to newest. Please verify payments.',
                    duration: 60000
                }).show();

                //Applying payments
                for (var x = 0; x < bills; x++) {
                    var amountDue = payment.getSublistValue({sublistId: 'apply', fieldId: 'due', line: x});
                    if(amountPaid == amountToPay || amountPaid > amountToPay){
                        break;
                    }
                    else if (amountDue < ((amountToPay - amountPaid) * deviation)) {
                        amountPaid += amountDue;
                        payment.selectLine({sublistId: 'apply', line: x});
                        payment.setCurrentSublistValue({sublistId: 'apply', fieldId: 'apply', value: true});
                    }
                    else{
                        var finalAmount = amountToPay - amountPaid;
                        amountPaid += finalAmount;
                        payment.selectLine({sublistId: 'apply', line: x});
                        payment.setCurrentSublistValue({sublistId: 'apply', fieldId: 'amount', value: finalAmount});
                    }
                }
            }
        }
        catch(error){
            log.error({title: 'Critical error in fieldChanged', details: error});
        }
    }

    return {
        fieldChanged: fieldChanged
    };
    
});

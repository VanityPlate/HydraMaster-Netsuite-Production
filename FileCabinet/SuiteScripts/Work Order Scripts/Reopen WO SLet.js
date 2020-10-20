/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param{record} record
 */
function(record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try {
            if(context.request.method === 'GET') {
                var recordid = context.request.parameters['workorder'];
                var worecord = record.load({
                    type: record.Type.WORK_ORDER,
                    id: recordid
                });
                var items = worecord.getLineCount({sublistId: 'item'});
                for (var x = 0; x < items; x++) {
                    worecord.setSublistValue({sublistId: 'item', fieldId: 'isclosed', value: false, line: x});
                }

                worecord.save()
            }
        }
        catch(error){
            log.error({title: 'Critical Error in onRequest', details: error});
            throw error;
        }
    }

    return {
        onRequest: onRequest
    };
    
});

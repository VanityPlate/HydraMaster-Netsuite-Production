/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/action', 'N/record'],

function(runtime, action, record) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try{
            //Getting parameters
            var results = runtime.getCurrentScript().getParameter({name: 'custscript_results'});

            //parsing results
            var payments = results.split('^^^');

            //updating records
            for(var x = 0; x < (payments.length -1); x++){
                var actions = action.find({recordType: record.Type.VENDOR_PAYMENT, recordId: payments[x + 1]});
                if(actions.confirm){
                    var result = actions.confirm();
                }
            }
        }
        catch(error){
            log.error({title: 'Critical Error in execute', details: error});
        }
    }

    return {
        execute: execute
    };
    
});

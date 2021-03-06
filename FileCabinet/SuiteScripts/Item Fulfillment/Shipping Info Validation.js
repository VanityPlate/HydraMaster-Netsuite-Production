/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/message', 'N/ui/dialog', 'N/search'],
/**
 * @param{record} record
 * @param{message} message
 */
function(record, message, dialog, search) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var shipInfo = scriptContext.currentRecord.getValue({
            fieldId: 'custbody_pcg_ship_instructions'
        });
        if(shipInfo.length > 0){
            var messageObj = message.create({
                type: message.Type.WARNING,
                title: 'READ THE SHIPPING INFORMATION!',
                message: shipInfo
            });
            messageObj.show({
               duration: 60000
            });
        }
        search.lookupFields.promise({
            type: search.Type.SALES_ORDER,
            id: scriptContext.currentRecord.getValue({fieldId: 'createdfrom'}),
            columns: 'shipcomplete'
        }).then(function (result) {
            if(result.shipcomplete){
                dialog.alert({
                   title: 'Ship Complete',
                   message: 'This order is ship complete. If shipping partial order first confirm with sales.'
                });
            }
        }).catch(function onRejected(reason) {
           console.log(reason);
        });

    }

    return {
        pageInit: pageInit,
    };
    
});

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

    function saveRecord(scriptContext){
        try{
            var trackingNumbers = '';
            var upsLines = scriptContext.currentRecord.getLineCount({sublistId: 'packageups'});
            if(upsLines > 0) {
                for (var x = 0; x < upsLines; x++) {
                    trackingNumbers = trackingNumbers.concat(scriptContext.getSublistValue({sublistId: 'packageups', fieldId: 'packagetrackingnumberups', line: x}) + '\n');
                }
            }
            var fedLines = scriptContext.currentRecord.getLineCount({sublistId: 'packagefedex'});
            if(upsLines > 0) {
                for (var x = 0; x < fedLines; x++) {
                    trackingNumbers = trackingNumbers.concat(scriptContext.getSublistValue({sublistId: 'packagefedex', fieldId: 'packagetrackingnumberups', line: x}) + '\n');
                }
            }
            scriptContext.currentRecord.setValue({fieldId: 'custbody_pcg_ifcustom_tracking_number', value: trackingNumbers});
            return true;
        }
        catch (error){
            log.error({title: 'Critical error in saveRec', details: error});
        }
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    };
    
});

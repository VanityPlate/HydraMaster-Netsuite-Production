/**
 * @copyright Alex S. Ducken 2020, HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/dialog'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord, dialog) {

    /**
     * Constants
     *
     * @ALERTTITLE  - title for success message
     * @ALERTMESSAGE - message body for success
     * @ALERTFAIL - title for failure to find message
     * @MESSAGEFAIL - message body for failure to find message
     */
    const ALERTTITLE = 'Line Item Removed';
    const ALERTMESSAGE = ' has been removed from the bill of materials.';
    const ALERTFAIL = 'Item Not Found';
    const MESSAGEFAIL = ' was not found for removal.';

    /**
     * Function to be executed when field is slaved.
     *
     * @details script to remove item from work order bill of materials
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        var success = function () {
            return null;
        };
        var failure = function () {
            throw 'Error generating message';
        };

        try{
            if(scriptContext.fieldId === 'custbody_wo_remove_item'){
                var itemID = scriptContext.currentRecord.getValue({fieldId: 'custbody_wo_remove_item'});

                var lineNumber = scriptContext.currentRecord.findSublistLineWithValue({sublistId: 'item', fieldId: 'item', value: itemID});
                if(lineNumber != -1){
                    scriptContext.currentRecord.removeLine({sublistId: 'item', line: lineNumber});
                    var completeMessage = scriptContext.currentRecord.getText({fieldId: 'custbody_wo_remove_item'}) + ALERTMESSAGE;
                    dialog.alert({
                        title: ALERTTITLE,
                        message: completeMessage
                    }).then(success).catch(failure);
                }
                else{
                    var completeMessage =  scriptContext.currentRecord.getText({fieldId: 'custbody_wo_remove_item'}) + MESSAGEFAIL;
                    dialog.alert({
                        title: ALERTFAIL,
                        message: completeMessage
                    }).then(success).catch(failure);
                }
            }
        }
        catch(error){
            log.error({title: 'Critical error in postSourcing', details: error});
        }

    }



    return {
        fieldChanged: fieldChanged
    }
});

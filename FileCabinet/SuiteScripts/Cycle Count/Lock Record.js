/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message', 'N/runtime'],
/**
 * @param{search} search
 */
function(search, message, runtime) {

    /**
     * Constants
     *
     * @param SUBLISTID key value pairs for sublistID to record type.
     */
    const SUBLISTID = {assemblybuild: 'component', itemfulfillment: 'item', assemblyunbuild: 'component', itemreceipt: 'item'};

    /**
     * Send error message to user that their transaction cannot be saved
     */
    function displayMessage(){
        try{
            message.create({
                duration: 60000,
                type: message.Type.ERROR,
                title: 'Cannot Commit Record',
                message: 'Transaction is locked because of ongoing cycle count. One or more items are currently being counted. \n' +
                    'Delay commitment or see and administrator.'
            }).show();
        }
        catch(error){
            log.error({title: 'Critical error in displayMessage', details: error});
        }
    }

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
            var output = true;
            //Generate search to check items on record against started cycle counts
            var searchResults = search.create({
                type: "inventorycount",
                filters:
                    [
                        ["type","anyof","InvCount"],
                        "AND",
                        ["mainline","is","F"],
                        "AND",
                        ["cogs","is","F"],
                        "AND",
                        ["shipping","is","F"],
                        "AND",
                        ["status","anyof","InvCount:B"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "item",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "Internal ID"
                        })
                    ]
            }).run().getRange({start: 0, end: 1000});
            //Checking if there are items to compare against
            if(searchResults.length > 0){
                var listId = SUBLISTID[scriptContext.currentRecord.type.toString()];
                searchResults.forEach(function (result){
                    if(-1 != scriptContext.currentRecord.findSublistLineWithValue({sublistId: listId, fieldId: 'item', value: result.getValue({name: 'internalid', summary: 'GROUP', join: 'item'})})){
                        displayMessage();
                        output = false;
                    }
                });
            }

            //return true as default
            return output;

        }
        catch(error){
            log.error({title: 'Critical error in saveRecord', details: error});
        }
    }

    return {
        saveRecord: saveRecord
    };
    
});

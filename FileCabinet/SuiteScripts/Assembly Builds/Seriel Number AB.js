/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/log', 'N/record', 'N/search', 'N/ui/dialog'],
    /**
     * @param{currentRecord} currentRecord
     * @param{log} log
     * @param{record} record
     * @param{search} search
     */
    function(currentRecord, log, record, search, dialog) {


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
                if(scriptContext.currentRecord.getValue({fieldId: 'custbody_serial_verified'})){
                    return true;
                }


                //Retrieving the subrecord to check it's serial numbers
                var invDetails = scriptContext.currentRecord.getSubrecord({fieldId: 'inventorydetail'});

                //No serial numbers to test against allowing save.
                if (!invDetails){
                    return true;
                }

                //Array for holding duplicate serial numbers
                var duplicates = [": "];

                //Iterating though the sublist on the subrecord checking that the serial number has not been used
                //previously
                var lines = invDetails.getLineCount({sublistId: 'inventoryassignment'});
                for(var x = 0; x < lines; ++x){
                    //retrieving the current serial number
                    invDetails.selectLine({sublistId: 'inventoryassignment', line: x});
                    var serialNumber = invDetails.getCurrentSublistValue(
                        {sublistId: 'inventoryassignment', fieldId: 'issueinventorynumber'});

                    //Refactor Testing
                    log.audit({title: 'Serial Number Test', details: serialNumber});

                    //creating and running a search to see if the current serial number is already in use
                    var filters = [["type","anyof","ItemShip"],"AND",["item.isserialitem","is","T"],"AND",["mainline","is","T"],"AND",["item.serialnumber","is", serialNumber]];
                    var inUse = search.create({
                        type: search.Type.TRANSACTION,
                        filters: filters
                    }).run().getRange({start: 0, end: 5});

                    //If there are any results add the duplicate serial number to alert user
                    if(inUse.length>1){
                        duplicates.push(serialNumber);
                    }

                    //Test Log
                    log.audit({title: x, details: serialNumber});
                }
                //if duplicates has more than the initial variable alert the user and return false to stop the save
                //otherwise return true to allow the saveing of the Assembly Build
                if(duplicates.length > 1){
                    dialog.alert({title: "SAVE FAILED!", message: "The following Serial#s are duplicates" + duplicates}).then(success).catch(failure);
                    return false;
                }

                else{
                    scriptContext.currentRecord.setValue({fieldId: 'custbody_serial_verified', value: true});
                    return true;
                }
            }
            catch(error){
                log.audit({title: "Critical Error in saveRecord", details: error});
                return false;
            }
        }

        return {
            saveRecord: saveRecord
        };

    });

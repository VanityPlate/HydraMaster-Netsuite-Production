/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message', 'N/ui/dialog', './Warranty Field Lib.js', 'N/search'],

function(currentRecord, message, dialog, fieldLib, search) {

    /**
     * CONSTANTS
     *
     * @MESSAGEBODY the body of a message to the user
     */
    const MESSAGEBODY = {
        0: 'This serial number is in use either by a installer or end user. See administrator.',
        1: 'This serial number is already in use by a end user. See administrator.',
        2: 'This serial number is already in use by a installer. See administrator.'
                        };

    /**
     * Helper function for displaying error messages to user.
     *
     * @param messageBody - the body of the message
     */
    function errorMessage(messageBody){
        try{
            message.create({
                duration: 30000,
                type: message.Type.ERROR,
                title: 'Serial Number In Use',
                message: messageBody
            }).show();
        }
        catch(error){
            throw 'Error in errorMessage ' + error;
        }
    };

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
        try{
            message.create({
                duration: 30000,
                type: message.Type.INFORMATION,
                title: 'Select Forms/Serial#',
                message: 'Enter a valid Serial# and select which forms to enter.'
            }).show();
        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try{
            if(scriptContext.fieldId == fieldLib.customerFields.serialNumber.id){
                var serialNumber = scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.serialNumber.id});
                var searchObj = search.create({
                    type: "salesorder",
                    filters:
                        [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["serialnumber", "is", serialNumber]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "salesdescription",
                                join: "item",
                                label: "Description"
                            })
                        ]
                }).run().getRange({start: 0, end: 1});
                if (searchObj.length > 0) {
                    //Do Nothing,  Serial Number is Valid
                } else {
                    scriptContext.currentRecord.setValue({fieldId: fieldLib.customerFields.serialNumber.id, value: ''});
                    message.create({
                        duration: 25000,
                        title: 'NO SUCH SERIAL NUMBER!',
                        message: 'Serial number not found.',
                        type: message.Type.ERROR
                    }).show();
                }
            }
        }
        catch(error){
            log.error({title: 'Critical error in fieldChanged', details: error});
        }
    }

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
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

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
            debugger;
            var formSelect = scriptContext.currentRecord.getValue({fieldId: fieldLib.entrySelect.formSelect.id});
            var searchObj = search.create({
                type: "customrecord_wrm_warrantyreg",
                filters:
                    [
                        ["custrecord_wrm_reg_serialnumber","anyof", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.serialNumber.id})]
                    ],
                columns:
                    [
                        search.createColumn({name: "custrecord_wrm_reg_ref_seriallot", label: "Serial/Lot Number"}),
                        search.createColumn({name: 'custrecord_installer_info', label: 'Installer Info'}),
                        search.createColumn({name: 'custrecord_wrm_reg_customer', label: 'End User'})
                    ]
            }).run().getRange({start: 0, end: 1});
            if(searchObj.length == 0){
                return true;
            }
            //Checking End User and Installer
            else if(formSelect ==  0 && (searchObj[0].getValue({name: 'custrecord_installer_info'}) || searchObj[0].getValue({name: 'custrecord_wrm_reg_customer'}))){
                errorMessage(MESSAGEBODY['0']);
            }
            //Checking Just End User
            else if(formSelect == 1 && searchObj[0].getValue({name: 'custrecord_wrm_reg_customer'})){
                errorMessage(MESSAGEBODY['1']);
            }
            //Checking Just Installer
            else if(formSelect == 2 && searchObj[0].getValue({name: 'custrecord_installer_info'})){
                errorMessage(MESSAGEBODY['2']);
            }
            else{
                return true;
            }
        }
        catch(error){
            log.error({title: 'Critical Error in saveRecord', details: error});
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        //postSourcing: postSourcing,
        //sublistChanged: sublistChanged,
        //lineInit: lineInit,
        //validateField: validateField,
        //validateLine: validateLine,
        //validateInsert: validateInsert,
        //validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});

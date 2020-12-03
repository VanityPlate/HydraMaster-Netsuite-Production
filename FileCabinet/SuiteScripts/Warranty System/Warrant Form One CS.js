/**
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/ui/message', 'N/record', './Warranty Field Lib.js'],
/**
 * @param{record} record
 * @param{search} search
 */
function(currentRecord, search, message, record, fieldLib) {

    /**
     * Function for generating and display and error message to the client -
     * informs user that of possible reasons for not being able to find an existing user
     */
    function noUserFoundMessage(){
        try{
            var messageObj = message.create({
                title: 'NO USER FOUND',
                message: 'User Might be a Lead or Prospect and require conversion or does not exist.',
                type: message.Type.ERROR,
                duration: 45000
            }).show();

            //Setting Field Values
            var clientObj = currentRecord.get();
            clientObj.setValue({fieldId: fieldLib.customerFields.oldCustomer.id, value: null});
            clientObj.setValue({fieldId: fieldLib.customerFields.oldCustEmail.id, value: null});
            clientObj.setValue({fieldId: fieldLib.customerFields.oldCustPhone.id, value: null});
            clientObj.setValue({fieldId: fieldLib.customerFields.customerAddress.id, value: ''});
            clientObj.setValue({fieldId: fieldLib.customerFields.customerPhone.id, value: ''});
            clientObj.setValue({fieldId: fieldLib.customerFields.customerEmail.id, value: ''});
            clientObj.setValue({fieldId: fieldLib.customerFields.mainContact.id, value: ''});
            clientObj.setValue({fieldId: fieldLib.customerFields.companyName.id, value: ''});

            //Enabling Fields
            fieldLib.customerInfo.forEach(function(fieldObj){
               clientObj.getField({fieldId: fieldObj.id}).isDisabled = false;
            });
        }
        catch(error){
            throw 'Critical error in noUserFoundMessage' + error;
        }
    }

    /**
     * Function that loads a record via promise api then updates and locks fields,
     * otherwise function informs user that no record could be located
     */
    function existingCustomer(customerId){
        try{
            //Creating Record Load Promise
            var loadRecordPromise = record.load.promise({
               type: record.Type.CUSTOMER,
               id: customerId,
               isDynamic: false
            });
            var clientObj = currentRecord.get();

            //Executing on Record Load Promise
            loadRecordPromise.then(function(objRecord) {
                //Setting Field Values
                clientObj.setValue({fieldId: fieldLib.customerFields.customerAddress.id, value: objRecord.getValue({fieldId: 'defaultaddress'})});
                clientObj.setValue({fieldId: fieldLib.customerFields.customerPhone.id, value: objRecord.getValue({fieldId: 'phone'})});
                clientObj.setValue({fieldId: fieldLib.customerFields.customerEmail.id, value: objRecord.getValue({fieldId: 'email'})});
                clientObj.setValue({
                        fieldId: fieldLib.customerFields.mainContact.id,
                        value: objRecord.getValue({fieldId: 'entityid'})
                    });
                clientObj.setValue({fieldId: fieldLib.customerFields.companyName.id, value: objRecord.getValue({fieldId: 'companyname'})});

                //Disabling Fields
                fieldLib.customerInfo.forEach(function(fieldObj){
                    clientObj.getField({fieldId: fieldObj.id}).isDisabled = true;
                });

                //Setting hidden value for use in scheduled script
                clientObj.setValue({fieldId: fieldLib.customerFields.hiddenCustomer.id, value: customerId});

            }, function(e) {
                //Error Loading Record Inform User
                noUserFoundMessage();
                throw e;
            });
        }
        catch(error){
            throw 'Critical error in existingCustomer' + error;
        }
    }

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
            var messageObj = message.create({
                duration: 30000,
                type: message.Type.INFORMATION,
                title: 'Instructions',
                message: 'Find an existing customer by using the "Find an Existing Customer" fields or enter new customer information.',
            }).show();

            //Setting Machine Type
            if(scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.serialNumber.id})){
                var searchObj = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["type", "anyof", "CustInvc"],
                            "AND",
                            ["serialnumber", "is", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.serialNumber.id})]
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
                    scriptContext.currentRecord.setValue({
                        fieldId: fieldLib.customerFields.machine.id,
                        value: searchObj[0].getValue({name: 'salesdescription', join: 'item'})
                    });
                } else {
                    throw 'Error finding serial number in formOne CS.';
                }
            }
        }
        catch(error){
            throw error;
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
            if(scriptContext.fieldId == fieldLib.customerFields.oldCustomer.id){
                //gathering information to post to page
                existingCustomer(scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.oldCustomer.id}));
            }
            else if(scriptContext.fieldId == fieldLib.customerFields.oldCustPhone.id) {
                //validating input
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["phone", "haskeywords", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.oldCustPhone.id})],
                            "OR",
                            ["contact.phone", "haskeywords", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.oldCustPhone.id})]
                        ]
                }).run().getRange({start: 0, end: 1});
                if (customerSearchObj.length == 0) {
                    noUserFoundMessage();
                } else {
                    existingCustomer(customerSearchObj[0].id);
                }
            }
            else if(scriptContext.fieldId == fieldLib.customerFields.oldCustEmail.id){
                //validating input and calling field update
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["email","contains", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.oldCustEmail.id})],
                            "OR",
                            ["custentity_2663_email_address_notif","contains", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.oldCustEmail.id})],
                            "OR",
                            ["contact.email","contains", scriptContext.currentRecord.getValue({fieldId: fieldLib.customerFields.oldCustEmail.id})]
                        ]
                }).run().getRange({start: 0, end: 1});
                if(customerSearchObj.length == 0){
                    noUserFoundMessage();
                }
                else{
                    existingCustomer(customerSearchObj[0].id);
                }
            }
        }
        catch(error){
            log.error({title: 'Critical Error in fieldChanged', details: error});
        }
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
            if(scriptContext.currentRecord.getField({fieldId: fieldLib.customerFields.mainContact.id}).isDisabled == false){
                    var recrodObj = scriptContext.currentRecord;
                    var country = recrodObj.getValue({fieldId: fieldLib.customerFields.customerCountry.id});
                    var mainContact = recrodObj.getValue({fieldId: fieldLib.customerFields.mainContact.id});
                    var email = recrodObj.getValue({fieldId: fieldLib.customerFields.customerEmail.id});
                    var phone = recrodObj.getValue({fieldId: fieldLib.customerFields.customerPhone.id});
                    var companyName = recrodObj.getValue({fieldId: fieldLib.customerFields.companyName.id});
                    var streetAddress = recrodObj.getValue({fieldId: fieldLib.customerFields.customerStreet.id});
                    var city = recrodObj.getValue({fieldId: fieldLib.customerFields.customerCity.id});
                    var state = recrodObj.getValue({fieldId: fieldLib.customerFields.customerState.id});
                    var zip = recrodObj.getValue({fieldId: fieldLib.customerFields.customerZip.id});
                    if(!zip || !city || !streetAddress || !companyName || !phone || !email || !mainContact || !country){
                        var messageObj = message.create({
                           type: message.Type.ERROR,
                           title: 'Missing Customer Info',
                           message: 'Must complete all fields for a new customer.',
                           duration: 25000
                        }).show();
                        return false;
                    }
                    else{
                        return true;
                    }
            }
            else{
                return true;
            }
        }
        catch(error){

        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        //sublistChanged: sublistChanged,
        //lineInit: lineInit,
        //validateField: validateField,
        //validateLine: validateLine,
        //validateInsert: validateInsert,
        //validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});

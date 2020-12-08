/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/record', 'N/search', 'N/runtime', './Warranty Field Lib.js', 'N/format'],

function(email, record, search, runtime, fieldLib, format) {

    /**
     * Helper function for converting custpage_ field to custbody_ field
     *
     * @param fieldId the unconverted field id
     * @return string the converted field id
     */
    function convertFieldId(fieldId){
        try{
            var regularExp = /custpage/g;
            return fieldId.replace(regularExp, 'custrecord');
        }
        catch(error){
            log.error({title: 'Critical error in convertFieldId', details: error});
        }
    }

    /**
     * Adding address and name to record
     */
    function fieldUpdate(recordObj, formOne){
        try {
            recordObj.setValue({fieldId: 'email', value: formOne['custpage_info_email']});
            recordObj.setValue({fieldId: 'phone', value: formOne['custpage_info_phone']});
            recordObj.setValue({fieldId: 'subsidiary', value: '1'});
            var nameSplit = formOne['custpage_main_contact'].split(' ');
            switch (nameSplit.length) {
                case 1:
                    recordObj.setValue({fieldId: 'firstname', value: nameSplit[0]});
                    recordObj.setValue({fieldId: 'lastname', value: '_'});
                    break;
                case 2:
                    recordObj.setValue({fieldId: 'firstname', value: nameSplit[0]});
                    recordObj.setValue({fieldId: 'lastname', value: nameSplit[1]});
                    break;
                default:
                    recordObj.setValue({fieldId: 'firstname', value: nameSplit[0]});
                    recordObj.setValue({fieldId: 'lastname', value: nameSplit[2]});
                    recordObj.setValue({fieldId: 'middlename', value: nameSplit[1]});
            }
            //Setting Address
            recordObj.selectNewLine({sublistId: 'addressbook'});
            var addressSub = recordObj.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
            });
            addressSub.setValue({fieldId: 'addr1', value: formOne['custpage_street_address']});
            addressSub.setValue({fieldId: 'addressee', value: formOne['custpage_main_contact']});
            addressSub.setValue({fieldId: 'addrphone', value: formOne['custpage_info_phone']});
            addressSub.setValue({fieldId: 'city', value: formOne['custpage_city']});
            addressSub.setValue({fieldId: 'country', value: formOne['custpage_country']});
            addressSub.setValue({fieldId: 'state', value: formOne['custpage_state']});
            addressSub.setValue({fieldId: 'zip', value: formOne['custpage_zip']});
            addressSub.setValue({fieldId: 'addr2', value: formOne['custpage_suite_address']});
            recordObj.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'defaultbilling', value: true});
            recordObj.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'defaultshipping', value: true});
            recordObj.commitLine({sublistId: 'addressbook'});
        }
        catch(error){
            log.error({title: 'Critical error in fieldUpdate', details: error});
        }
    }

    /**
     * Create Customer
     */
    function createCustomer(formOne, formTwo, formThree){
        try {
            //Creating Customer Record
            var customerObj = record.create({
                type: record.Type.CUSTOMER,
                isDynamic: true
            });
            //Setting Values
            customerObj.setValue({fieldId: 'isperson', value: 'T'});
            customerObj.setValue({fieldId: 'companyname', value: formOne['custpage_company_name']});
            customerObj.setValue({fieldId: 'custentity_customer_type', value: '5'});
            fieldUpdate(customerObj, formOne);

            //saving record
            return customerObj.save();
        }
        catch(error){
            log.error({title: 'Critical Error in createCustomer', details: error});
        }
    }

    /**
     * Create Warranty
     */
    function createWarranty(formZero, formOne, formTwo){
        var warrantyObj = record.create({
            isDynamic: true,
            type: 'customrecord_wrm_warrantyreg'
        });

        //Searching Up Item, Invoice, Invoice Date, Distributor
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type","anyof","CustInvc"],
                    "AND",
                    ["serialnumber","contains", formZero[fieldLib.customerFields.serialNumber.id]]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        join: "item",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "customerMain",
                        label: "Internal ID"
                    }),
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "datecreated", label: "Date Created"})
                ]
        }).run().getRange({start: 0, end: 1});

        if(invoiceSearchObj.length > 0) {
            //Field Setting
            warrantyObj.setValue({
                fieldId: 'custrecord_wrm_reg_ref_seriallot',
                value: formZero[fieldLib.customerFields.serialNumber.id]
            });
            warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: invoiceSearchObj[0].getValue({name: 'internalid', join: 'item'})});
            //Refactor Testing
            log.audit({title: 'item', details: invoiceSearchObj[0].getValue({name: 'internalid', join: 'item'})});
            var dateCreated = format.parse({value: invoiceSearchObj[0].getValue({name: 'datecreated'}), type: format.Type.DATE});
            warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_invoicedate', value: dateCreated, ignoreFieldChange: true});
            warrantyObj.setValue({fieldId: 'custrecord_invoice_reference', value: invoiceSearchObj[0].getValue({name: 'internalid'})});
            warrantyObj.setValue({fieldId: 'custrecord_selling_distributor', value: invoiceSearchObj[0].getValue({name: 'internalid', join: 'customerMain'})});
            warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_customer', value: invoiceSearchObj[0].getValue({name: 'internalid', join: 'customerMain'})});
            warrantyObj.setValue({fieldId: 'custrecord_vehicle_vin', value: formZero[fieldLib.customerFields.vehicleVIN.id]});
            //Setting Warranty Date
            var startDate = format.parse({value: formZero[fieldLib.entrySelect.installDate.id], type: format.Type.DATE});
            var terms = warrantyObj.getValue({fieldId: 'custrecord_wrm_reg_warrantyterm'});
            warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_warrantybegin', value: startDate, ignoreFieldChange: true});
            warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_warrantyterm', value: null});
            warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_warrantyterm', value: terms});

            //Saving and Returning Warranty Object
            return warrantyObj.save();
        }
    }

    /**
     * Create Installer Record
     */
    function createInstaller(formOne, formTwo, formThree){
        var installerObj = record.create({
            isDynamic: true,
            type: 'customrecord_installer_info'
        });

        //Setting fields
        for (const [key, value] of fieldLib.installerFields){
            switch(fieldLib.installerFields[key].id){
                case fieldLib.installerFields.testDate.id:
                    var setDate = format.format({value: formTwo[fieldLib.installerFields.testDate.id], type: format.Type.DATE});
                    installerObj.setValue({fieldId: fieldLib.installerFields.testDate.id, value: setDate});
                    break;
                default:
                    installerObj.setValue({fieldId: convertFieldId(fieldLib.installerFields[key].id), value: formTwo[fieldLib.installerFields[key].id], ignoreFieldChange: true});
            }
        }

        //Save and return
        return installerObj.save()
    }

    /**
     * Create Sales Order when incentives are Requested
     */
    function createSales(customerId, jacket, chemKit, jacketSize){
        try{

        }
        catch(error){
            log.error({title: 'Critical error in createSales', details: error});
        }
    }

    /**
     * Adds the end user information to the warranty registration
     */
    function appendRecords(installerId, customerId, warrantyId){
        try{
            //Testing for undefined variables
            installerId = (typeof installerId !== 'undefined' && installerId != null) ? installerId : -1;
            customerId = (typeof customerId !== 'undefined' && customerId != null) ? customerId : -1

            if(installerId || customerId){
                var warrantyObj = record.load({
                    type: 'customrecord_wrm_warrantyreg',
                    id: warrantyId,
                    isDynamic: true
                });
                if(installerId){warrantyObj.setValue({fieldId: 'custrecord_installer_info', value: installerId})};
                if(customerId){warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_customer', value: customerId})};
                warrantyObj.save();
            }
        }
        catch(error){
            log.error({title: 'Critical Error in appendCustomer', details: error});
        }
    }

    /**
     * Send email notifaction to thank end user
     */
    function sendEmail(warrantyId, customerId){
        try{
            //Find warranty to attach to email
            var warranty = search.create({
                type: "customrecord_wrm_warrantyreg",
                filters:
                    [
                        ["internalid","anyof", warrantyId]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"})
                    ]
            }).run().getRange({start: 0, end: 1});

            //Find customer to attach to email
            var customer = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid","anyof", customerId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "altname",
                            label: "Name"
                        })
                    ]
            }).run().getRange({start: 0, end: 1});

            //Constructing body of the email
            var body = 'Customer: ' + customer.getValue({name: 'altname'}) + ' Warranty: ' + warranty.getValue({name: ''}) + '.'

            //Send email
            email.send({
                author:         fieldLib.sender,
                recipients:     fieldLib.emailIds,
                subject:        'Please send a thank you card!',
                body:           body
            });
        }
        catch(error){
            log.error({title: 'Critical error in sendEmail', details: error});
        }
    }

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try{
            //Refactor Testing
            log.audit({title: 'Testing script fire.', details: 'execute fired'});

            //Gathering parameters
            var formZero = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_form_zero_params'}));
            var formOne = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_form_one_params'}));
            var formTwo = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_form_two_params'}));
            var formThree = JSON.parse(runtime.getCurrentScript().getParameter({name: 'custscript_form_three_params'}));

            //Refactor Testing
            log.audit({title: 'Form Zero', details: formZero});
            log.audit({title: 'Form One', details: formOne});
            log.audit({title: 'Form Two', details: formTwo});
            log.audit({title: 'Form Three', details: formThree});

            //gathering variables for deciding on how to build warranty
            var customerId = parseInt(formOne[fieldLib.customerFields.hiddenCustomer.id], 10);
            var formSelect = formZero[fieldLib.entrySelect.formSelect.id];
            var serialNumber = formZero[fieldLib.customerFields.serialNumber.id];
            var installerId, warrantyId;

            //Searching for existing warranty
            var warrantySearch = search.create({
                type: "customrecord_wrm_warrantyreg",
                filters:
                    [
                        ["custrecord_wrm_reg_ref_seriallot","contains",serialNumber]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"})
                    ]
            }).run().getRange({start: 0, end: 1});
            if(warrantySearch.length > 0){
                warrantyId = warrantySearch[0].getValue({name: 'internalid'});
            }

            //Creating Warranty Registration if None Exist
            if(!warrantyId) {
                warrantyId = createWarranty(formZero, formOne, formTwo);
            }

            //Creating Installer Record
            if(formSelect == 0 || formSelect == 2) {
                installerId = createInstaller(formOne, formTwo, formThree);
            }

            //Deciding between new customer or to use existing
            if(!customerId && (formSelect == 0 || formSelect == 1)){
                customerId = createCustomer(formOne, formTwo, formThree);
            }

            //Appending records to warranty registration
            appendRecords(installerId, customerId, warrantyId);


            //Creating Sales Order if One is Required
            if(formThree[fieldLib.rewardsFields.jacket.id] == 'T' || formThree[fieldLib.rewardsFields.chemicalKit.id] == 'T'){
               createSales(customerId, formThree[fieldLib.rewardsFields.jacket.id], formThree[fieldLib.rewardsFields.chemicalKit.id], formThree[fieldLib.rewardsFields.jacketSize.id]);
            }

            //Sending email notifaction send out thank you card
            if(formSelect == 0 || formSelect == 1) {
                sendEmail(warrantyId, customerId);
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

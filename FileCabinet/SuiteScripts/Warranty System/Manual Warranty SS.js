/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', './Warranty Field Lib.js'],

function(record, search, runtime, fieldLib) {

    /**
     * Helper function for converting custpage_ field to custbody_ field
     *
     * @param fieldId the unconverted field id
     * @return string the converted field id
     */
    function convertFieldId(fieldId){
        try{
            var regularExp = /custpage/g;
            return fieldId.replace(regularExp, 'custbody');
        }
        catch(error){
            log.error({title: 'Critical error in convertFieldId', details: error});
        }
    }

    /**
     * Adding address and name to record
     */
    function fieldUpdate(recordObj, formOne){
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
    function createWarranty(customerId, installerId, formOne, formTwo, formThree){
        var warrantyObj = record.create({
            isDynamic: true,
            type: 'customrecord_wrm_warrantyreg'
        });

        //Searching Up Item, Invoice, Invoice Date, Distributor


        //Field Setting
        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_customer', value: customerId});
        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_ref_seriallot', value: formOne['custpage_serial_number']});
    }

    /**
     * Create Installer Record
     */
    function createInstaller(formOne, formTwo, formThree){
        var installerObj = record.create({
            isDynamic: true,
            type: 'customrecord_install_details'
        });
        installerObj.setValue({fieldId: 'name', value: 'Test 3070'});
        return installerObj.save()
    }

    /**
     * Create Sales Order when incentives are Requested
     */
    function createSales(customerId, jacket, chemKit, jacketSize){

    }

    /**
     * Adds the end user information to the warranty registration
     */
    function appendCustomer(customerId, warrantyId){
        try{

        }
        catch(error){
            log.error({title: 'Critical Error in appendCustomer', details: error});
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
            var installerId, warrantyId;

            //Creating Warranty Registration if None Exist
            if(!warrantyId) {
                warrantyId = createWarranty(customerId, installerId, formOne, formTwo, formThree);
            }

            //Deciding between new customer or to use existing
            if(!customerId && (formSelect == 0 || formSelect == 1)){
                customerId = createCustomer(formOne, formTwo, formThree);
            }
            else{
                appendCustomer(customerId, warrantyId);
            }
            //Creating Installer Record
            if(formSelect == 0 || formSelect == 2) {
                installerId = createInstaller(formOne, formTwo, formThree);
            }

            //Creating Sales Order if One is Required
            if(formThree[fieldLib.rewardsFields.jacket.id] == 'T' || formThree[fieldLib.rewardsFields.chemicalKit.id] == 'T'){
               createSales(customerId, formThree[fieldLib.rewardsFields.jacket.id], formThree[fieldLib.rewardsFields.chemicalKit.id], formThree[fieldLib.rewardsFields.jacketSize.id]);
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

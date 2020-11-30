/**
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/log', 'N/search'],
/**
 * @param{currentRecord} currentRecord
 * @param{log} log
 */
function(currentRecord, record, log, search) {
    
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
        if(scriptContext.fieldId == "shipmethod"){
            //Gathering Values
            var checkShipping = scriptContext.currentRecord.getValue({fieldId: "shippingcost"});
            var altshippingcost = scriptContext.currentRecord.getValue({fieldId: "altshippingcost"});

            //if shipping cost is to be calculated then set it to zero to effectively cut out the
            //shipping calculator
            if(checkShipping == "To Be Calculated"){
                scriptContext.currentRecord.setValue({fieldId: "shippingcost", value: 0});
            }
        }
        else if(scriptContext.fieldId == 'entity' && scriptContext.currentRecord.getValue({fieldId: 'entity'})){
            var phone = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: scriptContext.currentRecord.getValue({fieldId: 'entity'}),
                columns: ['phone']
            }).phone;
            if(phone){
                try {
                    scriptContext.currentRecord.setValue({fieldId: 'custbody_pcg_contact_phone', value: phone});
                }
                catch (error){}
            }
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
        try{
            if(scriptContext.sublistId === 'item'){
                var itemType = scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'itemtype'});
                if(itemType != 'InvtPart' && itemType != 'Assembly'){
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pcg_list_price_stored',
                            value: null,
                            ignoreFieldChange: true
                        });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_pcg_list_price',
                        value: null,
                        ignoreFieldChange: true
                    });
                        return true;
                   }
                else{return true;}
            }
            else{return true;}
        }
        catch(error){
            log.error({title: 'Critical error in validateLine', details: error});
        }
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

    }

    return {
        //pageInit: pageInit,
        //fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        //sublistChanged: sublistChanged,
        //lineInit: lineInit,
        //validateField: validateField,
        validateLine: validateLine,
        //validateInsert: validateInsert,
        //validateDelete: validateDelete,
        //saveRecord: saveRecord
    };
    
});

/**
 *
 * @copyright Alex S. Ducken 2021 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/url', 'N/ui/message', 'N/ui/dialog', 'SuiteScripts/Help_Scripts/Get_Internal.js', 'N/currentRecord', 'SuiteScripts/Bom Update/Bom Update Library.js'],

function(https, url, message, dialog, get_internal, currentRecord, bomLib) {

    /**
     * Starts replacement script and informs user
     */
    var fire = (result) => {

        if(result) {
            message.create({
                title: 'Work Started!',
                message: 'The swap has been initiated please allow 5 minutes for the work to be completed.',
                type: message.Type.CONFIRMATION,
                duration: 30000
            }).show();

            //Capturing Values
            var recordObj = currentRecord.get();
            var newItem = recordObj.getValue({fieldId: bomLib.fieldIds.newItem});
            var oldItem = recordObj.getValue({fieldId: bomLib.fieldIds.originalItem});

            //Submitting Script For Deployment
            var output = url.resolveScript({
                scriptId: 'customscript_bom_update_slet_handler',
                deploymentId: 'customdeploy_bom_update_slet_handler',
                params: {'newItem': get_internal.item(newItem), 'oldItem': get_internal.item(oldItem)}
            });
            var response = https.get({
               url: output
            });

            //Refactor Testing
            console.log(response);
        }
        else{
            message.create({
                title: 'Work Canceled!',
                message: 'Nothing has been done.',
                type: message.Type.INFORMATION,
                duration: 30000
            }).show();
        }
    };


    /**
     * Informs user no action taken
     */
    var messageError = (reason) => {
        throw 'Error in confirmation. ' + reason.toString();
    };

    /**
     * Constants
     */
    //options for dialog conformation
    const options = {title: 'Confirm Selection', message: 'Test Fire!'};
    const ok = (result) => {fire(result);};
    const cancel = (reason) => {messageError(reason);};

    /**
     * @return{boolean} are the items found in netsuite
     */
    var confirmInput = () => {
        //Collecting data for preforming validation
        var recordObj =  currentRecord.get();
        var originalItem = recordObj.getValue({fieldId: bomLib.fieldIds.originalItem});
        var newItem = recordObj.getValue({fieldId: bomLib.fieldIds.newItem});

        //Checking that both fields contain values
        if(!originalItem || !newItem){return false;}

        //Validating, true for proceed / false for stop
        if(!get_internal.item(originalItem) || !get_internal.item(newItem)){
            return false;
        }
        else{return true;}
    };

    /**
     * Displays a message to user that they have provided incorrect input
     */
    var inputError = () => {
        message.create({
            type: message.Type.ERROR,
            title: 'Input Error!',
            message: 'One or more items you\'ve selected could not be found.',
            duration: 15000
        }).show();
    };

    /**
     * Function for initiating Bom Update
     */
    function submitBomChange(){
        try{
            //prompting user to confirm work to be done
            dialog.confirm(options).then(function(result){
                if(confirmInput()){ok(result);}
                else{inputError();}
            }).catch(function(reason){cancel(reason);});
        }
        catch (error){
            log.error({title: 'Critical error in submitBomChange', details: error});
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

    }

    return {
        pageInit: pageInit,
        submitBomChange: submitBomChange,
        //fieldChanged: fieldChanged,
        //postSourcing: postSourcing,
        //sublistChanged: sublistChanged,
        //lineInit: lineInit,
        //validateField: validateField,
        //validateLine: validateLine,
        //validateInsert: validateInsert,
        //validateDelete: validateDelete,
        //saveRecord: saveRecord
    };
    
});

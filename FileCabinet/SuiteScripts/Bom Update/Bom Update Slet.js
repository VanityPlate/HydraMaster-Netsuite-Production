/**
 *
 * @copyright Alex S. Ducken 2021 HydraMaster LLC
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/redirect', 'N/ui/serverWidget', 'SuiteScripts/Bom Update/Bom Update Library.js'],
    
    (redirect, serverWidget, bomLib) => {

        /**
         * Constants
         */
        const STATUSPAGE = 'https://5429364.app.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?whence=';

        /**
         * @return {serverWidget.Form object} form built for bom updates
         */
        function renderForm(){
            try{
                var form = serverWidget.createForm({title: 'Bom Update'});
                form.clientScriptModulePath = 'SuiteScripts/Bom Update/Bom Update CS.js';
                form.addButton({
                   id: bomLib.buttonIds.submitButton,
                   label: 'Submit',
                   functionName: 'submitBomChange'
                });
                form.addField({id: bomLib.fieldIds.originalItem, label: 'Original Item', type: serverWidget.FieldType.TEXT});
                form.addField({id: bomLib.fieldIds.newItem, label: 'New Item', type: serverWidget.FieldType.TEXT});
                return form;
            }
            catch (error) {
                log.error({title: 'Critical error in renderForm', details: error});
            }
        }

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{
                if(scriptContext.request.method === "GET") {
                    if(scriptContext.request.parameters['redirect']){
                        redirect.redirect({
                            url: STATUSPAGE
                        });
                    }
                    else
                    {
                        scriptContext.response.writePage({pageObject: renderForm()});
                    }
                }
            }
            catch (error){
                log.error({title: 'Critical error onRequest', details: error});
            }
        }

        return {onRequest}

    });

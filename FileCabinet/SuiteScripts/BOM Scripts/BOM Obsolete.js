/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/task', 'N/runtime', 'N/ui/serverWidget', 'SuiteScripts/Help_Scripts/Get_Internal.js'],

function(task, runtime, serverWidget, getInternal) {


    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try {
            if(context.request.method === 'GET') {
                context.response.writePage({
                    pageObject: renderForm()
                });
            }
            else{
                var obsolete = getInternal.item(context.request.parameters.custpage_obsolete);
                if(!obsolete){
                    var response = "Error! The value you entered is incorrect\n"
                    + "Use the external name for the item or BOM";
                    context.response.write({output: response});
                }
                else{
                    var response = "SUCCESS! Your results will be emailed to you.";
                    context.response.write({output: response});


                    var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                    scriptTask.scriptId = 'customscriptsch_bom_obsolete';
                    scriptTask.deploymentId = 'customdeploysch_bom_obsolete';
                    scriptTask.params = {
                        'custscript_part_number': context.request.parameters.custpage_obsolete,
                        'custscript_user_id': runtime.getCurrentUser().id
                    };
                    scriptTask.submit();
                }
            }
        }
        catch(error){
            log.error({title: 'Critical Error in onRequest', details: error});
        }
    }

    /**
     * Helper Function for Rendering the initial Suitelet form.
     */
    function renderForm(){
        var form = serverWidget.createForm({title: 'Bom Obsolete'});

        var obsolete = form.addSubmitButton({
            label: 'Obsolete'
        });

        var obsoleteItem = form.addField({
           id: 'custpage_obsolete',
           type: serverWidget.FieldType.TEXT,
           label: 'What do you want to obsolete?'
        });

        return form;
    }
    return {
        onRequest: onRequest
    };
    
});

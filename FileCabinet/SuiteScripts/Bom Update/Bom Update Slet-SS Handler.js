/**
 *
 * @copyright Alex S. Ducken 2021 HydraMaster LLC
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/task'],
    
    (task) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{
                //Capturing Values
                var oldItem = scriptContext.request.parameters['oldItem'];
                var newItem = scriptContext.request.parameters['newItem'];

                //Creating and submitting task
                var taskObj = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    deploymentId: 'customdeploy_bom_update_map',
                    scriptId: 'customscript_bom_update_map',
                    params: {
                        'custscript_old_item_map': oldItem,
                        'custscript_new_item_map': newItem
                    }
                });
                var taskId = taskObj.submit();

                scriptContext.response.write({output: oldItem + newItem + taskId});
            }
            catch (error){
                log.error({title: 'Critical error in onRequest.', details: error});
            }
        }

        return {onRequest}

    });

/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/task', 'N/record', 'N/file', 'N/runtime'],

    function(task, record, file, runtime) {

        function execute(scriptContext){
            try{
                var startNum = runtime.getCurrentScript().getParameter({name: 'custscript_check_number'});
                startNum = parseInt(startNum, 10);
                var iterator = file.load({id: 'Process_Files/Vendor Payment Checks/check_queued.txt'}).lines.iterator();
                iterator.each(function(id){
                    var objRecord = record.load({
                        type: record.Type.VENDOR_PAYMENT,
                        id: id.value,
                    });
                    objRecord.setValue({fieldId: 'tranid', value: startNum.toString()});
                    objRecord.save();
                    startNum += 1;
                    return true;
                });
                var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                scriptTask.scriptId = 'customscript_clean_up_printed';
                scriptTask.deploymentId = 'customdeploy_clean_up_printed';
                scriptTask.submit();
            }
            catch(error){
                log.error({title: 'Critical Error in updateCheckNumber', details: error});
            }
        }

    return {
        execute: execute
    };
    
});

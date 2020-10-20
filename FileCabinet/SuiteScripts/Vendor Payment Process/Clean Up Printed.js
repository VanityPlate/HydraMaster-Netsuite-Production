/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/file'],

function(file) {

    /**
     * Constant for folder name.
     */
    const VPC = 178295;


    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try{
            clearQueue();
            replaceFile();
        }
        catch(error){
            log.error({title: 'Critical Error in execute', details: error});
        }
    }
    /**
     * Function for clearing print queue after mass print
     */
    function clearQueue(){
        var iterator = file.load({id: 'Process_Files/Vendor Payment Checks/checks_to_delete.txt'}).lines.iterator();
        iterator.each(function(id){
            file.delete({id: id.value});
            return true;
        });
        replaceFile('checks_to_delete.txt');
        replaceFile('checks_to_print.txt');
        replaceFile('check_queued.txt');
    }

    //helper function for deleting and creating a file
    function replaceFile(fileName){
        var replacement = file.create({
            name: fileName,
            fileType: file.Type.PLAINTEXT,
            folder: VPC,
            isOnline: true
        });
        replacement.save();
    }

    return {
        execute: execute
    };
    
});

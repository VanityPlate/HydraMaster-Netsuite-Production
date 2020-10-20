/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/file', './Generate_PDF.js'],
/**
 * @param{file} file
 */
function(file, generatePDF) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
        try {
            var pdfObj = generatePDF.makePDF(scriptContext.newRecord);
            return 1;
        }
        catch(error){
            log.error({title: 'Critical Error in Render_Check', details: error});
        }
    }



    return {
        onAction : onAction
    };
    
});

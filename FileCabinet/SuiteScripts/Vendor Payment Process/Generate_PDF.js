define(['N/render', 'N/file', 'N/record'],

function(render, file, record) {

    /**
     * Constant for folder name.
     */
    const VPC = 178295;

    /**
     * REFACTOR
     * Test function for generating and saving a pdf
     *
     * @return Returns the generated PDF
     */
    function makePDF(payment){

        if(isCheckQueued(payment.id)) {
            var check = makeCheckXML(payment);
            check.folder = VPC;
            check.name = payment.id;
            check.isOnline = true;
            check.save();
            var fileUrl = file.load({id: 'Process_Files/Vendor Payment Checks/' + payment.id});
            printListUpdate(fileUrl.url);
            deleteListUpdate(fileUrl.id);
            return check;
        }
        return null;
    }

    /**
     *
     * @param Records for instantiating the render object
     */
    function makeCheckXML(check){
        var xmlCheckTemplate = file.load('Templates/AdvancedPDF Templates/vendor_check_template.xml');
        var renderer = render.create();
        renderer.templateContent = xmlCheckTemplate.getContents();
        renderer.addRecord({templateName: 'record', record: check});
        return renderer.renderAsPdf();
    }

    //helper function for validating if the check is already in the que and deciding if it should proceed or not
    function isCheckQueued(id){
        var checksQueued = file.load({id: 'Process_Files/Vendor Payment Checks/check_queued.txt'});
        var iterator = checksQueued.lines.iterator();
        var output = true;
        iterator.each(function(line){
            if(line == id)
                output = false;
            return true;
        });
        if(output) {
            checksQueued.appendLine({value: id});
            checksQueued.save();
        }
        return output;
    }

    //helper function for appending a line to the record that tracks the ready to print checks
    function printListUpdate(url){
        var fileObj = file.load({
            id: 'Process_Files/Vendor Payment Checks/checks_to_print.txt'
        });
        fileObj.appendLine({value: url});
        fileObj.save();
    }

    //helper function for appending a line to the record that tracks the ready to delete checks
    function deleteListUpdate(checkId){
        var fileObj = file.load({
            id: 'Process_Files/Vendor Payment Checks/checks_to_delete.txt'
        });
        fileObj.appendLine({value: checkId});
        fileObj.save();
    }

    return {
        makePDF: makePDF
    };
    
});


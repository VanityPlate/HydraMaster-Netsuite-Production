define(['N/file', 'N/render', 'N/xml'],

function(file, render, mxml) {

    /**
     * Constant for folder name.
     */
    const VPC = 178295;


    /**
     *Initiates Mass Print of Vendor Checks
     */
    function printVChecks(){
        try{
            return printFileID();
        }
        catch(error){
            log.error({title: 'Critical Error in printVChecks', details: error});
        }
    }

    /**
     * @Return integer: the file id of the file to be printed
     */
    function printFileID(){
        var pdfURLs = readCheckFile();
        var merge = mergePDFS(pdfURLs);
        return file.load({id: 'Process_Files/Vendor Payment Checks/Merged_Checks'}).id;
    }

    /**
     * This method builds a merged pdf for printing the sum total
     * of ready to print vendor checks
     *
     * @param array of vendor checks
     * @return id
     */
    function mergePDFS(urls){
        var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
        if(urls.length > 0) {
            xml += "<pdfset>";
            urls.forEach(function (x) {
                var newLine = '<pdf src="https://5429364-sb1.app.netsuite.com' + x + '"></pdf>';
                xml += newLine;
            });
            xml += "</pdfset>";
        }
        else{
            xml += "<pdf>\n<body font-size=\"12\">\n<h2>Nothing To Print</h2>\n";
            xml += "<p></p>";
            xml += "Sadness";
            xml += "</body>\n</pdf>";
        }
        var mergedChecks = render.xmlToPdf({xmlString: xml});
        mergedChecks.folder = VPC;
        mergedChecks.name = 'Merged_Checks';
        mergedChecks.isOnline = true;
        mergedChecks.save();
}

    /**
     * This method simply reads out the ready to print vendor check
     * urls and returns them in an array
     *
     * @returns {[array of the vendor checks urls that are ready to print]}
     */
    function readCheckFile(){
        var pdfURLS = [];
        var fileObj = file.load({id: 'Process_Files/Vendor Payment Checks/checks_to_print.txt'});
        var iterator = fileObj.lines.iterator();
        iterator.each(function(line){
            var pushLine = mxml.escape({xmlText: line.value});
            pdfURLS.push(pushLine);
            return true;
        });
        return pdfURLS;
    }

    return {
        printVChecks : printVChecks
    };
    
});

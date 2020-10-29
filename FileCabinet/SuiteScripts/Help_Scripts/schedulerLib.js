define(['N/https', 'N/url'],

function(https, url) {

    /**
     * Constants
     *
     * @var FILELIB a libary of file results
     */
    const FILELIB = {workOrderFix: 'Process_Files/Script Files/workOrderFix.txt', countKPI: 'Process_Files/Script Files/countKPI.txt'};

    return {
        fileLib: FILELIB
    };
    
});

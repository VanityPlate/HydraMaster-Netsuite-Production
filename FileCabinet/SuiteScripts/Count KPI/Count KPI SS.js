/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/file'],
/**
 * @param{record} record
 * @param{search} search
 */
function(record, search, file) {



    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try{
            //Preforming Search(worth noting that if the search provides line items in a different order someday this program will break)
            var searchObj = search.create({
                type: "inventorycount",
                filters:
                    [
                        ["type","anyof","InvCount"],
                        "AND",
                        ["datecreated","onorafter","thirtydaysago"],
                        "AND",
                        ['mainline', 'is', 'F']
                    ],
                columns:
                    [
                        search.createColumn({name: "item", label: "Item"}),
                        search.createColumn({name: "quantity", label: "Quantity"}),
                        search.createColumn({name: 'custitem_stnd_cost_muk', join: 'item', label: 'Standard Cost Mukilteo'})
                    ]
            }).runPaged({pageSize: 300});

            //Opening File
            var fileObj = file.create({
                name: 'countKPI.txt',
                fileType: file.Type.PLAINTEXT,
                folder: 264120,
                isOnline: true
            });

            //Building File
            searchObj.pageRanges.forEach(function(pageObj) {
                var pageData = searchObj.fetch({index: pageObj.index});
                var results = pageData.data.length;
                if (results >= 0) {
                    for (var x = 0; x <= results; x += 3) {
                        if(pageData.data[x]) {
                            var nextLine = pageData.data[x].getText({name: 'item'}) + '^^^' + pageData.data[x].getValue({name: 'custitem_stnd_cost_muk', join: 'item'}) +
                                '^^^' + pageData.data[x].getValue({name: 'quantity'}) +
                                '^^^' + pageData.data[x + 1].getValue({name: 'quantity'}) +
                                '^^^' + pageData.data[x + 2].getValue({name: 'quantity'});
                            //Refactor Testing
                            log.audit({title: 'Testing Line Output', details: nextLine});
                            fileObj.appendLine({value: nextLine});
                        }
                        else{x = 300;}
                    }
                }
            });

            //Saving File
            fileObj.save();

        }
        catch(error){
            log.error({title: 'Critical Error in onRequest', details: error});
        }
    }

    return {
        execute: execute
    };
    
});

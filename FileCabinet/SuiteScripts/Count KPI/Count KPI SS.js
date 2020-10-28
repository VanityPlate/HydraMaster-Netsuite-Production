/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', './Count KPI Fields.js', 'N/file'],
/**
 * @param{record} record
 * @param{search} search
 */
function(record, search, countFields) {



    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try{
            //Preforming Search
            var searchObj = search.create({
                type: "inventorycount",
                filters:
                    [
                        ["type","anyof","InvCount"],
                        "AND",
                        ["datecreated","onorafter","thirtydaysago"]
                    ],
                columns:
                    [
                        search.createColumn({name: "item", label: "Item"}),
                        search.createColumn({name: "unit", label: "Units"}),
                        search.createColumn({name: 'snapshotquantity', label: 'Snapshot Quantity'}),
                        search.createColumn({name: 'viewsnapshot', label: 'Snapshot Detail'}),
                        search.createColumn({name: 'countquantity', label: 'Count Quantity'}),
                        search.createColumn({name: 'countdetail', label: 'Count Detail'}),
                        search.createColumn({name: 'adjustedquantity', label: 'Adjusted Quantity'}),
                        search.createColumn({name: 'viewadjustment', label: 'Variance Detail'}),
                        search.createColumn({name: 'rate', label: 'Rate(STD Cost)'})
                    ]
            }).run().getRange({start: 0, end: 100});
            //Refactor Testing
            log.audit({title: 'Testing Search Results', details: searchObj[0].toString()});

        }
        catch(error){
            log.error({title: 'Critical Error in onRequest', details: error});
        }
    }

    return {
        execute: execute
    };
    
});

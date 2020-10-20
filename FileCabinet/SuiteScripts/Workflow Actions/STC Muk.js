/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/search'],

function(record, search) {
   
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
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalid", "is", scriptContext.newRecord.getValue({fieldId: 'id'})],
                        "AND",
                        ["inventorylocation", "anyof", "1"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "currentstandardcost", label: "Current Standard Cost"})
                    ]
            });
            var result = itemSearchObj.run().getRange({start: 0, end: 10});
            var currency = result[0].getValue({name: 'currentstandardcost'});
            return currency;
        }
        catch(error){
            log.error({title: 'Critical Error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

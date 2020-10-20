/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/file', 'N/runtime', 'N/search'],
/**
 * @param{email} email
 * @param{file} file
 * @param{runtime} runtime
 * @param{search} search
 */
function(email, file, runtime, search) {


    /**
     * Global Object itemNode Used for storing the chain of connections between the items
     */
    var itemNode = {
        obsolete: null,
        name: '',
        listReference: [],
    };

    /**
     * Helper function for sending out the list of results via email
     */
    function sendEMAIL(csvEmail, itemNumber, userId){
        email.send({
            author: userId,
            recipients: userId,
            subject: 'BOM OBSOLETE ' + itemNumber,
            body: 'Attached is the results for your obsolete request.',
            attachments: [csvEmail]
        });
    }

    /**
     * Helper function for creating the csv to attach to the email
     */
    function createCSV(obsoleteItems){
        var csvEmail = file.create({
            name: 'Inventory to Obsolete.csv',
            fileType: file.Type.CSV
        });
        for(var x = 0; x < obsoleteItems.length; x += 1){
            csvEmail.appendLine({value: getInfo(obsoleteItems[x].name.toString())});
        }
        return csvEmail;
    }


    /**
     * Helper function for pulling the details and internal id of an item
     */
    function getInfo(partNumber){
        var regExp = /,/gi;
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["externalid","anyof",partNumber]
                ],
            columns:
                [
                    search.createColumn({name: "salesdescription", label: "Description"}),
                    search.createColumn({name: "internalid", label: "Internal ID"})
                ]
        }).run().getRange({start: 0, end: 1});
        return [partNumber, itemSearchObj[0].getValue({name: 'salesdescription'}).replace(regExp, "_"), itemSearchObj[0].getValue({name: 'internalid'})];
    }


    /**
     * Helper function for starting the recursive search for checking if items can be obsoleted.
     */
    function obsoleteDive(items){
        for(var x = 0; x < items.length; x++){
            if(items[x].obsolete == null)
                recursiveObsolete(items[x]);
        }
        var nodesToGo = [];
        for(var x = 0; x < items.length; x += 1){
            if(items[x].obsolete === true){
                nodesToGo.push(items[x]);
            }
        }
        return nodesToGo;
    }

    /**
     * Recursive function for determining if an item can be obsoleted
     */
    function recursiveObsolete(item){
        if(item.obsolete) {
            return true;
        }
        else if(item.obsolete == false){
            return false;
        }
        else{
            if(!checkSelf(item)){
                item.obsolete = false;
                return false;
            }
            for(var x = 0; x < item.listReference.length; x++){
                if(!recursiveObsolete(item.listReference[x])){
                    item.obsolete = false;
                    return false;
                }
            }
            item.obsolete = true;
            return true;
        }
    }

    /**
     * Helper function for checking if a single item can be obsoleted
     */
    function checkSelf(item){
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["memberitem.externalid","anyof", item.name],
                    "AND",
                    ["custitem_pcg_status_code","noneof","2"]
                ],
            columns:
                [
                    search.createColumn({name: "externalid", label: "External ID"})
                ]
        });
        var results = itemSearchObj.run().getRange({start: 0, end: 1000});
        if(results.length != item.listReference.length)
            return false;
        else
            return true;
    }

    /**
     * Help function for starting to recursively inspecting the chain of assembled items and return an
     * array it itemNodes
     */
    function diveChain(obsolete){
        var items = [];
        recursiveBuild(obsolete, null, items);
        return items;
    }

    /**
     * Actual recursive function for diveChain
     */
    function recursiveBuild(obsolete, parent, items){
        var check = alreadyItem(items, obsolete);
        if(check == -1){
            var nextNode = Object.create(itemNode);
            nextNode.name = obsolete;
            nextNode.listReference = [];
            nextNode.obsolete = null;
            if(parent)
                nextNode.listReference.push(parent);
            items.push(nextNode);
            var members = getMembers(nextNode.name);
            members.forEach(function(result){
                var nextObsolete = result.getValue({name: 'externalid', join: 'memberItem'});
                recursiveBuild(nextObsolete, nextNode, items);
            });
        }
        else{
            if(alreadyParent(items[check].listReference, parent.name) == -1)
                items[check].listReference.push(parent);
        }

    }

    /**
     * Helper function for searching and returning the members of an item / assembly
     */
    function getMembers(parent){
        return search.create({
            type: "item",
            filters:
                [
                    ["externalid","anyof",parent],
                    "AND",
                    ["memberitem.externalid","noneof","@NONE@"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "externalid",
                        join: "memberItem",
                        label: "External ID"
                    })
                ]
        }).run().getRange({start: 0, end: 1000});
    }

    /**
     * Helper function for checking if listReference includes a parent already
     */
    function alreadyParent(parents, parent){
        for(var x = 0; x < parents.length; x++){
            if(parents[x].name == parent)
                return x;
        }
        return -1;
    }


    /**
     * Helper function for checking if items includes an item already
     */
    function alreadyItem(items, obsolete){
        for(var x = 0; x < items.length; x++){
            if(items[x].name == obsolete)
                return x;
        }
        return -1;
    }
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try{
            var partNumber = runtime.getCurrentScript().getParameter({name: 'custscript_part_number'});
            var userId = runtime.getCurrentScript().getParameter({name: 'custscript_user_id'});

            var items = diveChain(partNumber);
            var obsoleteItems = obsoleteDive(items);
            var csvEmail = createCSV(obsoleteItems);
            sendEMAIL(csvEmail, partNumber, userId);
        }
        catch(error){
            log.error({title: 'Critical Error in SchBOMObsolete', details: error});
        }
    }

    return {
        execute: execute
    };
    
});

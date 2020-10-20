/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/search', 'SuiteScripts/Help_Scripts/Load_Unknown_Record_Type.js'],
/**
 * @param{record} record
 * @param{search} search
 */
function(record, search, loadUnknown) {

    /**
     * Helper function for creating the new Item Record and setting its values
     */
    function makeItem(oldAssembly, itemName){
        var itemObj = record.create({
            type: record.Type.NON_INVENTORY_ITEM,
            isDynamic: true,
        });
        itemObj.setValue({fieldId: 'customform', value: '94'});
        itemObj.setValue({fieldId: 'itemid', value: itemName});
        itemObj.setValue({fieldId: 'subtype', value: 'Purchase'});
        itemObj.setValue({fieldId: 'purchasedescription', value: oldAssembly.getValue({fieldId: 'salesdescription'})});
        itemObj.setValue({fieldId: 'taxschedule', value: '2'});
        itemObj.setValue({fieldId: 'custitem_pcg_status_code', value: '6'});
        itemObj.setValue({fieldId: 'unitstype', value: '1'});
        itemObj.setValue({fieldId: 'purchaseunit', value: '1'});
        itemObj.setValue({fieldId: 'consumptionunit', value: '1'});
        itemObj.setValue({fieldId: 'subsidiary', value: oldAssembly.getValue({fieldId: 'subsidiary'})});
        itemObj.setValue({fieldId: 'includechildren', value: oldAssembly.getValue({fieldId: 'includechildren'})});
        itemObj.setValue({fieldId: 'custitem_pcg_npi_mktg_review', value: oldAssembly.getValue({fieldId: 'custitem_pcg_npi_mktg_review'})});
        itemObj.setValue({fieldId: 'custitem_pcg_item_current_revision', value: oldAssembly.getValue({fieldId: 'custitem_pcg_item_current_revision'})});
        itemObj.setValue({fieldId: 'custitem_pcg_used_on', value: oldAssembly.getValue({fieldId: 'custitem_pcg_used_on'})});
        return itemObj;
    }

    /**
     * Searches for all Item Records that need updating
     */
    function updateRecords(itemName, parentID) {
        //Refactor Testing
        log.audit({title: 'Testing Input', details: itemName+parentID});
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["memberitem.name", "contains", itemName]
                ],
            columns:
                [
                    search.createColumn({name: "internalid", label: "Internal ID"})
                ]
        });
        var inventoryObj = search.create({
            type: "item",
            filters:
                [
                    ["type","anyof","NonInvtPart"],
                    "AND",
                    ["name","haskeywords",itemName]
                ],
            columns:
                [
                    search.createColumn({name: "internalid", label: "Internal ID"})
                ]
        });
        var newID = inventoryObj.run().getRange({start: 0, end: 2})[0].getValue({name: 'internalid'});
        itemSearchObj.run().each(function (result) {
            changeRecord(result.getValue({name: 'internalid'}), parentID, itemName, newID);
            return true;
        });
    }

    /**
     * Updates an individual Item Record
     */
    function changeRecord(itemID, parentID, itemName, newID){
        var update = loadUnknown.recursiveLoad(itemID, 0);
        var lineRemove = update.findSublistLineWithValue({sublistId: 'member', fieldId: 'item', value: parentID});
        if(lineRemove != -1) {
            var quantity = update.getSublistValue({sublistId: 'member', fieldId: 'quantity', line: lineRemove});
            update.removeLine({sublistId: 'member', line: lineRemove});
            update.selectNewLine({
                sublistId: 'member'
            });
            update.setCurrentSublistValue({
                sublistId: 'member',
                fieldId: 'item',
                value: newID
            });
            update.setCurrentSublistValue({
                sublistId: 'member',
                fieldId: 'item_display',
                value: itemName
            });
            update.setCurrentSublistValue({
                sublistId: 'member',
                fieldId: 'quantity',
                value: quantity
            });
            update.commitLine({sublistId: 'member'});
            update.save();
        }
    }

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
        try{
            var itemName = scriptContext.newRecord.getValue({fieldId: 'itemid'});
            scriptContext.newRecord.setValue({fieldId: 'itemid', value: itemName + '-DELETE'});
            var itemObj = makeItem(scriptContext.newRecord, itemName);
            itemObj.save();
            updateRecords(itemName, scriptContext.newRecord.getValue({fieldId: 'id'}));
        }
        catch(error){
            log.audit({title: 'Critical Error in onAction', details: error});
        }
    }

    return {
        onAction : onAction
    };
    
});

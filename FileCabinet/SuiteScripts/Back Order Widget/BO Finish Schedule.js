/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'SuiteScripts/Help_Scripts/Load_Unknown_Record_Type.js', 'N/email', 'N/search'],

function(runtime, record, loadUnknown, email, search) {

    /**
     * Constants
     * Email recipients, Message to customer
     */
    const recipients = ['loren.long@hydramaster.com', 'robert.dobbs@hydramaster.com', 'alex.ducken@hydramaster.com'];
    const customerMessage ='The above items are back ordered and will be shipped out soon.';
    const SHIPINSTRUCTIONS ='Back Order Items';
    const SALESEMAILID = 20582;

    /**
     * Global Variables For Manipulation(I know I know...)
     */
    var orginalSale = '', createdSale = '', journalEntry = '', createdSalesId = '';

    /**
     * Create Journal Entry
     */
    function createEntry(items){
        try {
            //creating journal entry
            var entry = record.create({
                type: record.Type.JOURNAL_ENTRY,
                isDynamic: true
            });

            //finding amount to post to entry
            var itemCount = Math.floor(items.length / 2);
            var totalAmount = 0;
            for (var x = 0; x < itemCount; x++) {
                var itemSearchObj = search.create({
                    type: "item",
                    filters:
                        [
                            ["internalid", "anyof", items[1 + (2 * x)]]
                        ],
                    columns:
                        [
                            search.createColumn({name: "lastpurchaseprice", label: "Last Purchase Price"})
                        ]
                }).run().getRange({start: 0, end: 1});
                totalAmount += items[2 + (2 * x)] * parseFloat(itemSearchObj[0].getValue({name: 'lastpurchaseprice'}));
            }

            //setting entry fields
            entry.setValue({fieldId: 'subsidiary', value: '1'});
            entry.setValue({fieldId: 'memo', value: 'Back order liability for orders ' + orginalSale + ' ' + createdSale});

            //setting line fields
            entry.selectNewLine({sublistId: 'line'});
            entry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: '496'});
            entry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: totalAmount.toFixed(2)});
            entry.commitLine({sublistId: 'line'});
            entry.selectNewLine({sublistId: 'line'});
            entry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: '120'});
            entry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: totalAmount.toFixed(2)});
            entry.commitLine({sublistId: 'line'});

            //saving journal entry
            entry.save();


            //capturing journalEntry
            journalEntry = entry.id;

            //adding journal entry to new sales order
            var salesObj = record.load({
               type: record.Type.SALES_ORDER,
               id: createdSalesId,
               isDynamic: true
            });
            salesObj.setValue({fieldId: 'custbody_bo_journal_entry', value: journalEntry});
            salesObj.save();

        }
        catch(error){
            log.error({title: 'Critical Error in createEntry', details: error});
        }
    }

    /**
     * Linking sales orders through related records
     */
    function linkOrders(oldOrder, newOrder){
        try{
            //Relating old to new
            newOrder.setValue({fieldId: 'custbody_bo_relation', value: oldOrder.id});

            //Relating new to old
            oldOrder.setValue({fieldId: 'custbody_bo_relation', value: newOrder.id});

            //saving records
            newOrder.save();
            oldOrder.save();
        }
        catch(error){
            log.error({title: 'Critical Error in linkOrders', details: error});
        }
    }

    /**
     * Sending email to interested parties for
     */
    function alertEmail(salesId, items){
        //variables for composing email.
        var salesOrderNumber = '', itemNumbers = [], itemQuantity = [], emailText = '';

        //Getting sales order number
        var salesObj = record.load({
            type: record.Type.SALES_ORDER,
            id: salesId,
            isDynamic: false
        });
        salesOrderNumber = salesObj.getValue({fieldId: 'tranid'});

        //Parsing items for translation to email
        var itemCount = Math.floor(items.length / 2);
        for(var x = 0; x < itemCount; x++){
            var itemObj = loadUnknown.recursiveLoad(items[1 + (2 * x)], 0);
            itemNumbers.push(itemObj.getValue({fieldId: 'itemid'}));
            itemQuantity.push(items[2 + (2 * x)]);
        }

        //Writing Email
        emailText = emailText.concat("The following items and quantities are back ordered for " + salesOrderNumber +'\n');
        emailText = emailText.concat("Please trouble shoot why this failed automation. Then create the new sales order and adjust inventory.\n");
        for(var x = 0; x < itemCount; x++){
            emailText = emailText.concat(itemNumbers[x] + ' Quantity ' + itemQuantity[x] + '\n');
        }

        //Sending email
        email.send({
           author: SALESEMAILID,
           recipients: recipients,
           subject: 'Alert - Back Order Sales Order',
           body: emailText
        });
    }

    /**
     * Parsing Line Items
     */
    function parseLineItems(items){
        return items.split('^^^');
    }

    /**
     * Setting Sales Order Ship information
     */
    function setShipInfo(salesObj){
        //Setting Defualt Ship Info
        salesObj.setValue({fieldId: 'shipcarrier', value: 'ups'});
        salesObj.setValue({fieldId: 'shipmethod', value: '21127'});
        salesObj.setValue({fieldId: 'shippingcost', value: 0.00});

        //Checking if Kansas Order
        var lineItems = salesObj.getLineCount({sublistId: 'item'});
        for(var x = 0; x < lineItems; x++){
            var location = salesObj.getSublistValue({sublistId: 'item', fieldId: 'location', line: x});
            if(location.toString() == '16'){
                salesObj.setValue({fieldId: 'custbody_ready_to_ship', value: true});
                salesObj.setValue({fieldId: 'shipmethod', value: '4'});
                salesObj.setValue({fieldId: 'shippingcost', value: 0.00});
                salesObj.setValue({fieldId: 'custbody_kansas_bo', value: true});
            }
        }
        salesObj.save();
    }

    /**
     * Create Sales Order
     */
    function createSales(saleId, items){
        //Loading and Creating Records
        var salesObj = record.copy({
            type: record.Type.SALES_ORDER,
            id: saleId,
            isDynamic: true
        });
        var oldSalesObj = record.load({
            type: record.Type.SALES_ORDER,
            id: saleId,
            isDynamic: true
        });

        //Updating values
        salesObj.setValue({fieldId: 'custbody_pcg_contact_name', value: oldSalesObj.getValue({fieldId: 'custbody_pcg_contact_name'})});
        salesObj.setValue({fieldId: 'custbody_pcg_contact_phone', value: oldSalesObj.getValue({fieldId: 'custbody_pcg_contact_phone'})});
        salesObj.setValue({fieldId: 'memo', value: 'Back Order Items'});
        salesObj.setValue({fieldId: 'discountitem', value: '20216'});
        salesObj.setValue({fieldId: 'custbody_pcg_to_be_emailed_sales', value: true});
        salesObj.setValue({fieldId: 'tobeemailed', value: true});
        salesObj.setValue({fieldId: 'message', value: customerMessage});
        salesObj.setValue({fieldId: 'custbody_bo_order', value: true});
        salesObj.setValue({fieldId: 'custbody_pcg_ship_instructions', value: SHIPINSTRUCTIONS});
        salesObj.setValue({fieldId: 'shipcarrier', value: 'nonups'});
        salesObj.setValue({fieldId: 'shipmethod', value: '21192'});
        salesObj.setValue({fieldId: 'custbody_shipping_payment_method', value: '2'});
        salesObj.setValue({fieldId: 'custbody_ready_to_ship', value: false});
        salesObj.setValue({fieldId: 'custbody_ltl_sales_order', value: false});
        salesObj.setValue({fieldId: 'shipcomplete', value: true});
        salesObj.setValue({fieldId: 'custbody_hm_prod_wo', value: false});
        salesObj.setValue({fieldId: 'custbody_hm_no_wo_needed', value: false});
        salesObj.setValue({fieldId: 'custbody_pcg_back_door_order', value: false});
        salesObj.setValue({fieldId: 'linkedtrackingnumbers', value: ''});
        salesObj.setValue({fieldId: 'shippingcost', value: 0.00});



        //Removing Original Line Items
        var lines = salesObj.getLineCount({sublistId: 'item'});
        for(var x = lines - 1; x >= 0; x--){
            salesObj.removeLine({sublistId: 'item', line: x});
        }

        //Adding New Line Items
        var itemCount = Math.floor(items.length / 2);

        for(var x = 0; x < itemCount; x++){
            try {
                salesObj.selectNewLine({sublistId: 'item'});
                salesObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: items[1 + (2 * x)]});
                salesObj.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: parseInt(items[2 + (2 * x)])
                });
                salesObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_pcg_list_price', value: 0});
                salesObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'amount', value: 0});
                salesObj.commitLine({sublistId: 'item'});
            }
            catch (error) {
                return false;
            }
        }



        //Saving Record and setting global value to access new sales order
        //Catching Errors and sending to manual resolution
        try {
            var salesID = salesObj.save();
            setShipInfo(record.load({type: record.Type.SALES_ORDER, id: salesID, isDynamic: true}));
        }
        catch(error){
            alertEmail(saleId, items);
            log.error({title: 'Critical error saving copied sales order.', details: error});
            throw error;
        }
        createdSalesId = salesObj.id;

        //linking sales orders
        var newOrder = record.load({
            type: record.Type.SALES_ORDER,
            id: salesObj.id,
            isDynamic: true
        });
        linkOrders(oldSalesObj, newOrder);

        //Setting Global variables
        orginalSale = oldSalesObj.getValue({fieldId: 'tranid'});
        createdSale = newOrder.getValue({fieldId: 'tranid'});

        return true;
    }

    /**
     * Adjust Inventory
     */
    function adjustInv(items){
        //creating inventory adjust record
        var adjustObj = record.create({
            type: record.Type.INVENTORY_ADJUSTMENT,
            isDynamic: true
        });

        //setting default values
        adjustObj.setValue({fieldId: 'subsidiary', value: '1'});
        adjustObj.setValue({fieldId: 'adjlocation', value: '8'});
        adjustObj.setValue({fieldId: 'account', value: '277'});
        adjustObj.setValue({fieldId: 'memo', value: 'Back order item adjustment from ' + createdSale + ' ' + orginalSale});

        //adding line items
        var itemsCount = Math.floor(items.length / 2);
        for(var x = 0; x < itemsCount; x++){
            adjustObj.selectNewLine({sublistId: 'inventory'});
            adjustObj.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'location', value: '8'});
            adjustObj.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'item', value: items[1 + (x * 2)]});
            adjustObj.setCurrentSublistValue({sublistId: 'inventory', fieldId: 'adjustqtyby', value: parseInt(items[2 + (x * 2)])});
            adjustObj.commitLine({sublistId: 'inventory'});
        }

        //saving record
        adjustObj.save();
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
            //Getting parameters
            var saleId = runtime.getCurrentScript().getParameter({name: 'custscript_sales_order'});
            var items = runtime.getCurrentScript().getParameter({name: 'custscript_item_quantity'});

            //updating
            if(createSales(saleId, parseLineItems(items)) == true) {
                adjustInv(parseLineItems(items));
                createEntry(parseLineItems(items));
            }
            else{
                alertEmail(saleId, parseLineItems(items));
            }
        }
        catch(error){
            log.error({title: 'Critical Error in execute', details: error})
        }
    }

    return {
        execute: execute
    };
    
});

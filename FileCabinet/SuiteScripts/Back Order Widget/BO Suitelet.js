/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/redirect', 'N/record', 'N/search', 'N/task'],

function(serverWidget, redirect, record, search, task) {

    /**
     * Constants
     */
    const redirectURL = 'https://5429364-sb1.app.netsuite.com/app/center/card.nl?sc=-29';

    /**
     * Validating salesId
     */
    function validateSalesId(salesObj, assistant){
        if(!salesObj){
            var itemObj = assistant.getStep({id: 'custpage_add_order'}).getValue({id: 'custpage_fulfillment'});
            var itemfulfillmentSearchObj = search.create({
                type: "itemfulfillment",
                filters:
                    [
                        ["type","anyof","ItemShip"],
                        "AND",
                        ["internalid","anyof",itemObj],
                        "AND",
                        ["mainline","is","T"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "createdFrom",
                            label: "Internal ID"
                        })
                    ]
            }).run().getRange({start: 0, end: 1});
            salesObj = itemfulfillmentSearchObj[0].getValue({name: 'internalid', join: 'createdFrom'});
            return salesObj;
        }
        else{
            return salesObj;
        }
    }

    /**
     * Schedule Record Update
     */
    function scheduleRecordCreate(assistant){
        //Grabbing Variables
        var secondStep = assistant.getStep({id: 'custpage_add_line_item'});
        var salesID = validateSalesId(assistant.getStep({id: 'custpage_add_order'}).getValue({id: 'custpage_sales'}), assistant);
        var items = '';
        var lines = secondStep.getLineCount({group: 'custpage_lineitems'});
        for(var x = 0; x < lines; x++){
            items += '^^^' + secondStep.getSublistValue({group: 'custpage_lineitems', line: x, id: 'custpage_item'});
            items += '^^^' + secondStep.getSublistValue({group: 'custpage_lineitems', line: x, id: 'custpage_quantity'});
        }

        //Scheduling and submitting task
        var taskObj = task.create({
           taskType: task.TaskType.SCHEDULED_SCRIPT,
           scriptId: 'customscript_bo_finish_schedule',
           deploymentId: 'customdeploy_bo_finish_schedule',
           params: {custscript_sales_order : salesID, custscript_item_quantity : items}
        });
        taskObj.submit();
    }

    /**
     * Search and return results for the order to show in validation
     */
    function salesOrderSearch(assistant){
        var salesObj = assistant.getStep({id: 'custpage_add_order'}).getValue({id: 'custpage_sales'});
        salesObj = validateSalesId(salesObj, assistant);
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type","anyof","SalesOrd"],
                    "AND",
                    ["mainline","is","T"],
                    "AND",
                    ["internalid","anyof", salesObj]
                ],
            columns:
                [
                    search.createColumn({name: "shipaddress", label: "Shipping Address"}),
                    search.createColumn({
                        name: "altname",
                        join: "customerMain",
                        label: "Name"
                    }),
                    search.createColumn({name: "tranid", label: "Document Number"})
                ]
        }).run().getRange({start: 0, end: 1});

        return salesorderSearchObj;
    }

    /**
     * Form for first step
     */
    function renderFormOne(assistant){
        assistant.addField({
            id: 'custpage_sales',
            type: serverWidget.FieldType.SELECT,
            source: 'salesorder',
            label: 'Sales Order'
        });
        assistant.addField({
           id: 'custpage_fulfillment',
           type: serverWidget.FieldType.SELECT,
           source: 'itemfulfillment',
            label: 'Item Fulfillment'
        });
        assistant.clientScriptModulePath = 'SuiteScripts/Back Order Widget/BO Order CS.js';
        return assistant;
    }

    /**
     * Form for second step
     */
    function renderFormTwo(assistant){
        //Adding List
        var listObj = assistant.addSublist({
            id: 'custpage_lineitems',
            label: 'Back Ordered Items and Quantity',
            type: serverWidget.SublistType.INLINEEDITOR
        });
        listObj.addField({
            id: 'custpage_item',
            label: 'Item',
            type: serverWidget.FieldType.SELECT,
            source: 'item'
        });
        listObj.addField({
           id: 'custpage_quantity',
           label: 'Quantity Not Shipped',
           type: serverWidget.FieldType.TEXT
        });
        assistant.clientScriptModulePath = 'SuiteScripts/Back Order Widget/BO Line Item CS.js';
        return assistant;
    }

    /**
     * Form for third step
     */
    function renderFormThree(assistant){
        //Getting validate info
        var results = salesOrderSearch(assistant);

        //Adding Fields Holding Validation Info
        var orderField = assistant.addField({
            id: 'custpage_order',
            label: 'Sales Order',
            type: serverWidget.FieldType.TEXT
        });
        var customerField = assistant.addField({
            id: 'custpage_customer',
            label: 'Customer',
            type: serverWidget.FieldType.TEXT
        });
        var addressField = assistant.addField({
            id: 'custpage_address',
            label: 'Shipping Address',
            type: serverWidget.FieldType.TEXTAREA
        });

        //Updating Fields
        assistant.updateDefaultValues({
            custpage_order : results[0].getValue({name: 'tranid'}),
            custpage_customer : results[0].getValue({name: 'altname', join: 'customerMain'}),
            custpage_address : results[0].getValue({name: 'shipaddress'}),
        });

        //Locking Fields
        orderField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        customerField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        addressField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

        //Adding Sublist
        var listObj = assistant.addSublist({
            id: 'custpage_lineitems',
            label: 'Back Ordered Items and Quantity',
            type: serverWidget.SublistType.INLINEEDITOR
        });
        var itemField = listObj.addField({
            id: 'custpage_item',
            label: 'Item',
            type: serverWidget.FieldType.SELECT,
            source: 'item'
        });
        var quantityField = listObj.addField({
            id: 'custpage_quantity',
            label: 'Quantity',
            type: serverWidget.FieldType.TEXT
        });

        //Filling Sublist
        var secondStep = assistant.getStep({id: 'custpage_add_line_item'});
        var lines = secondStep.getLineCount({group: 'custpage_lineitems'});
        for(var x = 0; x < lines; x++){
            listObj.setSublistValue({id: 'custpage_item', line: x, value: secondStep.getSublistValue({group: 'custpage_lineitems', line: x, id: 'custpage_item'})});
            listObj.setSublistValue({id: 'custpage_quantity', line: x, value: secondStep.getSublistValue({group: 'custpage_lineitems', line: x, id: 'custpage_quantity'})});
        }

        //Locking Sublist
        itemField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        quantityField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

        return assistant;
    }

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try {
            //creating assistant
            var assistant = serverWidget.createAssistant({
                title: 'Back Ordered Items'
            });

            var orderStep = assistant.addStep({
                id: 'custpage_add_order',
                label: 'Choose an Order'
            });

            var lineItemStep = assistant.addStep({
                id: 'custpage_add_line_item',
                label: 'Select Line Items'
            });

            var validateStep = assistant.addStep({
                id: 'custpage_validate',
                label: 'Validate Input'
            });

            //handling call to each step
            if (context.request.method === 'GET') {
                var step = assistant.currentStep;
                if(!step){
                    assistant.currentStep = assistant.getStep({id: 'custpage_add_order'});
                    context.response.writePage({pageObject: renderFormOne(assistant)});
                }
                else if(step.id == 'custpage_add_order') {
                    context.response.writePage({pageObject: renderFormOne(assistant)});
                }
                else if(step.id == 'custpage_add_line_item'){
                    context.response.writePage({pageObject: renderFormTwo(assistant)});
                }
                else if(step.id == 'custpage_validate'){
                    context.response.writePage({pageObject: renderFormThree(assistant)});
                }
            }

            //handling movement between steps
            if(context.request.method == 'POST'){
                if(assistant.getLastAction() == 'next' || assistant.getLastAction() == 'back'){
                    assistant.currentStep = assistant.getNextStep();
                    assistant.sendRedirect({response: context.response});
                }
                if(assistant.getLastAction() == serverWidget.AssistantSubmitAction.FINISH){
                    scheduleRecordCreate(assistant);
                    assistant.finishedHtml = 'FINISHED';
                    context.response.writePage({pageObject: assistant});
                    assistant.isFinished = true;
                }
                if(assistant.getLastAction() == serverWidget.AssistantSubmitAction.CANCEL){
                    redirect.redirect({
                       url: redirectURL
                    });
                }
            }
        }
        catch(error){
            log.error({title: 'Critical Error in onRequest', details: error});
        }
    }

    return {
        onRequest: onRequest
    };
    
});

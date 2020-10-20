/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget'],

function(serverWidget) {

    /**
     * Function to render form for suitlet
     */
    function renderForm(){
        //creating form and adding client script path
        var form = serverWidget.createForm({title: 'Item History'});
        form.clientScriptModulePath = 'SuiteScripts/Negative Inventory/Inventory History CS.js';

        //adding field group and fields for input as well as submit button
        form.addButton({
            id: 'custpage_submit',
            label: 'Submit',
            functionName: 'getHistory'
        });
        var input = form.addFieldGroup({
           id: 'custpage_input',
           label: 'Input'
        });
        form.addField({
            id: 'custpage_item',
            label: 'Item',
            type: serverWidget.FieldType.TEXT,
            container: 'custpage_input'
        });
        form.addField({
            id: 'custpage_location',
            label: 'Location',
            type: serverWidget.FieldType.SELECT,
            source: 'location',
            container: 'custpage_input'
        });

        //Adding field group and fields for Totals(the output)
        form.addFieldGroup({
            id: 'custpage_totals',
            label: 'Totals'
        });
        form.addField({
           id: 'custpage_adjusted',
           type: serverWidget.FieldType.TEXT,
           label: 'Adjusted',
           container: 'custpage_totals'
        }).setHelpText({help: 'The summation of adjustments made for both Inventory Adjustments and Inventory Adjustment Worksheets.'});
        form.addField({
            id: 'custpage_received',
            type: serverWidget.FieldType.TEXT,
            label: 'Received',
            container: 'custpage_totals'
        }).setHelpText({help: 'The total number of items received includes transfer orders.'});
        form.addField({
            id: 'custpage_fulfilled',
            type: serverWidget.FieldType.TEXT,
            label: 'Shipped',
            container: 'custpage_totals'
        }).setHelpText({help: 'The total number of items shipped. A negative number denotes items leaving inventory.'});
        form.addField({
            id: 'custpage_consumed',
            type: serverWidget.FieldType.TEXT,
            label: 'Consumed',
            container: 'custpage_totals'
        }).setHelpText({help: 'The total number of items consumed as part of an assembly.'});
        form.addField({
            id: 'custpage_built',
            type: serverWidget.FieldType.TEXT,
            label: 'Built',
            container: 'custpage_totals'
        }).setHelpText({help: 'The total number of items built and added to inventory.'});

        //Adding list for displaying results
        var results = form.addSublist({
            id: 'custpage_results',
            type: serverWidget.SublistType.INLINEEDITOR,
            label: 'Results'
        });
        results.addField({
            id: 'custpage_document',
            type: serverWidget.FieldType.TEXT,
            label: 'Document #'
        });
        results.addField({
            id: 'custpage_transaction',
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction Type'
        });
        results.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.TEXT,
            label: 'Date Created'
        });
        results.addField({
            id: 'custpage_adjusted',
            type: serverWidget.FieldType.TEXT,
            label: 'Adjusted'
        });
        results.addField({
            id: 'custpage_total',
            type: serverWidget.FieldType.TEXT,
            label: 'Total'
        });

        return form;
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
        try{
            if(context.request.method === 'GET'){
                context.response.writePage({
                    pageObject: renderForm()
                });
            }
        }
        catch(error){
            log.error({title: 'Critical Error in on Request', details: error});
        }
    }

    return {
        onRequest: onRequest
    };
    
});

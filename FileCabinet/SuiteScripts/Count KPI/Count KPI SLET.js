/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', './Count KPI Fields.js'],
/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
function(serverWidget, countFields) {

    /**
     * Renders form and attaches client script
     */
    function renderForm(){
        try{
            var form = serverWidget.createForm({
               title: 'Cycle Count KPI-6 Months'
            });

            form.clientScriptModulePath = './Count KPI CS.js';

            form.addButton({
                id: 'custpage_fire_script',
                label: 'Submit',
                functionName: 'fireKPI'
            });

            form.addField({id: countFields.fields.invRecordAccuracy, type: serverWidget.FieldType.TEXT, label: 'Inventory Record Accuracy'});
            form.addField({id: countFields.fields.financialImpact, type: serverWidget.FieldType.CURRENCY, label: 'Financial Impact'});

            var itemList = form.addSublist({id: 'custpage_results', type: serverWidget.SublistType.INLINEEDITOR, label: 'Critical Counts'});
            var url = itemList.addField({id: countFields.fields.url, type: serverWidget.FieldType.URL, label: 'View Item'});
            url.linkText = 'view';
            itemList.addField({id: countFields.fields.item, type: serverWidget.FieldType.TEXT, label: 'Item'});
            itemList.addField({id: countFields.fields.units, type: serverWidget.FieldType.TEXT, label: 'Units'});
            itemList.addField({id: countFields.fields.snapQuantity, type: serverWidget.FieldType.INTEGER, label: 'Snapshot Quantity'});
            itemList.addField({id: countFields.fields.snapDetail, type: serverWidget.FieldType.TEXT, label: 'Snapshot Detail'});
            itemList.addField({id: countFields.fields.countQuantity, type: serverWidget.FieldType.INTEGER, label: 'Count Quantity'});
            itemList.addField({id: countFields.fields.countDetail, type: serverWidget.FieldType.TEXT, label: 'Count Detail'});
            itemList.addField({id: countFields.fields.adjustedQuantity, type: serverWidget.FieldType.INTEGER, label: 'Adjusted Quantity'});
            itemList.addField({id: countFields.fields.varianceDetail, type: serverWidget.FieldType.TEXT, label: 'Variance Detail'});
            itemList.addField({id: countFields.fields.rateSTDCost, type: serverWidget.FieldType.FLOAT, label: 'Rate(Std Cost)'});
            itemList.addField({id: countFields.fields.percentDiff, type: serverWidget.FieldType.TEXT, label: 'Percent Difference'});
            itemList.addField({id: countFields.fields.investigateCount, type: serverWidget.FieldType.TEXT, label: 'Investigate(Cycle Count)'});
            itemList.addField({id: countFields.fields.adjustedValue, type: serverWidget.FieldType.CURRENCY, label: 'Adjusted Value'});
            itemList.addField({id: countFields.fields.investigateValue, type: serverWidget.FieldType.TEXT, label: 'Investigate(Value)'});

            return form;
        }
        catch(error){
            throw 'Critical error in renderForm' + error;
        }
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
            log.error({title: 'Critical error in onRequest', details: error});
        }
    }

    return {
        onRequest: onRequest
    };
    
});

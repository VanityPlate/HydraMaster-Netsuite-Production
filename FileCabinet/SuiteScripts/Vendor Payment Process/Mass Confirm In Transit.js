/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/task', 'N/https'],

function(serverWidget, search, task, https) {

    /**
     * Generate Search Results
     */
    function generateResults(){
        try {
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type","anyof","VendPymt"],
                        "AND",
                        ["mainline","is","T"],
                        "AND",
                        ["status","anyof","VendPymt:B"]
                    ],
                columns:
                    [
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({name: "account", label: "Account"}),
                        search.createColumn({name: "memo", label: "Memo"}),
                        search.createColumn({name: "amount", label: "Amount"})
                    ]
            });

            return transactionSearchObj.run().getRange({start: 0, end: 1000});
        }
        catch(error){
            log.error({title: 'Critical Error in generateResults', details: error});
        }
    }

    /**
     * Rending Form
     */
    function renderForm(results){
        try{
            var formObj = serverWidget.createForm({title: 'In-Transit Payments'});
            formObj.clientScriptModulePath = 'SuiteScripts/Vendor Payment Process/In-Transit Confirm CS.js';
            var listObj = formObj.addSublist({
                id: 'custpage_transactions',
                type: serverWidget.SublistType.LIST,
                label: 'In-Transit Checks'
            });
            listObj.addButton({
                id: 'custpage_submit',
                label: 'Submit',
                functionName: 'submitSelection'
            });
            listObj.addMarkAllButtons();
            listObj.addField({
                id: 'custpage_confirm',
                label: 'Confirm',
                type: serverWidget.FieldType.CHECKBOX
            });
            var entityButton = listObj.addField({
                id: 'tranid',
                label: 'Document Number',
                type: serverWidget.FieldType.TEXT,
            });
            var trandateButton = listObj.addField({
                id: 'trandate',
                label: 'Date',
                type: serverWidget.FieldType.TEXT,
            });
            var accountButton = listObj.addField({
                id: 'account',
                label: 'Account',
                type: serverWidget.FieldType.TEXT,
            });
            var memoButton = listObj.addField({
                id: 'memo',
                label: 'Memo',
                type: serverWidget.FieldType.TEXT,
            });
            var amountButton = listObj.addField({
                id: 'amount',
                label: 'Amount',
                type: serverWidget.FieldType.TEXT,
            });
            var idButton = listObj.addField({
                id: 'id',
                label: 'ID',
                type: serverWidget.FieldType.TEXT
            });
            var x = 0;
            results.forEach(function (result) {
                listObj.setSublistValue({id: 'amount', line: x, value: result.getValue({name: 'amount'})});
                if(result.getValue({name: 'memo'})) {
                    listObj.setSublistValue({id: 'memo', line: x, value: result.getValue({name: 'memo'})});
                }
                listObj.setSublistValue({id: 'account', line: x, value: result.getText({name: 'account'})});
                listObj.setSublistValue({id: 'trandate', line: x, value: result.getValue({name: 'trandate'})});
                if(result.getValue({name: 'tranid'})) {
                    listObj.setSublistValue({id: 'tranid', line: x, value: result.getValue({name: 'tranid'})});
                }
                listObj.setSublistValue({id: 'id', line: x, value: result.id});
                x++;
            });

            //Hiding and locking sublist fields
            idButton.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            accountButton.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            amountButton.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            memoButton.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            trandateButton.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            entityButton.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

            return formObj;
        }
        catch(error){
            log.audit({title: 'Critical Error in renderForm', details: error});
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
                var results = context.request.parameters['results'];
                if(results){
                    //Refactor testing
                    log.audit({title: 'Testing Results', details: results});
                    var taskObj = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_in_transit_ues',
                        deploymentId: 'customdeploy_in_transit_ues',
                        params: {'custscript_results' : results}
                    });
                    taskObj.submit();
                }
                else{
                    context.response.writePage({pageObject: renderForm(generateResults())});
                }
            }
        }
        catch(error){
            log.audit({title: 'Critical Error in onRequest', details: error});
        }
    }
    return {
        onRequest: onRequest
    };
    
});

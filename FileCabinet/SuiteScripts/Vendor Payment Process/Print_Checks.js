/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', './Mass_Print_Vendor_Checks', 'N/http', 'N/task', 'N/file', 'N/url', 'N/record', 'N/search'],

function(serverWidget, massPrint, http,task, file, url, record, search) {

    /**
     * Function to render list
     */
    function renderList(form){
        var invoiceList = form.addSublist({
            id: 'custpage_vendor_invoices',
            type: serverWidget.SublistType.LIST,
            label: 'placeholder'
        });

        var urlField = invoiceList.addField({
            id: 'custpage_recordurl',
            type: serverWidget.FieldType.URL,
            label: 'Order Link'
        });
        urlField.linkText = 'View';

        invoiceList.addField({
            id: 'custpage_invoice',
            type: serverWidget.FieldType.TEXT,
            label: 'Invoice'
        });

        invoiceList.addField({
            id: 'custpage_vendor',
            type: serverWidget.FieldType.TEXT,
            label: 'Vendor'
        });

        invoiceList.addField({
            id: 'custpage_amount',
            type: serverWidget.FieldType.TEXT,
            label: 'Amount Paid'
        });

        var checks = file.load({
            id: 'Process_Files/Vendor Payment Checks/check_queued.txt'
        });

        var iterator = checks.lines.iterator();

        var x = 0;

        iterator.each(function(line){
            var invoiceURL = url.resolveRecord({
                recordType: record.Type.VENDOR_PAYMENT,
                recordId: line,
                isEditMode: false
            });
            var results = search.create({
                type: "transaction",
                filters:
                    [
                        ["internalid","anyof", line.value],
                        "AND",
                        ["mainline","is","T"]
                    ],
                columns:
                    [
                        search.createColumn({name: "amount", label: "amount"}),
                        search.createColumn({name: "transactionnumber", label: "Transaction Number"}),
                        search.createColumn({
                            name: "companyname",
                            join: "vendorLine",
                            label: "Company Name"
                        })
                    ]
            }).run().getRange({start: 0, end: 1});
            invoiceList.setSublistValue({id: 'custpage_recordurl', line: x, value: invoiceURL});
            if(results[0].getValue({name: 'companyname', join: 'vendorLine'})) {
                invoiceList.setSublistValue({
                    id: 'custpage_vendor',
                    line: x,
                    value: results[0].getValue({name: 'companyname', join: 'vendorLine'})
                });
            }
            invoiceList.setSublistValue({id: 'custpage_invoice', line: x, value: results[0].getValue({name: 'transactionnumber'})});
            invoiceList.setSublistValue({id: 'custpage_amount', line: x, value: '$' + Math.abs(results[0].getValue({name: 'amount'})).toFixed(2)});
            x++;
            return true;
        });
        invoiceList.label = 'Vendor Payments to be Printed(' + x + ')';
    }

    /**
     * Helper Function for rendering the form
     */
    function renderForm(){
        var form = serverWidget.createForm({title: 'Print Vendor Invoice Checks'});

        var print = form.addSubmitButton({
            label: 'Print'
        });

        renderList(form);

        var startCheckNum = form.addField({
            id: 'custpage_checknum',
            type: serverWidget.FieldType.TEXT,
            label: 'Starting Check Number'
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
            else {
                context.response.sendRedirect({
                    identifier: massPrint.printVChecks(),
                    type: http.RedirectType.MEDIA_ITEM
                });

                var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                scriptTask.scriptId = 'customscript_update_check_info';
                scriptTask.deploymentId = 'customdeploy_update_check_info';
                scriptTask.params = {'custscript_check_number' : context.request.parameters.custpage_checknum};
                scriptTask.submit();
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

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{search} search
     */
    function(log, record, search, ui, url) {

        /**
         * Function for truncating strings to maximum size of (300)
         */
        function cutString(lineToCut){
            return lineToCut.slice(0, 299);
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
            log.audit({title: 'Request Received.'});

            try {
                context.response.writePage({
                    pageObject: renderForm("Front Door Shipping")
                });
            }
            catch(error){
                log.error({title: 'Critical Error in onRequest', details: error});
            }
        }

        function renderForm(title){
            var form = ui.createForm({
                title: title
            });

            var allBackOrders = renderList(form, createSearch('customsearch_fd_orders_to_ship'), "All Pending Orders");
            var scBackOrders = renderList(form, createSearch('customsearch_no_sc_fd_ship_ready'), "Orders__Some Items Committed");
            var noScBackOrders = renderList(form, createSearch('customsearch_sc_fd_ship_ready'), "Ship Complete Orders__Fully Committed");

            return form;

        }


        function renderList(form, results, title){
            var count = 0;
            results.forEach(function (stuff) {
                count++;
            });

            var list = form.addSublist({
                id: title.split(" ").join("").toLowerCase(),
                type: ui.SublistType.LIST,
                label: title + '(' + count + ')'
            });
            var urlField = list.addField({
                id: 'recordurl',
                type: ui.FieldType.URL,
                label: 'Order Link'
            });
            urlField.linkText = 'View';
            list.addField({
                id: 'shipvia',
                type: ui.FieldType.TEXT,
                label: 'Ship Via'
            });
            list.addField({
                id: 'shipmemo',
                type: ui.FieldType.TEXT,
                label: 'Ship Memo'
            });
            list.addField({
                id: 'companyname',
                type: ui.FieldType.TEXT,
                label: 'Company Name'
            });
            list.addField({
                id: 'datecreated',
                type: ui.FieldType.TEXT,
                label: 'Date Created'
            });
            list.addField({
                id: 'custbody_pcg_ship_instructions',
                type: ui.FieldType.TEXT,
                label: 'Shipping Instructions'
            });
            list.addField({
                id: 'tranid',
                type: ui.FieldType.TEXT,
                label: 'Document Number'
            });

            var x = 0;
            results.forEach(function(result){
                var documentNum = result.getValue({name: 'tranid', summary: search.Summary.GROUP});
                if(result.getValue({name: 'shipmethod', summary: search.Summary.GROUP})) {
                    list.setSublistValue({
                        id: 'shipvia',
                        line: x,
                        value: result.getText({name: 'shipmethod', summary: search.Summary.GROUP})
                    });
                }
                list.setSublistValue({id: 'shipmemo', line: x, value: result.getValue({name: 'custbody_pcg_ship_memo', summary: search.Summary.GROUP})});
                list.setSublistValue({id: 'companyname', line: x, value: result.getValue({name: 'custcol_2663_companyname', summary: search.Summary.GROUP})});
                list.setSublistValue({id: 'datecreated', line: x, value: result.getValue({name: 'datecreated', summary: search.Summary.GROUP})});
                list.setSublistValue({id: 'custbody_pcg_ship_instructions', line: x, value: cutString(result.getValue({name: 'custbody_pcg_ship_instructions', summary: search.Summary.GROUP}))});
                list.setSublistValue({id: 'tranid', line: x, value: documentNum});
                list.setSublistValue({id: 'recordurl',
                    value: getURL(result.getValue({name: 'internalid', summary: search.Summary.GROUP}), documentNum), line: x});
                x++;
            });
            return list;
        }

        function getURL(recordId, documentNum) {
            //Getting record type and loading based on type
            if (documentNum.charAt(0) == 'S') {
            return url.resolveRecord({
                recordType: record.Type.SALES_ORDER,
                recordId: recordId,
                isEditMode: false
            });
            }
            else {
                return url.resolveRecord({
                    recordType: record.Type.TRANSFER_ORDER,
                    recordId: recordId,
                    isEditMode: false
                });
            }
        }

        function createSearch(searchId){
            return search.load({id: searchId}).run().getRange({start: 0, end: 999});
        }

        return {
            onRequest: onRequest
        };

    });

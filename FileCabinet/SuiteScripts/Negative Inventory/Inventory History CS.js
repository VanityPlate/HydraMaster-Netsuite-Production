/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'SuiteScripts/Help_Scripts/Get_Internal.js', 'N/ui/message', 'N/search'],

function(currentRecord, getInternal, message, search) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    /**
     * Takes the paged search results and renders them to the page
     */
    function updatePage(searchResults) {
        //Calculating Running Total and Updating
        updateLine = function (result, quantity) {
            runningTotal = runningTotal + parseInt(quantity);
            page.selectNewLine({sublistId: 'custpage_results'});
            page.setCurrentSublistValue({
                sublistId: 'custpage_results',
                fieldId: 'custpage_document',
                value: result.getValue({name: 'tranid', summary: 'GROUP'})
            });
            page.setCurrentSublistValue({
                sublistId: 'custpage_results',
                fieldId: 'custpage_transaction',
                value: result.getValue({name: 'type', summary: 'GROUP'})
            });
            page.setCurrentSublistValue({
                sublistId: 'custpage_results',
                fieldId: 'custpage_date',
                value: result.getValue({name: 'datecreated', summary: 'GROUP'})
            });
            page.setCurrentSublistValue({
                sublistId: 'custpage_results',
                fieldId: 'custpage_adjusted',
                value: quantity
            });
            page.setCurrentSublistValue({
                sublistId: 'custpage_results',
                fieldId: 'custpage_total',
                value: runningTotal
            });
            page.commitLine({sublistId: 'custpage_results'});
        };

        var page = currentRecord.get();
        var runningTotal = 0;
        var shipped = 0, received = 0, adjusted = 0, consumed = 0, built = 0;
        searchResults.pageRanges.forEach(function (pageRange) {
            var myPage = searchResults.fetch({index: pageRange.index});
            myPage.data.forEach(function(result){
                var type = result.getValue({name: 'type', summary: 'GROUP'});
                var quantity =  parseInt(result.getValue({name: 'quantity'}));
                if(type == 'BinWksht' || type == 'WorkOrd' || type == 'PurchOrd' || type == 'WOIssue' || type == 'WOClose' || type == 'TrnfrOrd' || type == 'CustCred' || type == 'BinTrnfr'){}
                else {
                    //Calculating Totals
                    switch(type){
                        case 'Build':
                            if(quantity > 0){built += quantity;}
                            else{consumed += quantity;}
                            updateLine(result, quantity);
                            break;
                        case 'WOCompl':
                            if(quantity > 0){built += quantity;}
                            else{consumed += quantity;}
                            updateLine(result, quantity);
                            break;
                        case 'ItemShip':
                            shipped += quantity;
                            updateLine(result, quantity);
                            break;
                        case 'ItemRcpt':
                            if(quantity > 0) {
                                received += quantity;
                                updateLine(result, quantity);
                            }
                            break;
                        case 'Unbuild':
                            if(quantity < 0){built += quantity;}
                            else{consumed += quantity;}
                            updateLine(result, quantity);
                            break;
                        default:
                            adjusted += quantity;
                            updateLine(result, quantity);
                    }
                }
            });
        });
        //Updating Totals
        page.setValue({fieldId: 'custpage_adjusted', value: adjusted});
        page.setValue({fieldId: 'custpage_received', value: received});
        page.setValue({fieldId: 'custpage_fulfilled', value: shipped});
        page.setValue({fieldId: 'custpage_consumed', value: consumed});
        page.setValue({fieldId: 'custpage_built', value: built});
    }

    /**
     * Generate the results by location for the history of the item
     */
    function generateResults(itemID, location){
        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["item.internalid","anyof",itemID],
                    "AND",
                    ["type","noneof","InvReval","CustInvc","SalesOrd","Estimate", "Opprtnty", "VendBill", "VendPymt", "VPrep", "InvCount"],
                    "AND",
                    ["location","anyof",location],
                    "AND",
                    ["itemsource","noneof","PHANTOM"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Document Number"
                    }),
                    search.createColumn({
                        name: "type",
                        summary: "GROUP",
                        label: "Type"
                    }),
                    search.createColumn({
                        name: "datecreated",
                        summary: "GROUP",
                        label: "Date Created",
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: "quantity",
                        label: "Quantity"
                    })
                ]
        }).runPaged();
        return transactionSearchObj;
    }

    /**
     * Method to display invalid input
     */
    function invalidInput(){
        var messageObj = message.create({
            title: 'Invalid Input',
            message: 'Please enter a valid item and location.',
            type: message.Type.ERROR
        });
        messageObj.show({duration: 25000});
    }

    /**
     * Method to display valid input
     */
    function validInput(){
        var messageObj = message.create({
            title: 'Success!',
            message: 'Your search is running please be patient.',
            type: message.Type.CONFIRMATION
        });
        messageObj.show({duration: 25000});
    }

    /**
     * Function for button click on Inventory History SLet.js
     */
    function getHistory(){
        try {
            //gathering values
            var itemHistory = currentRecord.get();
            var externalItem = itemHistory.getValue({fieldId: 'custpage_item'});
            var item = getInternal.item(externalItem);
            var location = itemHistory.getValue({fieldId: 'custpage_location'});

            //Validating Input
            if (!item || !location) {
                invalidInput();
            }
            else{
                validInput();
                updatePage(generateResults(item, location));
            }
        }
        catch(error){
            log.error({title: 'Critical Error in getHistory', details: error});
        }
    }

    return {
        pageInit: pageInit,
        getHistory: getHistory
    };
    
});

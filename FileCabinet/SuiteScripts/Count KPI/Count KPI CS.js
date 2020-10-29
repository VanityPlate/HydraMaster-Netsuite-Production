/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message', './Count KPI Fields.js', 'N/url', 'N/https', 'SuiteScripts/Help_Scripts/schedulerLib.js', 'N/currentRecord'],
/**
 * @param{search} search
 * @param{message} message
 * @param{countFields} field library for Count KPI
 */
function(search, message, countFields, url,  https, schedulerLib, currentRecord) {

    /**
     *Helper Function to Display Message to User that an Unknown Error Has Occurred
     */
    function errorMessage(){
        message.create({
            type: message.Type.ERROR,
            duration: 30000,
            title: 'Critical Error',
            message: 'There has been an unexpected error. Contact your administrator.'
        }).show();
    }

    /**
     * Display Results to Suitlet
     */
    function displayResults(){
        try{
            //getting record and results file
            var recordObj = currentRecord.get();
            var output = url.resolveScript({
                scriptId:  'customscript_wo_fix_scheduler',
                deploymentId: 'customdeploy_wo_fix_scheduler',
                params: {'results': 'countKPI'}
            });
            var response = https.get({url: output});
            var content = response.body.split('^^^');
            var lines = Number(content[0]);

            //Variables for Results
            var financialImpact = 0;
            var adjustedQuantity = 0;
            var totalAdjustments = 0;
            var lineSnap, lineCount, lineAdjust, lineRate, item, invCount, invValue, percentDiff, lineAdjustValue;


           if(lines != 0) {
               for(var x = 0; x < lines; x++) {
                   //line value
                   var y = (x * 5) + 1;
                   //Determining Line Values
                   item = content[y];
                   lineRate = parseFloat(content[y + 1]);
                   lineCount = parseFloat(content[y + 2]);
                   lineSnap = parseFloat(content[y + 3]);
                   lineAdjust = parseFloat(content[y + 4]);
                   totalAdjustments++;
                   lineAdjustValue = lineRate * lineAdjust;
                   financialImpact += lineAdjustValue;
                   if (lineAdjust != 0) {
                       adjustedQuantity++;
                   }
                   if (lineSnap > 0) {
                       percentDiff = (Math.abs(lineCount - lineSnap) / lineCount);
                   } else {
                       percentDiff = 'Negative Snapshot!';
                   }
                   if (percentDiff == 'Negative Snapshot!' || percentDiff >= countFields.tolerance.countTolerance) {
                       invCount = 'YES';
                   } else {
                       invCount = 'NO';
                   }
                   if (Math.abs(lineAdjustValue) >= countFields.tolerance.valueTolerance) {
                       invValue = 'YES';
                   } else {
                       invValue = 'NO';
                   }

                   //Adding Line Values
                   if(invValue == 'YES' || invCount == 'YES') {
                       recordObj.selectNewLine({sublistId: 'custpage_results'});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.item, value: item});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.snapQuantity, value: lineSnap});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.countQuantity, value: lineCount});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.adjustedQuantity, value: lineAdjust});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.rateSTDCost, value: lineRate});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.percentDiff, value: percentDiff == 'Negative Snapshot!' ? percentDiff : Math.trunc(percentDiff*100)});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.investigateCount, value: invCount});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.adjustedValue, value: lineAdjustValue});
                       recordObj.setCurrentSublistValue({sublistId: 'custpage_results', fieldId: countFields.fields.investigateValue, value: invValue});
                       recordObj.commitLine({sublistId: 'custpage_results'});
                   }
               }
            }

            //Displaying Totals
            recordObj.setValue({fieldId: countFields.fields.financialImpact, value: financialImpact});
            recordObj.setValue({fieldId: countFields.fields.invRecordAccuracy, value: ('%' + Math.trunc((1 - (adjustedQuantity / totalAdjustments)) * 100))});
        }
        catch(error) {
            errorMessage();
            log.error({title: 'Critical error in displayResults', details: error});
        }
    }

    /**
     *Function for Calling Scheduler Suitelet Through Promise
     */
    function executeScript(){
        try{
            //Creating promise
            var promiseWork = new Promise((resolve, reject) => {
                //Creating scheduled script and submitting
                var output = url.resolveScript({
                    scriptId: 'customscript_wo_fix_scheduler',
                    deploymentId: 'customdeploy_wo_fix_scheduler',
                    params: {'countKPI' :'TRUE'}
                });
                var response = https.get({
                    url: output
                });
                //Resolving scheduled script id
                var scriptID = response.body;

                resolve(scriptID);
            });

            //Executing Promise Chain
            promiseWork.then((output) => {
                var check = schedulerLib.checkStatus(output, 0);
                if(check){
                    displayResults();
                }
            }).catch(function (reason) {
                errorMessage();
                log.error({title: 'Critical error', details: reason});
            });
        }
        catch(error){
            errorMessage();
            log.audit({title: 'Critical Error in executeScript', details: error});
        }
    }

    function pageInit(scriptContext) {
        try{
            //Message Displaying Defaults & Letting User Know How to Change Them
            message.create({
                duration: 30000,
                type: message.Type.INFORMATION,
                title: 'Count KPI',
                message: 'Cycle Count Tolerance set to 5%. Value Tolerance set to $100.00. Date range set to previous 3 weeks. See administrator to update.'
            }).show();
        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    /**
     * Function for managing the count kpi execution
     */
    function fireKPI(){
        try{
            //Displaying Message That Execution is Underway
            message.create({
                duration: 30000,
                type: message.Type.INFORMATION,
                title: 'Execution Underway.',
                message: 'Gathering results, please be patient.'
            }).show();

            //Calling Scheduler to Execute Script
            executeScript();
        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    return {
        pageInit: pageInit,
        fireKPI: fireKPI
    };
    
});

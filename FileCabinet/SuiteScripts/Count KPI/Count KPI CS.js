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
            var fileObj = file.load({id: schedulerLib.fileLib.countKPI});

            //Variables for Results
            var financialImpact = 0;
            var adjustedQuantity = 0;
            var totalAdjustments = 0;
            var lineSnap, lineCount, lineAdjust, lineRate, lineSplit, item, invCount, invValue, percentDiff, lineAdjustValue;

            //creating iterator and using iterator
            var iterator = fileObj.lines.iterator();
            iterator.each(function (line) {
                //Determining Line Values
                lineSplit = line.split('^^^');
                item = lineSplit[0];
                lineRate = parseFloat(lineSplit[1]);
                lineCount = parseFloat(lineSplit[2]);
                lineSnap = parseFloat(lineSplit[3]);
                lineAdjust = parseFloat(lineSplit[4]);
                totalAdjustments++;
                lineAdjustValue = lineRate * lineAdjust;
                financialImpact += lineAdjustValue;
                if(lineAdjust != 0){adjustedQuantity++};
                if(lineSnap > 0){percentDiff = (Math.abs(lineCount - lineSnap)/lineCount);}
                else{percentDiff = 'Negative Snapshot!';}
                if(percentDiff == 'Negative Snapshot!' || percentDiff >= countFields.tolerance.countTolerance){invCount = 'YES';}
                else{invCount = 'NO';}
                if(Math.abs(lineAdjustValue) >= countFields.tolerance.valueTolerance){invValue = 'YES';}
                else{invValue = 'NO';}

                //Adding Line Values
                recordObj.setValue({fieldId: countFields.fields.item, value: item});
                recordObj.setValue({fieldId: countFields.fields.snapQuantity, value: lineSnap});
                recordObj.setValue({fieldId: countFields.fields.countQuantity, value: lineCount});
                recordObj.setValue({fieldId: countFields.fields.adjustedQuantity, value: lineAdjust});
                recordObj.setValue({fieldId: countFields.fields.rateSTDCost, value: lineRate});
                recordObj.setValue({fieldId: countFields.fields.percentDiff, value: percentDiff});
                recordObj.setValue({fieldId: countFields.fields.investigateCount, value: invCount});
                recordObj.setValue({fieldId: countFields.fields.adjustedValue, value: lineAdjustValue});
                recordObj.setValue({fieldId: countFields.fields.investigateValue, value: invValue});
            });

            //Displaying Totals
            recordObj.setValue({fieldId: countFields.fields.financialImpact, value: financialImpact});
            recordObj.setValue({fieldId: countFields.fields.invRecordAccuracy, value: (1 - (adjustedQuantity / totalAdjustments))});
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
            debugger;
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

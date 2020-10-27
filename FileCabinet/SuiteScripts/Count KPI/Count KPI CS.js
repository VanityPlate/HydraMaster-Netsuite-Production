/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message', './Count KPI Fields.js', 'N/url', 'N/https'],
/**
 * @param{search} search
 * @param{message} message
 * @param{countFields} field library for Count KPI
 */
function(search, message, countFields, https) {

    /**
     *
     *
     */
    function errorMessage(){
        message.create({
            type: message.Type.ERROR,
            duration: 30000,
            title: 'Critical Error',
            message: 'There has been an unexpected error. Contact your administrator.'
        }).show();
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

        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    return {
        pageInit: pageInit
    };
    
});

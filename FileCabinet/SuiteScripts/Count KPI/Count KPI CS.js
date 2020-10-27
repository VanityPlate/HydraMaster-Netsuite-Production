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
    

    function pageInit(scriptContext) {
        try{

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

        }
        catch(error){
            log.error({title: 'Critical error in pageInit', details: error});
        }
    }

    return {
        pageInit: pageInit
    };
    
});

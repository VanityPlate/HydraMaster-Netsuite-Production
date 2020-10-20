/**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record'],
/**
 * @param{log} log
 * @param{record} record
 */
function(log, record) {
    
    /**
     * Definition of Mass Update trigger point.
     *
     * @param {Object} params
     * @param {string} params.type - Record type of the record being processed by the mass update
     * @param {number} params.id - ID of the record being processed by the mass update
     *
     * @since 2016.1
     */
    function updateSerialVerified(params) {
        try{
            var assBOM = record.load({
                type: record.Type.ASSEMBLY_BUILD,
                id: params.id,
                isDynamic: false
            });

            //Refactor- testing output
            log.audit({title: 'testing', details: assBOM.getValue({fieldId: 'tranid'})});
            assBOM.setValue({fieldId: 'custbody_serial_verified', value: true});
            assBOM.save();
        }
        catch(error)
        {
            log.error({title: 'Critical Error in updateSerialVerified', details: error});
        }
    }

    return {
        each: updateSerialVerified
    };
    
});

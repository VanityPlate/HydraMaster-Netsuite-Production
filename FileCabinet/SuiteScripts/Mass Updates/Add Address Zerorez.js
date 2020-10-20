/**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param{record} record
 */
function(record) {
    
    /**
     * Definition of Mass Update trigger point.
     *
     * @param {Object} params
     * @param {string} params.type - Record type of the record being processed by the mass update
     * @param {number} params.id - ID of the record being processed by the mass update
     *
     * @since 2016.1
     */
    function each(params) {
        try {
            var recordObj = record.load({
                type: record.Type.CUSTOMER,
                id: params.id,
                isDynamic: true
            });
            recordObj.selectNewLine({sublistId: 'addressbook'});
            var address = recordObj.getCurrentSublistSubrecord({sublistId: 'addressbook', fieldId: 'addressbookaddress'});
            address.setValue({fieldId: 'country', value: 'US'});
            address.setValue({fieldId: 'attention', value: 'Vehicle Purchasing'});
            address.setValue({fieldId: 'addressee', value: 'Mike Albert Leasing, Inc.'});
            address.setValue({fieldId: 'addrphone', value: '888-368-8697'});
            address.setValue({fieldId: 'addr1', value: '10340 Evandale Drive'});
            address.setValue({fieldId: 'zip', value: '45241-2564'});
            address.setValue({fieldId: 'city', value: 'Cincinnati'});
            address.setValue({fieldId: 'state', value: 'OH'});
            recordObj.commitLine({sublistId: 'addressbook'});
            recordObj.save();
        }
        catch(error){
            log.audit({title: 'Critical Error in each', details: error});
        }
    }

    return {
        each: each
    };
    
});

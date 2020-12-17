/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 */
 /**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
  * @NModuleScope SameAccount
 */
define(['N/record'],
    
    function (record) {
        /**
         * Defines the Mass Update trigger point.
         * @param {Object} params
         * @param {string} params.type - Record type of the record being processed
         * @param {number} params.id - ID of the record being processed
         * @since 2016.1
         */
        function each (params) {
            try{
                //Loading Record
                var saleObj = record.load({
                    isDynamic: true,
                    id: params.id,
                    type: record.Type.SALES_ORDER
                });

                //Finding Relevant Sales Lines and Editing Them
                var lines = saleObj.getLineCount({sublistId: 'item'});
                for(var x = 0; x < lines; x++){
                    saleObj.selectLine({sublistId: 'item', line: x});
                    if(saleObj.getCurrentSublistValue({sublistId: 'item', fieldId: 'location'}) == 16){
                        saleObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'commitinventory', value: 3, ignoreFieldChange: true});
                        saleObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantitycommitted', value: 0, ignoreFieldChange: true});
                        saleObj.commitLine({sublistId: 'item'});
                    }
                }

                //Saving Updated Record
                saleObj.save();
            }
            catch(error){
                log.error({title: 'Critical error in each.', details: error});
            }
        }

        return {each: each};

    });

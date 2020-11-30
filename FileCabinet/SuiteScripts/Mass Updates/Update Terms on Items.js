/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
    /**
     * @param{log} log
     * @param{record} record
     */
    function(search, record) {

        /**
         * @Constants
         */
        const SEARCHES = {
            1:  'customsearch1527',
            2:  'customsearch1523',
            3:  'customsearch1525',
            4:  'customsearch1524'
        };

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
            try{
                //Loading Record
                var itemRecord = record.load({type: record.Type.ASSEMBLY_ITEM, id: params.id, isDynamic: true});

                //Determine Type of Warranty
                for(var x = 1; x <= 4; x++){
                    var searchObj = search.load({id: SEARCHES[x]}).run().getRange({start: 0, end: 1000});
                    if(searchObj.some(function (result){return params.id == result.id})){
                        itemRecord.setValue({fieldId: 'custitem_wrm_item_trackwarranty', value: 'T'});
                        itemRecord.setValue({fieldId: 'custitem_wrm_item_warrantyterms', value: x});
                        itemRecord.save();
                        break;
                    }
                }
            }
            catch (error){
                log.error({title: 'Critical error in each', details: error});
            }
        }

        return {
            each: each
        };

    });
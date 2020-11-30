/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 * @details Update to all serialized assemblies so they will work with warranty and case system.
 *
 */
 /**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
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
         * Defines the Mass Update trigger point.
         * @param {Object} params
         * @param {string} params.type - Record type of the record being processed
         * @param {number} params.id - ID of the record being processed
         * @since 2016.1
         */
        const each = (params) => {
            try{
                //Loading Record
                var itemRecord = record.load({type: record.Type.ASSEMBLY_ITEM, id: params.id, isDynamic: true});

                //Determine Type of Warranty
                for(var x = 1; x <= 4; x++){
                    var searchObj = search.load({id: SEARCHES[x]}).run().getRange({start: 0, end: 4000});
                    if(searchObj.some(function (result){return params.id == result.id})){
                        itemRecord.setValue({id: 'custitem_wrm_item_trackwarranty', value: 'T'});
                        itemRecord.setValue({id: 'custitem_wrm_item_warrantyterms', value: x});
                        itemRecord.save();
                        break;
                    }
                }
            }
            catch (error){
                log.error({title: 'Critical error in each', details: error});
            }
        }
        return {each}
    });

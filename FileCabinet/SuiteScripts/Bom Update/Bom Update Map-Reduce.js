/**
 *
 * @copyright Alex S. Ducken 2021 alexducken@gmail.com
 * HydraMaster LLC
 *
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/search', 'SuiteScripts/Help_Scripts/Load_Unknown_Record_Type.js'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search, loadUnknown) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            try{
                return search.create({
                    type: "assemblyitem",
                    filters:
                        [
                            ["type","anyof","Assembly"],
                            "AND",
                            ["component","anyof",runtime.getCurrentScript().getParameter({name: 'custscript_old_item_map'})]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
            }
            catch(error){
                log.error({title: 'Critical error in getInputData.', details: error});
            }

        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            try{
                //Collecting Values
                var assemblyObj = loadUnknown.recursiveLoad(JSON.parse(mapContext.value).id, 0);
                var oldItem = runtime.getCurrentScript().getParameter({name: 'custscript_old_item_map'});
                var newItem = runtime.getCurrentScript().getParameter({name: 'custscript_new_item_map'});
                var save = false;

                while(assemblyObj.findSublistLineWithValue({sublistId: 'member', value: oldItem, fieldId: 'item'}) != -1){
                    assemblyObj.selectLine({sublistId: 'member', line: assemblyObj.findSublistLineWithValue({sublistId: 'member', value: oldItem, fieldId: 'item'})});
                    var source = assemblyObj.getCurrentSublistValue({sublistId: 'member', fieldId: 'itemsource'});
                    var quantity = assemblyObj.getCurrentSublistValue({sublistId: 'member', fieldId: 'quantity'});
                    assemblyObj.setCurrentSublistValue({sublistId: 'member', fieldId: 'item', value: newItem});
                    assemblyObj.setCurrentSublistValue({sublistId: 'member', fieldId: 'itemsource', value: source});
                    assemblyObj.setCurrentSublistValue({sublistId: 'member', fieldId: 'quantity', value: quantity});
                    assemblyObj.commitLine({sublistId: 'member'});
                    save = true;
                }

                //Saving object if changes have been made
                if(save){
                    assemblyObj.save();
                }

            }
            catch (error){
                log.error({title: 'Critical error in map.', details: error});
            }
        }

        return {getInputData, map}

    });

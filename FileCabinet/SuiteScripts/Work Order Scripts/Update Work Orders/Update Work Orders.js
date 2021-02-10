/**
 *
 * @copyright Alex S. Ducken 2021 alexducken@gmail.com
 * HydraMaster LLC
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/file', 'SuiteScripts/Work Order Scripts/Update Work Orders/Update Work Orders Library.js'],
    
    (file, updateWOLib) => {

        /**
         *Factory for Line Objects
         */
        const LINE_BEHAVIOR = {
                getQuantity(){
                        return this.quantity;
                },
                getItemId(){
                        return this.itemId;
                },
                getLine(){
                        return this.line;
                }
        };

        let CreateLine = (quantity, itemId, line) => {
                let lineThing = Object.create(LINE_BEHAVIOR);
                lineThing.quantity = quantity;
                lineThing.itemId = itemId;
                lineThing.line = line;
                return lineThing;
        };

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
                        return file.load({id: updateWOLib.FILEID});
                }
                catch (error) {
                        log.error({title: 'Critical error in getInputDate', details: error});
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
                try {
                        //Capturing line values
                        var values = mapContext.value.split(',');

                        //Creating Object with Data
                        let lineOutput = CreateLine(values[6], values[10], values[5]);

                        //Writing Key Value Pairs
                        mapContext.write({
                               key: values[0],
                               value: lineOutput
                        })
                }
                catch (error) {
                        log.error({title: 'Critical error in map', details: error});
                }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
                try{
                        //Refactor Testing
                        log.audit({title: 'Testing Key', details: reduceContext.key});
                        log.audit({title: 'Testing Values', details: reduceContext.values});
                }
                catch (error) {
                        log.error({title: 'Critical error in reduce', details: error});
                }
        }


        return {getInputData, map, reduce}

    });

/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/file', 'N/format'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search, file, format) => {

        /**
         * Constants
         */
        const ITEMS = {
            BOXXER_WPH: 23860,
            CTS_WPH: 23862,
            CDS_WPH: 23861,
            GTXR_WPH: 23863,
            TITAN_WPH: 23864
        };

        const CUSTOMER_WPH = 21188;
        const ITEM_REGX = /(boxxer|cts|cds|gtxr|titan)/ig;
        const DEFAULT_DATE = '1/1/2012';
        const PHONE_REGX = /( |\(|\)|-)/ig;
        const SERIAL_REGX = /( |\*)/ig;

        /**
         * Creates a date object
         * @param {date} the date string to convert
         * @return {Nesutie Date Object}
         */
        function setDate(date){
            try{
                return format.parse({value: date, type: format.Type.DATE});
            }
            catch (error){
                log.error({title: 'Critical error in setDate', details: error});
            }
        }

        /**
         * Creates an individual customer
         * @param {values} information used to create customer
         * @returns {integer} the new customer internal id
         */
        function createCustomer(values){
            try{
                //Creating Record
                var customerObj = record.create({
                   isDynamic: true,
                   type: record.Type.CUSTOMER
                });

                //Setting Fields
                customerObj.setValue({fieldId: 'isperson', value: 'T'});
                customerObj.setValue({fieldId: 'companyname', value: values[7]});
                customerObj.setValue({fieldId: 'phone', value: values[14].replace(PHONE_REGX, '')});
                customerObj.setValue({fieldId: 'email', value: values[13]});
                customerObj.setValue({fieldId: 'subsidiary', value: '1'});
                var nameSplit = values[6];
                switch (nameSplit.length) {
                    case 1:
                        customerObj.setValue({fieldId: 'firstname', value: nameSplit[0]});
                        customerObj.setValue({fieldId: 'lastname', value: '_'});
                        break;
                    case 2:
                        customerObj.setValue({fieldId: 'firstname', value: nameSplit[0]});
                        customerObj.setValue({fieldId: 'lastname', value: nameSplit[1]});
                        break;
                    default:
                        customerObj.setValue({fieldId: 'firstname', value: nameSplit[0]});
                        customerObj.setValue({fieldId: 'lastname', value: nameSplit[2]});
                        customerObj.setValue({fieldId: 'middlename', value: nameSplit[1]});
                }
                if(values[12] != '') {
                    try {
                        //Setting Address
                        customerObj.selectNewLine({sublistId: 'addressbook'});
                        var addressSub = customerObj.getCurrentSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress'
                        });
                        addressSub.setValue({fieldId: 'attention', value: values[7]});
                        addressSub.setValue({fieldId: 'addr1', value: values[8]});
                        addressSub.setValue({fieldId: 'addressee', value: values[6]});
                        addressSub.setValue({fieldId: 'addrphone', value: values[14]});
                        addressSub.setValue({fieldId: 'city', value: values[9]});
                        addressSub.setValue({fieldId: 'country', value: values[12]});
                        addressSub.setValue({fieldId: 'state', value: values[10]});
                        addressSub.setValue({fieldId: 'zip', value: values[11]});
                        customerObj.setCurrentSublistValue({
                            sublistId: 'addressbook',
                            fieldId: 'defaultbilling',
                            value: true
                        });
                        customerObj.setCurrentSublistValue({
                            sublistId: 'addressbook',
                            fieldId: 'defaultshipping',
                            value: true
                        });
                        customerObj.commitLine({sublistId: 'addressbook'});
                    } catch (error) {
                        log.audit({title: 'Minor error - address failure', details: error});
                    }
                }

                //Saving and Returning Internal ID
                return customerObj.save();
            }
            catch (error){
                log.error({title: 'Critical error in createCustomer', details: error});
            }
        }


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
                return file.load({id: 493235});
            }
            catch(error){
                log.error({title: 'Critical error in getInputData', details: error});
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
                //Capturing line values
                var values = mapContext.value.split(',');

                //Creating Record
                var warrantyObj = record.create({type: 'customrecord_wrm_warrantyreg', isDynamic: true});

                //Finding Distributor
                var distributor = search.create({
                    type: "customer",
                    filters:
                        [
                            ["entityid","contains",values[5]]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                }).run().getRange({start: 0, end: 1});
                if(distributor.length > 0){
                    distributor = distributor[0].id;
                }
                else{
                    distributor = CUSTOMER_WPH;
                }

                //Finding End User
                if(values[14] != '') {
                    var customer = search.create({
                        type: "customer",
                        filters:
                            [
                                ["phone", "haskeywords", values[14].replace(PHONE_REGX, '')]
                            ],
                        columns:
                            [
                                search.createColumn({name: "internalid", label: "Internal ID"})
                            ]
                    }).run().getRange({start: 0, end: 1});
                }
                else{var customer = [];}
                if(customer.length > 0){
                    customer = customer[0].id;
                }
                else{
                    customer = createCustomer(values);
                }


                //Setting Record Values
                warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_ref_seriallot', value: values[1].replace(SERIAL_REGX, '')});
                warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_customer', value: distributor});
                warrantyObj.setValue({fieldId: 'custrecord_selling_distributor', value: customer});

                //Setting install date
                var installDate = values[0] != '' ? setDate(values[0]) : setDate(DEFAULT_DATE);
                warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_warrantybegin', value: installDate, ignoreFieldChange: true});

                //Selecting Item
                var itemSelect = values[2].match(ITEM_REGX);
                switch (itemSelect[0].toLowerCase()){
                    case 'cts':
                        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: ITEMS.CTS_WPH});
                        break;
                    case 'cds':
                        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: ITEMS.CDS_WPH});
                        break;
                    case 'titan':
                        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: ITEMS.TITAN_WPH});
                        break;
                    case 'boxxer':
                        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: ITEMS.BOXXER_WPH});
                        break;
                    case 'gtxr':
                        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: ITEMS.GTXR_WPH});
                        break;
                    default:
                        warrantyObj.setValue({fieldId: 'custrecord_wrm_reg_item', value: ITEMS.CDS_WPH});
                };

                //Saving Record
                warrantyObj.save();
            }
            catch(error){
                log.audit({title: 'Serial Failed On!', details: values[1]});
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

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map}

    });

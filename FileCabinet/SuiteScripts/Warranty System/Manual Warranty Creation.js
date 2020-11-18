/**
 *
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/redirect', 'N/search', 'N/task', './Warranty Field Lib.js'],

function(serverWidget, redirect, search, task, fieldLib) {

    /**
     * Constants
     * @COUNTRIES sourced key : value pairs for countries from Netsuite
     * @USSTATES sourced key : value pairs for USA states
     * @CASTATES sourced key : value pairs for Canada states
     * @FORMSELECT key : value pairs for selecting what forms to enter
     * @FORMS enumeration for for ids
     */
    const COUNTRIES = [{"value":"","text":""},{"value":"AF","text":"Afghanistan"},{"value":"AX","text":"Aland Islands"},{"value":"AL","text":"Albania"},{"value":"DZ","text":"Algeria"},{"value":"AS","text":"American Samoa"},{"value":"AD","text":"Andorra"},{"value":"AO","text":"Angola"},{"value":"AI","text":"Anguilla"},{"value":"AQ","text":"Antarctica"},{"value":"AG","text":"Antigua and Barbuda"},{"value":"AR","text":"Argentina"},{"value":"AM","text":"Armenia"},{"value":"AW","text":"Aruba"},{"value":"AU","text":"Australia"},{"value":"AT","text":"Austria"},{"value":"AZ","text":"Azerbaijan"},{"value":"BS","text":"Bahamas"},{"value":"BH","text":"Bahrain"},{"value":"BD","text":"Bangladesh"},{"value":"BB","text":"Barbados"},{"value":"BY","text":"Belarus"},{"value":"BE","text":"Belgium"},{"value":"BZ","text":"Belize"},{"value":"BJ","text":"Benin"},{"value":"BM","text":"Bermuda"},{"value":"BT","text":"Bhutan"},{"value":"BO","text":"Bolivia"},{"value":"BQ","text":"Bonaire, Saint Eustatius and Saba"},{"value":"BA","text":"Bosnia and Herzegovina"},{"value":"BW","text":"Botswana"},{"value":"BV","text":"Bouvet Island"},{"value":"BR","text":"Brazil"},{"value":"IO","text":"British Indian Ocean Territory"},{"value":"BN","text":"Brunei Darussalam"},{"value":"BG","text":"Bulgaria"},{"value":"BF","text":"Burkina Faso"},{"value":"BI","text":"Burundi"},{"value":"KH","text":"Cambodia"},{"value":"CM","text":"Cameroon"},{"value":"CA","text":"Canada"},{"value":"IC","text":"Canary Islands"},{"value":"CV","text":"Cape Verde"},{"value":"KY","text":"Cayman Islands"},{"value":"CF","text":"Central African Republic"},{"value":"EA","text":"Ceuta and Melilla"},{"value":"TD","text":"Chad"},{"value":"CL","text":"Chile"},{"value":"CN","text":"China"},{"value":"CX","text":"Christmas Island"},{"value":"CC","text":"Cocos (Keeling) Islands"},{"value":"CO","text":"Colombia"},{"value":"KM","text":"Comoros"},{"value":"CD","text":"Congo, Democratic Republic of"},{"value":"CG","text":"Congo, Republic of"},{"value":"CK","text":"Cook Islands"},{"value":"CR","text":"Costa Rica"},{"value":"CI","text":"Cote d'Ivoire"},{"value":"HR","text":"Croatia/Hrvatska"},{"value":"CU","text":"Cuba"},{"value":"CW","text":"CuraÃ§ao"},{"value":"CY","text":"Cyprus"},{"value":"CZ","text":"Czech Republic"},{"value":"DK","text":"Denmark"},{"value":"DJ","text":"Djibouti"},{"value":"DM","text":"Dominica"},{"value":"DO","text":"Dominican Republic"},{"value":"TL","text":"East Timor"},{"value":"EC","text":"Ecuador"},{"value":"EG","text":"Egypt"},{"value":"SV","text":"El Salvador"},{"value":"GQ","text":"Equatorial Guinea"},{"value":"ER","text":"Eritrea"},{"value":"EE","text":"Estonia"},{"value":"ET","text":"Ethiopia"},{"value":"FK","text":"Falkland Islands"},{"value":"FO","text":"Faroe Islands"},{"value":"FJ","text":"Fiji"},{"value":"FI","text":"Finland"},{"value":"FR","text":"France"},{"value":"GF","text":"French Guiana"},{"value":"PF","text":"French Polynesia"},{"value":"TF","text":"French Southern Territories"},{"value":"GA","text":"Gabon"},{"value":"GM","text":"Gambia"},{"value":"GE","text":"Georgia"},{"value":"DE","text":"Germany"},{"value":"GH","text":"Ghana"},{"value":"GI","text":"Gibraltar"},{"value":"GR","text":"Greece"},{"value":"GL","text":"Greenland"},{"value":"GD","text":"Grenada"},{"value":"GP","text":"Guadeloupe"},{"value":"GU","text":"Guam"},{"value":"GT","text":"Guatemala"},{"value":"GG","text":"Guernsey"},{"value":"GN","text":"Guinea"},{"value":"GW","text":"Guinea-Bissau"},{"value":"GY","text":"Guyana"},{"value":"HT","text":"Haiti"},{"value":"HM","text":"Heard and McDonald Islands"},{"value":"VA","text":"Holy See (City Vatican State)"},{"value":"HN","text":"Honduras"},{"value":"HK","text":"Hong Kong"},{"value":"HU","text":"Hungary"},{"value":"IS","text":"Iceland"},{"value":"IN","text":"India"},{"value":"ID","text":"Indonesia"},{"value":"IR","text":"Iran (Islamic Republic of)"},{"value":"IQ","text":"Iraq"},{"value":"IE","text":"Ireland"},{"value":"IM","text":"Isle of Man"},{"value":"IL","text":"Israel"},{"value":"IT","text":"Italy"},{"value":"JM","text":"Jamaica"},{"value":"JP","text":"Japan"},{"value":"JE","text":"Jersey"},{"value":"JO","text":"Jordan"},{"value":"KZ","text":"Kazakhstan"},{"value":"KE","text":"Kenya"},{"value":"KI","text":"Kiribati"},{"value":"KP","text":"Korea, Democratic People's Republic"},{"value":"KR","text":"Korea, Republic of"},{"value":"XK","text":"Kosovo"},{"value":"KW","text":"Kuwait"},{"value":"KG","text":"Kyrgyzstan"},{"value":"LA","text":"Lao People's Democratic Republic"},{"value":"LV","text":"Latvia"},{"value":"LB","text":"Lebanon"},{"value":"LS","text":"Lesotho"},{"value":"LR","text":"Liberia"},{"value":"LY","text":"Libya"},{"value":"LI","text":"Liechtenstein"},{"value":"LT","text":"Lithuania"},{"value":"LU","text":"Luxembourg"},{"value":"MO","text":"Macau"},{"value":"MK","text":"Macedonia"},{"value":"MG","text":"Madagascar"},{"value":"MW","text":"Malawi"},{"value":"MY","text":"Malaysia"},{"value":"MV","text":"Maldives"},{"value":"ML","text":"Mali"},{"value":"MT","text":"Malta"},{"value":"MH","text":"Marshall Islands"},{"value":"MQ","text":"Martinique"},{"value":"MR","text":"Mauritania"},{"value":"MU","text":"Mauritius"},{"value":"YT","text":"Mayotte"},{"value":"MX","text":"Mexico"},{"value":"FM","text":"Micronesia, Federal State of"},{"value":"MD","text":"Moldova, Republic of"},{"value":"MC","text":"Monaco"},{"value":"MN","text":"Mongolia"},{"value":"ME","text":"Montenegro"},{"value":"MS","text":"Montserrat"},{"value":"MA","text":"Morocco"},{"value":"MZ","text":"Mozambique"},{"value":"MM","text":"Myanmar (Burma)"},{"value":"NA","text":"Namibia"},{"value":"NR","text":"Nauru"},{"value":"NP","text":"Nepal"},{"value":"NL","text":"Netherlands"},{"value":"AN","text":"Netherlands Antilles (Deprecated)"},{"value":"NC","text":"New Caledonia"},{"value":"NZ","text":"New Zealand"},{"value":"NI","text":"Nicaragua"},{"value":"NE","text":"Niger"},{"value":"NG","text":"Nigeria"},{"value":"NU","text":"Niue"},{"value":"NF","text":"Norfolk Island"},{"value":"MP","text":"Northern Mariana Islands"},{"value":"NO","text":"Norway"},{"value":"OM","text":"Oman"},{"value":"PK","text":"Pakistan"},{"value":"PW","text":"Palau"},{"value":"PS","text":"Palestinian Territories"},{"value":"PA","text":"Panama"},{"value":"PG","text":"Papua New Guinea"},{"value":"PY","text":"Paraguay"},{"value":"PE","text":"Peru"},{"value":"PH","text":"Philippines"},{"value":"PN","text":"Pitcairn Island"},{"value":"PL","text":"Poland"},{"value":"PT","text":"Portugal"},{"value":"PR","text":"Puerto Rico"},{"value":"QA","text":"Qatar"},{"value":"RE","text":"Reunion Island"},{"value":"RO","text":"Romania"},{"value":"RU","text":"Russian Federation"},{"value":"RW","text":"Rwanda"},{"value":"BL","text":"Saint BarthÃ©lemy"},{"value":"SH","text":"Saint Helena"},{"value":"KN","text":"Saint Kitts and Nevis"},{"value":"LC","text":"Saint Lucia"},{"value":"MF","text":"Saint Martin"},{"value":"VC","text":"Saint Vincent and the Grenadines"},{"value":"WS","text":"Samoa"},{"value":"SM","text":"San Marino"},{"value":"ST","text":"Sao Tome and Principe"},{"value":"SA","text":"Saudi Arabia"},{"value":"SN","text":"Senegal"},{"value":"RS","text":"Serbia"},{"value":"CS","text":"Serbia and Montenegro (Deprecated)"},{"value":"SC","text":"Seychelles"},{"value":"SL","text":"Sierra Leone"},{"value":"SG","text":"Singapore"},{"value":"SX","text":"Sint Maarten"},{"value":"SK","text":"Slovak Republic"},{"value":"SI","text":"Slovenia"},{"value":"SB","text":"Solomon Islands"},{"value":"SO","text":"Somalia"},{"value":"ZA","text":"South Africa"},{"value":"GS","text":"South Georgia"},{"value":"SS","text":"South Sudan"},{"value":"ES","text":"Spain"},{"value":"LK","text":"Sri Lanka"},{"value":"PM","text":"St. Pierre and Miquelon"},{"value":"SD","text":"Sudan"},{"value":"SR","text":"Suriname"},{"value":"SJ","text":"Svalbard and Jan Mayen Islands"},{"value":"SZ","text":"Swaziland"},{"value":"SE","text":"Sweden"},{"value":"CH","text":"Switzerland"},{"value":"SY","text":"Syrian Arab Republic"},{"value":"TW","text":"Taiwan"},{"value":"TJ","text":"Tajikistan"},{"value":"TZ","text":"Tanzania"},{"value":"TH","text":"Thailand"},{"value":"TG","text":"Togo"},{"value":"TK","text":"Tokelau"},{"value":"TO","text":"Tonga"},{"value":"TT","text":"Trinidad and Tobago"},{"value":"TN","text":"Tunisia"},{"value":"TR","text":"Turkey"},{"value":"TM","text":"Turkmenistan"},{"value":"TC","text":"Turks and Caicos Islands"},{"value":"TV","text":"Tuvalu"},{"value":"UG","text":"Uganda"},{"value":"UA","text":"Ukraine"},{"value":"AE","text":"United Arab Emirates"},{"value":"GB","text":"United Kingdom (GB)"},{"value":"US","text":"United States"},{"value":"UY","text":"Uruguay"},{"value":"UM","text":"US Minor Outlying Islands"},{"value":"UZ","text":"Uzbekistan"},{"value":"VU","text":"Vanuatu"},{"value":"VE","text":"Venezuela"},{"value":"VN","text":"Vietnam"},{"value":"VG","text":"Virgin Islands (British)"},{"value":"VI","text":"Virgin Islands (USA)"},{"value":"WF","text":"Wallis and Futuna"},{"value":"EH","text":"Western Sahara"},{"value":"YE","text":"Yemen"},{"value":"ZM","text":"Zambia"},{"value":"ZW","text":"Zimbabwe"}]
    const USSTATES = [{"value":"","text":""},{"value":"AL","text":"Alabama"},{"value":"AK","text":"Alaska"},{"value":"AZ","text":"Arizona"},{"value":"AR","text":"Arkansas"},{"value":"AA","text":"Armed Forces Americas"},{"value":"AE","text":"Armed Forces Europe"},{"value":"AP","text":"Armed Forces Pacific"},{"value":"CA","text":"California"},{"value":"CO","text":"Colorado"},{"value":"CT","text":"Connecticut"},{"value":"DE","text":"Delaware"},{"value":"DC","text":"District of Columbia"},{"value":"FL","text":"Florida"},{"value":"GA","text":"Georgia"},{"value":"HI","text":"Hawaii"},{"value":"ID","text":"Idaho"},{"value":"IL","text":"Illinois"},{"value":"IN","text":"Indiana"},{"value":"IA","text":"Iowa"},{"value":"KS","text":"Kansas"},{"value":"KY","text":"Kentucky"},{"value":"LA","text":"Louisiana"},{"value":"ME","text":"Maine"},{"value":"MD","text":"Maryland"},{"value":"MA","text":"Massachusetts"},{"value":"MI","text":"Michigan"},{"value":"MN","text":"Minnesota"},{"value":"MS","text":"Mississippi"},{"value":"MO","text":"Missouri"},{"value":"MT","text":"Montana"},{"value":"NE","text":"Nebraska"},{"value":"NV","text":"Nevada"},{"value":"NH","text":"New Hampshire"},{"value":"NJ","text":"New Jersey"},{"value":"NM","text":"New Mexico"},{"value":"NY","text":"New York"},{"value":"NC","text":"North Carolina"},{"value":"ND","text":"North Dakota"},{"value":"OH","text":"Ohio"},{"value":"OK","text":"Oklahoma"},{"value":"OR","text":"Oregon"},{"value":"PA","text":"Pennsylvania"},{"value":"PR","text":"Puerto Rico"},{"value":"RI","text":"Rhode Island"},{"value":"SC","text":"South Carolina"},{"value":"SD","text":"South Dakota"},{"value":"TN","text":"Tennessee"},{"value":"TX","text":"Texas"},{"value":"UT","text":"Utah"},{"value":"VT","text":"Vermont"},{"value":"VA","text":"Virginia"},{"value":"WA","text":"Washington"},{"value":"WV","text":"West Virginia"},{"value":"WI","text":"Wisconsin"},{"value":"WY","text":"Wyoming"}]
    const CASTATES = [{"value":"AB","text":"Alberta"},{"value":"BC","text":"British Columbia"},{"value":"MB","text":"Manitoba"},{"value":"NB","text":"New Brunswick"},{"value":"NL","text":"Newfoundland"},{"value":"NT","text":"Northwest Territories"},{"value":"NS","text":"Nova Scotia"},{"value":"NU","text":"Nunavut"},{"value":"ON","text":"Ontario"},{"value":"PE","text":"Prince Edward Island"},{"value":"QC","text":"Quebec"},{"value":"SK","text":"Saskatchewan"},{"value":"YT","text":"Yukon"}]
    const FORMSELECT = [{value:0, text:'Customer and Installer'}, {value:1, text:'Only Customer'}, {value:2, text:'Only Installer'}];
    const FORMS = {0 : 'formSelect', 1 : 'selectProceed', 2 : 'installer', 3 : 'rewards_questions', 4 : 'validate'};
    const SSCRIPT = {0: 'customscript_manual_warranty_ss', 1: 'customdeploy_manual_warranty_ss'};

    /**
     * Constants
     */
    const redirectURL = 'https://5429364.app.netsuite.com/app/center/card.nl?sc=-29&whence=';

    /**
     * Adds fields to form
     */
    function addFields(assistant, fields, container){
        try {
            container = (typeof container !== 'undefined') ? container : -1;
            var output = [];
            if (container === -1) {
                fields.forEach(function (field) {
                    output.push(assistant.addField(field));
                });
            }
            else{
                fields.forEach(function (field) {
                    field.container = container;
                    output.push(assistant.addField(field));
                });
            }
            return output;
        }
        catch(error){
            log.error({title: 'Critical error in addFields', details: error});
        }
    }

    /**
     * Renders Form 0
     * Selecting if doing just installer/customer or both
     */
    function renderFormZero(assistant){
        //add fields
        var fields = addFields(assistant, fieldLib.entry);

        //update fields
        fields[0].isMandatory = true;
        FORMSELECT.forEach(function (result) {
            fields[1].addSelectOption(result);
        });

        //Attach client script
        assistant.clientScriptModulePath = 'SuiteScripts/Warranty System/Warrant Form Zero CS.js';
    }

    /**
     * Renders Form 1
     * Selection between new and existing customer
     */
    function renderFormOne(assistant){
        //Field Groups
        var serialMachine = assistant.addFieldGroup({
           id: 'fieldgroup_serial_machine',
           label: 'Machine and Serial'
        });
        var oldCustomer = assistant.addFieldGroup({
           id: 'fieldgroup_old',
           label: 'Find an Existing Customer'
        });
        var customerInfo = assistant.addFieldGroup({
            id: 'fieldgroup_info',
            label: 'Enter Customer Information'
        });

        //Adding and updating fields for customerMachine field groupd
        var fields = addFields(assistant, fieldLib.customerMacine, 'fieldgroup_serial_machine');
        fields[0].updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        fields[1].updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        fields[2].updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        //Getting Serial Number
        var firstForm = assistant.getStep({id: FORMS["0"]});
        var serialNumber =  firstForm.getValue({id: fieldLib.customerFields.serialNumber.id});
        fields[1].defaultValue = serialNumber;

        //Adding and updating fields for old customer
        fields = addFields(assistant, fieldLib.oldCustomer, 'fieldgroup_old');
        fields.forEach(function (field) {
            field.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});
        });

        //Fields for customerInfo
        fields = addFields(assistant, fieldLib.customerInfo, 'fieldgroup_info');
        fields[4].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});
        COUNTRIES.forEach(function (pair) {
            fields[5].addSelectOption({value: pair.value, text: pair.text});
        });
        USSTATES.forEach(function (pair) {
            fields[9].addSelectOption({value: pair.value, text: pair.text});
        });
        CASTATES.forEach(function (pair) {
            fields[9].addSelectOption({value: pair.value, text: pair.text});
        });

        //Attach client script
        assistant.clientScriptModulePath = 'SuiteScripts/Warranty System/Warrant Form One CS.js';
    }

    /**
     * Render Form Two
     * Installer Information
     */
    function renderFormTwo(assistant){
        //Getting Serial Number
        var firstForm = assistant.getStep({id: FORMS["0"]});
        var serialNumber =  firstForm.getValue({id: fieldLib.customerFields.serialNumber.id});

        //collecting distributor info
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters:
                [
                    ["type","anyof","SalesOrd"],
                    "AND",
                    ["serialnumber","is", serialNumber]
                ],
            columns:
                [
                    search.createColumn({
                        name: "entity",
                        label: "Distributor"
                    }),
                    search.createColumn({
                        name: "city",
                        join: "shippingAddress",
                        label: " City"
                    })
                ]
        }).run().getRange({start: 0, end: 1});

        //Creating Field Groups
        var installerInformation = assistant.addFieldGroup({
            id: 'fieldgroup_installerinfo',
            label: 'Installer Information'
        });
        var installerFieldChecklist = assistant.addFieldGroup({
            id: 'fieldgroup_installer_check',
            label: 'Installer Field Checklist'
        });
        var vehicleInfo = assistant.addFieldGroup({
            id: 'fieldgroup_vehicle_info',
            label: 'Vehicle Info'
        });
        if(salesorderSearchObj.length > 1) {
            var equipmentInstall = assistant.addFieldGroup({
                id: 'fieldgroup_install_equip',
                label: 'Equipment Installation Certificate'
            });
        }

        //Fields for installerInformation
        var fields = addFields(assistant, fieldLib.installerInfo, 'fieldgroup_installerinfo');
        fields[1].defaultValue = salesorderSearchObj[0].getValue({name: 'city', join: 'shippingAddress'});
        fields[1].updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        fields[0].defaultValue = salesorderSearchObj[0].getValue({name: 'entity'});
        fields[2].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

        //Fields for installerFieldCheckList
        fields = addFields(assistant, fieldLib.installerCheck, 'fieldgroup_installer_check');
        fields[9].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

        //adding vehicle info
       fields = addFields(assistant, fieldLib.vehicleInfo, 'fieldgroup_vehicle_info');
       fields[4].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

        //Equipment Installation Certificate
        fields = addFields(assistant, fieldLib.certificates, 'fieldgroup_install_equip');
        fields[5].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

        //adding client script
        assistant.clientScriptModulePath = 'SuiteScripts/Warranty System/Warrant Form Two CS.js';
    }

    /**
     * Render Form Three
     * CLient Rewards and Question
     */
    function renderFormThree(assistant){
        //Setting Script Path
        assistant.clientScriptModulePath = 'SuiteScripts/Warranty System/Warrant Form Three CS.js';

        //Creating Field Groups
        var rewardsQuestions = assistant.addFieldGroup({
            id: 'fieldgroup_rewards_questions',
            label: 'Find an Existing Customer'
        });

        //Fields for rewardsQuestions
       var fields = addFields(assistant, fieldLib.rewards, 'fieldgroup_rewards_questions');
    }

    /**
     * Render Form Four
     * Page for user to validate all information
     */
    function renderFormFour(assistant){
        try {
            //Collecting previous steps
            var firstStep = assistant.getStep({id: FORMS['1']});
            var secondStep = assistant.getStep({id: FORMS['2']});
            var thridStep = assistant.getStep({id: FORMS['3']});

            //creating field groups
            assistant.addFieldGroup({id: 'fieldgroup_customer', label: 'Customer Overview'});
            assistant.addFieldGroup({id: 'fieldgroup_installer', label: 'Installer Overview'});
            assistant.addFieldGroup({id: 'fieldgroup_rewards', label: 'Rewards'});

            //Customer Overview Fields
            var fields = addFields(assistant, fieldLib.validateCust, 'fieldgroup_customer');
            fields.forEach(function(field){
                field.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                field.defaultValue = firstStep.getValue({id: field.id});
            });
            fields[4].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

            //Installer Overview Fields
            fields = addFields(assistant, fieldLib.validateInst, 'fieldgroup_installer');
            fields.forEach(function(field){
                field.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
                field.defaultValue = secondStep.getValue({id: field.id});
            });
            fields[1].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

            //Rewards Fields
            fields = addFields(assistant, fieldLib.validateReward, 'fieldgroup_rewards');
            fields.forEach(function(field){
               field.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
               field.defaultValue = thridStep.getValue({id: field.id});
            });
            fields[3].updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});
        }
        catch(error){
            log.error({title: 'Critical Error in renderFormFour', details: error});
        }
    }

    /**
     * Function that returns Json object of all fields and values for an assistant step object
     */
    function stepJSON(step){
        try {
            //Getting fields
            var fields = step.getFieldIds();
            var output = {};

            //Assigning key-value pairs to output
            fields.forEach(function (id) {
                output[id] = step.getValue({id: id});
            });

            //Return
            return output;
        }
        catch(error){
            log.error({title: 'Critical error in stepJSON', details: error});
        }
    }

    /**
     * Schedules Task for creating warranty and associated records/updates
     */
    function generateTask(assistant){
        try {
            //Creating return strings
            var stepZeroOutput = stepJSON(assistant.getStep({id: FORMS['0']}));
            var stepOneOutput = stepJSON(assistant.getStep({id: FORMS['1']}));
            var stepTwoOutput = stepJSON(assistant.getStep({id: FORMS['2']}));
            var stepThreeOutput = stepJSON(assistant.getStep({id: FORMS['3']}));

            //creating and scheduling task
            var taskObj = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: SSCRIPT['0'],
                deploymentId: SSCRIPT['1'],
                params: {
                    custscript_form_zero_params: stepZeroOutput,
                    custscript_form_one_params: stepOneOutput,
                    custscript_form_two_params: stepTwoOutput,
                    custscript_form_three_params: stepThreeOutput
                }
            }).submit();
        }
        catch(error){
            log.error({title: 'Critical error in generateTask', details: error});
        }
    }

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try{
            var assistant = serverWidget.createAssistant({
               title: 'Create A Warranty'
            });
            var formSelect = assistant.addStep({
                id: FORMS['0'],
                label: 'Choose What Forms to Enter'
            });
            var selectProceed = assistant.addStep({
               id: FORMS['1'],
               label: 'New or Existing Customer'
            });
            var installer = assistant.addStep({
                id: FORMS['2'],
                label: 'Installer Information'
            });
            var rewards = assistant.addStep({
                id: FORMS['3'],
                label: 'Questionnaire and Rewards'
            });
            var validate = assistant.addStep({
                id: FORMS['4'],
                label: 'Validate'
            });

            if(context.request.method == 'GET'){
                if(!assistant.isFinished()){
                    renderFormZero(assistant);
                    assistant.currentStep = formSelect;
                    context.response.writePage({pageObject: assistant});
                }
            }
            else{
                var lastAction = assistant.getLastAction();
                if(lastAction == 'next' || lastAction == 'back'){
                    var nextStepNumber = assistant.getNextStep().stepNumber;
                    var forms = assistant.getStep({id: 'formSelect'}).getValue({id: fieldLib.entrySelect.formSelect.id});

                    switch (nextStepNumber) {
                        case 1: renderFormZero(assistant); assistant.currentStep = formSelect; break;
                        case 2:
                            if(forms == 2 && lastAction == 'next'){renderFormTwo(assistant); assistant.currentStep = installer;}
                            else if(forms == 2 && lastAction == 'back'){renderFormZero(assistant); assistant.currentStep = formSelect;}
                            else{renderFormOne(assistant); assistant.currentStep = selectProceed;}
                            break;
                        case 3:
                            if(forms == 1 && lastAction == 'next'){renderFormThree(assistant); assistant.currentStep = rewards;}
                            else if(forms == 1 && lastAction == 'back'){renderFormOne(assistant); assistant.currentStep = selectProceed;}
                            else{renderFormTwo(assistant); assistant.currentStep = installer;}
                            break;
                        case 4:
                            if(forms == 2 && lastAction == 'next'){renderFormFour(assistant); assistant.currentStep = validate;}
                            else if(forms == 2 && lastAction == 'back'){renderFormTwo(assistant); assistant.currentStep = installer;}
                            else{renderFormThree(assistant); assistant.currentStep = rewards;}
                            break;
                        case 5: renderFormFour(assistant); assistant.currentStep = validate; break;
                        default: renderFormZero(assistant); assistant.currentStep = formSelect;
                    }
                    context.response.writePage(assistant);
                }
                if(lastAction == serverWidget.AssistantSubmitAction.FINISH){
                    generateTask(assistant);
                    assistant.finishedHtml = 'FINISHED';
                    context.response.writePage({pageObject: assistant});
                    assistant.isFinished = true;
                }
                if(lastAction == serverWidget.AssistantSubmitAction.CANCEL){
                    redirect.redirect({
                        url: redirectURL
                    });
                }
            }
        }
        catch(error){
            log.error({title: 'Critical Error in onRequest', details: error});
        }
    }

    return {
        onRequest: onRequest
    };
    
});

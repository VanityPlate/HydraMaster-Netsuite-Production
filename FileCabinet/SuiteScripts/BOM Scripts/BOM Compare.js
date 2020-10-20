/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/file', 'N/search', 'N/record', 'N/email'],
/**
 * @param{runtime} runtime
 */
function(runtime, serverWidget, file, search, record, email) {

    /**
     * Global enum object holding the possible records that can be compared
     * and Global integer holding the amount of current comparable records
     */
    const RECORDS = {
        0: search.Type.SERIALIZED_ASSEMBLY_ITEM,
        2: search.Type.ASSEMBLY_ITEM,
        3: search.Type.SERIALIZED_INVENTORY_ITEM,
        4: search.Type.INVENTORY_ITEM
    };

    const RECORD_NUMBER = 4;


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

            if(context.request.method === 'GET') {
                context.response.writePage({
                    pageObject: renderForm()
                });
            }
            else{
                //Validating Data
                var bom1 = getInternal(context.request.parameters.custpage_bom_one);
                var bom2 = getInternal(context.request.parameters.custpage_bom_two);
                var records = validation(bom1, bom2);
                if(records){
                  //Letting user know they were successful and their results will be emailed to them
                  var response = "SUCCESS! Your results will be emailed to you." ;
                  context.response.write({output: response});

                  //Executing compare logic post successful validation
                  var mail = compareRecords(records.bom1, records.bom2, context.request.parameters.custpage_bom_one, context.request.parameters.custpage_bom_two);

                  //Emailing the file post record compare
                  sendMail(mail);
                }
                else{
                    var response = "Error! The values you entered are incorrect\n"
                        + "Use the external id of the records you wish to compare.";
                    context.response.write({output: response});
                }
            }
        }
        catch(error){
            log.error({title: "Critical Error Page Rendering", details: error})
        }
    }

    //Helper function to convert external ids to internal ids for assemblies
    //returns the internal id of the record based on its external id
    function getInternal(external){
        var find = search.create({
            type: search.Type.ITEM,
            filters: ['externalid', 'anyof', external]
        });

        var result = find.run().getRange({start: 0, end: 10});

        if(result.length == 0)
            return null;
        else
            return result[0].id;
    }

    //Helper Function for comparing the two records
    //returns a completed csv file
    function compareRecords(bom1, bom2, bom1Name, bom2Name){
        //Arrays for holding results from compare to be converted into csv file.
        var bom1UniComp = [];
        var bom2UniComp = [];
        //Array for holding if components have already been compared
        //Used when iterating over second bom
        var alreadyCompared = [];

        //Iterating through bom1
        var subLength = bom1.getLineCount({sublistId: 'member'});

        for(var x = 0; x < subLength; x++){
            //Assigning values for compare
            bom1.selectLine({sublistId: 'member', line: x});
            var member = bom1.getCurrentSublistValue({sublistId: 'member', fieldId: 'item'});
            var bom1Amount = bom1.getCurrentSublistValue({sublistId: 'member', fieldId: 'quantity'});
            var memberDes = bom1.getCurrentSublistValue({sublistId: 'member', fieldId: 'memberdescr'});
            var memberName = bom1.getCurrentSublistValue({sublistId: 'member', fieldId: 'item_display'});

            //Adding id list of already searched objects
            alreadyCompared.push(parseInt(member));

            //Determine if second bom has the same member
            var secondMember = bom2.findSublistLineWithValue({
               sublistId: 'member',
               fieldId: 'item',
               value: member
            });

            //if second bom has second member call split and let it handle array allocation
            if(secondMember != - 1){
                bom2.selectLine({sublistId: 'member', line: secondMember});
                var bom2Amount = bom2.getCurrentSublistValue({sublistId: 'member', fieldId: 'quantity'});
                add(member, bom1Amount, bom1UniComp, memberName, memberDes);
                add(member, bom2Amount, bom2UniComp, memberName, memberDes);
            }

            //if second bom does not have contain same member simply add to bom1UniComp
            else{
                add(member, bom1Amount, bom1UniComp, memberName, memberDes);
                add("", "", bom2UniComp, "", "");
            }
        }

        //Iterating through bom2
        subLength = bom2.getLineCount({sublistId: 'member'});
        for(var x = 0; x < subLength; x++){
            //Gathering values
            bom2.selectLine({sublistId: 'member', line: x});
            var member = bom2.getCurrentSublistValue({sublistId: 'member', fieldId: 'item'});

            //Checking if this member has been accounted for
            //If not accounted for add the member to correct array
            if(!includes(alreadyCompared, parseInt(member))){
                var bom2Amount = bom2.getCurrentSublistValue({sublistId: 'member', fieldId: 'quantity'});
                var memberDes = bom2.getCurrentSublistValue({sublistId: 'member', fieldId: 'memberdescr'});
                var memberName = bom2.getCurrentSublistValue({sublistId: 'member', fieldId: 'item_display'});
                add(member, bom2Amount, bom2UniComp, memberName, memberDes);
                add("", "", bom1UniComp, "", "");
            }
        }

        var bom1Desc = bom1.getValue({fieldId: 'description'});
        var bom2Desc = bom2.getValue({fieldId: 'description'});
        //Creating and returning the csv
        return makeCSV( bom1UniComp, bom2UniComp, bom1Name, bom2Name, bom1Desc, bom2Desc);
    }

    //Helper function for creating the csv file
    function makeCSV( bom1UniComp, bom2UniComp, bom1Name, bom2Name, bom1Desc, bom2Desc){

        var csvOut = file.create({
            name: 'BOMCompare.csv',
            fileType: 'CSV'
        });

        var regExp = /,/gi;

        //Creating Header info
        csvOut.appendLine({
            value: 'COMPONENT NAME,' + bom1Name + ',,' + bom1Desc.replace(regExp, "_") + ',COMPONENT NAME,' + bom2Name + ',,' + bom2Desc.replace(regExp, "_")});
        csvOut.appendLine({value: 'ID,Quantity,Name,Description,ID,Quantity,Name,Description'});

        //Building the data of the csv and adding it to file
        var x = 0;
        while(true){
            var line = "";
            if(x < bom1UniComp.length)
                line = line.concat(bom1UniComp[x].id + ',' + bom1UniComp[x].amount + ',' + bom1UniComp[x].name + ',' + bom1UniComp[x].description.replace(regExp, "_") + ',');
            else
                line = line.concat(",,,,")
            if(x < bom2UniComp.length)
                line = line.concat(bom2UniComp[x].id + ',' + bom2UniComp[x].amount + ',' + bom2UniComp[x].name + ',' + bom2UniComp[x].description.replace(regExp, "_"));
            else
                line = line.concat(",")
            if(line == ",,,,,")
                break;
            else{
                x++;
                csvOut.appendLine({value: line});
            }
        }

        return csvOut;
    }

    //Helper function to mimic array.prototype.includes
    //which appears to be absent in Netsuite
    function includes(list, value){
        var output = false;
        list.forEach(function(check){
           if(check == value)
               output = true;
        });
        return output;
    }


    //Helper function for adding new objects into correct array for
    //later appending to csv file
    function add(id, amount, list, memberName, memberDes){
        list.push(new Line(id, amount, memberName, memberDes));
    }


    //Constructor for objects to place into arrays
    function Line(id, amount, memberName, memberDes){
        this.id = id;
        this.amount = amount;
        this.name = memberName;
        this.description = memberDes;
    }

    //Helper Function for emailing completed csv file the current user
    function sendMail(mail){
        //boxing mail to attach
        var attachments = [mail];

        //Sending email to current user with csv attached
        email.send({
            author: runtime.getCurrentUser().id,
            recipients: runtime.getCurrentUser().id,
            subject: 'BOM Compare',
            body: 'Attached is a csv with the BOM compare information.',
            attachments: attachments
        });
    }

    //Helper Function for Validating the input from the user.
    //Alerts the user if they have entered incorrect values
    //returns null if failed and an object containing to loaded records if successful
    function validation(bom1, bom2){

        if(bom1 == null || bom2 == null)
            return null;

        var failed = false;
        var output = {bom1: "", bom2: ""};

        output.bom1 = recursiveLoad(bom1, 0);
        output.bom2 = recursiveLoad(bom2, 0);

        if(output.bom1 == null || output.bom2 == null){
            return null;
        }
        else{
            return output;
        }
    }

    //Recursive Function for loading a record with an unknown type
    function recursiveLoad(id, attempt){
        try{
            var output = record.load({
                type: RECORDS[attempt],
                id: id,
                isDynamic: true
            });
            return output;
        }
        catch(error){
            if(attempt == RECORD_NUMBER)
                return null;
            else return recursiveLoad(id, attempt + 1)
        }
    }


    //Helper Function for rendering the form
    function renderForm(){
        var form = serverWidget.createForm({title: 'BOM Compare'});

        //Button to compare the BOMs in the page fields
        var compareBOMs = form.addSubmitButton({
            label: 'Compare'
        });

        //Fields for entering the BOMs to compare
        var bomOne = form.addField({
            id: 'custpage_bom_one',
            type: serverWidget.FieldType.TEXT,
            label: 'BOMI'
        });
        var bomTwo = form.addField({
            id: 'custpage_bom_two',
            type: serverWidget.FieldType.TEXT,
            label: 'BOMII'
        });

        return form;
    }


    return {
        onRequest: onRequest
    };
    
});

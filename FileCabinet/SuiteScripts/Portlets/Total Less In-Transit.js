/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N/record'],

function(record) {

    /**
     * Constants
     * @URL - the relative path to HM A/P Aging Detail
     * @URLPARMAS - the parameters portion of the url path less the vendor id
     */
    const URL = '/app/reporting/reportrunner.nl?cr=454';
    const URLPARMAS = '&critSpec5=vend%2Cvendor%2Cnkey%2Cx%2Cx%2CIN&fieldVals5=';

    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) {
        try {
            var portlet = params.portlet;
            var entity = record.load({
               type: record.Type.VENDOR,
               id: params.entity,
               isDynamic: false
            });

            var balance = entity.getValue({fieldId: 'balanceprimary'});
            var inTransit = entity.getValue({fieldId: 'intransitbalance'});
            var adjusted = (balance - inTransit).toFixed(2);

            //Creating the url
            var vendorID = params.entity.toString();
            var completeURL = URL + URLPARMAS + vendorID;

            //Refactor Testing
            log.audit({title: 'Complete Url', details: completeURL});


            var content = '<td><span><b><p style="text-align: left;">$' + adjusted + '</p></b></span></td>' +
            '<td><span><p><p style="text-align: left"><a href=' + completeURL + '>HM A/P Aging Detail</a></p></b></span></td>';
            portlet.title = 'Total Due Less In-Transit';
            portlet.html = content;
        }
        catch(error){
            log.error({title: 'Critical Error in render', details: error});
        }
    }

    return {
        render: render
    };
    
});

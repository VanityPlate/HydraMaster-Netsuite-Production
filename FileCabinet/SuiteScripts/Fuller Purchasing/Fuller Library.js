/**
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 */

define([],

function() {

    /**
     * Bill to Address
     */
    var billTo = 'Fuller Plastics, LLC\nOne Fuller Way\nGreat Bend KS 67530\nUnited States';

    /**
     * Enum holding relation between PO and SO ship method.
     */
    const POSO = {
        4:     {carrier: 'ups', method: 23313},
        23870: {carrier: 'nonups', method: 23312},
        20224: {carrier: 'nonups', method: 23312}
    };

    /**
     * Enum Containing Environment Specific Values For Scheduled Script
     */
    const ENVIRONMENT = {
        customer    :   20782,
        contact     :   23452,
        addressHMK  :   17022,
        addressHMM  :   17023,
        shipPay     :   3,
        subsidiary  :   3
    };

    /**
     * Enum Containing Environment Specific Values For Client Script
     */
    const ENVIRONMENT_CS = {
        vendor      :   20807,
        shipto      :   20782,
        16          :   17023,
        8           :   17022
    };

    return {
        poso: POSO,
        environment: ENVIRONMENT,
        environment_cs: ENVIRONMENT_CS,
        billTo: billTo
    };
    
});

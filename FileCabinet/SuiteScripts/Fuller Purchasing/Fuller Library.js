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
        20224: {carrier: 'nonups', method: 23312},
        23869: {carrier: 'nonups', method: 24398},
        21001: {carrier: 'nonups', method: 24399},
        21137: {carrier: 'nonups', method: 24400},
        20218: {carrier: 'nonups', method: 24401},
        20277: {carrier: 'nonups', method: 24402},
        21120: {carrier: 'nonups', method: 24403},
        21121: {carrier: 'nonups', method: 24404},
        21118: {carrier: 'nonups', method: 24405},
        21116: {carrier: 'nonups', method: 24406},
        20294: {carrier: 'nonups', method: 24408},
        20223: {carrier: 'nonups', method: 24409},
        20293: {carrier: 'nonups', method: 24410},
        21115: {carrier: 'nonups', method: 24411},
        20292: {carrier: 'nonups', method: 24412},
        21114: {carrier: 'nonups', method: 24413},
        21117: {carrier: 'nonups', method: 24414},
        20285: {carrier: 'nonups', method: 24415},
        21129: {carrier: 'nonups', method: 24417},
        21130: {carrier: 'nonups', method: 24418},
        20288: {carrier: 'nonups', method: 24419},
        21128: {carrier: 'nonups', method: 24420},
        21127: {carrier: 'nonups', method: 24421},
        21126: {carrier: 'nonups', method: 24422},
        21124: {carrier: 'nonups', method: 24423},
        21136: {carrier: 'nonups', method: 24424},
        21125: {carrier: 'nonups', method: 24425},
        21122: {carrier: 'nonups', method: 24426},
        21123: {carrier: 'nonups', method: 24427},
        20291: {carrier: 'nonups', method: 24428},
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

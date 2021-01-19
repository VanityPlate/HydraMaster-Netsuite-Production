/**
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 */

define([],

function() {

    /**
     * Enum holding relation between PO and SO ship method.
     */
    const POSO = {
        4:      {carrier: 'ups', method: 23313},
        23870: {carrier: 'nonups', method: 23312}
    };

    return {
        poso: POSO
    };
    
});

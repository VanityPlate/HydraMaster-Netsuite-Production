/**
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * Field Library for Count KPI
 */

define([],

function() {

    const tolerance = {
        countTolerance: 5,
        valueTolerance: 100
    };

    const fields = {
        url:                'custpage_url',
        item:               'custpage_item',
        units:              'custpage_units',
        snapQuantity:       'custpage_snap_quantity',
        snapDetail:         'custpage_snap_detail',
        countQuantity:      'custpage_count_quantity',
        countDetail:        'custpage_count_detail',
        adjustedQuantity:   'custpage_adjusted_quantity',
        varianceDetail:     'custpage_variance_detail',
        rateSTDCost:        'custpage_rate_cost',
        percentDiff:        'custpage_percent_diff',
        investigateCount:   'custpage_investigate_count',
        adjustedValue:      'custpage_adjusted_value',
        investigateValue:   'custpage_investigate_value',
        invRecordAccuracy:  'custpage_inv_accuracy',
        financialImpact:    'custpage_financial_impact'
    };

    return {
        tolerance: tolerance,
        fields: fields
    };
    
});

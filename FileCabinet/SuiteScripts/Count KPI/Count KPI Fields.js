/**
 * @copyright Alex S. Ducken 2020 HydraMaster LLC
 *
 * Field Library for Count KPI
 */

define([],

function() {

    const tolerance = {
        countTolerance: .05,
        valueTolerance: 100
    };

    const fields = {
        url:                'custpage_url',
        item:               'custpage_item',
        snapQuantity:       'custpage_snap_quantity',
        countQuantity:      'custpage_count_quantity',
        adjustedQuantity:   'custpage_adjusted_quantity',
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

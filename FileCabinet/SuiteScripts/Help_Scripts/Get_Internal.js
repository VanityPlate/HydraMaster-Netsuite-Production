define(['N/search'],
/**
 * @param{search} search
 */
function(search) {

    function item(external){
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

    return {
        item: item
    };
    
});

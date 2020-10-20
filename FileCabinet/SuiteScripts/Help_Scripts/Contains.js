define([],

function() {

    function includes(collection, compare){
        for(var i = 0; i < collection.length; i++){
            if(collection[i] == compare)
                return i;
        }
        return -1;
    }

    return {
    includes: includes
    };
    
});

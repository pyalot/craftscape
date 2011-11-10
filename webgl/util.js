/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

var extend = function(a, b){
    var result = {};
    for(var name in a){
        result[name] = a[name];
    }
    for(var name in b){
        result[name] = b[name];
    }
    return result;
};

var Class = function(obj){
    var constructor = obj.__init__ || function(){};

    if(obj.__extends__){
        var base = obj.__extends__.prototype;
    }
    else{
        var base = {};
    }

    constructor.prototype = extend(base, obj);
    return constructor;
};

    
var clamp = function(value, left, right){
    return value < left ? left : (value > right ? right : value);
};

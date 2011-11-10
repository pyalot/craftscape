/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Scheduler = function(onrun){
    var request = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    if(!request){
        request = function(callback){
            setTimeout(callback, 1000/30);
        };
    }
    var last;

    var step = function(){
        request(step);
        var current = Date.now();
        var delta = current-last;
        delta = Math.max(1, Math.min(delta, 500));
        last = current;
        onrun(delta/1000, current/1000);
    }

    this.start = function(){
        last = Date.now();
        request(step);
    }
};

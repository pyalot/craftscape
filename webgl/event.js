/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

var EventManager = Class({
    __init__: function(){
        this.listener_ids = 0;
        this.listeners = {};
    },
    dispatch: function(name){
        var args = [null];
        for(var i=1; i<arguments.length; i++){
            args.push(arguments[i]);
        }
        var listeners = this.listeners;
        for(id in listeners){
            var listener = listeners[id];
            var match = listener.match(name);
            if(match){
                args[0] = match;
                listener.callback.apply(listener.obj, args);
            }
        }
        return this;
    },
    on: function(match, obj, callback){
        this.bind(match, obj, callback);
        return this;
    },
    bind: function(match, obj, callback){
        if(!callback){
            var callback = obj;
            var obj = null;
        }
        if(typeof(match) == 'string'){
            var matcher = function(name){
                if(name == match){
                    return name;
                }
            }
        }
        else{
            var matcher = function(name){
                return name.match(match);
            }
        }
        var id = this.listener_ids++;
        this.listeners[id] = {
            id: id,
            match: matcher,
            callback: callback,
            obj: obj,
        }
        return id;
    },
    unbind: function(id){
        delete this.listeners[id];
        return this;
    }
});

var EventStack = Class({
    __init__: function(){
        this.stack = [];
        this.push();
    },
    push: function(){
        this.top = new EventManager();
        this.stack.push(this.top);
        return this;
    },
    pop: function(){
        var stack = this.stack;
        var length = stack.length;
        if(length > 1){
            stack.pop();
            this.top = stack[stack.length-1];
        }
        else{
            throw 'EventStack Error: stack has length 1';
        }
        return this;
    },
    on: function(match, obj, callback){
        var stack = this.stack;
        var length = stack.length;

        var manager = stack[length-1];
        manager.on(match, obj, callback);
        return this;
    },
    dispatch: function(){
        var stack = this.stack;
        var length = stack.length;

        for(var i=0; i<length; i++){
            var manager = stack[i];
            manager.dispatch.apply(manager, arguments);
        }
        return this;
    },
});

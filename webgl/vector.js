/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
(function(){
    var fmt = function(value){
        var str = value.toFixed(4);
        while(str.length < 7){
            str = ' ' + str;
        }
        return str;
    }

    Vec2 = Class({
        type: 'Vec2',
        __init__: function(x, y){
            this.x = x === undefined ? 0 : x;
            this.y = y === undefined ? 0 : y;
        },
    });

    Vec3 = function(x, y, z){
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    };

    Vec3.prototype = {
        type: 'Vec3',
        normalize: function(){
            var length = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
            if(length != 0){
                this.x /= length;
                this.y /= length;
                this.z /= length;
            }
            return this;
        },
        length: function(){
            var x=this.x, y=this.y, z=this.y;
            return Math.sqrt(x*x + y*y + z*z);
        },
        log: function(message){
            if(!message){
                var message = 'Vec3';
            }
            console.log('%s: %s %s %s', message, fmt(this.x), fmt(this.y), fmt(this.z));
            return this;
        },
        mul: function(value){
            if(value.type == 'Vec3'){
                this.x *= value.x;
                this.y *= value.y;
                this.z *= value.z;
            }
            else if(value.type == 'Mat3'){
                this.set(
                    value.data[0]*this.x + value.data[1]*this.y + value.data[2]*this.z,
                    value.data[3]*this.x + value.data[4]*this.y + value.data[5]*this.z,
                    value.data[6]*this.x + value.data[7]*this.y + value.data[8]*this.z
                )
            }
            else{
                this.x *= value;
                this.y *= value;
                this.z *= value;
            }
            return this;
        },
        cross: function(other){
            var x1=this.x, y1=this.y, z1=this.z;
            var x2=other.x, y2=other.y, z2=other.z;
            return this.set(
                y1*z2 - y2*z1,
                z1*x2 - z2*x1,
                x1*y2 - x2*y1
            );
        },
        sub: function(value){
            if(value.type == 'Vec3'){
                this.x -= value.x;
                this.y -= value.y;
                this.z -= value.z;
            }
            else{
                this.x -= value;
                this.y -= value;
                this.z -= value;
            }
            return this;
        },
        add: function(value){
            if(value.type == 'Vec3'){
                this.x += value.x;
                this.y += value.y;
                this.z += value.z;
            }
            else{
                this.x += value;
                this.y += value;
                this.z += value;
            }
            return this;
        },
        update: function(other){
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            return this;
        },
        set: function(x, y, z){
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
    };
})();

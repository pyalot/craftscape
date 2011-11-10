/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

(function(){
    var sin = Math.sin;
    var cos = Math.cos;
    var tan = Math.tan2;
    var sqrt = Math.sqrt;
    var p = Math.pow;

    Quat = Class({
        type: 'quaternion',
        __init__: function(){
            this.w = 1;
            this.x = 0;
            this.y = 0;
            this.z = 0;
        },
        setRotation: function(angle, x, y, z){
            var l = sqrt(x*x + y*y + z*z);
            x/=l;
            y/=l;
            z/=l;
            var angle = (angle/360)*Math.PI*2;

            var s = sin(angle/2);
            this.w = cos(angle/2);

            this.x = x*s;
            this.y = y*s;
            this.z = z*s;
            return this;
        },
        add: function(other){
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
            this.w += other.w;
            return this;
        },
        normalize: function(){
            var l = sqrt(p(this.w, 2)+p(this.x, 2)+p(this.y,2)+p(this.z,2));
            this.w /= l;
            this.x /= l;
            this.y /= l;
            this.z /= l;
            return this;
        },
        dot: function(other){
            return (
                this.w*other.w +
                this.x*other.x +
                this.y*other.y +
                this.z*other.z
            )
        },
        ident: function(){
            this.w = 1;
            this.x = 0;
            this.y = 0;
            this.z = 0;
            return this;
        },
        invert: function(){
            this.x *= -1;
            this.y *= -1;
            this.z *= -1;
            return this;
        },
        mul: function(other){
            return this._mul(other.w, other.x, other.y, other.z);
        },
        rotateByAxis: function(x, y, z){
            return this._mul(0, x, y, z);
        },
        rotate: function(scale, x, y, z){
            var w1=0, x1=x*scale, y1=y*scale, z1=z*scale;
            var w2=this.w, x2=this.x, y2=this.y, z2=this.z;
            this.w += (w2*w1 - x2*x1 - y2*y1 - z2*z1)*0.5;
            this.x += (y2*z1 - z2*y1 + w2*x1 + w1*x2)*0.5;
            this.y += (z2*x1 - x2*z1 + w2*y1 + w1*y2)*0.5;
            this.z += (x2*y1 - y2*x1 + w2*z1 + w1*z2)*0.5;
            return this;
        },
        _mul: function(w1, x1, y1, z1){
            var w2=this.w, x2=this.x, y2=this.y, z2=this.z;
            var w = w2*w1 - x2*x1 - y2*y1 - z2*z1;
            var x = y2*z1 - z2*y1 + w2*x1 + w1*x2;
            var y = z2*x1 - x2*z1 + w2*y1 + w1*y2;
            var z = x2*y1 - y2*x1 + w2*z1 + w1*z2;

            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        },
    });
})();

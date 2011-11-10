/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

(function(){
    var fmt = function(value){
        var str = value.toFixed(2);
        while(str.length < 7){
            str = ' ' + str;
        }
        return str;
    }

    var pi = Math.PI;
    var tau = 2*pi;
    var deg = 360/tau
    var arc = tau/360

    Mat2 = function(){
        this.data = [
            1, 0,
            0, 1,
        ];
    }

    Mat2.prototype = {
        type: 'Mat2',
        set: function(
            a0, b0,
            a1, b1
        ){
            this.data.splice(0, 16,
                a0, b0, 
                a1, b1 
            );
            return this;
        },
    };
        
    Mat3 = function(other){
        this.data = [
            1, 0, 0, 
            0, 1, 0, 
            0, 0, 1
        ];
    };

    Mat3.prototype = {
        type: 'Mat3',
        set: function(
            a0, b0, c0, 
            a1, b1, c1, 
            a2, b2, c2
        ){
            this.data.splice(0, 16,
                a0, b0, c0, 
                a1, b1, c1, 
                a2, b2, c2
            );
            return this;
        },
        ident: function(){
            return this.set(
                1, 0, 0, 
                0, 1, 0, 
                0, 0, 1
            );
        },
        log: function(message){
            var d = this.data;
            if(!message){
                message = 'Mat3';
            }
            console.group(message);
            console.log(fmt(d[0]), fmt(d[1]), fmt(d[2]));
            console.log(fmt(d[3]), fmt(d[4]), fmt(d[5]));
            console.log(fmt(d[6]), fmt(d[7]), fmt(d[8]));
            console.groupEnd();
            return this;
        },
        rotatex: function(angle){
            var s = Math.sin(angle*arc);
            var c = Math.cos(angle*arc);
            return this.amul(
                 1,  0,  0,  
                 0,  c,  s,  
                 0, -s,  c
            );
        },
        rotatey: function(angle){
            var s = Math.sin(angle*arc);
            var c = Math.cos(angle*arc);
            return this.amul(
                 c,  0, -s,  
                 0,  1,  0,  
                 s,  0,  c
            );
        },
        rotatez: function(angle){
            var s = Math.sin(angle*arc);
            var c = Math.cos(angle*arc);
            return this.amul(
                 c,  s,  0,  
                -s,  c,  0,  
                 0,  0,  1
            );
        },
        updateFrom: function(other){
            if(other.type == 'Mat4'){
                tmp4.updateFrom(other);
                tmp4.invert().transpose();
                var d = tmp4.data;

                var a0 = d[0],  b0 = d[1],  c0 = d[2];
                var a1 = d[4],  b1 = d[5],  c1 = d[6]; 
                var a2 = d[8],  b2 = d[9],  c2 = d[10];
            }
            else{
                var d = other.data;

                var a0 = d[0],  b0 = d[1],  c0 = d[2];
                var a1 = d[3],  b1 = d[4],  c1 = d[5]; 
                var a2 = d[6],  b2 = d[7],  c2 = d[8];
            }

            return this.set(
                a0, b0, c0, 
                a1, b1, c1, 
                a2, b2, c2
            );
            return this;
        },
        amul: function(
            b00, b10, b20, 
            b01, b11, b21, 
            b02, b12, b22, 
            b03, b13, b23
        ){
            var a = this.data;

            var a00 = a[0];
            var a10 = a[1];
            var a20 = a[2];
            
            var a01 = a[3];
            var a11 = a[4];
            var a21 = a[5];
            
            var a02 = a[6];
            var a12 = a[7];
            var a22 = a[8];
            
            a[0]  = a00*b00 + a01*b10 + a02*b20;
            a[1]  = a10*b00 + a11*b10 + a12*b20;
            a[2]  = a20*b00 + a21*b10 + a22*b20;
            
            a[3]  = a00*b01 + a01*b11 + a02*b21;
            a[4]  = a10*b01 + a11*b11 + a12*b21;
            a[5]  = a20*b01 + a21*b11 + a22*b21;
            
            a[6]  = a00*b02 + a01*b12 + a02*b22;
            a[7]  = a10*b02 + a11*b12 + a12*b22;
            a[8] =  a20*b02 + a21*b12 + a22*b22;

            return this;
        },
        transpose: function(){
            var d = this.data;
            return this.set(
                d[0], d[3], d[6], 
                d[1], d[4], d[7], 
                d[2], d[5], d[8]
            );
        }
    }

    Mat4 = function(other){
        this.data = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    };

    Mat4.prototype = {
        type: 'Mat4',
        set: function(
            a0, b0, c0, d0,
            a1, b1, c1, d1,
            a2, b2, c2, d2,
            a3, b3, c3, d3
        ){
            this.data.splice(0, 16,
                a0, b0, c0, d0,
                a1, b1, c1, d1,
                a2, b2, c2, d2,
                a3, b3, c3, d3
            );
            return this;
        },
        setRotation: function(q){
            var d = this.data;
            var w=q.w, x=q.x, y=q.y, z=q.z;

            return this.set(
                1-(2*y*y + 2*z*z),  2*x*y - 2*z*w,      2*x*z + 2*y*w,      d[3],
                2*x*y + 2*z*w,      1-(2*x*x + 2*z*z),  2*y*z - 2*x*w,      d[7],
                2*x*z - 2*y*w,      2*y*z + 2*x*w,      1-(2*x*x + 2*y*y),  d[11],
                d[12],              d[13],              d[14],              d[15]
            );
        },
        rotateQuat: function(q){
            var d = this.data;
            var w=q.w, x=q.x, y=q.y, z=q.z;

            return this.amul(
                1-(2*y*y + 2*z*z),  2*x*y - 2*z*w,      2*x*z + 2*y*w,      0,
                2*x*y + 2*z*w,      1-(2*x*x + 2*z*z),  2*y*z - 2*x*w,      0,
                2*x*z - 2*y*w,      2*y*z + 2*x*w,      1-(2*x*x + 2*y*y),  0,
                0,                  0,                  0,                  1 
            );
        },
        updateFrom: function(other){
            var d = other.data;
            if(other.type == 'Mat4'){
                var a0 = d[0],  b0 = d[1],  c0 = d[2],  d0 = d[3];
                var a1 = d[4],  b1 = d[5],  c1 = d[6],  d1 = d[7];
                var a2 = d[8],  b2 = d[9],  c2 = d[10], d2 = d[11];
                var a3 = d[12], b3 = d[13], c3 = d[14], d3 = d[15];

            }
            else{
                var a0 = d[0],  b0 = d[1],  c0 = d[2],  d0 = 0;
                var a1 = d[3],  b1 = d[4],  c1 = d[5],  d1 = 0;
                var a2 = d[6],  b2 = d[7],  c2 = d[8],  d2 = 0;
                var a3 = 0,     b3 = 0,     c3 = 0,     d3 = 1;
            }
                
            return this.set(
                a0, b0, c0, d0,
                a1, b1, c1, d1,
                a2, b2, c2, d2,
                a3, b3, c3, d3
            );
        },
        det: function(){
            var d = this.data;


            var a11 = d[0],  a12 = d[1],  a13 = d[2],  a14 = d[3];
            var a21 = d[4],  a22 = d[5],  a23 = d[6],  a24 = d[7];
            var a31 = d[8],  a32 = d[9],  a33 = d[10], a34 = d[11];
            var a41 = d[12], a42 = d[13], a43 = d[14], a44 = d[15];

            return (
                + a11*a22*a33*a44 + a11*a23*a34*a42 + a11*a24*a32*a43
                + a12*a21*a34*a33 + a12*a23*a31*a44 + a12*a24*a33*a41
                + a13*a21*a32*a44 + a13*a22*a34*a41 + a13*a24*a31*a42
                + a14*a21*a33*a42 + a14*a22*a31*a43 + a14*a23*a31*a41
                - a11*a22*a34*a43 - a11*a23*a32*a44 - a11*a24*a33*a42
                - a12*a21*a33*a44 - a12*a23*a34*a41 - a12*a24*a31*a43
                - a13*a21*a34*a42 - a13*a22*a31*a44 - a13*a24*a32*a41
                - a14*a21*a32*a43 - a14*a22*a33*a41 - a14*a23*a31*a42
            )
        },
        invert: function(){
            var det = this.det();
            if(det == 0){
                return this.ident();
            }
            else{
                var d = this.data;
                var a11 = d[0],  a12 = d[1],  a13 = d[2],  a14 = d[3];
                var a21 = d[4],  a22 = d[5],  a23 = d[6],  a24 = d[7];
                var a31 = d[8],  a32 = d[9],  a33 = d[10], a34 = d[11];
                var a41 = d[12], a42 = d[13], a43 = d[14], a44 = d[15];

                return this.set(
                    (a22*a33*a44 + a23*a34*a42 + a24*a32*a43 - a22*a34*a43 - a23*a32*a44 - a24*a33*a42)/det,
                    (a12*a34*a43 + a13*a32*a44 + a14*a33*a42 - a12*a33*a44 - a13*a34*a42 - a14*a32*a43)/det,
                    (a12*a23*a44 + a13*a24*a42 + a14*a22*a43 - a12*a24*a43 - a13*a22*a44 - a14*a23*a42)/det,
                    (a12*a24*a33 + a13*a22*a34 + a14*a23*a32 - a12*a23*a34 - a13*a24*a32 - a14*a22*a33)/det,
                    
                    (a21*a34*a43 + a23*a31*a44 + a24*a33*a41 - a21*a33*a44 - a23*a34*a41 - a24*a31*a43)/det,
                    (a11*a33*a44 + a13*a34*a41 + a14*a31*a43 - a11*a34*a43 - a13*a31*a44 - a14*a33*a41)/det,
                    (a11*a24*a43 + a13*a21*a44 + a14*a23*a41 - a11*a23*a44 - a13*a24*a41 - a14*a21*a43)/det,
                    (a11*a23*a34 + a13*a24*a31 + a14*a21*a33 - a11*a24*a33 - a13*a21*a34 - a14*a23*a31)/det,
                    
                    (a21*a32*a44 + a22*a34*a41 + a24*a31*a42 - a21*a34*a42 - a22*a31*a44 - a24*a32*a41)/det,
                    (a11*a34*a42 + a12*a31*a44 + a14*a32*a41 - a11*a32*a44 - a12*a34*a41 - a14*a31*a42)/det,
                    (a11*a22*a44 + a12*a24*a41 + a14*a21*a42 - a11*a24*a42 - a12*a21*a44 - a14*a22*a41)/det,
                    (a11*a24*a32 + a12*a21*a34 + a14*a22*a31 - a11*a22*a34 - a12*a24*a31 - a14*a21*a32)/det,
                    
                    (a21*a33*a42 + a22*a31*a43 + a23*a32*a41 - a21*a32*a43 - a22*a33*a41 - a23*a31*a42)/det,
                    (a11*a32*a43 + a12*a33*a41 + a13*a31*a42 - a11*a33*a42 - a12*a31*a43 - a13*a32*a41)/det,
                    (a11*a23*a42 + a12*a21*a43 + a13*a22*a41 - a11*a22*a43 - a12*a23*a41 - a13*a21*a42)/det,
                    (a11*a22*a33 + a12*a23*a31 + a13*a21*a32 - a11*a23*a32 - a12*a21*a33 - a13*a22*a31)/det
                )
            }
        },
        ident: function(){
            return this.set(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        },
        perspective: function(params){
            var args = params;
            //var args = $.extend(params, {fov:60, near:1, far:100});
            var near = args.near;
            var far = args.far;

            var angle = (args.fov/360)*Math.PI;

            var aspect = args.width/args.height;
            var top = near * Math.tan(angle);
            var bottom = -top;
            var right = top * aspect;
            var left = -right;

            var a = (2*near)/(right-left);
            var b = (right+left)/(right-left);
            var c = (2*near)/(top-bottom);
            var d = (top+bottom)/(top-bottom);
            var e = -(far+near)/(far-near);
            var f = -(2*far*near)/(far-near);
            var g = -1;

            return this.set(
                a, 0, b, 0,
                0, c, d, 0,
                0, 0, e, f,
                0, 0, g, 0
            ).transpose();
        },
        inverse_perspective: function(params){
            var args = params;
            //var args = $.extend({fov:60, near:1, far:100}, params);
            var near = args.near;
            var far = args.far;
            
            var aspect = args.width/args.height;
            var top = near * Math.tan((args.fov*Math.PI)/360.0);
            var bottom = -top;
            var right = top * aspect;
            var left = -right;

            var a = (right-left)/(2*near)
            var b = (right+left)/(2*near)
            var c = (top-bottom)/(2*near)
            var d = (top+bottom)/(2*near)
            var e = -1
            var f = -(far-near)/(2*far*near)
            var g = (far+near)/(2*far*near)

            return this.set(
                a, 0, 0, b,
                0, c, 0, d,
                0, 0, 0, e,
                0, 0, f, g
            ).transpose();
        },
        ortho: function(params){
            var args = extend({near:-1, far:1, top:-1, bottom:1, left:-1, right:1}, params);
            var near = args.near;
            var far = args.far;
            var bottom = args.bottom;
            var top = args.top;
            var right = args.right;
            var left = args.left;

            var a = 2/(right-left)
            var b = -((right+left)/(right-left))
            var c = 2/(top-bottom)
            var d = -((top+bottom)/(top-bottom))
            var e = -2/(far-near)
            var f = -((far+near)/(far-near))
            var g = 1

            return this.set(
                a, 0, 0, b,
                0, c, 0, d,
                0, 0, e, f,
                0, 0, 0, g
            ).transpose()
        },
        inverse_ortho: function(params){
            var args = extend({near:-1, far:1, top:-1, bottom:1, left:-1, right:1}, params);
            var near = args.near;
            var far = args.far;
            var bottom = args.bottom;
            var top = args.top;
            var right = args.right;
            var left = args.left;

            var a = (right-left)/2
            var b = (right+left)/2
            var c = (top-bottom)/2
            var d = (top+bottom)/2
            var e = (far-near)/-2
            var f = (near+far)/2
            var g = 1

            return this.set(
                a, 0, 0, b,
                0, c, 0, d,
                0, 0, e, f,
                0, 0, 0, g
            ).transpose()
        },
        log: function(message){
            var d = this.data;
            if(!message){
                message = 'Mat4';
            }
            console.group(message);
            console.log(fmt(d[0]), fmt(d[1]), fmt(d[2]), fmt(d[3]));
            console.log(fmt(d[4]), fmt(d[5]), fmt(d[6]), fmt(d[7]));
            console.log(fmt(d[8]), fmt(d[9]), fmt(d[10]), fmt(d[11]));
            console.log(fmt(d[12]), fmt(d[13]), fmt(d[14]), fmt(d[15]));
            console.groupEnd();
            return this;
        },

        // operations
        translate: function(x, y, z){
            return this.amul(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1
            );
        },
        rotatex: function(angle){
            var s = Math.sin(angle*arc);
            var c = Math.cos(angle*arc);
            return this.amul(
                 1,  0,  0,  0,
                 0,  c,  s,  0,
                 0, -s,  c,  0,
                 0,  0,  0,  1
            );
        },
        rotatey: function(angle){
            var s = Math.sin(angle*arc);
            var c = Math.cos(angle*arc);
            return this.amul(
                 c,  0, -s,  0,
                 0,  1,  0,  0,
                 s,  0,  c,  0,
                 0,  0,  0,  1
            );
        },
        rotatez: function(angle){
            var s = Math.sin(angle*arc);
            var c = Math.cos(angle*arc);
            return this.amul(
                 c,  s,  0,  0,
                -s,  c,  0,  0,
                 0,  0,  1,  0,
                 0,  0,  0,  1
            );
        },        
        scale : function(x , y, z) {            
            var a = this.data;
            a[0] *= x;
            a[1] *= x;
            a[2] *= x;
            a[3] *= x;
            a[4] *= y;
            a[5] *= y;
            a[6] *= y;
            a[7] *= y;
            a[8] *= z;
            a[9] *= z;
            a[10] *= z;
            a[11] *= z;
            return this;
        },        
        mul: function(b){
            return this.lmul(b.data);
        },
        amul: function(
            b00, b10, b20, b30,
            b01, b11, b21, b31,
            b02, b12, b22, b32,
            b03, b13, b23, b33
        ){
            var a = this.data;

            var a00 = a[0];
            var a10 = a[1];
            var a20 = a[2];
            var a30 = a[3];
            
            var a01 = a[4];
            var a11 = a[5];
            var a21 = a[6];
            var a31 = a[7];
            
            var a02 = a[8];
            var a12 = a[9];
            var a22 = a[10];
            var a32 = a[11];
            
            var a03 = a[12];
            var a13 = a[13];
            var a23 = a[14];
            var a33 = a[15];
            
            a[0]  = a00*b00 + a01*b10 + a02*b20 + a03*b30;
            a[1]  = a10*b00 + a11*b10 + a12*b20 + a13*b30;
            a[2]  = a20*b00 + a21*b10 + a22*b20 + a23*b30;
            a[3]  = a30*b00 + a31*b10 + a32*b20 + a33*b30;
            
            a[4]  = a00*b01 + a01*b11 + a02*b21 + a03*b31;
            a[5]  = a10*b01 + a11*b11 + a12*b21 + a13*b31;
            a[6]  = a20*b01 + a21*b11 + a22*b21 + a23*b31;
            a[7]  = a30*b01 + a31*b11 + a32*b21 + a33*b31;
            
            a[8]  = a00*b02 + a01*b12 + a02*b22 + a03*b32;
            a[9]  = a10*b02 + a11*b12 + a12*b22 + a13*b32;
            a[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
            a[11] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
            
            a[12] = a00*b03 + a01*b13 + a02*b23 + a03*b33;
            a[13] = a10*b03 + a11*b13 + a12*b23 + a13*b33;
            a[14] = a20*b03 + a21*b13 + a22*b23 + a23*b33;
            a[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;

            return this;
        },
        lmul: function(b){
            var a = this.data;

            var a00 = a[0];
            var a10 = a[1];
            var a20 = a[2];
            var a30 = a[3];
            
            var a01 = a[4];
            var a11 = a[5];
            var a21 = a[6];
            var a31 = a[7];
            
            var a02 = a[8];
            var a12 = a[9];
            var a22 = a[10];
            var a32 = a[11];
            
            var a03 = a[12];
            var a13 = a[13];
            var a23 = a[14];
            var a33 = a[15];
            
            var b00 = b[0];
            var b10 = b[1];
            var b20 = b[2];
            var b30 = b[3];
            
            var b01 = b[4];
            var b11 = b[5];
            var b21 = b[6];
            var b31 = b[7];
            
            var b02 = b[8];
            var b12 = b[9];
            var b22 = b[10];
            var b32 = b[11];
            
            var b03 = b[12];
            var b13 = b[13];
            var b23 = b[14];
            var b33 = b[15];

            a[0]  = a00*b00 + a01*b10 + a02*b20 + a03*b30;
            a[1]  = a10*b00 + a11*b10 + a12*b20 + a13*b30;
            a[2]  = a20*b00 + a21*b10 + a22*b20 + a23*b30;
            a[3]  = a30*b00 + a31*b10 + a32*b20 + a33*b30;
            
            a[4]  = a00*b01 + a01*b11 + a02*b21 + a03*b31;
            a[5]  = a10*b01 + a11*b11 + a12*b21 + a13*b31;
            a[6]  = a20*b01 + a21*b11 + a22*b21 + a23*b31;
            a[7]  = a30*b01 + a31*b11 + a32*b21 + a33*b31;
            
            a[8]  = a00*b02 + a01*b12 + a02*b22 + a03*b32;
            a[9]  = a10*b02 + a11*b12 + a12*b22 + a13*b32;
            a[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
            a[11] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
            
            a[12] = a00*b03 + a01*b13 + a02*b23 + a03*b33;
            a[13] = a10*b03 + a11*b13 + a12*b23 + a13*b33;
            a[14] = a20*b03 + a21*b13 + a22*b23 + a23*b33;
            a[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;

            return this;
        },
        transpose: function(){
            var d = this.data;
            return this.set(
                d[0], d[4], d[8], d[12],
                d[1], d[5], d[9], d[13],
                d[2], d[6], d[10], d[14],
                d[3], d[7], d[11], d[15]
            );
        }
    };
    
    var tmp4 = new Mat4();
    //var tmp3 = new Mat3();
})();

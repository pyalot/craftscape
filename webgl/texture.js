/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    var bound = {};

    framework.Texture = Class({
        type: 'Texture',
        __init__: function(){
            this.id = gl.createTexture();
            this.linear().repeat();
        },
        bind: function(unit){
            if(unit === undefined){
                var unit = 0;
            }
            if(bound[unit] !== this){
                bound[unit] = this;
                gl.activeTexture(gl.TEXTURE0+unit);
                gl.bindTexture(gl.TEXTURE_2D, this.id);
            }
            return this;
        },
        image: function(image){
            this.bind();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            return this;
        },
        size: function(width, height, type){
            var type = type === undefined ? gl.UNSIGNED_BYTE : gl[type.toUpperCase()];
            this.bind();
            this.width = width;
            this.height = height;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            return this;
        },
        nearest: function(){
            this.bind();
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            return this;
        },
        linear: function(){
            this.bind();
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            return this;
        },
        mipmap: function(){
            this.bind();
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            return this;
        },
        repeat: function(){
            return this.wrap(gl.REPEAT);
        },
        repeatMirrored: function(){
            return this.wrap(gl.MIRRORED_REPEAT);
        },
        clamp: function(){
            return this.wrap(gl.CLAMP);
        },
        borderColor: function(x, y, z, a){
            this.bind();
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_BORDER_COLOR, x, y, z, a);
            return this;
        },
        clampToBorder: function(){
            return this.wrap(gl.CLAMP_TO_BORDER);
        },
        clampToEdge: function(){
            return this.wrap(gl.CLAMP_TO_EDGE);
        },
        wrap: function(value){
            this.bind();
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, value);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, value);
            return this;
        }
    });
});

/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

var Framework = Class({
    __init__: function(canvas){
        var self = this;

        this.canvas = canvas;
        this.canvas_node = $(canvas);

        this.gl = canvas.getContext('experimental-webgl', {
            premultipliedAlpha: true,
        });

        if(!this.gl){
            throw 'No WebGL support';
        }

        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        for(var i=0; i<Framework.components.length; i++){
            Framework.components[i](this, this.gl);
        }

    },
    getExt: function(name){
        if(!this.gl.getExtension('OES_' + name)){
            throw 'Extension Unsupported: ' + name;
        }
        return this;
    },
    requireParam: function(name, minvalue){
        var value = this.gl.getParameter(this.gl[name]);
        if(value < minvalue){
            throw 'Param ' + name + '=' + value + '. A minimum of ' + minvalue + ' is required';
        }
        return this;
    },
    checkError: function(description){
        var gl = this.gl;

        var code = gl.getError();
        switch(code){
            case gl.NO_ERROR:
                return;
            case gl.OUT_OF_MEMORY:
                if(description) console.error(description);
                console.group('Out of Memory');
                console.trace();
                console.groupEnd();
                break;
            case gl.INVALID_ENUM:
                if(description) console.error(description);
                console.group('Invalid Enum');
                console.trace();
                console.groupEnd();
                break;
            case gl.INVALID_OPERATION:
                if(description) console.error(description);
                console.group('Invalid Operation');
                console.trace();
                console.groupEnd();
                break;
            case gl.INVALID_FRAMEBUFFER_OPERATION:
                if(description) console.error(description);
                console.group('Invalid Framebuffer Operation');
                console.trace();
                console.groupEnd();
                break;
            case gl.INVALID_VALUE:
                if(description) console.error(description);
                console.group('Invalid Value');
                console.trace();
                console.groupEnd();
                break;
        }
    },
    depthLess: function(){
        var gl = this.gl;

        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);

        return this;
    },
    depthLessEqual: function(){
        var gl = this.gl;

        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        return this;
    },
    coverageToAlpha: function(value){
        if(value){
            this.gl.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
        }
        else{
            this.gl.disable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
        }
        return this;
    },
    blendAlpha: function(){
        var gl = this.gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        return this;
    },
    cull: function(value){
        var gl = this.gl;

        if(value){
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl[value.toUpperCase()]);
        }
        else{
            gl.disable(gl.CULL_FACE);
        }
        return this;
    },
    Drawable: Class({
        draw: function(shader){
            this.vbo.draw(shader);
        },
        bind: function(shader){
            this.vbo.bind(shader);
        },
    })
});

Framework.components = [];

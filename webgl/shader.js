/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    var current = null;

    framework.Shader = Class({
        __init__: function(source, filename){
            this.filename = filename;
            this.source = source;
            this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
            this.vertex = gl.createShader(gl.VERTEX_SHADER);
            this.program = gl.createProgram();

            this.textures = {};
            this.units = {};
            this.unit_counter = 0;

            gl.attachShader(this.program, this.vertex);
            gl.attachShader(this.program, this.fragment);
            this.link(source);
        },
        uniformLocation: function(name){
            var location = this.uniform_cache[name];
            if(location === undefined){
                var location = this.uniform_cache[name] = gl.getUniformLocation(this.program, name);
            }
            return location;
        },
        attributeLocation: function(name){
            var location = this.attribute_cache[name];
            if(location === undefined){
                var location = this.attribute_cache[name] = gl.getAttribLocation(this.program, name);
            }
            return location;
        },
        link: function(source){
            var shaders = this.preprocess(source);
            this.uniform_cache = {};
            this.attribute_cache = {};

            this.compile(this.vertex, shaders.vertex);
            this.compile(this.fragment, shaders.fragment);
            gl.linkProgram(this.program);
            if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)){
                throw this.filename + ': program link: ' + this.path + ': ' + gl.getProgramInfoLog(this.program);
            }
        },
        compile: function(shader, source){
            var directives = [
                '#version 100',
                'precision highp int;',
                'precision highp float;',
                'precision highp vec2;',
                'precision highp vec3;',
                'precision highp vec4;',
            ].join('\n');
            gl.shaderSource(shader, directives + '\n' + source);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                throw this.filename + ': shader compile: ' + gl.getShaderInfoLog(shader);
            }
        },
        validate: function(){
            gl.validateProgram(this.program);
            if(!gl.getProgramParameter(this.program, gl.VALIDATE_STATUS)){
                throw this.filename + ': program validate: ' + gl.getProgramInfoLog(this.program);
            }
        },
        preprocess: function(source){
            var lines = source.split('\n');
            var shaders = {};
            var type;

            for(var i=0; i<lines.length; i++){
                var line = lines[i];
                var match = line.match(/^(\w+):$/);
                if(match){
                    type = match[1];
                    if(shaders[type] === undefined){
                        shaders[type] = '';
                    }
                }
                else{
                    shaders[type] += '#line ' + i + '\n' + line + '\n';
                }
            }
            return shaders;
        },
        getUnit: function(name){
            var unit = this.units[name];
            if(unit === undefined){
                var unit = this.units[name] = this.unit_counter++;
            }
            return unit;
        },
        setupTextures: function(){
            for(var name in this.textures){
                var texture = this.textures[name];
                var unit = this.getUnit(name);
                texture.bind(unit);
            }
        },
        sampler: function(name, location, texture){
            var unit = this.getUnit(name);
            this.textures[name] = texture;
            texture.bind(unit);
            gl.uniform1i(location, unit);
        },
        set: function(name, value){
            this.use();
            if(name.type == 'viewpoint'){
                name.set(this);
            }
            else if(name.type == 'projection'){
                name.set(this);
            }
            else if(typeof(name) == 'string'){
                var location = this.uniformLocation(name);
                if(location != undefined){
                    if(arguments.length == 2){
                        var type = value.type || typeof(value);
                        switch(type){
                            case 'number'   : gl.uniform1f(location, value); break;
                            case 'Mat4'     : gl.uniformMatrix4fv(location, false, value.data); break;
                            case 'Mat3'     : gl.uniformMatrix3fv(location, false, value.data); break;
                            case 'Mat2'     : gl.uniformMatrix2fv(location, false, value.data); break;
                            case 'Vec4'     : gl.uniform4f(location, value.x, value.y, value.z, value.w); break;
                            case 'Vec3'     : gl.uniform3f(location, value.x, value.y, value.z); break;
                            case 'Vec2'     : gl.uniform2f(location, value.x, value.y); break;
                            case 'Texture'  : this.sampler(name, location, value); break;
                            case 'object':
                                if(value instanceof Array){
                                    gl['uniform' + value.length + 'fv'](location, value);
                                }
                                break;
                        }
                    }
                    else{
                        var values = [];
                        for(var i=1; i<arguments.length; i++){
                            values.push(arguments[i]);
                        }
                        gl['uniform' + values.length + 'fv'](location, values);
                    }
                }
            }
            else{
                for(var uniform_name in name){
                    this.set(uniform_name, name[uniform_name]);
                }
            }
            return this;
        },
        use: function(uniforms){
            if(current != this){
                current = this;
                gl.useProgram(this.program);
                this.setupTextures();
            }
            if(uniforms){
                this.set(uniforms);
            }
        },
        draw: function(drawable, to, uniforms){
            to.bind();
            this.use(uniforms);
            this.set('viewport', to.width, to.height);
            drawable.bind(this);
            drawable.draw();
        },
    });
});

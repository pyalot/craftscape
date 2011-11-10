/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    var float_size = Float32Array.BYTES_PER_ELEMENT;

    framework.VBO = Class({
        __init__: function(params){
            this.pointers = [];
            this.type = gl[params.type] || gl.TRIANGLES;

            var data = [];
            for(spec in params){
                if(spec.match(/[a-zA-Z_]+_[1234]/)){
                    var values = params[spec];
                    var split = spec.split(/_(?=[1234])/);
                    var name = split[0];
                    var size = parseInt(split[1]);
                    this.count = values.length/size;

                    this.pointers.push({
                        name: name,
                        size: size,
                        offset: data.length,
                    });

                    data = data.concat(values);
                }
            }
            
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        },
        bind: function(shader){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            var pointers = this.pointers;
            var l = pointers.length;

            for(var i=0; i<l; i++){
                var pointer = pointers[i];
                var location = shader.attributeLocation(pointer.name);
                if(location >= 0){
                    gl.enableVertexAttribArray(location);
                    gl.vertexAttribPointer(location, pointer.size, gl.FLOAT, false, 0, pointer.offset*float_size);
                }
            }
        },
        draw: function(shader){
            gl.drawArrays(this.type, 0, this.count);
        }
    });
});

/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    framework.Perspective = Class({
        type: 'projection',
        __init__: function(viewport, params){
            var self = this;
            this.params = params;
            this.proj = new Mat4();
            this.inv_proj = new Mat4();
            viewport.onResize(function(event, width, height){
                self.resize(width, height);
            });
        },
        resize: function(width, height){
            this.params.width = width;
            this.params.height = height;
            this.proj.perspective(this.params);
            this.inv_proj.inverse_perspective(this.params);
        },
        set: function(shader){
            shader.set({
                near: this.params.near,
                far: this.params.far,
                proj: this.proj,
                inv_proj: this.inv_proj,
            });
        },
    });
    
    framework.Ortho = Class({
        type: 'projection',
        __init__: function(viewport, params){
            var self = this;
            this.params = params;
            this.proj = new Mat4();
            this.inv_proj = new Mat4();
            viewport.onResize(function(event, width, height){
                self.resize(width, height);
            });
        },
        resize: function(width, height){
            var s = this.params.scale;
            var aspect = (width*s)/height;
            this.params.top = s/2;
            this.params.bottom = -s/2;
            this.params.left = -aspect/2;
            this.params.right = aspect/2;

            this.proj.ortho(this.params);
            this.inv_proj.inverse_ortho(this.params);
        },
        set: function(shader){
            shader.set({
                near: this.params.near,
                far: this.params.far,
                proj: this.proj,
                inv_proj: this.inv_proj,
            });
        },
    });
});

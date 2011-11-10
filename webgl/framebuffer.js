Framework.components.push(function(framework, gl){
    var current = null;

    var screen = framework.screen = {
        events: new EventManager(),
        bind: function(){
            if(current !== null){
                framework.gl.viewport(0, 0, this.width, this.height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
        },
        onResize: function(callback){
            this.events.on('resize', callback);
            callback('resize', this.width, this.height);
            return this;
        },
        resize: function(){
            var width = this.width = framework.canvas_node.width();
            var height = this.height = framework.canvas_node.height();

            framework.canvas.width = width;
            framework.canvas.height = height;
            this.events.dispatch('resize', width, height);
            return this;
        },
    };
    
    framework.canvas_node.resize(function(){
        screen.resize();
    });
    $(window).resize(function(){
        screen.resize();
    });
    screen.resize();

    framework.Framebuffer = Class({
        __init__: function(){
            this.id = gl.createFramebuffer();
        },
        color: function(texture){
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.id, 0);
            this.check();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            current = null;
            this.width = texture.width;
            this.height = texture.height;
            return this;
        },
        depth: function(){
            var id = this.depthstencil = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, id);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, id);
            this.check();
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            current = null;
            return this;
        },
        check: function(){
            var result = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if(result == gl.FRAMEBUFFER_UNSUPPORTED){
                throw 'Framebuffer is unsupported';
            }
            else if(result == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT){
                throw 'Framebuffer incomplete attachment';
            }
            else if(result == gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS){
                throw 'Framebuffer incomplete dimensions';
            }
            else if(result == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT){
                throw 'Framebuffer incomplete missing attachment';
            }
        },
        bind: function(){
            if(current !== this){
                current = this;
                framework.gl.viewport(0, 0, this.width, this.height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
            }
        },
        onResize: function(callback){
            callback('resize', this.width, this.height);
        },
    });
});

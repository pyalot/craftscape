/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

var Viewpoint = Class({
    type: 'viewpoint',
    __init__: function(params){
        this.time = Date.now()/1000;
        var selector = params.element || document;
        this.offset = params.offset || new Vec3();
        this.damping = params.damping || 0.95;
        this.acc_factor = params.acc_factor || 50.0;

        var self = this;
        this.orientation = params.orientation || 0;
        this.orientation_speed = 0;
        this.orientation_acc = 0;
        this.pitch = params.pitch || 0;
        this.pitch_speed = 0;
        this.pitch_acc = 0;

        this.pos = new Vec3(params.x, params.y, params.z);
        this.last_pos = new Vec3(params.x, params.y, params.z);
        this.vel = new Vec3();
        this.acc = new Vec3();
        this.tmp = new Vec3();

        var x, y, lastx, lasty, pressed;

        $(selector)
            .mousedown(function(event){
                pressed = true;
                lastx = event.pageX;
                lasty = event.pageY;
            })
            .mouseup(function(){
                pressed = false;
            })
            .mousemove(function(event){
                if(pressed){
                    var x = event.pageX;
                    var y = event.pageY;

                    self.orientation_acc += x-lastx;
                    self.pitch_acc += y-lasty;

                    lastx = x;
                    lasty = y;
                }
            })
            .bind('selectstart', function(){
                return false;
            });

        this.view = new Mat4();
        this.inv_view = new Mat4();
        this.rot = new Mat3();
        this.inv_rot = new Mat3();
    },
    set: function(shader){
        shader.set({
            view: this.view,
            inv_view: this.inv_view,
            rot: this.rot,
            inv_rot: this.inv_rot,
        });
    },
    update: function(){
        var now = Date.now()/1000;
        var time = this.time;
        var timestep = 1/120;
        
        var acc = this.acc;
        acc.x = keys.a ? +1 : keys.d ? -1 : 0;
        acc.y = keys.q ? +1 : keys.e ? -1 : 0;
        acc.z = keys.s ? -1 : keys.w ? +1 : 0;
        acc.mul(timestep).mul(this.rot);

        if(now - time > 0.25){
            time = now - 0.25;
        }

        while(time < now){
            this.step(timestep);
            time += timestep;
        }
        this.time = time;
                
        var diff = time - now;
        if(diff > 0){
            var u = (timestep - diff)/timestep;
            var orientation = this.last_orientation + (this.orientation - this.last_orientation)*u;
            var pitch = this.last_pitch + (this.pitch - this.last_pitch)*u;
            var x = this.last_pos.x + (this.pos.x - this.last_pos.x)*u;
            var y = this.last_pos.y + (this.pos.y - this.last_pos.y)*u;
            var z = this.last_pos.z + (this.pos.z - this.last_pos.z)*u;
        }
        else{
            var orientation = this.orientation;
            var pitch = this.pitch;
            var x = this.pos.x;
            var y = this.pos.y;
            var z = this.pos.z;
        }
        
        this.orientation_acc = 0;
        this.pitch_acc = 0;
        
        this.view
            .ident()
            .translate(this.offset.x, this.offset.y, this.offset.z)
            .rotatex(pitch)
            .rotatey(orientation)
            .translate(x, y, z);

        this.inv_view
            .updateFrom(this.view)
            .invert();

        this.rot.updateFrom(this.view);
        this.inv_rot.updateFrom(this.inv_view);
    },
    step: function(delta){
        this.last_pos.update(this.pos);
        this.last_orientation = this.orientation;
        this.last_pitch = this.pitch;

        this.orientation_speed += this.orientation_acc * delta * this.acc_factor;
        this.pitch_speed += this.pitch_acc * delta * this.acc_factor;

        this.orientation_speed *= this.damping;
        this.pitch_speed *= this.damping;

        this.orientation += this.orientation_speed * delta;
        this.pitch += this.pitch_speed * delta;

        this.vel.add(this.acc).mul(0.975);
        this.tmp.update(this.vel).mul(delta);
        this.pos.add(this.tmp);

        if(this.pitch > 85){
            this.pitch = 85;
            this.pitch_speed = 0;
        }
        else if(this.pitch < -85){
            this.pitch = -85;
            this.pitch_speed = 0;
        }

    },
});

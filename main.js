/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

var editsize = 3;
var lightview = new Mat4().rotatex(15).rotatey(60);
var inv_lightview = new Mat4().updateFrom(lightview).invert();
var keys = new Keys();
var controls = {
    rock: 1.0,
    soil: 0.0,
    water: 0.0,
    dir: 1.0,
    rain: 1.0,
    erode: 1.0,
    evaporate: 1.0,
};
var view, mousepos, projection;
var start = Date.now()/1000;

var Processor = Class({
    __init__: function(width, height, framework){
        this.result = new framework.Texture()
            .size(width, height, 'float')
            .linear()
            .clampToEdge();
        this.fbo = new framework.Framebuffer()
            .color(this.result);
        this.quad = framework.unitQuad();
    },
    run: function(program){
        program.draw(this.quad, this.fbo);
    }
});

var Water = Class({
    __init__: function(width, height, framework, programs, heights, normals){
        this.programs = programs;
        this.framework = framework;
        
        this.tmp = new Processor(width, height, framework);
        this.last = new Processor(width, height, framework);
        this.current = new Processor(width, height, framework);
        this.normals = new Processor(width, height, framework);
        this.flows = new Processor(128, 128, framework);
        this.flows.result.nearest();

        programs.water_diffuse.set('heights', heights.result);
        programs.water_momentum
            .set('last', this.last.result)
            .set('current', this.current.result)
            .set('ground', heights.result);
        programs.water_cycle.set('water', this.tmp.result);
        programs.water_normals.set({
            ground: heights.result,
            water: this.current.result,
        });
        programs.flows.set({
            flows: this.flows.result,
            water: this.current.result,
        });
    },
    update: function(){
        this.programs.water_diffuse.set('axis', 0, 1).set('source', this.current.result);
        this.tmp.run(this.programs.water_diffuse);
        this.programs.water_diffuse.set('axis', 1, 0).set('source', this.tmp.result);
        this.current.run(this.programs.water_diffuse);

        this.tmp.run(this.programs.water_momentum);
        this.programs.copy.set('source', this.current.result);
        this.last.run(this.programs.copy);
        this.programs.water_cycle
            .set('rain', controls.rain)
            .set('evaporate', controls.evaporate)
            .set(view)
            .set(projection)
            .set('mousepos', mousepos)
            .set('editsize', editsize)
            .set('screen', [this.framework.screen.width, this.framework.screen.height])
            .set('create', keys.space && controls.water ? 1.0 * controls.dir : 0.0)

        this.current.run(this.programs.water_cycle);
        this.normals.run(this.programs.water_normals);
        this.tmp.run(this.programs.flows);
        this.flows.run(this.programs.copy.set('source', this.tmp.result));
    },
});

var Shadow = Class({
    __init__: function(width, height, framework, programs, terrain, grid){
        this.programs = programs;
        this.grid = grid;
        this.gl = framework.gl;

        this.depth = new framework.Texture()
            .size(2048, 2048, 'float')
            .linear()
            .clampToEdge();

        this.fbo = new framework.Framebuffer()
            .color(this.depth)
            .depth();
        
        this.proj = new framework.Ortho(this.fbo, {
            scale: 1.5,
            near: -20,
            far: 20,
        });

        programs.shadow
            .set('heights', terrain.heights.result)
            .set(this.proj);
            
        programs.shadowmap
            .set('heights', terrain.heights.result)
            .set('normals', terrain.normals.result)
            .set('shadows', this.depth)
            .set('shadowsize', this.depth.width, this.depth.height)
            .set(this.proj);

        programs.water_shadowmap
            .set('ground', terrain.heights.result)
            .set('water', terrain.water.current.result)
            .set('normals', terrain.water.normals.result)
            .set('shadows', this.depth)
            .set('shadowsize', this.depth.width, this.depth.height)
            .set(this.proj);

        this.map = new Processor(width*2, height*2, framework);
        this.water_map = new Processor(width*2, height*2, framework);
        this.tmp = new Processor(width*2, height*2, framework);
    },
    update: function(){
        this.fbo.bind();
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.programs.shadow.set('view', lightview).draw(this.grid, this.fbo);

        this.programs.shadowmap.set('view', lightview);
        this.map.run(this.programs.shadowmap);
        this.programs.blur.set('axis', 1.2, 0.0).set('source', this.map.result);
        this.tmp.run(this.programs.blur);
        this.programs.blur.set('axis', 0.0, 1.2).set('source', this.tmp.result);
        this.map.run(this.programs.blur);
        
        this.programs.water_shadowmap.set('view', lightview);
        this.water_map.run(this.programs.water_shadowmap);
        this.programs.blur.set('axis', 1.2, 0.0).set('source', this.water_map.result);
        this.tmp.run(this.programs.blur);
        this.programs.blur.set('axis', 0.0, 1.2).set('source', this.tmp.result);
        this.water_map.run(this.programs.blur);
    }
});
    
var Terrain = Class({
    __init__: function(width, height, framework, programs, grid){
        this.framework = framework;
        this.programs = programs;
        this.heights = new Processor(width, height, framework);
        this.normals = new Processor(width, height, framework);
        this.occlusions = new Processor(width, height, framework);
        this.water = new Water(width, height, framework, programs, this.heights, this.normals);
        this.shadow = new Shadow(width, height, framework, programs, this, grid);
        
        this.tmp = new Processor(width, height, framework);

        programs.normal.set('heights', this.heights.result);
        programs.occlusion.set({
            'heights': this.heights.result,
            'normals': this.normals.result,
        });
        this.delta = 223.0;
        this.programs.simplex.set('delta', this.delta);
        this.heights.run(this.programs.simplex);
        this.programs.errode.set({
            ground: this.heights.result,
            water: this.water.current.result,
        });
        this.programs.diffuse_soil.set({
            ground: this.tmp.result,
            water: this.water.current.result,
        });
    },
    update: function(){
        this.water.update();
        this.programs.errode.set('factor', controls.erode);
        this.tmp.run(this.programs.errode);
        
        this.heights.run(this.programs.diffuse_soil);

        if(keys.space && (controls.soil || controls.rock)){
            this.programs.god
                .set(view)
                .set(projection)
                .set('mousepos', mousepos)
                .set('delta', Date.now()/1000-start)
                .set('screen', [this.framework.screen.width, this.framework.screen.height])
                .set('rockfactor', controls.rock * controls.dir)
                .set('soilfactor', controls.soil * controls.dir)
                .set('editsize', editsize)
            this.tmp.run(this.programs.god);
            this.heights.run(this.programs.copy.set('source', this.tmp.result));
        }
        
        this.normals.run(this.programs.normal);
        this.occlusions.run(this.programs.occlusion);
        this.shadow.update();
    },
});

$(function(){
    var canvas = $('canvas');
    $('#modtype').buttonset();
    $('#modop').buttonset();
    $('#params').buttonset();
   
    $('input[name="modtype"]').change(function(){
        controls.rock = 0.0;
        controls.soil = 0.0;
        controls.water = 0.0;
        controls[$(this).attr('id')] = 1.0;
    });
    
    $('input[name="modop"]').change(function(){
        if($(this).attr('id') == 'add'){
            controls.dir = 1.0;
        }
        else{
            controls.dir = -1.0;
        }
    });

    $('#rain,#erode,#evaporate').change(function(){
        var id = $(this).attr('id');
        if(this.checked){
            controls[id] = 1.0;
        }
        else{
            controls[id] = 0.0;
        }
    });

    view = new Viewpoint({
        element: document,
        offset: new Vec3(0, 0, 0.0),
        x: -0.08,
        y: -0.08,
        z: -0.65,
        pitch: 12,
    });

    mousepos = [0, 0];
    canvas.mousemove(function(event){
        mousepos[0] = event.pageX;
        mousepos[1] = this.height - event.pageY;
    });
    
    $(document).mousewheel(function(event, delta){
        editsize = clamp(editsize - delta*0.1, 2, 20);
    });

    var handle_error = function(description){
        var elem = $('<div id="error"></div>')
            .appendTo('body');
        $('<h1>Whoops, shit happens.</h1>')
            .appendTo(elem);
        $('<pre></pre>').text(description).appendTo(elem);
        $('<div id="bugs"><a href="https://bugzilla.mozilla.org/enter_bug.cgi">file a mozilla bug</a>, <a href="http://code.google.com/p/chromium/issues/list">file a chrome bug</a>, <a href="http://code.google.com/p/angleproject/issues/list">file an angleproject bug</a>, <a href="http://emailcustomercare.amd.com/">file an AMD bug</a>, <a href="http://nvidia.custhelp.com/app/chat/chat_launch">file an Nvidia bug</a></div>').appendTo(elem);
    }

    try{
        var framework = new Framework(canvas[0])
            .depthLess()
            .blendAlpha()
            .getExt('texture_float')
            .requireParam('MAX_VERTEX_TEXTURE_IMAGE_UNITS', 4);
    }
    catch(error){
        handle_error(error);
        return;
    }
    
    projection = new framework.Perspective(framework.screen, {
        near: 0.01,
        far: 20,
        fov: 60,
    });

    var gl = framework.gl;

    var grid = new framework.Grid({
        xsize: 512,
        ysize: 512,
        cell_width: 4,
        cell_height: 4,
        width: 1,
        height: 1,
    });
    
    var hexgrid = new framework.HexGrid({
        xsize: 512,
        ysize: 512,
        width: 1,
        height: 1,
    });

    var scheduler = new Scheduler(function(delta, now){ 
        terrain.update();
        framework.screen.bind();

        gl.clearColor(0.7, 0.7, 0.7, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        view.update(delta);

        programs.display
            .set(projection)
            .set(view)
            .set('mousepos', mousepos)
            .set('editsize', editsize)
            .draw(hexgrid, framework.screen);

        programs.water_display
            .set(projection)
            .set(view)
            .set('mousepos', mousepos)
            .set('editsize', editsize)
            .draw(grid, framework.screen);
    });

    var programs = {
        display: 'display.shader',
        simplex: 'simplex3d.shader',
        normal: 'normal.shader',
        occlusion: 'occlusion.shader',
        shadow: 'shadow.shader',
        shadowmap: 'shadowmap.shader',
        blur: 'blur.shader',
        rock: 'rock_texture.png',
        rock_normals: 'rock2_normals.png',
        grass: 'grass_material.png',
        grass_normals: 'grass_normals.png',

        water_diffuse: 'water/diffuse.shader',
        water_display: 'water/display.shader',
        water_momentum: 'water/momentum.shader',
        water_cycle: 'water/cycle.shader',
        water_normals: 'water/normals.shader',
        water_shadowmap: 'water/shadowmap.shader',
        flows: 'flows.shader',
        god: 'god.shader',

        errode: 'errode.shader',
        diffuse_soil: 'diffuse_soil.shader',

        copy: 'copy.shader',
    };

    var terrain;
    
    var loader = new framework.Loader()
        .error(function(description){
            handle_error(description);
        })
        .load(programs)
        .ready(function(){
            terrain = new Terrain(512, 512, framework, programs, hexgrid);
            terrain.update();
            programs.display.set({
                'heights': terrain.heights.result,
                'normals': terrain.normals.result,
                'occlusions': terrain.occlusions.result,
                'rock': programs.rock.mipmap(),
                'rock_normals': programs.rock_normals.mipmap(),
                'grass': programs.grass.mipmap(),
                'grass_normals': programs.grass_normals.mipmap(),
                'shadowmap': terrain.shadow.map.result,
                water: terrain.water.current.result,
            });
            programs.water_display.set({
                lightview: inv_lightview,
                normals: terrain.water.normals.result,
                heights: terrain.heights.result,
                water_heights: terrain.water.current.result,
                detail_normals: programs.grass_normals,
                shadowmap: terrain.shadow.water_map.result,
                flows: terrain.water.flows.result,
            });
            scheduler.start();
        });
});

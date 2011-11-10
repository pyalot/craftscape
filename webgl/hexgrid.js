/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    framework.HexGrid = Class({
        __extends__: framework.Drawable,
        __init__: function(params){
            var args = extend({
                xsize: 10,
                ysize: 10,
                width: 1,
                height: 1,
            }, params);

            var position_2f = [];
            var texcoord_2f = [];
            var barycentric_3f = [];

            var width = args.width;
            var height = args.height;
            var xsize = args.xsize;
            var ysize = args.ysize;
            var hw = width/2;
            var hh = height/2;

            for(var x=0; x<=xsize; x++){
                var x1 = clamp((x-0.5)/xsize, 0, 1);
                var x2 = clamp((x+0.0)/xsize, 0, 1);
                var x3 = clamp((x+0.5)/xsize, 0, 1);
                var x4 = clamp((x+1.0)/xsize, 0, 1);
                for(var y=0; y<ysize; y+=2){
                    var t = (y+0)/ysize;
                    var m = (y+1)/ysize;
                    var b = (y+2)/ysize;

                    position_2f.push(
                        x1*width-hw, t*height-hh,
                        x3*width-hw, t*height-hh,
                        x2*width-hw, m*height-hh,

                        x2*width-hw, m*height-hh,
                        x3*width-hw, t*height-hh,
                        x4*width-hw, m*height-hh,    
                        
                        x1*width-hw, b*height-hh,
                        x2*width-hw, m*height-hh,
                        x3*width-hw, b*height-hh,    
                        
                        x2*width-hw, m*height-hh,
                        x4*width-hw, m*height-hh,
                        x3*width-hw, b*height-hh
                    );
                    
                    texcoord_2f.push(
                        x1, t,    x3, t,   x2, m,
                        x2, m,    x3, t,   x4, m,    
                        
                        x1, b,    x2, m,   x3, b,
                        x2, m,    x4, m,   x3, b
                    );

                    barycentric_3f.push(
                        1, 0, 0,    0, 1, 0,    0, 0, 1,
                        1, 0, 0,    0, 1, 0,    0, 0, 1,
                        
                        1, 0, 0,    0, 1, 0,    0, 0, 1,
                        1, 0, 0,    0, 1, 0,    0, 0, 1
                    );
                }
            }

            this.vbo = new framework.VBO({
                position_2f: position_2f,
                texcoord_2f: texcoord_2f,
                barycentric_3f: barycentric_3f,
            });
        },
    });
});

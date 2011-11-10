/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    framework.Quad = Class({
        __extends__: framework.Drawable,
        __init__: function(params){
            var b=params.y;
            var t=b+params.h;
            var l=params.x;
            var r=params.x+params.h;
             
            this.vbo = new framework.VBO({
                position_2f: [
                     r,  t,
                     l,  t,
                     l,  b,

                     r,  t,
                     l,  b,
                     r,  b,
                ],
                texcoord_2f: [
                     1,  0,
                     0,  0,
                     0,  1,

                     1,  0,
                     0,  1,
                     1,  1,
                ]
            });
        },
    });

    var unit_quad;

    framework.unitQuad = function(){
        if(!unit_quad){
            unit_quad = new framework.Quad({
                x: -1, y: -1,
                w: 2, h: 2,
            });
        }
        return unit_quad;
    };
});

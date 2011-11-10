/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    framework.Grid = Class({
        __extends__: framework.Drawable,
        __init__: function(params){
            var args = extend({
                xsize: 10,
                ysize: 10,
                width: 1,
                height: 1,
                cell_width: 1,
                cell_height: 1,
            }, params);

            var position_2f = [];
            var texcoord_2f = [];
            var barycentric_3f = [];
            var cell_uv_4f = [];

            var width = args.width;
            var height = args.height;
            var xsize = args.xsize;
            var ysize = args.ysize;

            var cell_count_x = args.xsize/args.cell_width;
            var cell_count_y = args.ysize/args.cell_height;

            for(var x=0; x<xsize; x++){
                var left = x/xsize;
                var right = (x+1)/xsize;
                var pleft = (left*width) - width/2;
                var pright = (right*width) - width/2;
                var cell_x = Math.floor(x/args.cell_width)/cell_count_x;
                var cell_l = (x%args.cell_width)/args.cell_width;
                var cell_r = ((x%args.cell_width)+1)/args.cell_width;

                for(var y=0; y<ysize; y++){
                    var bottom = y/ysize;
                    var top = (y+1)/ysize;
                    var pbottom = (bottom*height) - height/2;
                    var ptop = (top*height) - height/2;
                    var cell_y = Math.floor(y/args.cell_height)/cell_count_y;
                    var cell_b = (y%args.cell_height)/args.cell_height;
                    var cell_t = ((y%args.cell_height)+1)/args.cell_height;

                    position_2f.push(
                        pleft, ptop,
                        pleft, pbottom,
                        pright, ptop,

                        pleft, pbottom,
                        pright, pbottom,
                        pright, ptop
                    );

                    texcoord_2f.push(
                        left, top,
                        left, bottom,
                        right, top,

                        left, bottom,
                        right, bottom,
                        right, top
                    );
                   
                    cell_uv_4f.push(
                        cell_x, cell_y, cell_l, cell_t,
                        cell_x, cell_y, cell_l, cell_b,
                        cell_x, cell_y, cell_r, cell_t,

                        cell_x, cell_y, cell_l, cell_b,
                        cell_x, cell_y, cell_r, cell_b,
                        cell_x, cell_y, cell_r, cell_t 
                    );
                    
                    /*
                    cell_uv_4f.push(
                        left, bottom, 0, 1,
                        left, bottom, 0, 0,
                        left, bottom, 1, 1,

                        left, bottom, 0, 0,
                        left, bottom, 1, 0,
                        left, bottom, 1, 1
                    );
                    */

                    barycentric_3f.push(
                        1, 0, 0,
                        0, 1, 0,
                        0, 0, 1,
                        
                        1, 0, 0,
                        0, 1, 0,
                        0, 0, 1
                    );
                }
            }

            this.vbo = new framework.VBO({
                position_2f: position_2f,
                texcoord_2f: texcoord_2f,
                barycentric_3f: barycentric_3f,
                cell_uv_4f: cell_uv_4f,
            });
        },
    });
});

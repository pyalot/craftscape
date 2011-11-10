/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    framework.Box = Class({
        __extends__: framework.Drawable,
        __init__: function(params){
            var params = params || {};
            var w = this.width = params.width || 1;
            var h = this.height = params.height || 1;
            var d = this.depth = params.depth || 1;

            this.vbo = new framework.VBO({
                position_3: [
                   -w, -h, -d,  -w,  h, -d,   w,  h, -d,
                    w, -h, -d,  -w, -h, -d,   w,  h, -d,
                                                           
                    w,  h,  d,  -w,  h,  d,  -w, -h,  d,
                    w,  h,  d,  -w, -h,  d,   w, -h,  d,
                                                            
                   -w,  h, -d,  -w,  h,  d,   w,  h,  d,
                    w,  h, -d,  -w,  h, -d,   w,  h,  d,
                                                          
                    w, -h,  d,  -w, -h,  d,  -w, -h, -d,
                    w, -h,  d,  -w, -h, -d,   w, -h, -d,

                   -w, -h, -d,  -w, -h,  d,  -w,  h,  d,
                   -w,  h, -d,  -w, -h, -d,  -w,  h,  d,

                    w,  h,  d,   w, -h,  d,   w, -h, -d,
                    w,  h,  d,   w, -h, -d,   w,  h, -d,
                ],
                normal_3: [
                    0,  0, -1,   0,  0, -1,   0,  0, -1,
                    0,  0, -1,   0,  0, -1,   0,  0, -1,

                    0,  0,  1,   0,  0,  1,   0,  0,  1,
                    0,  0,  1,   0,  0,  1,   0,  0,  1,

                    0,  1,  0,   0,  1,  0,   0,  1,  0,
                    0,  1,  0,   0,  1,  0,   0,  1,  0,

                    0, -1,  0,   0, -1,  0,   0, -1,  0,
                    0, -1,  0,   0, -1,  0,   0, -1,  0,

                   -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
                   -1,  0,  0,  -1,  0,  0,  -1,  0,  0,

                    1,  0,  0,   1,  0,  0,   1,  0,  0,
                    1,  0,  0,   1,  0,  0,   1,  0,  0,
                ],
                texcoord_2: [
                    0, 1,  0, 0,  1, 0,
                    1, 1,  0, 1,  1, 0,

                    1, 0,  0, 0,  0, 1,
                    1, 0,  0, 1,  1, 1,
                                  
                    0, 1,  0, 0,  1, 0,
                    1, 1,  0, 1,  1, 0,
                                  
                    1, 0,  0, 0,  0, 1,
                    1, 0,  0, 1,  1, 1,
                                  
                    0, 1,  0, 0,  1, 0,
                    1, 1,  0, 1,  1, 0,
                                  
                    1, 0,  0, 0,  0, 1,
                    1, 0,  0, 1,  1, 1,
                ],
            });
        },
    });
});

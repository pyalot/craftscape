/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

vertex:
    uniform mat4 proj, view;
    uniform sampler2D heights;

    attribute vec2 position, texcoord;

    varying float depth;
    
    void main(){
        float y = texture2D(heights, texcoord).x;
        vec4 pos = vec4(position.x, y, -position.y, 1.0);
        vec4 eye_pos = view * pos;
        depth = eye_pos.z;
        gl_Position = proj * eye_pos;
    }

fragment:
    varying float depth;
    void main(){
        if(gl_FrontFacing){
            gl_FragColor = vec4(depth, depth, depth, 1.0);
        }
        else{
            gl_FragColor = vec4(100.0, 100.0, 100.0, 1.0);
        }
    }

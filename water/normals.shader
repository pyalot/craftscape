/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

vertex:
    attribute vec2 position;
    void main(){
        gl_Position = vec4(position, 0.0, 1.0);
    }

fragment:
    uniform vec2 viewport;
    uniform sampler2D ground, water;
    
    vec3 get(float x, float y){
        vec2 uv = (gl_FragCoord.xy+vec2(x,y))/viewport; 
        float g = texture2D(ground, uv).x;
        float w = texture2D(water, uv).x;
        float h = g+w;
        return vec3(uv.x, h, uv.y);
    }

    vec3 getn(vec3 pos, float x, float y){
        vec3 v = get(x, y) - pos;
        vec3 perp = cross(vec3(0.0, 1.0, 0.0), v);
        return normalize(cross(v, perp));
    }

    void main(){
        vec3 pos = get(0.0, 0.0);
        vec3 normal =  normalize((
            getn(pos, -1.0,  1.0) +
            getn(pos,  0.0,  1.0) +
            getn(pos,  1.0,  1.0) +
            getn(pos, -1.0,  0.0) +
            getn(pos,  1.0,  0.0) +
            getn(pos, -1.0, -1.0) +
            getn(pos,  0.0, -1.0) +
            getn(pos,  1.0, -1.0)
        )/8.0);
        gl_FragColor = vec4(normal, 1.0);
    }

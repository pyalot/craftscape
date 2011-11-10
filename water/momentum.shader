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
    uniform sampler2D current, last, ground;
    uniform vec2 viewport;

    vec4 get(sampler2D src, float x, float y){
        return texture2D(src, (gl_FragCoord.xy+vec2(x,y))/viewport);
    }
    
    vec3 exchange(float g1, vec3 l1, vec3 c1, float x, float y){
        float g2 = get(ground, x, y).x;
        vec3 c2 = get(current, x, y).xyz;
        float change = (g2+c2.x) - (g1+l1.x);
        change = clamp(change*1.00, -c1.x*0.25, c2.x*0.25);
        return vec3(change, vec2(-x*change, -y*change));
    }

    void main(void){
        float g = get(ground, 0.0, 0.0).x;
        vec3 l = get(last, 0.0, 0.0).xyz;
        vec3 c = get(current, 0.0, 0.0).xyz;

        vec3 v = (
            exchange(g, l, c,  1.0,  0.0) +
            exchange(g, l, c, -1.0,  0.0) +
            exchange(g, l, c,  0.0,  1.0) +
            exchange(g, l, c,  0.0, -1.0)
        )*vec3(0.25, 0.25, 0.25);
        
        vec3 n = c + v;
        gl_FragColor = vec4(n, 1.0);
    }

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
    uniform sampler2D ground, water;
    uniform vec2 viewport;
    uniform float factor;

    vec4 get(sampler2D source, float x, float y){
        return texture2D(source, (gl_FragCoord.xy+vec2(x,y))/viewport);
    }
        
    float tf = 0.0015;
    float tm = 0.5;

    void main(void){
        vec4 g = get(ground, 0.0, 0.0);
        vec3 w = get(water, 0.0, 0.0).xyz;

        float erroded = (length(w.yz)*0.000005)/(w.x+0.001)*factor;
        erroded /= 1.0 + g.z*300.0;
        g.y -= erroded;
        g.z += erroded;

        vec3 w_left    = get(water, -1.0,  0.0).xyz;
        vec3 w_right   = get(water,  1.0,  0.0).xyz;
        vec3 w_top     = get(water,  0.0,  1.0).xyz;
        vec3 w_bot     = get(water,  0.0, -1.0).xyz;
        
        vec4 g_left    = get(ground, -1.0,  0.0);
        vec4 g_right   = get(ground,  1.0,  0.0);
        vec4 g_top     = get(ground,  0.0,  1.0);
        vec4 g_bot     = get(ground,  0.0, -1.0);
        
        float soil_transported_off = (min(abs(w.y*tf/(w.x+0.001)), tm) + min(abs(w.z*tf/(w.x+0.001)), tm))*g.z;
        float soil_transported_in = (
            clamp(w_left.y*tf/(w_left.x+0.001), 0.0, tm) * g_left.z +
            clamp(-w_right.y*tf/(w_right.x+0.001), 0.0, tm) * g_right.z +
            clamp(-w_top.z*tf/(w_top.x+0.001), 0.0, tm) * g_top.z +
            clamp(w_bot.z*tf/(w_bot.x+0.001), 0.0, tm) * g_bot.z
        );
        g.z += (soil_transported_in - soil_transported_off)*factor;
        g.z = max(0.0, g.z);
        g.x = g.y + g.z;

        gl_FragColor = g;
    }

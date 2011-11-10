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
    uniform sampler2D water;
    uniform vec2 viewport, screen, mousepos;
    uniform float rain, evaporate, create, editsize;
    
    uniform mat4 inv_view, inv_proj;
    uniform mat3 inv_rot;
    
    vec2 get(float x, float y){
        return texture2D(water, (gl_FragCoord.xy+vec2(x,y))/viewport).yz;
    }
    
    vec3 get_world_normal(vec2 coord){
        vec2 frag_coord = coord/screen;
        frag_coord = (frag_coord-0.5)*2.0;
        vec4 device_normal = vec4(frag_coord, 0.0, 1.0);
        vec3 eye_normal = normalize((inv_proj * device_normal).xyz);
        vec3 world_normal = normalize(inv_rot*eye_normal);
        return world_normal;
    }

    void main(void){
        vec2 uv = gl_FragCoord.xy/viewport;
        
        vec3 mousevec = get_world_normal(mousepos);
        vec4 eyepos = inv_view * vec4(0.0, 0.0, 0.0, 1.0);
        float u = dot(vec3(0.0, 1.0, 0.0), -eyepos.xyz)/dot(vec3(0.0, 1.0, 0.0), mousevec);
        vec3 intersection = eyepos.xyz + mousevec * u;
        vec3 position = vec3(uv.x-0.5, 0.0, -uv.y+0.5);
        float dist = distance(position, intersection)*pow(editsize, 3.0);
        float s = smoothstep(1.0, 0.0, dist);

        vec3 w = texture2D(water, uv).xyz;
        w.x += 0.00000005*rain;
        w.x *= mix(1.0, 0.999925, evaporate);
        w.x += s * create * 0.0001;
        w.x = clamp(w.x, 0.0, 1.0);
        w.yz = (
            get(-1.0, -1.0)*1.0    + get(0.0, -1.0)*1.4    + get(1.0, -1.0)*1.0 +
            get(-1.0,  0.0)*1.4     + w.yz*300.0              + get(1.0, -1.0)*1.4 +
            get(-1.0, -1.0)*1.0    + get(0.0, -1.0)*1.4    + get(1.0, -1.0)*1.0
        )*0.98*(1.0/(300.0+1.4*4.0+4.0));
        gl_FragColor = vec4(w, 1.0);
    }

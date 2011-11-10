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
    uniform vec2 viewport, shadowsize;
    uniform sampler2D heights, shadows, normals;
    uniform mat4 view, proj;
    
    vec2 off = vec2(1.0)/shadowsize;
    
    vec3 get(float x, float y){
        vec2 uv = (gl_FragCoord.xy+vec2(x,y))/viewport; 
        float h = texture2D(heights, uv).x;
        return vec3(uv.x-0.5, h, -uv.y+0.5);
    }

    float shadowed(float depth1, vec2 center, float x, float y){
        float depth2 = texture2D(shadows, center + off*vec2(x, y)).x;
        return smoothstep(1.0, 0.0, (depth2 - depth1-0.0001)*100.0);
    }

    void main(){
        vec4 pos = vec4(get(0.0, 0.0), 1.0);
        vec4 eye = view * pos;
        vec4 device = proj * view * pos;
        vec3 device_normal = device.xyz / device.w;
        vec2 uv = (device_normal.xy+1.0)*0.5;
        float depth1 = eye.z;

        //float depth2 = texture2D(shadows, uv).x;
        float s = (
            shadowed(depth1, uv,  0.0,  0.0) +
            shadowed(depth1, uv,  1.0,  0.0) +
            shadowed(depth1, uv, -1.0,  0.0) +
            shadowed(depth1, uv,  0.0,  1.0) +
            shadowed(depth1, uv,  0.0, -1.0) +
            shadowed(depth1, uv, -1.0, -1.0) +
            shadowed(depth1, uv,  1.0, -1.0) +
            shadowed(depth1, uv, -1.0,  1.0) +
            shadowed(depth1, uv,  1.0,  1.0)
        )/9.0;

        vec4 normal = texture2D(normals, gl_FragCoord.xy/viewport);
        normal.z *= -1.0;
        normal.xyz = normalize(normal.xyz);
        normal = view * normal;

        float c = dot(normalize(normal.xyz), vec3(0.0, 0.0, 1.0)) > 0.1 ? 1.0 : 0.0;
        float f = min(s, c);
       
        gl_FragColor = vec4(f, f, f, 1.0);
    }

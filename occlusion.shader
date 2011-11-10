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
    float pi = 3.14159265358979323846;

    uniform vec2 viewport;
    uniform sampler2D heights, normals;
    
    vec3 get(float x, float y){
        vec2 uv = (gl_FragCoord.xy+vec2(x,y))/viewport; 
        float h = texture2D(heights, uv).x;
        return vec3(uv.x, h, uv.y);
    }

    #define raylength 10.0

    void main(){
        float occlusion = 0.0;
        vec3 pos = get(0.0, 0.0);
        vec3 normal = texture2D(normals, gl_FragCoord.xy/viewport).xyz;
        vec3 tangent = normalize(cross(normal, vec3(0.0, 0.0, 1.0)));
        vec3 bitangent = normalize(cross(tangent, normal));
        mat3 orthobasis = mat3(tangent, normal, bitangent);

        for(int i=1; i<33; i++){
            float s = float(i)/32.0;
            float a = sqrt(s*512.0);
            float b = sqrt(s);
            float x = sin(a)*b*raylength;
            float y = cos(a)*b*raylength;
            vec3 sample_uv = orthobasis * vec3(x, 0.0, y);
            vec3 sample_pos = get(sample_uv.x, sample_uv.z);
            vec3 sample_dir = normalize(sample_pos - pos);
            float lambert = clamp(dot(normal, sample_dir), 0.0, 1.0);
            float dist_factor = 0.23/sqrt(length(sample_pos - pos));
            occlusion += dist_factor*lambert;
        }
        float incident = 1.0 - occlusion/32.0;
        gl_FragColor = vec4(incident, incident, incident, 1.0);
    }

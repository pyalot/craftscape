/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

vertex:
    uniform mat4 proj, view;
    uniform sampler2D heights;
    uniform vec2 viewport;

    attribute vec2 position;
    attribute vec2 texcoord;
    attribute vec3 barycentric;
    
    varying vec2 uv;
    varying vec3 bc, v_position;

    const float pi = 3.1415926535897931;
    const float pih = pi*0.5;
               
    void main(){
        uv = texcoord;
        bc = barycentric;
        float y = texture2D(heights, texcoord).x;
        v_position = (view * vec4(position.x, y, -position.y, 1.0)).xyz;
        gl_Position = proj * view * vec4(position.x, y, -position.y, 1.0);
    }

fragment:
    uniform sampler2D heights, normals, occlusions, shadowmap, water;
    uniform sampler2D rock, rock_normals;
    uniform sampler2D grass, grass_normals;
    uniform vec2 mousepos, viewport;
    uniform mat4 inv_proj, inv_view;
    uniform mat3 inv_rot;
    uniform float editsize;

    varying vec2 uv;
    varying vec3 bc, v_position;
    
    vec3 get_world_normal(vec2 coord){
        vec2 frag_coord = coord/viewport;
        frag_coord = (frag_coord-0.5)*2.0;
        vec4 device_normal = vec4(frag_coord, 0.0, 1.0);
        vec3 eye_normal = normalize((inv_proj * device_normal).xyz);
        vec3 world_normal = normalize(inv_rot*eye_normal);
        return world_normal;
    }

    struct SHC{
        vec3 L00, L1m1, L10, L11, L2m2, L2m1, L20, L21, L22;
    };

    SHC beach = SHC(
        vec3( 0.6841148,  0.6929004,  0.7069543),
        vec3( 0.3173355,  0.3694407,  0.4406839),
        vec3(-0.1747193, -0.1737154, -0.1657420),
        vec3(-0.4496467, -0.4155184, -0.3416573),
        vec3(-0.1690202, -0.1703022, -0.1525870),
        vec3(-0.0837808, -0.0940454, -0.1027518),
        vec3(-0.0319670, -0.0214051, -0.0147691),
        vec3( 0.1641816,  0.1377558,  0.1010403),
        vec3( 0.3697189,  0.3097930,  0.2029923)
    );

    vec3 shLight(vec3 normal, SHC l){
        float x = normal.x;
        float y = normal.y;
        float z = normal.z;

        const float C1 = 0.429043;
        const float C2 = 0.511664;
        const float C3 = 0.743125;
        const float C4 = 0.886227;
        const float C5 = 0.247708;

        return (
            C1 * l.L22 * (x * x - y * y) +
            C3 * l.L20 * z * z +
            C4 * l.L00 -
            C5 * l.L20 +
            2.0 * C1 * l.L2m2 * x * y +
            2.0 * C1 * l.L21  * x * z +
            2.0 * C1 * l.L2m1 * y * z +
            2.0 * C2 * l.L11  * x +
            2.0 * C2 * l.L1m1 * y +
            2.0 * C2 * l.L10  * z
        );
    }
    
    vec3 Kr = vec3(0.18867780436772762, 0.4978442963618773, 0.6616065586417131); // air
    vec3 absorb(float dist, vec3 color, float factor){
        return color-color*pow(Kr, vec3(factor/dist));
    }
   
    void main(){
        vec3 base_normal = normalize(texture2D(normals, uv).xyz);
        vec3 tangent = normalize(cross(base_normal, vec3(0.0, 0.0, 1.0)));
        vec3 bitangent = normalize(cross(tangent, base_normal));
        mat3 orthobasis = mat3(tangent, base_normal, bitangent);

        vec3 mousevec = get_world_normal(mousepos);
        vec4 eyepos = inv_view * vec4(0.0, 0.0, 0.0, 1.0);
        float u = dot(vec3(0.0, 1.0, 0.0), -eyepos.xyz)/dot(vec3(0.0, 1.0, 0.0), mousevec);
        vec3 intersection = eyepos.xyz + mousevec * u;
        float dist = distance((inv_view * vec4(v_position, 1.0)).xz, intersection.xz)*pow(editsize, 3.0);
        vec3 selection;
        if(dist > mix(0.99, 0.25, editsize/20.0) && dist < 1.0){
            selection = vec3(0.12, 0.92, 0.0);
        }
        else{
            selection = vec3(1.0, 1.0, 1.0);
        }
      
        vec3 w = texture2D(water, uv).xyz;
        float rock_factor = 20.0;
        //vec3 rock_color = pow(texture2D(rock, uv*rock_factor).rgb, vec3(0.5)) * 1.5;
        vec3 rock_color = texture2D(rock, uv*rock_factor).rgb * 0.8;
        vec3 rock_normal = orthobasis * normalize((texture2D(rock_normals, uv*rock_factor).xyz-0.5)*vec3(2.0, 3.0, 2.0));
        
        float grass_factor = 8.0;
        vec3 grass_color = texture2D(grass, uv*grass_factor).rgb;
        vec3 grass_normal = orthobasis * normalize((texture2D(grass_normals, uv*grass_factor).xyz-0.5)*vec3(2.0, 1.0, 2.0));

        vec3 dirt = vec3(85.0/255.0, 34.0/255.0, 0.0);
        vec3 soil = mix(grass_color, dirt, sqrt(clamp(w.x/0.0003+length(w.yz)/0.015, 0.0, 1.0)));
        
        vec4 ground = texture2D(heights, uv);
        float mix_factor = clamp(ground.z*500.0, 0.0, 1.0);
        vec3 color = mix(rock_color, soil, mix_factor).xyz;
        vec3 normal = mix(rock_normal, grass_normal, mix_factor).xyz;

        float occlusion = mix(0.0, 1.0, texture2D(occlusions, uv).x);
        float shadowed = mix(0.3, 1.0, texture2D(shadowmap, uv).x);
        vec3 diffuse = shLight(normal, beach);
        vec3 exident = diffuse*occlusion*shadowed*color;
        float d = length(v_position);
        vec3 incident = absorb(d, exident*selection, 2.5) + pow(Kr*d*0.7, vec3(2.0));

        gl_FragColor = vec4(pow(incident, vec3(1.0/1.8)), 1.0);
    }

/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

vertex:
    uniform mat4 proj, view;
    uniform sampler2D heights, water_heights;

    attribute vec2 position, texcoord;
    attribute vec4 cell_uv;

    varying float h;
    varying vec2 uv;
    varying vec4 v_position, v_cell_uv;

    void main(){
        float h1 = texture2D(heights, texcoord).x;
        float h2 = texture2D(water_heights, texcoord).x;
        h = h2;
        vec4 pos = view * vec4(position.x, h1+h2-0.00000, -position.y, 1.0);
        gl_Position = proj * pos;
        uv = texcoord;
        v_position = pos;
        v_cell_uv = cell_uv;
    }

fragment:
    varying float h;
    varying vec2 uv;
    varying vec4 v_position, v_cell_uv;

    uniform vec2 viewport, mousepos;
    uniform mat3 inv_rot;
    uniform mat4 inv_proj, lightview, inv_view;
    uniform float editsize;
    uniform sampler2D water_heights, normals, detail_normals, shadowmap, flows;

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

    vec3 getnormal(){
        float s = 1.0/128.0;

        //vec2 off = mod(uv, s);
        vec2 off = v_cell_uv.zw*s;

        //vec2 center_uv = uv-off+1.0/64.0;
        vec2 center_uv = v_cell_uv.xy+1.0/2048.0;
        vec2 right_uv = center_uv + vec2(s, 0.0);
        vec2 top_uv = center_uv + vec2(0.0, s);
        vec2 topright_uv = center_uv + vec2(s, s);

        vec2 center_pos = texture2D(flows, center_uv).xy;
        vec2 right_pos = texture2D(flows, right_uv).xy;
        vec2 top_pos = texture2D(flows, top_uv).xy;
        vec2 topright_pos = texture2D(flows, topright_uv).xy;

        vec3 center = normalize(texture2D(detail_normals, uv*32.0-center_pos*2.0).xyz*2.0-1.0);
        vec3 right = normalize(texture2D(detail_normals, uv*32.0-right_pos*2.0).xyz*2.0-1.0);
        vec3 top = normalize(texture2D(detail_normals, uv*32.0-top_pos*2.0).xyz*2.0-1.0);
        vec3 topright = normalize(texture2D(detail_normals, uv*32.0-topright_pos*2.0).xyz*2.0-1.0);

        vec3 normal1 = mix(center, right, off.x/s);
        vec3 normal2 = mix(top, topright, off.x/s);
        vec3 normal = mix(normal1, normal2, off.y/s);
        return normalize(normal*vec3(1.0, 0.2, 1.0));
    }
    
    void main(){
        vec3 w = texture2D(water_heights, uv).xyz;
        vec2 c = w.yz/(w.x+0.001)+0.5;
        
        vec3 mousevec = get_world_normal(mousepos);
        vec4 eyepos = inv_view * vec4(0.0, 0.0, 0.0, 1.0);
        float u = dot(vec3(0.0, 1.0, 0.0), -eyepos.xyz)/dot(vec3(0.0, 1.0, 0.0), mousevec);
        vec3 intersection = eyepos.xyz + mousevec * u;
        float dist = distance((inv_view * v_position).xz, intersection.xz)*pow(editsize, 3.0);
        vec3 selection;
        if(dist > mix(0.99, 0.25, editsize/20.0) && dist < 1.0){
            selection = vec3(0.12, 0.92, 0.0);
        }
        else{
            selection = vec3(1.0, 1.0, 1.0);
        }

        float speed_factor = clamp(length(w.yz)/0.02, 0.0, 1.0);
        float depth_factor = clamp(w.x/0.001, 0.0, 1.0);

        vec3 base_normal = normalize(texture2D(normals, uv).xyz);
        vec3 tangent = normalize(cross(base_normal, vec3(0.0, 0.0, 1.0)));
        vec3 bitangent = normalize(cross(tangent, base_normal));
        mat3 orthobasis = mat3(tangent, base_normal, bitangent);
        vec3 detail_normal = orthobasis * getnormal();
        vec3 normal = normalize(mix(base_normal*0.5+detail_normal*0.5, detail_normal, speed_factor));
        normal = normalize(mix(normal, base_normal, sqrt(clamp(w.x/0.0075, 0.0, 1.0))*0.75));

        vec3 lightdir = (lightview * vec4(0.0, 0.0, 1.0, 1.0)).xyz;
        vec3 eye_normal = get_world_normal(gl_FragCoord.xy);
        vec3 specular_normal = reflect(eye_normal, normalize(normal * vec3(1.0, 0.35, 1.0)));
        float lambert = pow(max(0.0, dot(specular_normal, lightdir)), 0.5);
        float specular = pow(lambert, 20.0)*0.9;
        vec3 deep = vec3(0.0, 51.0/255.0, 128.0/255.0)*0.5;
        vec3 turbulent = vec3(42.0/255.0, 212.0/255.0, 255.0/255.0)*0.9;

        vec3 color = mix(turbulent, deep, sqrt(clamp(w.x/0.0075, 0.0, 1.0)));
        color = mix(color, vec3(1.0, 1.0, 1.0), clamp(pow(speed_factor*2.0, 3.0), 0.0, 1.0));

        vec3 exident = color * mix(shLight(specular_normal, beach), shLight(normal, beach), 0.75);

        float d = length(v_position.xyz);
        float shadow = texture2D(shadowmap, uv).x;
        vec3 incident = absorb(d, exident*mix(0.45, 1.0, shadow)*selection+specular*shadow, 2.5) + pow(Kr*d*0.7, vec3(2.0));
        
        gl_FragColor = vec4(pow(incident, vec3(1.0/1.8)), depth_factor);
    }

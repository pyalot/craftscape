vertex:
    attribute vec2 position;
    void main(){
        gl_Position = vec4(position, 0.0, 1.0);
    }

fragment:
    uniform sampler2D ground, water;
    uniform vec2 viewport, axis;

    vec2 exchange(vec4 g1, float x, float y){
        vec2 uv = (gl_FragCoord.xy+vec2(x, y))/viewport;
        vec4 g2 = texture2D(ground, uv);
        float diff = (g2.x-g1.x)/4.0;
        float sdiff, gdiff;
        sdiff = clamp(diff, -g1.z/2.0, g2.z/2.0)*0.08;
        if(abs(diff) > 0.001){
            gdiff = diff*0.1;
        }
        else{
            gdiff = 0.0;
        }
        return vec2(gdiff, sdiff);
    }

    void main(void){
        vec2 uv = gl_FragCoord.xy/viewport;
        vec4 g = texture2D(ground, uv);
        vec2 c = (
            exchange(g,  1.0,  0.0) +
            exchange(g, -1.0,  0.0) +
            exchange(g,  0.0,  1.0) +
            exchange(g,  0.0, -1.0)
        );
        gl_FragColor = g + vec4(0.0, c, 0.0);
    }

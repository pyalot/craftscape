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
    uniform sampler2D heights, source;
    uniform vec2 viewport, axis;

    vec3 exchange(float t1, float h1, vec2 off){
        vec2 uv = (gl_FragCoord.xy+off)/viewport;
        float t2 = texture2D(heights, uv).x;
        float h2 = texture2D(source, uv).x;
        float f1 = t1+h1;
        float f2 = t2+h2;
        float diff = (f2-f1)/2.0;
        diff = clamp(diff*0.65, -h1/2.0, h2/2.0);
        return vec3(diff, -off*diff);
    }

    void main(void){
        vec2 uv = gl_FragCoord.xy/viewport;
        float t = texture2D(heights, uv).x;
        vec3 h = texture2D(source, uv).xyz;
        vec3 r = h + exchange(t, h.x, axis) + exchange(t, h.x, -axis);
        gl_FragColor = vec4(r, 1.0);
    }

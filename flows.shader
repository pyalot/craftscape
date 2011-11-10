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
    uniform sampler2D water, flows;
    uniform vec2 viewport;

    void main(void){
        vec2 uv = gl_FragCoord.xy/viewport;
        vec2 pos = texture2D(flows, uv).xy;
        vec3 w = texture2D(water, uv).xyz;
        vec2 vel = (w.yz*0.001)/(w.x*0.1+0.001);
        gl_FragColor = vec4(pos+vel, 0.0, 1.0);
    }

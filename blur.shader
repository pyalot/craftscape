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
    uniform sampler2D source;
    uniform vec2 viewport, axis;

    void main(void){
        vec2 off = axis/viewport;
        vec2 uv = gl_FragCoord.xy/viewport;

        vec4 a = texture2D(source, uv)*0.375;
        vec4 b = texture2D(source, uv+off)*0.3125;
        vec4 c = texture2D(source, uv-off)*0.3125;
        gl_FragColor = a+b+c;
    }

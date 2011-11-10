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
    uniform vec2 viewport;

    void main(void){
        vec2 uv = gl_FragCoord.xy/viewport;
        gl_FragColor = texture2D(source, uv);
    }

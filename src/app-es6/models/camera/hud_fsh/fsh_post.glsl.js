System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // Fragment shader program 
            // fsh_post - color variation of postTarget
            exports_1("uniforms", uniforms = {
                tDiffuse: { type: 't', value: null }
            });
            exports_1("fsh", fsh = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D tDiffuse; 
  varying vec2 vuv;

  void main() {
    // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
    vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

    // paint
    gl_FragColor = texture2D(tDiffuse, vuv); 
    //gl_FragColor += vec4(1.0, 0.0, 0.0, 0.5);
    gl_FragColor.r *= 0.5;
    //gl_FragColor.g *= 0.5;
    //gl_FragColor.b *= 0.5;
    //gl_FragColor.a = 0.5;
  }
`);
        }
    }
});
//# sourceMappingURL=fsh_post.glsl.js.map
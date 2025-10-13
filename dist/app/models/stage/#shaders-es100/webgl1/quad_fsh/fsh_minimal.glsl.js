// fsh_minimal.glsl.ts
// Fragment shader program 
// fsh_minimal - texture map
const uniforms = {
    tDiffuse: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 }
};
const fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      varying vec2 vuv;

      void main() {
        // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
        vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

        // paint
        gl_FragColor = texture2D(tDiffuse, vuv); 
      }`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_minimal.glsl.js.map
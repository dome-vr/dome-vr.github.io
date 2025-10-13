// fsh_texture.glsl.ts
// Fragment shader program 
// fsh_default - texture map
const red_uniforms = {
    tDiffuse: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 },
    uAspect: { type: 'f', value: 1.0 },
    uResolution: { type: 'v2', value: null }
};
const red_fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      uniform float uAspect; 
      uniform vec2 uResolution;
      varying vec2 vuv;

      void main() {

        // texture
        gl_FragColor = texture2D(tDiffuse, vuv); 
      }`;
export { red_fsh, red_uniforms };
//# sourceMappingURL=fsh_texture.glsl.js.map
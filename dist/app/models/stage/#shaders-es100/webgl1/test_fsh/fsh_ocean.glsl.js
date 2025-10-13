// fsh_ocean.glsl.ts
// Fragment shader program 
// fsh_default - texture map
const ocean_uniforms = {
    tDiffuse: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 },
    uAspect: { type: 'f', value: 1.0 },
    uResolution: { type: 'v2', value: null }
};
const ocean_fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      uniform float uAspect; 
      uniform vec2 uResolution;
      varying vec2 vuv;
      int i = 0;

      void main() {

        // paint
        //gl_FragColor = texture2D(tDiffuse, vuv); 
        gl_FragColor = vec4(0.0,1.0,1.0,1.0); 
      }`;
export { ocean_fsh, ocean_uniforms };
//# sourceMappingURL=fsh_ocean.glsl.js.map
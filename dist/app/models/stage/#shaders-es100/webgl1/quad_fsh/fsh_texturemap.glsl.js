// fsh_texturemap.glsl.ts
// Fragment shader program 
const uniforms = {
    tDiffuse: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 },
    uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
};
const fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      varying vec2 vuv;

      void main() {
        // paint
        gl_FragColor = texture2D(tDiffuse, vuv); 
      }`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_texturemap.glsl.js.map
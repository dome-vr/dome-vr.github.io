// fsh_pointcloud2.glsl.ts
// Fragment shader program 
// fsh_default - varying vAlpha
const uniforms = {
    uColor: { type: 'v3', value: new THREE.Color(0xff0000) }
};
const fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform vec3 uColor; 
      varying float vAlpha;

      void main() {
        gl_FragColor = vec4(uColor, vAlpha); 
      }`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_pointcloud3.glsl.js.map
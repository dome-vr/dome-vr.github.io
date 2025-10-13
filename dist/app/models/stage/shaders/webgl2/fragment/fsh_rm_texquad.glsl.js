// fsh_rm_texquad.glsl.ts
// rm-quad NDC [-1,1]x[-1,1] texture map
// Fragment shader program 
const uniforms = {
    tDiffuse: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 }
};
const fsh = `//#version 300 es     //written in by three.js compiler 

      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      in vec2 vuv;
      /* out vec4 pc_fragColor; */    //pre-defined by three.js compiler 


      void main() {
        // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
        vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

        // paint
        pc_fragColor = texture2D(tDiffuse, vuv); 
      }`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_rm_texquad.glsl.js.map
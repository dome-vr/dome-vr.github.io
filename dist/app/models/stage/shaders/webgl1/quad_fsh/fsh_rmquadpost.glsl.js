// fsh_texturemap.glsl.ts
// Fragment shader program 
//uniform sampler2D tex;
//in vec2 texture_coordinates;
//
//void main()
//{
//  vec3 col = texture2D(tex, texture_coordinates);
//
//  gl_FragColor = vec4(col.b, col.r, col.g, 1.0);
//}
import * as THREE from '../../../../../../../node_modules/three/build/three.module.js';
const uniforms = {
    tDiffuse: { type: 't', value: null },
    tDiffusePost: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 },
    uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
};
const fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform sampler2D tDiffusePost; 
      uniform float uTime; 
      varying vec2 vuv;


      void main() {
        vec4 color = texture(tDiffuse, vuv);
        vec4 colorPost = texture(tDiffusePost, vuv);

        // paint
        //gl_FragColor = vec4(colorPost.rgba);     
        gl_FragColor = vec4(color.rgba + colorPost.gbra);     
      }`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_rmquadpost.glsl.js.map
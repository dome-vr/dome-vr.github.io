// fsh_sky.glsl.ts
// Fragment shader program 
// fsh_default - texture map
import * as THREE from '../../../node_modules/three/build/three.module.js';

const tl = new THREE.TextureLoader();

const uniforms_sky = {
    uTime: { type: 'f', value: 0.0 },
    uAspect: { type: 'f', value: 1.0 },
    uResolution: { type: 'v2', value: null }
};
const fsh_sky = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform float uTime; 
      uniform float uAspect; 
      uniform vec2 uResolution;
      varying vec2 vuv;

      void main() {
        // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
        vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

        // paint
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);     //blue;
      }`;
export { fsh_sky, uniforms_sky };
//# sourceMappingURL=fsh_default.glsl.js.map

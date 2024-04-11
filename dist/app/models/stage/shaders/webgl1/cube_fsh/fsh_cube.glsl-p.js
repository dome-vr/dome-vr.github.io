// fsh_cube.glsl.ts
// Fragment shader program 
// fsh_cube - texture map
const uniforms = {
    tCube: { type: 'samplerCube', value: '' },
    tFlip: { type: 'float', value: 0.0 },
    opacity: { type: 'float', value: 1.0 },
    time: { type: 'float', value: 0.0 }
};
const fsh = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vWorldPosition;

#include <common>
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform float time;

void main() {

    gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
    gl_FragColor.a *= opacity;
        gl_FragColor.r *= 0.5;
        gl_FragColor.b *= 1.2;
}`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_cube.glsl-p.js.map
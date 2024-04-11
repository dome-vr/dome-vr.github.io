// fsh_cube_sin.glsl.ts
// Fragment shader program 
// fsh_cube - texture map
const uniforms = {
    tCube: { type: 'samplerCube', value: '' },
    tFlip: { type: 'float', value: 0.0 },
    opacity: { type: 'float', value: 1.0 },
    uTime: { type: 'float', value: 0.0 }
};
const fsh = `
#include <common>
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform float uTime;

varying vec3 vWorldPosition;


void main() {
    gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
    gl_FragColor.a *= opacity;
    gl_FragColor.r += 0.1*sin(uTime);
    gl_FragColor.b += 0.1*sin(2.0*uTime);
}`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_cube_sin.glsl.js.map
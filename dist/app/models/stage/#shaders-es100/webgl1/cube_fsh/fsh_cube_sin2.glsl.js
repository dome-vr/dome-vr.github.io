// fsh_cube_sin2.glsl.ts
// Fragment shader program 
// fsh_cube - texture map
const uniforms = {
    tCube: { type: 'samplerCube', value: '' },
    tFlip: { type: 'float', value: 0.0 },
    opacity: { type: 'float', value: 1.0 },
    uTime: { type: 'float', value: 0.0 }
};
const fsh = `

varying vec3 vWorldPosition;

#include <common>
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform float uTime;


void main() {
    gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
    gl_FragColor.a *= opacity;
    gl_FragColor.r += 0.2*sin(uTime);
    gl_FragColor.b += 0.1*sin(2.0*uTime);
}`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_cube_sin2.glsl.js.map
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // Fragment shader program 
            // fsh_cube - texture map
            exports_1("uniforms", uniforms = {
                tCube: { type: 'samplerCube', value: '' },
                tFlip: { type: 'float', value: 0.0 },
                opacity: { type: 'float', value: 1.0 },
                uTime: { type: 'float', value: 0.0 }
            });
            exports_1("fsh", fsh = `
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
}`);
        }
    }
});
//# sourceMappingURL=fsh_cube_sin.glsl.js.map
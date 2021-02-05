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
                time: { type: 'float', value: 0.0 }
            });
            exports_1("fsh", fsh = `

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
}`);
        }
    }
});
//# sourceMappingURL=fsh_cube.glsl.js.map
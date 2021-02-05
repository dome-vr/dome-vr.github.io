System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var vsh;
    return {
        setters:[],
        execute: function() {
            // Vertex shader program 
            // vsh_default - texture map
            exports_1("vsh", vsh = `
      varying vec2 vuv;
      void main() {
        gl_Position = vec4(position.xy, 1.0, 1.0);
        vuv = uv;
      }
      `);
        }
    }
});
//# sourceMappingURL=vsh_default.glsl.js.map
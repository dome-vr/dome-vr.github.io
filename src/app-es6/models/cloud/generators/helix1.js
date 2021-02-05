System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var helix1;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // helix1
            exports_1("helix1", helix1 = (state) => {
                const TWOPI = 2 * Math.PI;
                var radius = 0.3 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'];
                for (var i = 0; i < particles; i++) {
                    var p = i / particles;
                    vertices.push(radius * Math.cos(p * TWOPI), 2 * p * radius - 300, radius * Math.sin(p * TWOPI));
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=helix1.js.map
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var helix2;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // helix2
            exports_1("helix2", helix2 = (state) => {
                const TWOPI = 2 * Math.PI;
                var radius = 0.6 * state['cloudRadius'], // 600
                vertices = [], particles = state['particles'], i, j, p;
                for (j = 0; j < particles; j++) {
                    if (j % 2 === 0) {
                        i = j;
                    }
                    else {
                        i = particles / 2.0 + j;
                    }
                    p = i / particles;
                    vertices.push(radius * Math.cos(3 * p * TWOPI), 2 * p * radius - 600, radius * Math.sin(3 * p * TWOPI));
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=helix2.js.map
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var sphere2;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere2
            exports_1("sphere2", sphere2 = (state) => {
                var radius = 0.75 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'];
                for (var i = 0; i < particles; i++) {
                    let phi = 3 * Math.acos(-1 + (2 * i) / particles), theta = 0.5 * Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=sphere2.js.map
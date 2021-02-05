System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var sphere3;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere3
            exports_1("sphere3", sphere3 = (state) => {
                var radius = 0.3 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'], i;
                for (var i = 0; i < particles; i++) {
                    let phi = Math.acos(-1 + (2 * i) / particles), theta = Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), 2 * radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=sphere3.js.map
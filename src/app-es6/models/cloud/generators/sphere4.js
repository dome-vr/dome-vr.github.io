System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var sphere4;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere4
            exports_1("sphere4", sphere4 = (state) => {
                var radius = 0.3 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'], i;
                for (var i = 0; i < particles; i++) {
                    let phi = Math.acos(-1 + (2 * i) / particles), theta = 0.5 * Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(0.5 * radius * Math.cos(theta) * Math.sin(phi), 4 * radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=sphere4.js.map
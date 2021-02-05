System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var sphere1;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere1
            exports_1("sphere1", sphere1 = (state) => {
                var radius = 0.75 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'];
                for (var i = 0; i < particles; i++) {
                    let phi = Math.acos(-1 + (2 * i) / particles), theta = Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=sphere1.js.map
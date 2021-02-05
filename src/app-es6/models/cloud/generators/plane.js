System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var plane;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // plane
            exports_1("plane", plane = (state) => {
                var vertices = [], amountX = 12, amountZ = 16, separation = 0.15 * state['cloudRadius'], //150 
                offsetX = ((amountX - 1) * separation) / 2, offsetZ = ((amountZ - 1) * separation) / 2;
                for (var i = 0; i < state['particles']; i++) {
                    var x = (i % amountX) * separation;
                    var z = Math.floor(i / amountX) * separation;
                    var y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200;
                    vertices.push(x - offsetX, y, z - offsetZ);
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=plane.js.map
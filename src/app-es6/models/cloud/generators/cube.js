System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var cube;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // cube
            exports_1("cube", cube = (state) => {
                var vertices = [], amount = 8, separation = 0.15 * state['cloudRadius'], //150 
                offset = ((amount - 1) * separation) / 2;
                for (var i = 0; i < state['particles']; i++) {
                    var x = (i % amount) * separation;
                    var y = Math.floor((i / amount) % amount) * separation;
                    var z = Math.floor(i / (amount * amount)) * separation;
                    vertices.push(x - offset, y - offset, z - offset);
                }
                return vertices;
            });
        }
    }
});
//# sourceMappingURL=cube.js.map
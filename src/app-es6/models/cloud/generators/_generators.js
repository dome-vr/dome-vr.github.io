// _generators.ts
// imports specific generator functions from models/cloud/generators/*.ts
System.register(['./cube', './helix1', './helix2', './helix3', './plane', './sphere1', './sphere2', './sphere3', './sphere4'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var cube_1, helix1_1, helix2_1, helix3_1, plane_1, sphere1_1, sphere2_1, sphere3_1, sphere4_1;
    var generators;
    return {
        setters:[
            function (cube_1_1) {
                cube_1 = cube_1_1;
            },
            function (helix1_1_1) {
                helix1_1 = helix1_1_1;
            },
            function (helix2_1_1) {
                helix2_1 = helix2_1_1;
            },
            function (helix3_1_1) {
                helix3_1 = helix3_1_1;
            },
            function (plane_1_1) {
                plane_1 = plane_1_1;
            },
            function (sphere1_1_1) {
                sphere1_1 = sphere1_1_1;
            },
            function (sphere2_1_1) {
                sphere2_1 = sphere2_1_1;
            },
            function (sphere3_1_1) {
                sphere3_1 = sphere3_1_1;
            },
            function (sphere4_1_1) {
                sphere4_1 = sphere4_1_1;
            }],
        execute: function() {
            generators = { cube: cube_1.cube,
                helix1: helix1_1.helix1,
                helix2: helix2_1.helix2,
                helix3: helix3_1.helix3,
                plane: plane_1.plane,
                sphere1: sphere1_1.sphere1,
                sphere2: sphere2_1.sphere2,
                sphere3: sphere3_1.sphere3,
                sphere4: sphere4_1.sphere4 };
            exports_1("generators", generators);
        }
    }
});
//# sourceMappingURL=_generators.js.map
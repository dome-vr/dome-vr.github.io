System.register(['../services/mediator', '../models/cloud/generators/_generators'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1, _generators_1;
    var targets, morphTargets, positions, MorphTargets;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            },
            function (_generators_1_1) {
                _generators_1 = _generators_1_1;
            }],
        execute: function() {
            // constants - targets is all names of position generators
            targets = Object.keys(_generators_1.generators);
            // singleton closure-instance variable
            positions = [];
            class MorphTargets {
                // ctor
                constructor() {
                    morphTargets = this;
                } //ctor
                // generate positions array = [x,y,z, ...]
                generate(state) {
                    var vertices = [], requestedTargets = state['morphtargets'] || targets;
                    // generate positions 
                    //    for(let s of targets){
                    //      console.log(`type of generators[${s}] is ${typeof generators[s]}`);
                    //    }
                    for (let t of requestedTargets) {
                        vertices = _generators_1.generators[t](state);
                        //console.log(`vertices = ${vertices}`);
                        mediator_1.mediator.log(`${t} generated vertices has length ${vertices.length}`);
                        for (let i = 0; i < vertices.length; i++) {
                            positions.push(vertices[i]);
                        }
                    }
                    // sanity
                    //mediator.logc(`morphTarget generated positions.l = ${positions.length}`);
                    return positions;
                } //generate
            }
             //MorphTargets
            // enforce singleton export
            if (morphTargets === undefined) {
                morphTargets = new MorphTargets();
            }
            exports_1("morphTargets", morphTargets);
        }
    }
});
//# sourceMappingURL=morphtargets.js.map
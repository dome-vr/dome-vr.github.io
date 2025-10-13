// services/morphtargets.ts  
import { generators } from '../models/stage/actors/cloud/generators/generators.js';
// constants - targets is all names of position generators
const targets = Object.keys(generators);
// closure var instance of MorphTargets
let morphTargets;
const positions = [];
class MorphTargets {
    // ctor
    constructor() {
        morphTargets = this;
    } //ctor
    // generate positions array = [x,y,z, ...]
    // Object.keys(generators):string[] is all names of position generators
    generate(state) {
        let vertices = [], requestedTargets = state['morphtargets'] || targets;
        if (requestedTargets.length === 0) {
            requestedTargets = targets;
        }
        //console.log(`\n\n ((((((((((((( MorphTargets.generate(state):`);
        //console.dir(state);
        //console.log(`requestedTargets:`);
        //console.dir(requestedTargets);
        for (const t of requestedTargets) {
            vertices = generators[t](state);
            //console.log(`vertices = ${vertices}`);
            //console.log(`${t} generated vertices has length ${vertices.length}`);
            for (let i = 0; i < vertices.length; i++) {
                positions.push(vertices[i]);
            }
        }
        // sanity
        //console.logc(`morphTarget generated positions.l = ${positions.length}`);
        return positions;
    } //generate
} //MorphTargets
// enforce singleton export
if (morphTargets === undefined) {
    morphTargets = new MorphTargets();
}
export { morphTargets };
//# sourceMappingURL=morphtargets.js.map
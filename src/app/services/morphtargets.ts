// morphTargets.ts - service 
import {mediator} from '../services/mediator';
import * as generators from '../models/cloud/generators/_generators';


// constants - targets is all names of position generators
const targets:string[] = Object.keys(generators);

// singleton closure-instance variable
var morphTargets:MorphTargets,
    positions:number[] = [];



class MorphTargets {

  // ctor
  constructor(){
    morphTargets = this;
    //console.log(`possible targets = ${targets}`);
  } //ctor


  // generate positions array = [x,y,z, ...]
  generate(state:Object){
    var vertices:number[] = [],
        requestedTargets = state['morphtargets'] || targets;


    // generate positions 
    for(let t of requestedTargets){
      //console.log(`t = ${t}`);
      //console.log(`generators[${t}] = ${generators[t]}`);
      vertices = generators[t](state);
      mediator.log(`${t} generated vertices has length ${vertices.length}`);
      for(let i=0; i<vertices.length; i++){
        positions.push(vertices[i]);
      }
    }

    // sanity
    //mediator.logc(`morphTarget generated positions.l = ${positions.length}`);

    return positions;
  }//generate
}//MorphTargets


// enforce singleton export
if(morphTargets === undefined){
  morphTargets = new MorphTargets();
}
export {morphTargets};

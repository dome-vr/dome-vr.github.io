// morphTargets.ts - service 
import {mediator} from '../services/mediator';
import {generators} from '../models/cloud/generators/_generators';

// constants - targets is all names of position generators
const targets:string[] = Object.keys(generators);

// singleton closure-instance variable
var morphTargets:MorphTargets,
    positions:number[] = [];



class MorphTargets {

  // ctor
  constructor(){
    morphTargets = this;
  } //ctor


  // generate positions array = [x,y,z, ...]
  generate(state:object){
    var vertices:number[] = [],
        requestedTargets = state['morphtargets'] || targets;


    // generate positions 
//    for(let s of targets){
//      console.log(`type of generators[${s}] is ${typeof generators[s]}`);
//    }
    for(let t of requestedTargets){
      vertices = generators[t](state);
      //console.log(`vertices = ${vertices}`);
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

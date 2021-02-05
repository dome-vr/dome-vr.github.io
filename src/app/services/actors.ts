// actors.ts - holds timed actions 
//
// from state/stage.ts
//      actors: function(callback){
//        try{
//          if(state['actors']){
//            actors.create(state['actors'], narrative, callback);
//          }else{
//            callback(null, {});
//          }
//        }
//        catch(e) {
//          mediator.loge(`stage.delta caused error: ${e}`);
//          callback(e, {});
//        }
//      }, 


// transform3d
//import {mediator} from './mediator';
import {transform3d} from './transform3d';


// singleton instance
var actors:Actors;

class Actors {

  create(state:object={}, narrative:Narrative, callback:Function,
         vr:boolean=false){

    var actor:THREE.Object3D;   // actor-instance


    // iterate through actor names-options
    // three cases: _actor = f/t/undefined => create/remove/modify
    // NOTE: _actors:true not needed so _actors ignored if used
    for(let a of Object.keys(state)){       
      if(a === '_actors'){   // obviously skip _actors - not an actor name
        console.log(`key is '_actors'!`);
        continue;
      }
      console.log(`actor-name is a = ${a}`);

      let _actor = state[a]['_actor'];
      // f => remove
      if(_actor === false){             
          if(vr){
            console.log(`_actor=f ~ removing vractor ${a} from vr_scene`);
            narrative.removevrActor(a);
          }else{
            console.log(`_actor=f ~ removing actor ${a} from scene`);
            narrative.removeActor(a);
          }
      }//f=>remove                      


      // options for modify/create
      let options = state[a]['options'];  // defaults are in specific actor 
      console.log(`options:`);
      console.dir(options);

      // undef => modify
      if(_actor === undefined){          
          if(vr){
            actor = narrative.vractors[a];
          }else{
            actor = narrative.actors[a];
          }
          actor.delta(options);
      }//undef=>modify


      // url for create
      let url = state[a]['url'] || '';

      // true => create
      if(_actor){                         
        console.log(`\n!!!!!!!!!!!!!!!!!!!! actor url = ${url}`);            
        System.import(url).then((Actor) => {

          //actor = Actor.create(options);   // actor-instance
          Actor.create(options).then((actor) => {
            console.log(`\n\n!!!!!!!!!!!!!!!!!! imported actor = ${actor}`);
            console.log(`actor ${url} loaded:`);
            console.dir(actor);
            console.log(`actor vr = ${vr}`);
  
            // apply transform3d in options to actor
            if(options && options['transform']){
              console.log(`initial actor.pos = ${actor.position.toArray()}`);
              transform3d.apply(options['transform'], actor);
              console.log(`transf actor.pos = ${actor.position.toArray()}`);
            }
  
            if(vr){
              // fourth var true => add to scene
              console.log(`before add: reportvrActorsInvrScene = ${narrative.reportvrActorsInvrScene()}`);
              console.log(`actor = ${actor}  a = ${a}`);
              narrative.addvrActor(a, actor, true);
              console.log(`after add: reportvrActorsInvrScene = ${narrative.reportvrActorsInvrScene()}`);
            }else{
              console.log(`before add: reportActorsInScene = ${narrative.reportActorsInScene()}`);
              narrative.addActor(a, actor, true);
              console.log(`after add: reportActorsInScene = ${narrative.reportActorsInScene()}`);
            }
  
          });//Actor.create.then
        });//System.import.then
      }//_actor=t => create
      callback(null, {});

    }//for(a of state['actors'])
  }//create
}//Actor


// enforce singleton export
if(actors === undefined){
  actors = new Actors();
}
export {actors};


// action.ts 
import {mediator} from '../services/mediator';

// singleton closure-instance variable
var action:Action;


class Action {

  // ctor
  constructor(){
    action = this;
  } //ctor

  delta(state:object, callback:Function){
    mediator.log(`Action.delta: state = ${state}`);

    // return Queue of timed actions - future: may need additions?
    callback(null, state);
  }

}//Action


// enforce singleton export
if(action === undefined){
  action = new Action();
}
export {action};

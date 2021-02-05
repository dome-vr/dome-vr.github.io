// n_changeState.ts -  test of narrative.changeState

// imports
//import {narrative} from '../../../src/app/narrative';

// exported singleton instance
var n_changeState:N_changeState;


class N_changeState {

  constructor() {
    n_changeState = this;
    //console.log(`n.changeState: narrative = ${narrative}`);
  }

  // n.changeState
}


// enforce singleton export
if(n_changeState === undefined){
  n_changeState = new N_changeState();
}
export {n_changeState};


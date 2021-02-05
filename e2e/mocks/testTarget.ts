// testTarget.ts - mock narrative.targets member
// represents narrative, camera, animation, etc...

// import specific test modules
import {n_exec} from './modules/n_exec';
import {n_changeState} from './modules/n_changeState';



// exported singleton instance
var testTarget:TestTarget;

class TestTarget {

  constructor() {
    testTarget = this;
    console.log(`n_exec = ${n_exec}`);
    console.log(`n_changeState = ${n_changeState}`);
  }

  // n.exec
  f_s(s:string){ n_exec.f_s(s); }
  f_n(n:number){ n_exec.f_n(n); }
  f_o(o:object){ n_exec.f_o(o); }
  f_as(as:[string]){ n_exec.f_as(as); }
  f_an(an:[number]){ n_exec.f_an(an); }
  f_ao(ao:[object]){ n_exec.f_ao(ao); }
  f_a(a,b,c,d){ n_exec.f_a(a,b,c,d); }
  f_a_empty(){ n_exec.f_a_empty(); }

  // n.changeState
}


// enforce singleton export
if(testTarget === undefined){
  testTarget = new TestTarget();
}
export {testTarget};


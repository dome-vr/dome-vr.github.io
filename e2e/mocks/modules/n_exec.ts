// n_exec.ts -  test of narrative.exec

// exported singleton instance
var n_exec:N_exec;


class N_exec {

  constructor() {
    n_exec = this;
  }

  // n.exec
  f_s(s:string){ 
    console.assert(s === 'test', `${s} !== 'test`); 
  }

  f_n(n:number){ 
    console.assert(n === 2017, `${n} !== 2017`); 
  }

  f_o(o:Object){ 
    console.assert(o['a'] === 1, `${o['a']} !== 1`); 
    console.assert(o['b'] === 'foo', `${o['b']} !== 'foo'`); 
  }
  
  f_as(as:string[]){ 
    console.assert(as[0] === 'test0', `${as[0]} !== 'test0'`); 
    console.assert(as[1] === 'test1', `${as[1]} !== 'test1'`); 
  }
  
  f_an(an:number[]){ 
    console.assert(an[0] === 1, `${an[0]} !== 1`); 
    console.assert(an[1] === 2, `${an[1]} !== 2`); 
    console.assert(an[2] === 3, `${an[2]} !== 3`); 
  }
  
  f_ao(ao:object[]){ 
    console.assert(ao[0]['a'] === 0, `${ao[0]['a']} !== 0`); 
    console.assert(ao[0]['b'] === 'foo', `${ao[0]['b']} !== 'foo'`); 
    console.assert(ao[1]['c'] === 1, `${ao[1]['c']} !== 1`); 
    console.assert(ao[1]['d'] === 'coco', `${ao[0]['d']} !== 'coco'`); 
  }
  
  f_a(a,b,c,d){ 
    console.assert(a === 1, `${a} !== 1`); 
    console.assert(b === 2, `${b} !== 2`); 
    console.assert(c === 3, `${c} !== 3`); 
    console.assert(d === 'foo', `${d} !== 'foo'`); 
  }

  f_a_empty(){ 
    console.log(`all 8 n_exec tests passed`); 
  }
}


// enforce singleton export
if(n_exec === undefined){
  n_exec = new N_exec();
}
export {n_exec};


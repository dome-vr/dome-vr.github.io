// narrative-exec.ts

  // execute actions - declarative function invocations
  // message-based function invocation
  // NOTE: structure of action is as follows:
  //   {t/id: string,  // required
  //    f:    string,  // required
  //    one of following seven arg types: // required
  //      s: string
  //      o: object
  //      n: number
  //      a: array of multiple csv-args ([] => no-arg)
  //      as: array of strings
  //      ao: array of objects
  //      an: array of numbers
  //    dt: deltaTime (secs) from prev action
  //    et: ellapsedTime (secs) from prev action - absolute 'schedule'
  //   }
  //
  // NOTE: actions with timestamp are executed iff the elapsed time of the 
  //   application exceeds action.ms. If actions.ms is undefined then the
  //   action is executed upon 'first opportunity' after receipt. (see
  //   narrative.animate() for queue handling.
  // RECALL narrative.animate() - the single point which invokes narrative.exec
  //   does so in a try-catch block to immediately catch throws from exec
  exec(action:Object){
    var target,  // target = narrative.targets[action.t] or actors[action.id] 
        f,       // f = target[action.f]
        arg,     // f(arg) where arg is one of seven types above
        execute = () => {
          try{
            mediator.log(`nar.exec invoking action ${action['f']}`);
            f(arg);
            if(config['record_actions']){
              mediator.record(action);
            }
          }catch(e){
            throw e;
          }
        };

    
    // diagnostic
    //mediator.log(`*** narrative.exec action:`);
    //console.dir(action);

    // empty action - bail
    if(!action || action === {}){
      return;
    }


    // action has target 'id' or 't' giving the execution context 
    // actors(action.id) or narrative.target[action.t]
    if(action['id']){             // @@@ id
      mediator.log(`action['id'] = ${action['id']}`);
      target = narrative.actors[action['id']];      // target object for function f
      if(!target){
        throw new Error(`narrative.actors[${action['id']}] is not defined!`);
      }
    }else{                     // @@@ target-name, not id
      mediator.log(`action['t'] = ${action['t']}`);
      target = narrative.targets[action['t']];
      if(!target){  
        throw new Error(`narrative.targets[${action['t']}] is not defined!`);
      }
    }

    // function
    f = target[action['f']];
    if(!f){  
      throw new Error(`${action['f']} is not defined on target!`);
    }

    // arg
    // RECALL: Array.isArray([]) is true, but typeof [] is 'object'
    if(arg = action['o']){  // Object
      if(typeof arg === 'object'){
        execute();
      }else{
        throw new Error(`typeof action['o'] is NOT 'object'!`);
      }
    }

    if(arg = action['ao']){  // array of Objects
      if(Array.isArray(arg)){
        execute();
      }else{
        throw  new Error(`action['ao'] is NOT an array!`);
      }
    }

    if(arg = action['n']){  // number
      if(typeof arg === 'number'){
        execute();
      }else{
        throw  new Error(`typeof action['n'] is NOT 'number'!`);
      }
    }

    if(arg = action['an']){  // array of numbers
      if(Array.isArray(arg)){
        execute();
      }else{
        throw  new Error(`action['an'] is NOT an array!`);
      }
    }

    if(arg = action['s']){  // string
      if(typeof arg === 'string'){
        execute();
      }else{
        throw  new Error(`typeof action['s'] is NOT 'string'!`);
      }
    }

    if(arg = action['an']){  // array of strings
      if(Array.isArray(arg)){
        execute();
      }else{
        throw  new Error(`action['as'] is NOT an array!`);
      }
    }

    if(arg = action['a']){  // multiple args (<=8 or no-arg) passed in array
      if(Array.isArray(arg)){
        let j,k,l,m,n,o,p,q;
        [j,k,l,m,n,o,p,q] = arg;  // destructure the individual args 
                                  // a 'tail' of 0-8 args may be undefined
        try{
          f(j,k,l,m,n,o,p,q);
        }catch(e){
          throw e;
        }
      }else{
        throw  new Error(`action['a'] is NOT an array!`);
      }
    }
  }//exec

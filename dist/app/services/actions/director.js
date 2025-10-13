// director.ts 
//look (peek) at queue
//keep module actionsTargets
//exec actions
import { queue } from './queue.js';
// singleton closure-instance variable
let director, actionsTargets, narrative; // needed to fetch actors
class Director {
    // ctor
    constructor() {
        director = this;
    } //ctor
    static create() {
        if (director === undefined) {
            director = new Director();
        }
    }
    // actionsTargets are the first name determing the action exec 'signature'
    // narrative reference is needed to fetch actors if action-target (a.t)
    // is not in actionsTargets name-keys
    initialize(config) {
        //console.log(`services/actions/director initializing`);
        actionsTargets = config['actionsTargets'] || {};
        narrative = config['actionsTargets']['narrative'];
    }
    // peek at queued actions - compare current elapsed time to action timestamp
    // execute action if timestamp < et
    // NOTE: called in animation-render loop - so approx every 16ms. (60 fps)
    // NOTE: et is sent in from clock maintaining elapsed rendering time
    // NOTE: queue.peek() returns a Promise so await below is asynchronous, and
    // thus execution returns to the animation-render loop to complete the frame
    async look(et) {
        let done = false;
        while (!done) {
            try {
                const action = await queue.peek(); //promise returned by 
                // queue.peek() resolves to queue.fifo[0] if it exists
                //console.log(`director.exec: action['ms']=${action['ms']} et=${et}`);
                //console.dir(action);
                // if exists, test the timestamp against elapsed time et
                // promise resolved => action exists - so the first check is unneeded
                //console.log(`action['ms']<et is ${action['ms']<et}`);
                if (action && (action['ms'] < et)) {
                    //console.log(`director.exec: action['ms']=${action['ms']} et=${et}`);
                    director.exec(queue.pop());
                }
                else {
                    done = true; // no actions are ready to be executed
                    //console.log(`director.exec: done = ${done}`);
                }
            }
            catch (e) { //promise returned by queue.peek() rejected => queue empty
                done = true;
                break;
            }
        }
    } //look
    // execute action by composing the action execution signature
    // NOTE: a is action - arg is maximally shortened for simplest signatures
    // see models/actions/action.interface.ts
    // NOTE: if a.t does not exist in actionsTargets, then we can assume a.t is an
    // actor name and fetch the actor using narrative.findActor(name:string)
    exec(a) {
        //console.log(`\ndirector.exec: a.t=${a.t} a.f=${a.f} a.a=${a.a} a.o=${a.o} ${a.ms}`);
        // set target
        const names = a.t.split('.'), //possibly multiple exp:'a.b.c'
        name = names[0];
        let target;
        //console.log(`d.exec(): name = ${name}`);
        //console.log(`d.exec(): target = ${actionsTargets[name]}:`);
        //console.dir(actionsTargets[name]);
        if (actionsTargets[name]) {
            target = actionsTargets[name]; // named target in config.actionsTargets list
        }
        else {
            target = narrative['findActor'](name); // name not in actionsTargets => actor
            if (!target) {
                console.error(`name ${name} NOT found in actionsTargets or n.actors!`);
                return;
            }
        }
        // if target has multiple name exp:'a.b.c'
        if (names.length > 1) {
            for (let i = 1; i < names.length; i++) {
                target = target[names[i]]; // append next embedded name
                console.log(`adding ${names[i]} to target now = ${target}`);
                console.dir(target);
            }
        }
        // invoke method on target, or set a property on target by assignment
        if (a.f) { // invoke method a.f <action.function>
            //console.log(`\n\n@@@@@@@@@@director.exec a.f = ${a.f}`);
            //console.log(`@@@@@@@@@@director actionsTargets = ${actionsTargets}:`);
            //console.dir(actionsTargets);
            try {
                switch (a.a) {
                    case 'o': // a.f has type Object arg
                        target[a.f](a.o);
                        break;
                    case 'n': // a.f has type 'primitive' non-object arg 
                        console.log(`a.f = ${a.f}`);
                        console.log(`a.o['arg'] = ${a.o['arg']}`);
                        target[a.f](a.o['arg']);
                        break;
                    case 'v': // a.f has type void arg 
                        target[a.f]();
                        break;
                    case 'm': // multiple args in a.f signature exp: a.f(a,b,c)
                        target[a.f](...a.o['arg']); // a.o[arg] MUST be array of args!
                        break;
                    default:
                        target[a.f](a.o['arg']); // default is single non-Object arg  
                        break;
                }
            }
            catch (e) {
                console.error(`error invoking ${a.t}.${a.f}: ${e}`);
            }
        }
        else { // set property of target by assignment
            try {
                console.log(`\n\n####director.exec`);
                console.log(`a.o:`);
                console.dir(a.o);
                console.log(`a.o length = ${Object.entries(a.o).length}`);
                for (const [n, v] of Object.entries(a.o)) {
                    // n is property name, v is property value
                    console.log(`director.exec setting ${n} = ${v}`);
                    console.log(`director.exec typeof n = ${typeof n}:`);
                    console.log(`director.exec typeof v = ${typeof v}:`);
                    console.log(`director.exec typeof target = ${typeof target}:`);
                    console.dir(target);
                    target[n] = v;
                }
            }
            catch (e) {
                console.error(`error assigning ${a.o} to ${target}: ${e}`);
            }
        }
    } //exec
} //Director
Director.create();
export { director };
//# sourceMappingURL=director.js.map
// narrative-actors-vractors.ts

  // manage actors and scene - adding {name, null} removes named actor
  addActor(name, o, addToScene=true){
    narrative.removeActor(name);
    if(o){
      mediator.log(`addActor: before add sc.ch.l = ${scene.children.length}`);
      o['name'] = name;
      if(addToScene){
        //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! added actor ${name}`);
        scene.add(o);
      }
      narrative.actors[name] = o;
      mediator.log(`addActor: added o.name = ${o.name}`);
      mediator.log(`addActor: after add narrative.actors[${name}] = ${narrative.actors[name]} `);
      mediator.log(`addActor: after add sc.ch.l = ${scene.children.length}`);
    }
  }

  removeActor(name){
    if(narrative.actors[name]){
      mediator.log(`rmActor: before delete sc.ch.l = ${scene.children.length}`);
      mediator.log(`rmActor: removing narrative.actors[${name}] = ${narrative.actors[name]}`);
      scene.remove(narrative.actors[name]);
      delete narrative.actors[name];
      //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! removed actor ${name}`);
      mediator.log(`rmActor: after delete narrative.actors[${name}] = ${narrative.actors[name]} `);
      mediator.log(`rmActor: after delete sc.ch.l = ${scene.children.length}`);
    }
  }

  // report state of actors in scene
  reportActorsInScene(){
    var actors:string[] = [];

    mediator.log(`reportActors: sc.ch.l = ${scene.children.length}`);
    for(let o of scene.children){
      mediator.log(`reportActors: scene contains child ${o.name}`);
      mediator.log(`reportActors: narrative.actors[${o.name}] is ${narrative.actors[o.name]}`);
      if(o !== narrative.actors[o.name]){
        mediator.log(`reportActors: there is name ambiguity!!: scene child ${o.name} is not actor ${o.name}`);
      }
    };
    for(let a of scene.children){
      actors.push(a.name);
    }
    return(actors);
  }


  // vr_scene
  // manage vractors and vr_scene - adding {name, null} removes named actor
  addvrActor(name, o, addToScene=true){
    narrative.removevrActor(name);
    if(o){
      mediator.log(`addvrActor: before add vr_sc.ch.l = ${vr_scene.children.length}`);
      o['name'] = name;
      if(addToScene){
        //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!! added vractor ${name}`);
        vr_scene.add(o);
      }
      narrative.vractors[name] = o;
      mediator.log(`addvrActor: added o.name = ${o.name}`);
      mediator.log(`addvrActor: after add narrative.vractors[${name}] = ${narrative.vractors[name]} `);
      mediator.log(`addvrActor: after add vr_sc.ch.l = ${vr_scene.children.length}`);
    }
  }

  removevrActor(name){
    if(narrative.vractors[name]){
      mediator.log(`rmvrActor: before delete vr_sc.ch.l = ${vr_scene.children.length}`);
      mediator.log(`rmvrActor: removing narrative.vractors[${name}] = ${narrative.vractors[name]}`);
      vr_scene.remove(narrative.vractors[name]);
      delete narrative.vractors[name];
      //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! removed vractor ${name}`);
      mediator.log(`rmvrActor: after delete narrative.vractors[${name}] = ${narrative.vractors[name]} `);
      mediator.log(`rmvrActor: after delete vr_sc.ch.l = ${vr_scene.children.length}`);
    }
  }

  // report state of vractors in vr_scene
  reportvrActorsInvrScene(){
    var actors:string[] = [];

    mediator.log(`reportvrActors: vr_sc.ch.l = ${vr_scene.children.length}`);
    for(let o of vr_scene.children){
      mediator.log(`reportvrActors: vr_scene contains child ${o.name}`);
      mediator.log(`reportvrActors: narrative.vractors[${o.name}] is ${narrative.vractors[o.name]}`);
      if(o !== narrative.vractors[o.name]){
        mediator.log(`reportvrActors: there is name ambiguity!!: vr_scene child ${o.name} is not vractor ${o.name}`);
      }
    };
    for(let a of vr_scene.children){
      actors.push(a.name);
    }
    return(actors);
  }

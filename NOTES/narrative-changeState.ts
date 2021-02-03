// narrative-changeState.ts

  // change component loading and animations according to absolute path, i.e
  // all present and transitional substate template:model pairs are represented
  // in the path argument.
  // Also, the path appears in address bar and is available from state service
  changeState(state) {
    mediator.logc(`*** narrative.changeState()`); 

    // component changes
    async.parallel({
      camera: function(callback){
        try{
          if(state['camera'] !== undefined && Object.keys(state['camera']).length > 0 ){
            //console.log(`^^^^^^^^^^^^^^ narrative CALLING camera.delta!`);
            //console.dir(state['camera']);
            camera.delta(state['camera'], hud, callback);
          }else{
            //console.log(`^^^^^^^^^^^^^^ narrative NOT calling camera.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: camera.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      },

      stage: function(callback){
        try{
          if(state['stage'] !== undefined && Object.keys(state['stage']).length > 0 ){
            //console.log(`^^^^^^^^^^^^^^ narrative CALLING stage.delta!`);
            stage.delta(state['stage'], narrative, callback);
          }else{
            //console.log(`^^^^^^^^^^^^^^ narrative NOT calling stage.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: stage.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      },

      cloud: function(callback){
        try{
          if(state['cloud'] !== undefined && Object.keys(state['cloud']).length > 0 ){
            //console.log(`^^^^^^^^^^^^^^ narrative CALLING cloud.delta!`);
            cloud.delta(state['cloud'], TWEEN, csphere, callback);
          }else{
            //console.log(`^^^^^^^^^^^^^^ narrative NOT calling cloud.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: cloud.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      },

      space: function(callback){
        try{
          if(state['space'] !== undefined && Object.keys(state['space']).length > 0 ){
            //console.log(`^^^^^^^^^^^^^^ narrative CALLING space.delta!`);
            space.delta(state['space'], sgTarget,  callback);
          }else{
            //console.log(`^^^^^^^^^^^^^^ narrative NOT calling space.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: space.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      },

      audio: function(callback){
        try{
          if(state['audio'] !== undefined && Object.keys(state['audio']).length > 0 ){
            //console.log(`^^^^^^^^^^^^^^ narrative CALLING audio.delta!`);
            audio.delta(state['audio'], narrative, callback);
          }else{
            //console.log(`^^^^^^^^^^^^^^ narrative NOT calling audio.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: audio.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      },

      vrstage: function(callback){
        try{
          if(state['vrstage'] !== undefined && Object.keys(state['vrstage']).length > 0 ){
            console.log(`^^^^^^^^^^^^^^ narrative CALLING vrstage.delta!`);
            // fourth var (boolean) true => vrstage in vr_scene
            vrstage.delta(state['vrstage'], narrative, callback, true);
          }else{
            console.log(`^^^^^^^^^^^^^^ narrative NOT calling vrstage.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: vrstage.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      },

      action: function(callback){
        try{
          if(state['action'] !== undefined && Object.keys(state['action']).length > 0 ){
            //console.log(`^^^^^^^^^^^^^^ narrative CALLING action.delta!`);
            action.delta(state['action'], callback);
          }else{
            //console.log(`^^^^^^^^^^^^^^ narrative NOT calling action.delta!`);
            callback(null, null);
          }
        }
        catch(e) {
          mediator.loge(`changeState: action.delta caused error: ${e}`);
          console.trace();
          callback(e, null);
        }
      }
      },//first arg
      function(err, o) {
        if(err){
          mediator.loge("error: " + err);
          console.trace();
          return;
        }
        console.log(`n.changeState result o:`);
        console.dir(o);

        // returned by Camera.delta
        // RECALL: transparent_texture is a texture NOT a url
        if(o['camera']){
          let _p = o['camera']['_post'];
          if(_p !== undefined){
            if(_p === false){
              hud['_post'] = false;
              hud.material.uniforms.tDiffuse.value = transparent_texture;
              hud.material.uniforms.tDiffuse.needsUpdate = true;
            }else{
              hud['_post'] = true;
            }
          }
        }
        
        // returned by Stage.delta
        //mediator.log(`o['stage'] = ${o['stage']}`);
        if(o['stage']){
          // frame
          if(o['stage']['frame']){
            if(o['stage']['frame']['_stats'] === false){
              _stats = false;                                   // hide stats
              stats.dom.style.display = 'none';
            }
            if(o['stage']['frame']['_stats'] === true){
              _stats = true;                                   // show stats
              stats.dom.style.display = 'block';
            }
          }

          // actors returns nothing - adds/removes from narrative.actors

          //skycube
          cube = o['stage']['skycube'];
          mediator.log(`cube = ${cube}`);
          if(cube !== undefined){                // undefined => modify
            if(cube){                            // object => create
              narrative.addActor('skycube', cube);
            }else{                               // null => remove
              narrative.removeActor('skycube');
            }
          }
          // skydome
          dome = o['stage']['skydome'];
          mediator.log(`dome = ${dome}`);
          if(dome !== undefined){                // undefined => modify
            if(dome){                            // object => create
              narrative.addActor('skydome', dome);
            }else{                               // null => remove
              narrative.removeActor('skydome');
            }
          }
          // ambient_light
          ambient_light = o['stage']['ambient_light'];
          mediator.log(`ambient_light = ${ambient_light}`);
          if(ambient_light !== undefined){
            if(ambient_light){
              narrative.addActor('ambient_light', ambient_light);
            }else{
              narrative.removeActor('ambient_light');
            }
          }
          // axes
          axes = o['stage']['axes'];
          mediator.log(`axes = ${axes}`);
          if(axes !== undefined){
            if(axes){
              narrative.addActor('axes', axes);
            }else{
              narrative.removeActor('axes');
            }
          }
          // fog
          fog = o['stage']['fog'];
          mediator.log(`fog = ${fog}`);
          if(fog !== undefined){
            if(fog){
              scene.fog = fog;
            }else{
              scene.fog = null;
            }
          }
        }
    
        // returned by cloud
        //mediator.log(`o['cloud'] = ${o['cloud']}`);
        if(o['cloud']){
          _cloud = o['cloud']['_cloud'] || _cloud;
          mediator.log(`_cloud = ${_cloud}`);
          if(o['cloud']['group']){
            group = o['cloud']['group'];
            mediator.log(`cloud group = ${group}`); 
            if(group){
              if(!cloud_pivot){
                cloud_pivot = new THREE.Object3D();
                cloud_pivot.translateZ(state['cloud']['translateZ'] || -1000);
              }
              cloud_pivot.add(group);
              narrative.addActor('cloud_pivot', cloud_pivot, true);
            }
          }else{
            narrative.removeActor('cloud_pivot');
          }
        }
    
        // returned by Space.delta - don't add to scene!
        //mediator.log(`o['space'] = ${o['space']}`);
        if(o['space']){
          // set render flag if needed
          if(state['space']['_raymarch'] !== undefined){  // t or f
            _raymarch = state['space']['_raymarch'];
            //console.log(`((((((((((((((((( _raymarch set to ${_raymarch}`);
          }
          if(o['space']['rm_shMat']){
            mediator.log(`space returns shMat with fsh = ${o['space']['rm_shMat'].fragmentShader}`);
            mediator.log(`quad.material = ${quad.material}`);
            quad.material = o['space']['rm_shMat'];
            quad.material.needsUpdate = true;   // needed?
          }else{
            console.log(`o['space']['rm_shMat'] is undefined`);
          }
        }


        // returned by VrStage.delta
        //mediator.log(`o['vrstage'] = ${o['vrstage']}`);
        if(o['vrstage']){

          // actors returns nothing - adds/removes from narrative.actors
          for(let actor in narrative.vractors){
            console.log(`@@@@@ vr_scene actor = ${actor}`);
            //for(let p in narrative.vractors[actor]){
            //  console.log(`actor[${p}] = ${narrative.vractors[actor][p]}`);
            //}
          }

          // ambient_light
          vr_ambient_light = o['vrstage']['ambient_light'];
          mediator.log(`vrstage: vr_ambient_light = ${vr_ambient_light}`);
          if(vr_ambient_light !== undefined){
            if(vr_ambient_light){
              narrative.addvrActor('vr_ambient_light', vr_ambient_light, true);
            }else{
              narrative.removevrActor('vr_ambient_light');
            }
          }
          // axes
          vr_axes = o['vrstage']['axes'];
          mediator.log(`vrstage: vr_axes = ${vr_axes}`);
          if(vr_axes !== undefined){
            if(vr_axes){
              narrative.addvrActor('vr_axes', vr_axes, true);
            }else{
              narrative.removevrActor('vr_axes');
            }
          }
          // fog
          vr_fog = o['vrstage']['fog'];
          mediator.log(`vrstage: vr_fog = ${vr_fog}`);
          if(vr_fog !== undefined){
            if(vr_fog){
              vr_scene.fog = vr_fog;
            }else{
              vr_scene.fog = null;
            }
          }
        }


        // returned Action.delta
        //mediator.logc(`o['action'] = ${o['action']}`);
        if(o['action']){
          let _a = o['action'];
          if(Object.keys(_a).length > 0){
            _action = _a['_action'];
            actions = _a['actions'] || [];
            mediator.log(`_a['_deltaTime'] = ${_a['_deltaTime']}`);
            if((_a['_deltaTime'] !== undefined) && _a['_deltaTime'] === false){
              _deltaTime = false;
            }else{
              _deltaTime = _a['_deltaTime'] || _deltaTime;
            }
            mediator.log(`_action= ${_action}`);
            mediator.log(`actions.length = ${actions.length}`); 
            mediator.logc(`_deltaTime= ${_deltaTime}`);
            if(actions.length > 0){
              if(_action === undefined){
                console.log(`_action undef => append actions = ${actions}`);
                for(let a of actions){
                  queue.fifo.push(a);   // undefined => append each action
                }
              }else{
                if(_action){
                  queue.load(actions);      // true => replace
                }else{
                  queue.load([]);           // f => empty
                }
              }
            }
            mediator.log(`queue.fifo.length = ${queue.fifo.length}`);
          }
        }

        // if not started, start clock and begin rendering cycle
        if(animating){return;}
        animating = true;

        // gsap
        TweenMax.ticker.addEventListener('tick', animate);
        console.log(`** starting TweenMax`);
    
        clock.start();
        console.log(`** starting clock`);
        // start render-cycle

      }//2nd arg
    );
    //async.parallel
  }//changeState

// narrative.ts - render, animate
    render = () => {
        // ellapsedTime in seconds - used in simulations
        et = clock.getElapsedTime();
        quad.material.uniforms.uTime.value = et;
        quad.material.uniforms.uTime.needsUpdate = true;

        // simulate camera shot animations
        // * csphere
        // slow examine-rotation
        //csphere.rotation.y = Math.PI * Math.sin(0.1*et);
        //csphere.rotation.x = Math.PI * Math.sin(0.1*et);
        //csphere.rotation.z = Math.PI * Math.sin(0.1*et); //same effect as roll

        // dolly-translation XYZ of csphere
        //csphere.position.x = 0.5*csph_r*Math.sin(.05*et);
        //csphere.position.y = 0.5*csph_r*Math.sin(.05*et);
        //csphere.position.z = 0.5*csph_r*Math.sin(.05*et);

        // * camera-lens
        // pan - 'OK'
        //lens.rotation.y = 0.5*Math.sin(0.1*et); 
        // tilt - 'OK'
        //lens.rotation.x = 0.5*Math.sin(0.1*et); 
        // roll - 'OK'
        //lens.rotation.z = 0.5*Math.sin(0.1*et); 

        // camera fov-zoom
        //lens.fov = 90.0 + 30.0*(Math.sin(.05*et));
        //lens.updateProjectionMatrix();



        // rotate skydome
        if(dome){
          dome.rotation.y = et * 0.01;
        }

        // actors
        for(let actor in narrative.actors){
          let _actor = narrative.actors[actor];
          if(_actor['render']){
            //console.log(`${actor} is rendering`);
            _actor['render'](et);
          }
        }
        for(let actor in narrative.vractors){
          let _actor = narrative.vractors[actor];
          let options = {texture: postTarget.texture}; // could be ignored!
          if(_actor['render']){
            //console.log(`${actor} is rendering`);
            _actor['render'](et, options);
          }
        }

        // animate spritecloud
        if(_cloud){
          //period = 0.1 + Math.random() * 0.1;  //period = 0.001;
          period = 0.01 + 0.01*Math.random();  //period = 0.001;
          for (i = 0, l = group.children.length; i < l; i ++ ) {
            sprite = group.children[ i ];
            material = sprite.material;
            // orig - exceeds screen to much
            //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 1.0;
            // more constrained
            // orig
            //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 0.5;
            //scale = Math.sin( et + sprite.position.z * 0.01 ) * 0.3 + 0.5;
            scale = Math.sin( et + sprite.position.z * 0.1 ) * 0.3 + 0.5;
            imageWidth = 1;
            imageHeight = 1;
            if(material.map && material.map.image && material.map.image.width){
              imageWidth = material.map.image.width;
              imageHeight = material.map.image.height;
            }
  
            material.rotation += period * 0.1;     // ( i / l ); 
            sprite.scale.set( scale * imageWidth, scale * imageHeight, 1.0 );
          }
          // EXPT!!!!! - no group rotation in X or Y
          //group.rotation.x = et * 0.5;
          //group.rotation.y = et * 0.75;
          //group.rotation.z = et * 1.0;
          cloud_pivot.rotation.x = et * 0.2;
          //cloud_pivot.rotation.y = et * 0.4;
          cloud_pivot.rotation.z = et * 0.3; //0.6;
        }
  

        // if quad shading-raymarch
        if(_raymarch){
          // update uVertex = rm_point.position for csphere dolly
          if(!lens.getWorldPosition(vcopy).equals(lens_posp)){
            delta_pos.copy(lens_posp);
            delta_pos.addScaledVector(lens.getWorldPosition(vcopy), -1.0);
  
            // KEY! normalize the lens position dimensions - as if csphere_radius
            // had unit radius - thus scale by 1.0/csphr_r
            delta_pos.divideScalar(csph_r);
  
            rm_point.position.add(delta_pos); // delta_pos = csph_posp-csph.pos
            lens_posp.copy(lens.getWorldPosition(vcopy));
          }
  
          // set rm_pivot counter-rotation to camera-lens for pan/tilt/roll
          // cam_up aspect adjustments to rm-object geometry dimensions
          lens.updateMatrixWorld();
          lens.getWorldQuaternion(world_q);
          if(!world_q.equals(world_qp)){
            // set rm_pivot counter-rotation to camera-lens for pan/tilt/roll
            lens_q.copy(lens.quaternion);
            rm_pivot.quaternion.copy(lens_q.inverse());
  
            // cam_up
            //cam_fwd = camera.getWorldDirection(cam_fwd);
            //cam_right.crossVectors(cam_fwd, cam_up);
            cam_up.copy(lens.up).applyQuaternion(world_q);
            quad.material.uniforms.uCam_up.value = cam_up;
            quad.material.uniforms.uCam_up.needsUpdate = true;
  
            // for next frame
            world_qp.copy(world_q);
          }
  
    
          // sync hud-size to lens.fov
          // update rm-geom scaling due to effects of camera-lens fov-zoom
          // multiply w,h,d by uFovscale
          if(lens.fov !== fovp){
            let s = 2.0 * Math.tan(0.008726646 * lens.fov);  // 0.5 * degr->radians
            hud.scale.set(s,s,1.0);
            lens.updateProjectionMatrix();
  
            quad.material.uniforms.uFovscale.value = fov_initial/lens.fov;
            quad.material.uniforms.uFovscale.needsUpdate = true;
            fovp = lens.fov;
          }
  
          // update rm-geom x,z to compensate for screen aspectratio distortion
          // divide width and depth by uAspect
          if(aspect !== aspectp){
            quad.material.uniforms.uAspect.value = aspect;
            quad.material.uniforms.uAspect.needsUpdate = true;
            aspectp = aspect;
          }
  
          // uVertex
          // update uVertex = rm_point.getWorldPosition = rm_point.position
          // since rm_point is a root-child of scene
          quad.material.uniforms.uVertex.value = rm_point.getWorldPosition(vcopy);
          quad.material.uniforms.uVertex.needsUpdate = true;
        }//if(_raymarch)

        // @@@@render scene to target
        renderer.render(scene, lens, sgTarget);
        quad.material.uniforms.tDiffuse.value = sgTarget.texture;
        quad.material.uniforms.tDiffuse.needsUpdate = true;


        // if _webvr texture vrspace with postTarget.texture 
        // and render vr_scene to webVR output
        // else, render rm_scene to webGL output
        if(_webvr || hud['post']){
          renderer.render(rm_scene, lens, postTarget);

          // post-processing - postTarget.texture to hud ShaderMaterial
          if(hud['post']){
            hud.material.uniforms.tDiffuse.value = postTarget.texture;
            hud.material.uniforms.tDiffuse.needsUpdate = true;
          }

          // webvr - postTarget.texture to vrspace ShaderMaterial/Material
          // turn on vr for third 'webvr' render of vr_scene to webvr display 
          if(_webvr){
            renderer.vr.enabled = true;

            // update ViveControllers
            if(_vive){
              vive_controller1.update();
              vive_controller2.update();
            }

            // FAILS! - rm_scene.add(vr_cubeCamera) also commented out
//            if(_webvr_skybox && _webvr_skybox_dynamic){  
//              vr_cubeCamera.updateCubeMap(renderer, rm_scene);
//              vr_cube.material.uniforms.tCube.value = vr_cubeCamera.renderTarget.texture;
//              vr_cube.material.uniforms.tCube.needsUpdate = true;
//            }
  
            if(_webvr_skycube_faces){
              let i = 0;
              ['bottom','top','left','right','back','front'].map((n) => {
                vr_face[i] = vr_group.getObjectByName(n);
                vr_face[i].material.map = postTarget.texture;
                vr_face[i].material.needsUpdate = true;
              });
            }
            if(_webvr_skycube){
              vr_cube.material.map = postTarget.texture;
              vr_cube.material.needsUpdate = true;
            }
            if(_webvr_skydome){
              vr_dome.material.map = postTarget.texture;
              vr_dome.material.needsUpdate = true;  
            }

            renderer.render(vr_scene, lens);
          }
        }else{
          // else, render rm_scene to webGL output
          renderer.render(rm_scene, lens);
        }
    },//render()


    animate = () => {
      //turn off vr for first two webGL render-passes
      if(_webvr){
        renderer.vr.enabled = false;
      }

      // Leap Motion csphere-controls
      if(controls){
        controls.update();
      }
      
      // delta-t - accumulate
      // _deltaTime = f => dt is ellapsed time
      // _deltaTime = t => dt is reset to 0 after every action exec
      // NOTE: et = clock.getEllapsedTime() not used - except temporarily in 
      //   render for camera animation simulation
      t0 += clock.getDelta();

      // check queue for pending actions - at undefined or at < dt => exec
      if(a = queue.peek()){
        if(_deltaTime){
          at = a['dt'];
        }else{
          at = a['et'];
        }

        if(!at || at <= t0){
          if(_deltaTime){
            t0 = 0; // reset startTime for reset of ellapsedTime t0
          }
          try{
            narrative.exec(queue.pop());
          }catch(e){
            mediator.loge(e);
            console.trace();
          }
        }
      }

      if(_cloud){
        TWEEN.update();}
      if(_stats){
        stats.update();}
      render();
    };


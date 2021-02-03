// narrative.ts l438 - after render()
// animate()

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



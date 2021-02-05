// vr keyboard-map functions
import {mediator} from '../../../services/mediator';



// singleton instance and param object
var map:Keymap,
    c3d:Camera3d,
    csphere:THREE.Mesh,
    camera:THREE.PerspectiveCamera,
    record_shots:boolean,
    a:object;


class Keymap {

  constructor(){
    map = this;
  }

  initialize(_c3d, _csphere, _camera, _record_shots){
    c3d = _c3d;
    csphere = _csphere;
    camera = _camera;
    record_shots = _record_shots;
  }

  keys(e) {
    mediator.log(`keyup: key = ${e.keyCode}`);
    switch(e.keyCode){
      // CENTER/HOME - normalize camera and csphere<br>
      // a - center
      case 65: 
        a = {d:3};
        if(e.shiftKey){ // sh => home
          c3d.home(a);  
         //log({t:'camera3d', f:'home', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'home', a:a});
          }
        }else{          // no-sh => center - no change to zoom
          c3d.center(a);
         //log({t:'camera3d', f:'center', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'center', a:a});
          }
        }
        break;
  

      // ZOOM - EXAMINE
      // z - zoom in/clockwise examine          
      case 90: 
        if(e.altKey){     // alt => zoom
          if(e.shiftKey){ // sh => cut
            a = {s:0.9};
            c3d.zoomcutBy(a);  
            //log({t:'camera3d', f:'zoomflyTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'zoomflyTo', a:a});
            }
          }else{          // no-sh => fly
            a = {s:0.9, d:3};
            c3d.zoomflyBy(a);
            //log({t:'camera3d', f:'zoomflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'zoomflyBy', a:a});
            }
          }
        }else{            // no-alt => examine
          if(e.shiftKey){ // sh => pitch
            a = {r:-0.3927, d:3}; // PI/4 
            c3d.pitchflyBy(a);
           //log({t:'camera3d', f:'pitchflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchflyBy', a:a});
            }
          }else{          // no-sh => yaw
            a = {r:-0.3927, d:3}; // PI/4 
            c3d.yawflyBy(a);
           //log({t:'camera3d', f:'yawflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawflyBy', a:a});
            }
          }
        }
        break;
  
      // x - zoom out          
      case 88: 
        if(e.altKey){     // alt => zoom
          if(e.shiftKey){ // shift  => cut
            a = {s:1.111};
            c3d.zoomcutBy(a);
           //log({t:'camera3d', f:'zoomcutTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'zoomcutTo', a:a});
            }
          }else{         
            a = {s:1.1111, d:3};
            c3d.zoomflyBy(a); // 1.0/0.9 = 1.1111
           //log({t:'camera3d', f:'zoomcutBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'zoomcutBy', a:a});
            }
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => pitch
            a = {r:0.3927, d:3}; // PI/4 
            c3d.pitchflyBy(a);
           //log({t:'camera3d', f:'pitchflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchflyBy', a:a});
            }
          }else{          // no-sh => yaw
            a = {r:0.3927, d:3}; // PI/4 
            c3d.yawflyBy(a);
           //log({t:'camera3d', f:'yawflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawflyBy', a:a});
            }
          }
        }
        break;
  
      
      // DOLLY - arrows
      // left arrow - LEFT X-         
      case 37: 
        a = {x:-0.1, d:3};  
        c3d.dollyflyBy(a);
        //log({t:'camera3d', f:'dollyflyBy', a:a});
        if(record_shots){
          mediator.record({t:'camera3d', f:'dollyflyBy', a:a});
        }
        break;

      // right arrow - RIGHT X+
      case 39: 
        a = {x:0.1, d:3};  
        c3d.dollyflyBy(a);
        //log({t:'camera3d', f:'dollyflyBy', a:a});
        if(record_shots){
          mediator.record({t:'camera3d', f:'dollyflyBy', a:a});
        }
        break;
  
      // up arrow - FWD Z-/UP Y+          
      case 38: 
        if(e.shiftKey){ // sh => UP Y+
          a = {y:0.1, d:3};  
          c3d.dollyflyBy(a);
          //log({t:'camera3d', f:'dollyflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'dollyflyBy', a:a});
          }
        }else{          // no-sh => FWD Z-
          a = {z:-0.1, d:3};  
          c3d.dollyflyBy(a);
          //log({t:'camera3d', f:'dollyflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'dollyflyBy', a:a});
          }
        }
        break;
  
      // down arrow - BACK Z+/DOWN Y-          
      case 40: 
        if(e.shiftKey){ // sh => DOWN Y-
          a = {y:-0.1, d:3};  
          c3d.dollyflyBy(a);
         //log({t:'camera3d', f:'dollyflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'dollyflyBy', a:a});
          }
        }else{          // no-sh => BACK Z+
          a = {z:0.1, d:3};  
          c3d.dollyflyBy(a);
          //log({t:'camera3d', f:'dollyflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'dollyflyBy', a:a});
          }
        }
        break;
  
      default:
        mediator.log(`key '${e.keyCode}' not associated with c3d function`);
    }
  }//keys()
};


// enforce singleton
if(!map){
  map = new Keymap();
}

export {map};


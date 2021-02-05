// i3d keyboard-map functions (superset of vr)
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



      // PAN/TILT
      // Q - pan (look) left          
      case 81: 
        console.log(`\n[[[[[ left arrow - 37`);
        if(e.shiftKey){ // sh => abs transform ('to')
          a = {r:0.7854, d:3};
          c3d.panflyTo(a);  
         //log({t:'camera3d', f:'panflyTo', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'panflyTo', a:a});
          }
        }else{          // no-sh => rel transform ('by')
          a = {r:0.19635, d:3};
          c3d.panflyBy(a);
         //log({t:'camera3d', f:'panflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'panflyBy', a:a});
          }
        }
        break;
  
      // W - pan (look) right          
      case 87: 
        if(e.shiftKey){ // sh => abs transform ('to')
          a = {r:-0.7854, d:3};
          c3d.panflyTo(a);  
         //log({t:'camera3d', f:'panflyTo', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'panflyTo', a:a});
          }
        }else{          // no-sh => rel transform ('by')
          a = {r:-0.19635, d:3};
          c3d.panflyBy(a);
         //log({t:'camera3d', f:'panflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'panflyBy', a:a});
          }
        }
        break;
  
      // E - tilt (look) up          
      case 69: 
        if(e.shiftKey){ // sh => abs transform ('to')
          a = {r:0.7854, d:3};
          c3d.tiltflyTo(a);  
         //log({t:'camera3d', f:'tiltflyTo', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'tiltflyTo', a:a});
          }
        }else{          // no-sh => rel transform ('by')
          a = {r:0.19635, d:3};
          c3d.tiltflyBy(a);
         //log({t:'camera3d', f:'tiltflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'tiltflyBy', a:a});
          }
        }
        break;
  
      // R - tilt (look) down          
      case 82: 
        if(e.shiftKey){ // sh => abs transform ('to')
          a = {r:-0.7854, d:3};
          c3d.tiltflyTo(a);  
         //log({t:'camera3d', f:'tiltflyTo', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'tiltflyTo', a:a});
          }
        }else{          // no-sh => rel transform ('by')
          a = {r:-0.19635, d:3};
          c3d.tiltflyBy(a);
         //log({t:'camera3d', f:'tiltflyBy', a:a});
          if(record_shots){
            mediator.record({t:'camera3d', f:'tiltflyBy', a:a});
          }
        }
        break;

      // ROLL<br>
      // b - roll neg => ccw         
      case 66: 
        if(e.altKey){     // alt => cut
          if(e.shiftKey){ // shift  => 'to'
            a = {r:-1.57};  
            c3d.rollcutTo(a);
           //log({t:'camera3d', f:'rollcutTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollcutTo', a:a});
            }
          }else{         
            a = {r:-0.3927};
            c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
           //log({t:'camera3d', f:'rollcutBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollcutBy', a:a});
            }
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => abs transform ('to')
            a = {r:-1.57, d:3};  // PI/8
           //log({t:'camera3d', f:'rollflyTo', a:a});
            c3d.rollflyTo(a);  
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollflyTo', a:a});
            }
          }else{          // no-sh => rel transform ('by')
            a = {r:-0.3927, d:3}; // PI/4 
            c3d.rollflyBy(a);
           //log({t:'camera3d', f:'rollflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollflyBy', a:a});
            }
          }
        }
        break;
  
      // n - roll pos => cw         
      case 78:
        if(e.altKey){     // alt => cut
          if(e.shiftKey){ // shift  => 'to'
            a = {r:1.57};  
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollcutTo', a:a});
            }
            c3d.rollcutTo(a);
          }else{         
            a = {r:0.3927};
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollcutBy', a:a});
            }
            c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => abs transform ('to')
           a = {r:1.57, d:3};  // PI/8
            c3d.rollflyTo(a);  
           //log({t:'camera3d', f:'rollflyTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollflyTo', a:a});
            }
          }else{          // no-sh => rel transform ('by')
            c3d.rollflyBy(a);
           //log({t:'camera3d', f:'rollflyBy', a:a});
            a = {r:0.3927, d:3}; // PI/4 
            if(record_shots){
              mediator.record({t:'camera3d', f:'rollflyBy', a:a});
            }
          }
        }
        break;


      // EXAMINE - longitudinal - 'yaw' - rotate csphere around y-axis<br>  
      // g => yaw neg => ccw         
      case 71:    
        if(e.altKey){     // alt => cut
          if(e.shiftKey){ // shift  => 'to'
            a = {r:-1.57};  
            c3d.yawcutTo(a);
           //log({t:'camera3d', f:'yawcutTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawcutTo', a:a});
            }
          }else{         
            a = {r:-0.1};
            c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
           //log({t:'camera3d', f:'yawcutBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawcutBy', a:a});
            }
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => abs transform ('to')
            a = {r:-1.57, d:3};  // PI/8
            c3d.yawflyTo(a);  
           //log({t:'camera3d', f:'yawflyTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawflyTo', a:a});
            }
          }else{          // no-sh => rel transform ('by')
            a = {r:-0.3927, d:3}; // PI/4 
            c3d.yawflyBy(a);
           //log({t:'camera3d', f:'yawflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawflyBy', a:a});
            }
          }
        }
        break;
  
      // h - yaw pos => cw         
      case 72:  
        if(e.altKey){     // alt => cut
          if(e.shiftKey){ // shift  => 'to'
            a = {r:1.57};  
            c3d.yawcutTo(a);
           //log({t:'camera3d', f:'yawcutTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawcutTo', a:a});
            }
          }else{         
            a = {r:0.3927};
            c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
           //log({t:'camera3d', f:'yawcutBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawcutBy', a:a});
            }
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => abs transform ('to')
            a = {r:1.57, d:3};  // PI/8
            c3d.yawflyTo(a);  
           //log({t:'camera3d', f:'yawflyTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawflyTo', a:a});
            }
          }else{          // no-sh => rel transform ('by')
            a = {r:0.3927, d:3}; // PI/4 
            c3d.yawflyBy(a);
           //log({t:'camera3d', f:'yawflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'yawflyBy', a:a});
            }
          }
        }
        break;
  
  
      // EXAMINE - latitudinal - 'pitch' - rotate csphere around x-axis<br>
      // j => pitch neg => ccw         
      case 74:   
        if(e.altKey){     // alt => cut
          if(e.shiftKey){ // shift  => 'to'
            a = {r:-1.57};  
            c3d.pitchcutTo(a);
           //log({t:'camera3d', f:'pitchcutTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchcutTo', a:a});
            }
          }else{         
            a = {r:-0.3927};
            c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
           //log({t:'camera3d', f:'pitchcutBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchcutBy', a:a});
            }
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => abs transform ('to')
           a = {r:-1.57, d:3};  // PI/8
            c3d.pitchflyTo(a);  
           //log({t:'camera3d', f:'pitchflyTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchflyTo', a:a});
            }
          }else{          // no-sh => rel transform ('by')
            a = {r:-0.3927, d:3}; // PI/4 
            c3d.pitchflyBy(a);
           //log({t:'camera3d', f:'pitchflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchflyBy', a:a});
            }
          }
        }
        break;
  
      // k - pitch pos => cw          
      case 75:  
        if(e.altKey){     // alt => cut
          if(e.shiftKey){ // shift  => 'to'
            a = {r:1.57};  
            c3d.pitchcutTo(a);
           //log({t:'camera3d', f:'pitchcutTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchcutTo', a:a});
            }
          }else{         
            a = {r:0.3927};
            c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
           //log({t:'camera3d', f:'pitchcutBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchcutBy', a:a});
            }
          }
        }else{            // no-alt => fly
          if(e.shiftKey){ // sh => abs transform ('to')
            a = {r:1.57, d:3};  // PI/8
            c3d.pitchflyTo(a);  
           //log({t:'camera3d', f:'pitchflyTo', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchflyTo', a:a});
            }
          }else{          // no-sh => rel transform ('by')
            a = {r:0.3927, d:3}; // PI/4 
            c3d.pitchflyBy(a);
           //log({t:'camera3d', f:'pitchflyBy', a:a});
            if(record_shots){
              mediator.record({t:'camera3d', f:'pitchflyBy', a:a});
            }
          }
        }
        break;

  
      // 0 - bezier 'through' curve          
      // * NOTE: bezier() will always fail e2e-spec test because at each run
      //   the vertices and control points are chosen by Math.random() so
      //   one run will never match another.
      case 48: 
        // uses default dur=10 npoints=6
        if(e.altKey){     // alt => XY plane fly path ONLY
          a = {d:20, n:6, z:false};
        }else{        // no alt => z fly path also
          a = {d:20, n:6, z:true};
        }
        c3d.bezier(a); 
       //log({t:'camera3d', f:'bezier', a:a});
        if(record_shots){
          mediator.record({t:'camera3d', f:'bezier', a:a});
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


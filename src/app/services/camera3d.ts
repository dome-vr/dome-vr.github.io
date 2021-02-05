// camera3d.ts 
// services
import {mediator} from './mediator';




// reference to singleton instance of Camera3d
// NOTE: needed since first call by browser after requestAnimationFrame
// resets the execution context (this) to 'window' and thus fails
var c3d:Camera3d,
    csphere:THREE.Mesh,
    map:Keymap,
    lens:THREE.PerspectiveCamera,
    animation:Animation,
    zoom:number = 90.0,      // zoom - dynamic tracking
    // by default the lens looks at the csphere center - pan/tilt look away
    pan:number = 0.0,       // pan - dynamic tracking
    tilt:number = 0.0,      // tilt - dynamic tracking
    // euler
    pitch:number = 0.0,   // examine-pitch (rotation of csphere around x-axis)
    yaw:number = 0.0,       // examine-yaw (rotation of csphere around y-axis)
    roll:number = 0.0,      // roll - dynamic tracking
    shot:object,
    // faster conditional
    record_shots:boolean = false,
    // tmp matrices used in diagnostics transforms and diagnostics
    matrixa = new THREE.Matrix4(),
    matrixb = new THREE.Matrix4();



class Camera3d {

  constructor(){ 
    //medaitor.log(`camera3d ctor`);
    c3d = this;
    record_shots = config.record_shots; // faster conditional test
  }


  initialize(_lens:THREE.PerspectiveCamera, _csphere:THREE.Mesh, _animation:Animation){   
    lens = _lens;
    csphere = _csphere;
    animation = _animation;
    
    // keyboard functions - use imported map
    System.import(config._map)   
      .then((Keymap) => {
        map = Keymap.map; // export
        map.initialize(c3d, csphere, lens, config.record_shots);
        window.addEventListener("keyup", map.keys);
    })
    .catch((e) => {
      mediator.loge(`camera3d: import of keymap caused error: ${e}`);
    });
  }//initialize



  // camera keybd-functions
  // normalize position orientation of csphere and lens - AND zoom
  home(a){
    a.d = a.d || 0.0;

    //shot
    shot = { timeline: {p: {paused:true, repeat:0},
               actors:{
                 'lens~rotation':[{dur:a.d, p:{'x':0.0, 'y':0.0, 'z':0.0}}],
                 'csphere~position':[{dur:a.d, p:{'x':0.0, 'y':0.0, 'z':0.0}}],
                 'csphere~rotation':[{dur:a.d, p:{'x':0.0, 'y':0.0, 'z':0.0}}]
               }
              }//tl
    };//shot
    animation.perform(shot);

    // lens
    lens.position.x = 0.0;
    lens.position.y = 0.0;
    lens.up.x = 0.0;
    lens.up.y = 1.0;
    lens.up.z = 0.0;
    if(lens.fov !== zoom){
      lens.fov = zoom;
      lens.updateProjectionMatrix();
    }

    // dynamic trackers
    zoom = 90.0;
    roll = 0.0;
    pan = 0.0;
    tilt = 0.0;
    yaw = 0.0;
    pitch = 0.0;
  }



  // lens keybd-functions
  // normalize position orientation of csphere and lens - but NOT zoom
  center(a){
    a.d = a.d || 0.0;

    //shot
    shot = { timeline: {p: {paused:true, repeat:0},
               actors:{
                 'csphere~rotation':[{dur:a.d, p:{'x':0.0, 'y':0.0, 'z':0.0}}],
                 'lens~rotation':[{dur:a.d, 
                                 p:{'x':0.0, 'y':0.0, 'z':0.0 }}]
               }
              }//tl
    };//shot
    animation.perform(shot);

    // lens
    lens.position.x = 0.0;
    lens.position.y = 0.0;
    lens.up.x = 0.0;
    lens.up.y = 1.0;
    lens.up.z = 0.0;
    if(lens.fov !== zoom){
      lens.fov = zoom;
      lens.updateProjectionMatrix();
    }

    // dynamic trackers
    zoom = 90.0;
    roll = 0.0;
    pan = 0.0;
    tilt = 0.0;
    yaw = 0.0;
    pitch = 0.0;
  }


  
  // ZOOM<br>
  // modify csphere.scale 
  // * NOTE: dynamic lens.fov animation updates of three.js 
  // lens.updateProjectionMatrix() find an undefined projectionMatrix!<br>
  // For this reason zoom is not implemented by lens.fov<br>
  // cut - no animation
  zoomcutTo(a) {  
    zoom = a.s;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~':[{dur:0, p:{fov:zoom}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  zoomcutBy(a) {   
    zoom *= a.s;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~':[{dur:0, p:{fov:zoom}}]
                             }
                            }//tl
                };//shot
    animation.perform(shot);
  }

  // fly - animate
  zoomflyTo(a) {  
    zoom = a.s;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~':[{dur:a.d, p:{fov:zoom}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  zoomflyBy(a) {
    zoom *= a.s;
    console.log(`zoom = ${zoom}`);
    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~':[{dur:a.d, p:{fov:zoom}}]
                             }
                            }//tl
                };//shot
    animation.perform(shot);
  }

  // ROLL<br>
  // modify lens.rotation.z<br> 
  // cut - no animation
  rollcutTo(a) {  
    roll = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:0, p:{z:roll}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  rollcutBy(a) {   
    roll += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:0, p:{z:roll}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }

  // fly - animate
  rollflyTo(a) {  
    roll = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:a.d, p:{z:roll}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  rollflyBy(a) {   
    roll += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:a.d, p:{z:roll}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }


  // PAN/TILT<br>
  // modify lens.rotation.y/lens.rotation.x 
  panflyTo(a) {   
    pan = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:a.d, p:{y:pan}}]
                              }
                            }//tl
                };//shot
    console.dir(shot);
    animation.perform(shot);
  }
  panflyBy(a) {   
    pan += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:a.d, p:{y:pan}}]
                              }
                            }//tl
                };//shot
    console.dir(shot);
    animation.perform(shot);
  }

  tiltflyTo(a) {   
    tilt = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:a.d, p:{x:tilt}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  tiltflyBy(a) {   
    tilt += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'lens~rotation':[{dur:a.d, p:{x:tilt}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }


  // EXAMINE-YAW<br>
  // longitudinal examination - rotate csphere around y-axis<br> 
  // modify csphere.rotation.y<br>
  // cut - no animation
  yawcutTo(a) {  
    yaw = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:0, p:{y:yaw}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  yawcutBy(a) {   
    yaw += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:0, p:{y:yaw}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }

  // fly - animate
  yawflyTo(a) {  
    yaw = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:a.d, p:{y:yaw}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  yawflyBy(a) {   
    yaw += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:a.d, p:{y:yaw}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }

  // EXAMINE-PITCH<br>
  // lattitudinal examination - rotate csphere around x-axis<br> 
  // modify csphere.rotation.x<br>
  // cut - no animation
  pitchcutTo(a) {  
    pitch = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:0, p:{x:pitch}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  pitchcutBy(a) {   
    pitch += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:0, p:{x:pitch}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }

  // fly - animate
  pitchflyTo(a) {  
    pitch = a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:a.d, p:{x:pitch}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }
  pitchflyBy(a) {   
    pitch += a.r;

    // shot
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~rotation':[{dur:a.d, p:{x:pitch}}]
                              }
                            }//tl
                };//shot
    animation.perform(shot);
  }


  // csphere-camera shot implementations
  // DOLLY - csphere translation<br>
  // fly - animate (default dur=3.0)
  dollyflyTo(a) {  
    a.d = a.d || 3.0;
    a.x = a.x || csphere.position.x;
    a.y = a.y || csphere.position.y;
    a.z = a.z || csphere.position.z;

    // shot microstate-change
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~position':[{dur:a.d, 
                                p:{x:a.x, y:a.y, z:a.z}}]
                              }
                            }//tl
              };//shot
    mediator.log(`dollyflyTo: shot = ${shot}`);
    animation.perform(shot);
  }
  dollyflyBy(a) {
    a.d = a.d || 3.0;
    a.x = a.x || 0.0;
    a.y = a.y || 0.0;
    a.z = a.z || 0.0;
    a.x = csphere.position.x + a.x; 
    a.y = csphere.position.y + a.y; 
    a.z = csphere.position.z + a.z; 

    // shot microstate-change
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~position':[{dur:a.d, 
                                 p:{x:a.x, y:a.y, z:a.z }}]
                              }
                            }//tl
              };//shot
    mediator.log(`dollyflyBy: shot = ${shot}`);
    animation.perform(shot);
  }

  // cut - no animation (dur=0)
  dollycutTo(a) {  
    a.x = a.x || csphere.position.x;
    a.y = a.y || csphere.position.y;
    a.z = a.z || csphere.position.z;

    // shot microstate-change
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~position':[{dur:0, 
                                 p:{x:a.x, y:a.y, z:a.z }}]
                              }
                            }//tl
              };//shot
    mediator.log(`dollycutTo: shot = ${shot}`);
    animation.perform(shot);
  }
  dollycutBy(a) {
    a.d = 0.0;
    a.x = a.x || 0.0;
    a.y = a.y || 0.0;
    a.z = a.z || 0.0;
    a.x = csphere.position.x + a.x; 
    a.y = csphere.position.y + a.y; 
    a.z = csphere.position.z + a.z; 

    // shot microstate-change
    shot = { timeline: {p: {paused:true, repeat:0},
                             actors:{
                              'csphere~position':[{dur:0, 
                                 p:{x:a.x, y:a.y, z:a.z }}]
                              }
                            }//tl
              };//shot
    animation.perform(shot);
  }



  // random 2d-bezier camera nav<br> 
  // use default 6 points and 'through' bezier curve type
  bezier(a={d:20, n:6, z:true}){
    var i,
        x = [],
        y = [],
        z = [],
        v = [],
        bezier;

    // bezier 'through' curve points - z:true => fly in z dimension also
    if(a.z){
      z[0] = 0.0;
    }
    x[0] = 0.0;
    y[0] = 0.0;
    if(Math.random() > 0.5){
      x[1] = 0.5*Math.random();   // ++
      y[1] = 0.5*Math.random();
      x[2] = -0.5*Math.random();  // -+
      y[2] = 0.5*Math.random();
      x[3] = -0.5*Math.random();  // --
      y[3] = -0.5*Math.random();
      x[4] = 0.5*Math.random();  // +-
      y[4] = -0.5*Math.random();
      if(a.z){
        z[1] = -0.2*Math.random();
        z[2] = z[1] - 30*Math.random();
        z[3] = z[2] + 30*Math.random();
        z[4] = -0.2*Math.random();
      }
    }else{
      x[1] = -0.5*Math.random();   // --
      y[1] = -0.5*Math.random();
      x[2] = -0.5*Math.random();  // -+
      y[2] = 0.5*Math.random();
      x[3] = 0.5*Math.random();  // ++
      y[3] = 0.5*Math.random();
      x[4] = 0.5*Math.random();  // +-
      y[4] = -0.5*Math.random();
      if(a.z){
        z[1] = -0.2*Math.random();
        z[2] = z[1] - 30*Math.random();
        z[3] = z[2] + 30*Math.random();
        z[4] = -0.2*Math.random();
      }
    }
    x[5] = 0.0;
    y[5] = 0.0;
    if(a.z){
      z[5] = 0.0;
    }

    // create values array
    for(i=0; i<a.n; i++){
      if(a.z){
        v.push({x:x[i], y:y[i], z:z[i]});
      }else{
        v.push({x:x[i], y:y[i]});
      }
    }
    bezier = {bezier:{autoRotate:true, 
                      curviness:2, 
                      values:v,
                      }};

    // shot<br>
    // y-coords are webgl 
    shot = {
      timeline: {p: {paused:true, repeat:0, tweens:[]},
                 actors:{
                   'csphere~position':[{dur:a.d, p:bezier}]
                 }
                }//tl
    };//shot
    animation.perform(shot);
  }





  // camera change with NO Substate change !!! - for studio usage only!
  // translation on arbitrary axis - transform is relative and cumulative<br>
  // axis is Vector3 - will be normalized if not already
  translateAxisDistance(axis, d){
    axis.normalize();
    csphere.translateOnAxis(axis, d);
  }

  // camera change with NO Substate change !!! - for studio usage only!
  // rotate the camerasphere csphere by ordered pitch, yaw, roll
  rotate(params){
    var pitch = params.pitch || 0.0;
    var yaw = params.yaw || 0.0;
    var roll = params.roll || 0.0;

    matrixa.makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll));
    csphere.applyMatrix(matrixa);
  }

  // camera change with NO Substate change !!! - for studio usage only!
  // rotation around arbitraray axis - transform is relative and cumulative<br>
  // axis is Vector3 - will be normalized if not already
  rotateAxisAngle(x,y,z, angle){
    var axis = new THREE.Vector3(x,y,z);
    axis.normalize();
    csphere.rotateOnAxis(axis, angle);
  }

  // camera change with NO Substate change !!! - for studio usage only!
  // relative rotation/scale 
  // * NOTE: params = {pitch:p, yaw:y, roll:r, zoom:scale}
  relRotateScale(params){
    //Object.keys(params).forEach(function(p){
    //});
    var pitch = params.pitch || 0.0;
    var yaw = params.yaw || 0.0;
    var roll = params.roll || 0.0;
    var scale = params.zoom || 1.0;

    // rotate-scale-translate (by x/y/z* scale)
    matrixa.makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll));
    matrixa.multiplyScalar(scale);  // scale
    //examine_matrix(matrixa);
          
    // apply relative rotation-scale to csphere
    csphere.applyMatrix(matrixa);
    //examine_matrix(csphere.matrix);
  }


  // camera change with NO Substate change !!! - for studio usage only!
  // transform the camerasphere csphere by combination of translation,
  // rotation and zoom
  // * NOTE: params = { tx:x, ty:y, tz:z, pitch:p, yaw:y, roll:r, zoom:z}
  transform(params){
    var x = params.tx || 0.0;
    var y = params.ty || 0.0;
    var z = params.tz || 0.0;
    var pitch = params.pitch || 0.0;
    var yaw = params.yaw || 0.0;
    var roll = params.roll || 0.0;
    var scale = params.zoom || 1.0;

    //Object.keys(params).forEach(function(p){
    //  mediator.log(`params[${p}] = ${params[p]}`);
    //});

    // examine initial csphere matrix
    //examine_matrix(csphere.matrix);

    // absolute translation - matrixb
    matrixb.makeTranslation(x, y, z);
    //examine_matrix(matrixb);
    
    // apply absolute translation to csphere
    csphere.applyMatrix(matrixb);
    //examine_matrix(csphere.matrix);

    // rotate-scale-translate (by x/y/z* scale)
    matrixa.makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll));
    matrixa.multiplyScalar(scale);  // scale
    //examine_matrix(matrixa);
          
    // apply relative rotation-scale to csphere
    csphere.applyMatrix(matrixa);
    examine_matrix(csphere.matrix);
  }//transform - no substate change!
}//Camera3d


// enforce singleton export
if(c3d === undefined){
  c3d = new Camera3d();
}
export {c3d};


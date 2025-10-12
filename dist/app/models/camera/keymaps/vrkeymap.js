// vrkeymap.ts 

//dolly x,y,z; rotate-examine via keys
// assumes controlTarget, vrsecene or vrcsphere, is centered at origin
// singleton closure-instance variable

//TEST:
//dist/app/models/camera/keymaps/vrkeymap:
//
//@/@T4/capri-vrcontrols.html
//(scenes/@T4/capri-vrcontrols.js)


let vrkeymap;
class Vrkeymap {
    constructor() {
        //console.log(`private Vrkeymap ctor`
    }
  
  static create() {
        if (vrkeymap === undefined) {
            vrkeymap = new Vrkeymap();
        }
    }

    // start key-listening and identify controlTarget and optional dolly spped
    // typically controlTarget is vrscene, but can be individual actor for exp.
    start(controlTarget, speed = 0.01, camera) {

        let fov = camera.getFocalLength();
        const initial_fov = fov;
        console.log(`**********vrkeymap: camera initial_fov=${initial_fov}:`);
        //console.log(`vrkeymap: camera=${camera}:`);
        //console.dir(camera);
        //console.log(`+++ vrkeymap:  controlTarget = ${controlTarget}:`);
        //console.dir(controlTarget);

        document.addEventListener('keydown', (e) => {
            //console.log(`key pressed is ${e.key}`);
            switch (e.keyCode) {

                // SPACEBAR = unwind camera roll, standard up-vector
                // SHIFT-SPACEBAR = initial 'home' position and orientation
                case 32:
                    if (e.shiftKey) { // sh => home
                        controlTarget.position.x = 0.0;
                        controlTarget.position.y = 0.0;
                        controlTarget.position.z = 0.0;
                        controlTarget.rotation.x = 0.0;
                        controlTarget.rotation.y = 0.0;
                        controlTarget.rotation.z = 0.0;
                        controlTarget.up.x = 0.0;
                        controlTarget.up.y = 1.0;
                        controlTarget.up.z = 0.0;
                        camera.setFocalLength(initial_fov);
                    }else{
                        controlTarget.rotation.z = 0.0;
                        controlTarget.up.x = 0.0;
                        controlTarget.up.y = 1.0;
                        controlTarget.up.z = 0.0;
                    }
                    break;


                // Z-KEY
                case 90:
                    //console.log(`key pressed is ${e.key} z-key`); 
                    //CTRL=ZOOM
                    if(e.ctrlKey){
                      fov = camera.getFocalLength();
                      if (e.shiftKey) { 
                        //ZOOM-OUT - lower bound
                        fov -= speed*0.1;
                        if(fov > 1.0){
                          camera.setFocalLength(fov);
                        }
                      }else{
                        //ZOOM-IN - lower bound
                        fov += speed*0.1;
                        if(fov < 170.0){
                          camera.setFocalLength(fov);
                        }
                      }
                    }
                    //DOLLY-Z
                    else {
                      if (e.shiftKey) { 
                        //DOLLY+Z (BACK)
                        controlTarget.position.z -= speed*2.0;
                      }else{
                        //DOLLY-Z (FWD)
                        controlTarget.position.z += speed*2.0;
                      }
                    }
                    break;


                // LEFT-ARROW
                case 37:
                    //console.log(`key pressed is ${e.key} LEFT-ARROW`); 
                    if (e.shiftKey) {
                      if(e.ctrlKey){
                        //PAN-L (CCW)
                        controlTarget.rotation.y -= speed*.005;
                      }else{
                        //ORBIT-CCW: orbit ccw around y-axis at scene origin
                      }
                    }
                    else {
                        //DOLLY -X
                        controlTarget.position.x += speed*2.0;
                    }
                    break;


                // RIGHT-ARROW         
                case 39:
                    //console.log(`key pressed is ${e.key} RIGHT-ARROW`); 
                    if (e.shiftKey) { 
                      if(e.ctrlKey){
                        //PAN-R (CW)
                        controlTarget.rotation.y += speed*.005;
                      }else{
                        //ORBIT-CW: orbit cw around y-axis at scene origin
                      }
                    }
                    else {
                        //DOLLY +X
                        controlTarget.position.x -= speed*2.0;
                    }
                    break;


                // UP-ARROW
                case 38:
                    //console.log(`key pressed is ${e.key} UP-ARROW`); 
                    if (e.shiftKey) { 
                      if(e.ctrlKey){
                        //TILT-UP (CCW looking down +X-axis)
                        controlTarget.rotation.x -= speed*.005;
                      }else{
                        //ORBIT-CCW: orbit ccw around x-axis at scene origin
                      }
                    }
                    else {
                        //DOLLY +Y
                        controlTarget.position.y -= speed*2.0;
                    }
                    break;


                // DOWN-ARROW
                case 40:
                    //console.log(`key pressed is ${e.key} DOWN-ARROW`); 
                    if (e.shiftKey) { 
                      if(e.ctrlKey){
                        //TILT-DOWN (CW looking down +X-axis)
                        controlTarget.rotation.x += speed*.005;
                      }else{
                        //ORBIT-CW: orbit cw around x-axis at scene origin
                      }
                    }
                    else {
                        //DOLLY -Y
                        controlTarget.position.y += speed*2.0;
                    }
                    break;


                default:
                //console.log(`key '${e.keyCode}' not associated with //c3d function`);
            }
        }); //keydown
    } //start
}
//enforce singleton
Vrkeymap.create();
export { vrkeymap };
//# sourceMappingURL=vrkeymap.js.map
//# sourceMappingURL=vrkeymap.js.map

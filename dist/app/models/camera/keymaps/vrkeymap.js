// vrkeymap.ts - dolly x,y,z; rotate-examine via keys
// assumes controlTarget, vrsecene or vrcsphere, is centered at origin
// singleton closure-instance variable
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
    start(controlTarget, speed = 0.01) {
        console.log(`+++ vrkeymap:  controlTarget = ${controlTarget}:`);
        console.dir(controlTarget);
        document.addEventListener('keydown', (e) => {
            console.log(`key pressed is ${e.key}`);
            switch (e.keyCode) {
                // HOME = SPACEBAR
                // restore controlTarget to position=origin, 
                // with default up and orientation, and scale,
                // and if using zoom by fov, set fov=90 (original) 
                case 32:
                    controlTarget.position.x = 0.0;
                    controlTarget.position.y = 0.0;
                    controlTarget.position.z = 0.0;
                    controlTarget.rotation.x = 0.0;
                    controlTarget.rotation.y = 0.0;
                    controlTarget.rotation.z = 0.0;
                    controlTarget.up.x = 0.0;
                    controlTarget.up.y = 0.0;
                    controlTarget.up.z = 0.0;
                    break;
                // move fwd/backward i.e. negZ/posZ
                case 90:
                    //console.log(`controlTarget.position.z = ${controlTarget.position.z}`);
                    //console.log(`key pressed is ${e.key} LEFT-ARROW`); 
                    if (e.shiftKey) { // sh => FWD controlTarget.pos.z -= k                                          // NOTE: tgt=scene => BACKWD lens
                        controlTarget.position.z -= speed;
                    }
                    else { // small-z => BKWD controlTarget.pos.z += k                                    // NOTE: tgt=scene => FWD lens
                        controlTarget.position.z += speed;
                    }
                    break;
                // DOLLY - arrows
                // left arrow - LEFT X-         
                // SHIFT-left arrow - yaw cw         
                case 37:
                    //console.log(`key pressed is ${e.key} LEFT-ARROW`);  
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.y -= speed * .01;
                    }
                    else {
                        controlTarget.position.x += speed;
                    }
                    break;
                // right arrow - RIGHT X+
                // SHIFT-right arrow - yaw ccw         
                case 39:
                    //console.log(`key pressed is ${e.key} RIGHT-ARROW`);  
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.y += speed * .01;
                    }
                    else {
                        controlTarget.position.x -= speed;
                    }
                    break;
                // up arrow - UP Y+          
                // SHIFT-up arrow - pitch ccw         
                case 38:
                    //console.log(`key pressed is ${e.key} UP-ARROW`); 
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.x -= speed * .01;
                    }
                    else { // no-sh => FWD Z-
                        controlTarget.position.y -= speed;
                    }
                    break;
                // down arrow - DOWN Y-          
                // SHIFT-down arrow - pitch cw         
                case 40:
                    //console.log(`key pressed is ${e.key} DOWN-ARROW`); 
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.x += speed * .01;
                    }
                    else {
                        controlTarget.position.y += speed;
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
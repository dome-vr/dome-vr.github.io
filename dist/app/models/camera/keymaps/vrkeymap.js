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
    start(controlTarget, rotateTarget, speed = 0.01) {
        console.log(`+++ vrkeymap:  controlTarget = ${controlTarget}:`);
        console.dir(controlTarget);
        console.log(`+++ vrkeymap:  rotateTarget = ${rotateTarget}:`);
        console.dir(rotateTarget);
        document.addEventListener('keydown', (e) => {
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
                    // rotateTarget
                    if (rotateTarget) {
                        rotateTarget.position.x = 0.0;
                        rotateTarget.position.y = 0.0;
                        rotateTarget.position.z = 0.0;
                        rotateTarget.rotation.x = 0.0;
                        rotateTarget.rotation.y = 0.0;
                        rotateTarget.rotation.z = 0.0;
                    }
                    break;
                // DOLLY - arrows
                // left arrow - LEFT X-         
                // SHIFT-left arrow - yaw cw         
                case 37:
                    //console.log(`key pressed is ${e.key} LEFT-ARROW`);  
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.y -= speed;
                        if (rotateTarget) {
                            rotateTarget.rotation.y += speed;
                        }
                    }
                    else {
                        controlTarget.position.x += speed;
                        if (rotateTarget) {
                            rotateTarget.position.x -= speed;
                        }
                    }
                    break;
                // right arrow - RIGHT X+
                // SHIFT-right arrow - yaw ccw         
                case 39:
                    //console.log(`key pressed is ${e.key} RIGHT-ARROW`);  
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.y += speed;
                        if (rotateTarget) {
                            rotateTarget.rotation.y -= speed;
                        }
                    }
                    else {
                        controlTarget.position.x -= speed;
                        if (rotateTarget) {
                            rotateTarget.position.x += speed;
                        }
                    }
                    break;
                // up arrow - UP Y+          
                // SHIFT-up arrow - pitch ccw         
                case 38:
                    //console.log(`key pressed is ${e.key} UP-ARROW`); 
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.x -= speed;
                        if (rotateTarget) {
                            rotateTarget.rotation.x += speed;
                        }
                    }
                    else { // no-sh => FWD Z-
                        controlTarget.position.y -= speed;
                        if (rotateTarget) {
                            rotateTarget.position.y += speed;
                        }
                    }
                    break;
                // down arrow - DOWN Y-          
                // SHIFT-down arrow - pitch cw         
                case 40:
                    //console.log(`key pressed is ${e.key} DOWN-ARROW`); 
                    if (e.shiftKey) { // sh => UP Y+
                        controlTarget.rotation.x += speed;
                        if (rotateTarget) {
                            rotateTarget.rotation.x -= speed;
                        }
                    }
                    else {
                        controlTarget.position.y += speed;
                        if (rotateTarget) {
                            rotateTarget.position.y -= speed;
                        }
                    }
                    break;
                default:
                //console.log(`key '${e.keyCode}' not associated with //c3d function`);
            }
        });
    } //start
}
//enforce singleton
Vrkeymap.create();
export { vrkeymap };
//# sourceMappingURL=vrkeymap.js.map
//# sourceMappingURL=vrkeymap.js.map
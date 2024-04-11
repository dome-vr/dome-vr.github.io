// singleton closure-instance variable
let vrcontrols, deltaQ, isDragging = false, prevMousePos = { x: 0, y: 0 }, deltaMove = { x: 0, y: 0 };
class Vrcontrols {
    constructor() {
        vrcontrols = this;
    }
    static create() {
        if (vrcontrols === undefined) {
            vrcontrols = new Vrcontrols();
        }
    }
    // start mouse examine-rotate control - can be re-started with different ctgt
    // typically domElement is always rendering canvas
    // typically controlTarget is vrscene, but can be individual actor for exp.
    // a good speed is 0.1 - larger numbers will increse the rotation per mouse
    // move, and smaller numbers will decrease the rotation amount per move
    start(controlTarget, domElement, speed = 0.1) {
        //console.log(`\n\n&&&&&&&&&& vrcontrols`);
        //console.log(`domElement = ${domElement}`);
        domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
        });
        domElement.addEventListener('mousemove', (e) => {
            deltaMove = {
                x: e.offsetX - prevMousePos['x'],
                y: e.offsetY - prevMousePos['y'],
            };
            if (isDragging) {
                deltaQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.Math.degToRad(deltaMove['y'] * speed), THREE.Math.degToRad(deltaMove['x'] * speed), 0, 'XYZ'));
                controlTarget.quaternion.multiplyQuaternions(deltaQ, controlTarget.quaternion);
            }
            prevMousePos = {
                x: e.offsetX,
                y: e.offsetY
            };
        });
        document.addEventListener('mouseup', (e) => {
            isDragging = false;
        });
    } //start
}
//enforce singleton
Vrcontrols.create();
export { vrcontrols };
//# sourceMappingURL=vrcontrols.js.map
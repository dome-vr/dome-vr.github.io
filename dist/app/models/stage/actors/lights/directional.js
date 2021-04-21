import { transform3d } from '../../../../services/transform3d.js';
// class Directional - Factory
export const Directional = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // directional
            const color = options['color'] || 'white', intensity = options['intensity'] || 1.0, p = options['position'], // default Object3D.DefaultUp=[0,1,0]
            castShadow = options['castShadow'] || false, _visualizer = options['_visualizer'] || false, transform = options['transform'], dlight = new THREE.DirectionalLight(color, intensity);
            let visualizer;
            // position
            if (p) {
                dlight.position.set(p[0], p[1], p[2]).normalize();
            }
            // add/remove visualizer
            if (_visualizer) { // true
                visualizer = new THREE.DirectionalLightHelper(dlight, 3);
                dlight.add(visualizer);
            }
            else {
                if (visualizer) {
                    dlight.remove(visualizer);
                    visualizer = undefined;
                }
            }
            // cast shadow
            dlight.castShadow = castShadow;
            // transform
            if (transform) {
                transform3d.apply(transform, dlight);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            dlight['delta'] = (options) => {
                //console.log(`directional.delta: options = ${options}:`);
                //console.dir(options);
                const _v = options['_visualizer'], t = (options['transform'] || {});
                // property changes
                dlight.color = options['color'] || color;
                dlight.intensity = options['intensity'] || intensity;
                // castShadow
                if (options['castShadow'] !== undefined) {
                    dlight.castShadow = options['castShadow'];
                }
                // add/remove visualizer
                if (_v !== undefined) {
                    if (_v) { //true
                        if (visualizer === undefined) {
                            visualizer = new THREE.DirectionalHelper(dlight, 3);
                            dlight.add(visualizer);
                        }
                    }
                    else { //false
                        if (visualizer) {
                            dlight.remove(visualizer);
                            visualizer = undefined;
                        }
                    }
                }
                // transform
                if (Object.keys(t).length > 0) {
                    transform3d.apply(t, dlight);
                }
            }; //delta
            resolve(dlight);
        }); //return new Promise<Actor>
    } // create
}; //Directional;
//# sourceMappingURL=directional.js.map
import { transform3d } from '../../../../services/transform3d.js';
// class Hemisphere - Factory
export const Hemisphere = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // hemisphere
            const skycolor = options['skycolor'] || 'white', groundcolor = options['groundcolor'] || 'green', intensity = options['intensity'] || 1.0, castShadow = options['castShadow'] || false, _visualizer = options['_visualizer'] || false, transform = options['transform'], hlight = new THREE.HemisphereLight(skycolor, groundcolor, intensity);
            let visualizer;
            // add/remove visualizer
            if (_visualizer) { // true
                visualizer = new THREE.HemisphereLightHelper(hlight, 3);
                hlight.add(visualizer);
            }
            else {
                hlight.remove(visualizer);
                visualizer = undefined;
            }
            // cast shadow
            hlight.castShadow = castShadow;
            // transform
            if (transform) {
                transform3d.apply(transform, hlight);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            hlight['delta'] = (options) => {
                //console.log(`directional.delta: options = ${options}:`);
                //console.dir(options);
                const _v = options['_visualizer'], t = options['transform'] || {};
                // NOTE:hlight.color IS skycolor; intensity is property of parent Light
                if (options['skycolor']) {
                    hlight.color = options['skycolor'];
                }
                if (options['groundcolor']) {
                    hlight.groundColor = options['groundcolor'];
                }
                if (options['intensity']) {
                    hlight.intensity = options['intensity'];
                }
                // castShadow
                if (options['castShadow'] !== undefined) {
                    hlight.castShadow = options['castShadow'];
                }
                // add/remove visualizer
                if (_v !== undefined) {
                    if (_v) { //true
                        if (visualizer === undefined) {
                            visualizer = new THREE.HemisphereLightHelper(hlight, 3);
                            hlight.add(visualizer);
                        }
                    }
                    else { //false
                        if (visualizer) {
                            hlight.remove(visualizer);
                            visualizer = undefined;
                        }
                    }
                }
                // transform
                if (transform) {
                    transform3d.apply(transform, hlight);
                }
            };
            resolve(hlight);
        }); //return new Promise<Actor>
    } // create
}; //Hemisphere;
//# sourceMappingURL=hemisphere.js.map
import { transform3d } from '../../../../services/transform3d.js';
import { narrative } from '../../../../narrative.js';
// class Spot - Factory
export const Spot = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // spot
            const color = options['color'] || 'white', intensity = options['intensity'] || 1.0, angle = options['angle'] || Math.PI / 2, penumbra = options['penumbra'] || 0.0, decay = options['decay'] || 1.0, p = options['position'], // default Object3D.DefaultUp=[0,1,0]
            target = options['target'], // actor name
            castShadow = options['castShadow'] || false, _visualizer = options['_visualizer'] || false, transform = options['transform'], spotlight = new THREE.SpotLight(color, intensity);
            let visualizer;
            // spotlight properties
            spotlight.angle = angle;
            spotlight.penumbra = penumbra;
            spotlight.decay = decay;
            spotlight.angle = angle;
            // position, orientation to target
            if (p) {
                spotlight.position.set(p[0], p[1], p[2]);
            }
            if (target) {
                const actor = narrative.findActor(target);
                if (actor) {
                    spotlight.target = actor;
                }
            }
            // add/remove visualizer
            if (_visualizer) { // true
                visualizer = new THREE.SpotLightHelper(spotlight);
                spotlight.add(visualizer);
            }
            else {
                spotlight.remove(visualizer);
                visualizer = undefined;
            }
            // cast shadow
            spotlight.castShadow = castShadow;
            // transform
            if (transform) {
                transform3d.apply(transform, spotlight);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            spotlight['delta'] = (options) => {
                //console.log(`spot.delta: options = ${options}:`);
                //console.dir(options);
                const color = options['color'], intensity = options['intensity'], angle = options['angle'], penumbra = options['penumbra'], decay = options['decay'], _v = options['_visualizer'], p = options['position'], target = options['target'], // actor name
                t = (options['transform'] || {});
                // property changes
                if (color) {
                    spotlight.color = color;
                }
                if (intensity) {
                    spotlight.intensity = intensity;
                }
                if (angle) {
                    spotlight.angle = angle;
                }
                if (penumbra) {
                    spotlight.penumbra = penumbra;
                }
                if (decay) {
                    spotlight.decay = decay;
                }
                // position, orientation to target
                if (p) {
                    spotlight.position.set(p[0], p[1], p[2]);
                }
                if (target) {
                    const actor = narrative.findActor(target);
                    if (actor) {
                        spotlight.target = actor;
                    }
                }
                // castShadow
                if (options['castShadow'] !== undefined) {
                    spotlight.castShadow = options['castShadow'];
                }
                // add/remove visualizer
                if (_v !== undefined) {
                    if (_v) {
                        if (visualizer === undefined) {
                            visualizer = new THREE.SpotHelper(5);
                            spotlight.add(visualizer);
                        }
                    }
                    else {
                        if (visualizer) {
                            spotlight.remove(visualizer);
                            visualizer = undefined;
                        }
                    }
                }
                // transform
                if (Object.keys(t).length > 0) {
                    transform3d.apply(t, spotlight);
                }
            }; //delta
            resolve(spotlight);
        }); //return new Promise<Actor>
    } // create
}; //Spot;
//# sourceMappingURL=spot.js.map
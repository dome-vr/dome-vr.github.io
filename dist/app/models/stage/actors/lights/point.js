import { transform3d } from '../../../../services/transform3d.js';
// class Point - Factory
export const Point = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // point
            const color = options['color'] || 'white', intensity = options['intensity'] || 1.0, distance = options['distance'] || 0.0, decay = options['decay'] || 1.0, p = options['position'], // default Object3D.DefaultUp=[0,1,0]
            castShadow = options['castShadow'] || false, _visualizer = options['_visualizer'] || false, transform = options['transform'], plight = new THREE.PointLight(color, intensity);
            let visualizer;
            // position
            if (p) {
                plight.position.set(p[0], p[1], p[2]);
            }
            // add/remove visualizer
            if (_visualizer) { // true
                visualizer = new THREE.PointLightHelper(plight, 3);
                plight.add(visualizer);
            }
            else {
                plight.remove(visualizer);
                visualizer = undefined;
            }
            // cast shadow
            plight.castShadow = castShadow;
            // transform
            if (transform) {
                transform3d.apply(transform, plight);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            plight['delta'] = (options) => {
                //console.log(`point.delta: options = ${options}:`);
                //console.dir(options);
                const _v = options['_visualizer'], t = (options['transform'] || {});
                // property changes
                plight.color = options['color'] || color;
                plight.intensity = options['intensity'] || intensity;
                plight.distance = options['distance'] || 0.0;
                plight.decay = options['decay'] || 1.0;
                // castShadow
                if (options['castShadow'] !== undefined) {
                    plight.castShadow = options['castShadow'];
                }
                // add/remove visualizer
                if (_v !== undefined) {
                    if (_v) {
                        if (visualizer === undefined) {
                            visualizer = new THREE.PointHelper(plight, 3);
                            plight.add(visualizer);
                        }
                    }
                    else {
                        if (visualizer) {
                            plight.remove(visualizer);
                            visualizer = undefined;
                        }
                    }
                }
                // transform
                if (Object.keys(t).length > 0) {
                    transform3d.apply(t, plight);
                }
            }; //delta
            resolve(plight);
        }); //return new Promise<Actor>
    } // create
}; //Point;
//# sourceMappingURL=point.js.map
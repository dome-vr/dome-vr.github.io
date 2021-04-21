import { transform3d } from '../../../../services/transform3d.js';
// class Ambient - Factory
export const Ambient = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // ambient
            const color = options['color'] || 'white', intensity = options['intensity'] || 1.0, transform = options['transform'], alight = new THREE.AmbientLight(color, intensity);
            // transform
            if (transform) {
                transform3d.apply(transform, alight);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            alight['delta'] = (options) => {
                //console.log(`directional.delta: options = ${options}:`);
                //console.dir(options);
                const transform = (options['transform'] || {});
                alight.color = options['color'] || 'white';
                alight.intensity = options['intensity'] || 1.0;
                // transform
                if (transform) {
                    transform3d.apply(transform, alight);
                }
            };
            resolve(alight);
        }); //return new Promise<Actor>
    } // create
}; //Ambient;
//# sourceMappingURL=ambient.js.map
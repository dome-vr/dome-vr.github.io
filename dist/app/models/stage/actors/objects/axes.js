import { transform3d } from '../../../../services/transform3d.js';
// class Axes - Factory
export const Axes = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // axes
            const length = options['length'] || 10000, transform = options['transform'] || {}, axes = new THREE.AxesHelper(length);
            // transform
            //console.log(`transform = ${transform}`);
            if (transform && Object.keys(transform).length > 0) {
                transform3d.apply(transform, axes);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            // NOTE: only modification by transform is possible - for exp, 'length'
            // modification is ignored (AxisHelper has no length-property or method) 
            axes['delta'] = (options = {}) => {
                //console.log(`axes.delta: options = ${options}:`);
                //console.dir(options);
                const transform = options['transform'] || {};
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, axes);
                }
            };
            resolve(axes);
        }); //return new Promise
    }
}; //Axes
//# sourceMappingURL=axes.js.map
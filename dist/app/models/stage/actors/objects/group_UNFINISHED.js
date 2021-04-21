import { transform3d } from '../../../../services/transform3d.js';
// class Group - Factory
export const Group = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // group
            const children = options['chiildren'], transform = options['transform'] || {}, group = new THREE.Group();
            //children
            for (const child of children) {
                group.add(child);
            }
            // transform
            //console.log(`transform = ${transform}`);
            if (transform && Object.keys(transform).length > 0) {
                transform3d.apply(transform, group);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            // NOTE: only modification by transform is possible - for exp, 'length'
            // modification is ignored (AxisHelper has no length-property or method) 
            group['delta'] = (options = {}) => {
                //console.log(`group.delta: options = ${options}:`);
                //console.dir(options);
                const transform = options['transform'] || {};
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, group);
                }
            };
            resolve(group);
        }); //return new Promise
    }
}; //Group
//# sourceMappingURL=group_UNFINISHED.js.map
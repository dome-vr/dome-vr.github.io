import { transform3d } from '../../../../services/transform3d.js';
// class Points - Factory
export const Points = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // points
            const positions = options['positions'] || [[0, 0, 0]], transform = options['transform'] || {}, vertices = [], pointsize = options['pointsize'] || 0.0, points_g = new THREE.Geometry(), points_m = new THREE.PointsMaterial({ color: 'white', size: pointsize }); //size must be zero or visible!
            //vertices
            for (let i = 0; i < positions.length; i++) {
                vertices.push(...positions[i]);
            }
            // geometry, material, mesh
            points_g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            // points
            const points = new THREE.Points(points_g, points_m);
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            // NOTE: only modification by transform is possible - for exp, 'length'
            // modification is ignored (AxisHelper has no length-property or method) 
            points['delta'] = (options = {}) => {
                //console.log(`points.delta: options = ${options}:`);
                //console.dir(options);
                const transform = options['transform'] || {};
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, points);
                }
            };
            // transform
            //console.log(`transform = ${transform}`);
            if (transform && Object.keys(transform).length > 0) {
                transform3d.apply(transform, points);
            }
            resolve(points);
        }); //return new Promise
    }
}; //Points
//# sourceMappingURL=points.js.map
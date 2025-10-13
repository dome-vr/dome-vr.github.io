import { transform3d } from '../../../../services/transform3d.js';
// class Point - Factory
export const Point = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // point
            const position = options['position'] || [0, 0, 0], transform = options['transform'] || {}, pointsize = options['pointsize'] || 0.0, vertices = [], point_g = new THREE.Geometry(), point_m = new THREE.PointsMaterial({ color: 'white', size: pointsize }); //size must be zero or visible!
            //vertices
            console.log(`position.l = ${position.length}`);
            vertices.push(...position);
            // geometry, material, mesh
            point_g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            // point
            const point = new THREE.Points(point_g, point_m);
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            // NOTE: only modification by transform is possible - for exp, 'length'
            // modification is ignored (AxisHelper has no length-property or method) 
            point['delta'] = (options = {}) => {
                //console.log(`point.delta: options = ${options}:`);
                //console.dir(options);
                const transform = options['transform'] || {};
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, point);
                }
            };
            // transform
            //console.log(`transform = ${transform}`);
            if (transform && Object.keys(transform).length > 0) {
                transform3d.apply(transform, point);
            }
            resolve(point);
        }); //return new Promise
    }
}; //Point
//# sourceMappingURL=point.js.map
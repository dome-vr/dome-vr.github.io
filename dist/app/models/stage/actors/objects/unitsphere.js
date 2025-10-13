import { transform3d } from '../../../../services/transform3d.js';
// class Unitsphere - Factory
export const Unitsphere = class {
    static create(options = {}) {
        // options
        const radius = options['radius'] || 1.0, widthSegments = options['widthSegments'] || 32, heightSegments = options['heightSegments'] || 32, wireframe = options['wireframe'] || false, material = options['material'] || 'basic', color = options['color'] || 'red', opacity = options['opacity'] || 1.0, map = options['map'], loader = new THREE.TextureLoader(), transform = options['transform'] || {};
        //diagnostics
        //console.log(`&&& Unitsphere options:`);
        //console.dir(options);
        return new Promise((resolve, reject) => {
            const sphere_g = new THREE.SphereGeometry(radius, widthSegments, heightSegments), sphere_m = (material === 'basic') ? new THREE.MeshBasicMaterial({
                wireframe: wireframe,
                color: color,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            }) :
                new THREE.MeshPhongMaterial({
                    wireframe: wireframe,
                    color: color,
                    transparent: true,
                    opacity: opacity,
                    side: THREE.DoubleSide
                });
            // texture
            if (map) {
                sphere_m.map = loader.load(map);
            }
            // blending
            // check: need gl.enable(gl.BLEND)
            sphere_m.blending = THREE.CustomBlending;
            sphere_m.blendSrc = THREE.SrcAlphaFactor; // default
            sphere_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
            sphere_m.blendEquation = THREE.AddEquation; // default
            //sphere_m.depthTest = false;  //default
            // sphere
            const sphere = new THREE.Mesh(sphere_g, sphere_m);
            // transform
            transform3d.apply(transform, sphere);
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            sphere['delta'] = (options = {}) => {
                //console.log(`unitsphere.delta: options = ${options}:`);
                //console.dir(options);
                const wireframe = options['wireframe'], color = options['color'], opacity = options['opacity'], map = options['map'], transform = options['transform'];
                if (wireframe !== undefined) {
                    sphere_m.wireframe = wireframe;
                }
                if (color !== undefined) {
                    sphere_m.color = color;
                }
                if (opacity !== undefined) {
                    sphere_m.opacity = opacity;
                }
                // texture map
                if (map) {
                    loader.load(map, (t) => {
                        sphere_m.map = t;
                        sphere_m.needsUpdate = true;
                    });
                }
                // transform
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, sphere);
                }
            }; //sphere.delta
            // render method - not needed in this case
            //sphere['render'] = (et:number=0, options:object={}) => {}
            // return actor ready to be added to scene
            if (map) {
                loader.load(map, (t) => {
                    sphere_m.map = t;
                    sphere_m.needsUpdate = true;
                    resolve(sphere);
                });
            }
            else {
                resolve(sphere);
            }
        }); //return new Promise
    }
}; //Unitsphere;
//# sourceMappingURL=unitsphere.js.map
import { transform3d } from '../../../../services/transform3d.js';
// class Unitcube - Factory
export const Unitcube = class {
    static create(options = {}) {
        // options
        const wireframe = options['wireframe'] || false, material = options['material'] || 'basic', color = options['color'] || 'red', opacity = options['opacity'] || 1.0, map = options['map'], loader = new THREE.TextureLoader(), transform = (options['transform'] || {});
        let cube_g, cube_m, cube;
        //diagnostics
        //console.log(`&&& Unitcube options:`);
        //console.dir(options);
        return new Promise((resolve, reject) => {
            cube_g = new THREE.BoxGeometry(1.0, 1.0, 1.0);
            cube_m = (material === 'basic') ? new THREE.MeshBasicMaterial({
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
            cube_m.blending = THREE.CustomBlending;
            cube_m.blendSrc = THREE.SrcAlphaFactor; // default
            cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
            //cube_m.depthTest = false;
            cube = new THREE.Mesh(cube_g, cube_m);
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            cube['delta'] = (options = {}) => {
                //console.log(`unitcube.delta: options = ${options}:`);
                //console.dir(options);
                const wireframe = options['wireframe'], color = options['color'], opacity = options['opacity'], map = options['map'], transform = options['transform'];
                if (wireframe !== undefined) {
                    cube_m.wireframe = new Boolean(wireframe);
                }
                if (color !== undefined) {
                    cube_m.color = color;
                }
                if (opacity !== undefined) {
                    cube_m.opacity = opacity;
                }
                // texture map
                if (map) {
                    loader.load(map, (t) => {
                        cube_m.map = t;
                        cube_m.needsUpdate = true;
                    });
                }
                // transform
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, cube);
                }
            }; //cube.delta
            // blending
            // check: need gl.enable(gl.BLEND)
            cube_m.blending = THREE.CustomBlending;
            cube_m.blendSrc = THREE.SrcAlphaFactor; // default
            cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
            cube_m.blendEquation = THREE.AddEquation; // default
            //cube_m.depthTest = false;  //default
            // render method - not needed in this case
            //cube['render'] = (et:number=0, options:object={}) => {}
            // transform
            transform3d.apply(transform, cube);
            // return actor ready to be added to scene
            if (map) {
                loader.load(map, (t) => {
                    cube_m.map = t;
                    cube_m.needsUpdate = true;
                    resolve(cube);
                });
            }
            else {
                resolve(cube);
            }
        }); //return new Promise
    } //create
}; //Unitcube
//# sourceMappingURL=unitcube.js.map
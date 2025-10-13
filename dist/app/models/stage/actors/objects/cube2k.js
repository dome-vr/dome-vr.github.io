import { transform3d } from '../../../../services/transform3d.js';
// class Cube2k - Factory
export const Cube2k = class {
    static create(options = {}) {
        let cube_g, cube_m, cube;
        // options
        const wireframe = options['wireframe'] || false, material = options['material'] || 'basic', color = options['color'] || 'red', opacity = options['opacity'] || 1.0, transform = (options['transform'] || {});
        //diagnostics
        //console.log(`&&& Cube2k options:`);
        //console.dir(option);
        return new Promise((resolve, reject) => {
            const cube_g = new THREE.BoxGeometry(2000.0, 2000.0, 2000.0);
            cube_m = (material === 'basic') ?
                new THREE.MeshBasicMaterial({
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
                //console.log(`cube2k.delta: options = ${options}:`);
                //console.dir(options);
                const wireframe = options['wireframe'], color = options['color'], opacity = options['opacity'], transform = options['transform'];
                if (wireframe !== undefined) {
                    cube_m.wireframe = new Boolean(wireframe);
                }
                if (color !== undefined) {
                    cube_m.color = color;
                }
                if (opacity !== undefined) {
                    cube_m.opacity = opacity;
                }
                // transform
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, cube);
                }
            };
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
            resolve(cube);
        }); //return new Promise
    } //create
}; //Cube2k;
//# sourceMappingURL=cube2k.js.map
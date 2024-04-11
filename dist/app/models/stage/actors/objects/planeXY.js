import { transform3d } from '../../../../services/transform3d.js';
// class PlaneXY - Factory
export const PlaneXY = class {
    static create(options = {}) {
        // options
        const wireframe = options['wireframe'] || false, color = options['color'] || 'red', opacity = options['opacity'] || 1.0, width = options['width'] || 1000, height = options['height'] || 1000, map = options['map'], transform = options['transform'] || {}, loader = new THREE.TextureLoader();
        //diagnostics
        //console.log(`\n&&&&&&&&&&&&& PlaneXY w=${width} h=${height}; options:`);
        //console.dir(options);
        return new Promise((resolve, reject) => {
            const plane_g = new THREE.PlaneGeometry(width, height, 1, 1), plane_m = new THREE.MeshBasicMaterial({
                wireframe: wireframe,
                color: color,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            });
            console.log(`\n\n############# planeXY opacity = ${opacity}`);
            // blending
            // check: need gl.enable(gl.BLEND)
            plane_m.blending = THREE.CustomBlending;
            plane_m.blendSrc = THREE.SrcAlphaFactor; // default
            plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
            //plane_m.depthTest = true;  //default is f
            // plane
            const plane = new THREE.Mesh(plane_g, plane_m);
            // transform
            if (Object.keys(transform).length > 0) {
                //console.log(`planeXY executing transform ${transform}`);
                //transform = {t:[0.0,0.0,0.0],e:[0.0,0.0,0.0],s:[1.0,1.0,1.0]};
                transform3d.apply(transform, plane);
                //console.log(`after executing transform plane = ${plane}:`);
                //console.dir(plane);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            plane['delta'] = (options = {}) => {
                //console.log(`planeXY.delta: options = ${options}:`);
                //console.dir(options);
                const wireframe = options['wireframe'], color = options['color'], opacity = options['opacity'], transform = options['transform'];
                if (wireframe !== undefined) {
                    plane_m.wireframe = new Boolean(wireframe);
                }
                if (color !== undefined) {
                    plane_m.color = color;
                }
                if (opacity !== undefined) {
                    plane_m.opacity = opacity;
                }
                // transform
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, plane);
                }
            };
            // render method - not needed in this case
            //plane['render'] = (et:number=0, options:object={}) => {}
            // return actor ready to be added to scene
            if (map) {
                loader.load(map, (t) => {
                    plane_m.map = t;
                    plane_m.needsUpdate = true;
                    resolve(plane);
                });
            }
            else {
                resolve(plane);
            }
        }); //return new Promise
    } //create
}; //PlaneXY;
//# sourceMappingURL=planeXY.js.map
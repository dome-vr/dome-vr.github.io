import { transform3d } from '../../../../services/transform3d.js';
// class Multimaterial - Factory
export const Multimaterial = class {
    static create(options = {}) {
        //console.log(`\n&&& Multimaterial.create options:`);
        //console.dir(options);
        const geometry = options['geometry'] || 'quad', // defining option
        // other options (superset of geometry cases)
        width = options['width'] || 1.0, height = options['height'] || 1.0, radius = options['radius'] || 1.0, quad_widthSegments = options['widthSegments'] || 1, quad_heightSegments = options['heightSegments'] || 1, sphere_widthSegments = options['widthSegments'] || 32, sphere_heightSegments = options['heightSegments'] || 32, 
        // NOTE: the following two arrays are truncated in use by a lesser
        // textures length, and all three arrays can have repeated elements
        color = options['color'] || ['white'], //undef tail els default 'white' 
        opacity = options['opacity'] || [0.5], //undef tail els default to 0.5 
        textures = options['textures'] || [], //textures.l limits colr and opac 
        loader = new THREE.TextureLoader(), transform = (options['transform'] || {}); // {} => no transform
        let multimat_g, multimat_m, multimat;
        return new Promise((resolve, reject) => {
            let maps; // cannot be declared even 'any' or 'any[]' ?! 
            // see 'just in case 10 lines or so below
            async function load() {
                maps = await Promise.all(textures.map(url => loader.load(url))).catch((e) => {
                    const err = `failure to load textures ${textures}:${e}`;
                    console.error(err);
                    reject(err);
                });
                // just in case
                if (maps === undefined) {
                    maps = [];
                }
                // NOTE: execution within load() will wait for all textures to load.
                // i.e maps will be loaded when switch etc.,... is executed
                let e;
                switch (geometry) {
                    case 'quad':
                        multimat_g = new THREE.PlaneGeometry(width, height, quad_widthSegments, quad_heightSegments);
                        break;
                    case 'sphere':
                        multimat_g = new THREE.SphereGeometry(radius, quad_widthSegments, quad_heightSegments);
                        break;
                    default:
                        e = `unrecognized geometry = ${geometry}`;
                        console.error(e);
                        reject(e);
                }
                //diagnostics
                //console.log(`multimat_g:`);
                //console.dir(multimat_g);
                // prepare layers
                multimat_g.clearGroups();
                // create multimaterial multimat_m and layered geometry multimat_g
                if (maps.length > 0) {
                    for (const i in maps) {
                        multimat_g.addGroup(0, Infinity, i);
                        const m = new THREE.MeshBasicMaterial({ color: color[i] || 'white',
                            transparent: true, opacity: opacity[i] || 0.5, map: maps[i],
                            side: THREE.DoubleSide });
                        //console.log(`adding material ${m} using texture ${textures[i]} to multimat_m`); 
                        //console.dir(m);
                        multimat_m.push(m);
                    }
                }
                else { // no textures ! use simple default non-textured material
                    multimat_m.push(new THREE.MeshBasicMaterial({
                        color: color[0] || 'white', transparent: true,
                        opacity: opacity[0] || 0.5, side: THREE.DoubleSide
                    }));
                }
                // create multimaterial mesh
                multimat = new THREE.Mesh(multimat_g, multimat_m);
                // transform
                if (Object.keys(transform).length > 0) {
                    transform3d.apply(transform, multimat);
                }
                // ACTOR.INTERFACE method
                // delta method for modifying properties - only transform can be applied
                multimat['delta'] = (options = {}) => {
                    const transform = options['transform'];
                    // transform
                    if (Object.keys(transform).length > 0) {
                        transform3d.apply(transform, multimat);
                    }
                };
                // render method - not needed in this case
                //sphere['render'] = (et:number=0, options:object={}) => {}
                // return actor ready to be added to scene
                resolve(multimat);
            } //load
            load();
        }); //return new Promise<Actor>
    } //create
}; //Multimaterial;
//# sourceMappingURL=multimaterial.js.map
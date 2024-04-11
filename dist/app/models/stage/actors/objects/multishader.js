import { transform3d } from '../../../../services/transform3d.js';
// class Multishader - Factory
export const Multishader = class {
    static create(options = {}) {
        const geometry = options['geometry'] || 'quad', // defining option
        // other options (superset of geometry cases)
        width = options['width'] || 1.0, height = options['height'] || 1.0, radius = options['radius'] || 1.0, quad_widthSegments = options['widthSegments'] || 1, quad_heightSegments = options['heightSegments'] || 1, sphere_widthSegments = options['widthSegments'] || 32, sphere_heightSegments = options['heightSegments'] || 32, 
        // read notes above
        material = options['material'] || [], vshaders = options['vshaders'] || [], fshaders = options['fshaders'] || [], textures = options['textures'] || [], loader = new THREE.TextureLoader(), transform = options['transform'] || {}; // {} => no transform
        let multimat_g, multimat_m, multimat;
        return new Promise((resolve, reject) => {
            let maps, // cannot be declared even 'any' or 'any[]' ?! 
            vsh, // see 'just in case' commented section below
            fsh;
            async function load() {
                maps = await Promise.all(textures.map(url => loader.load(url) || '')).catch((e) => {
                    const err = `failure to load textures ${textures}:${e}`;
                    console.error(err);
                    reject(err);
                });
                // maps
                //console.log(`&&& multishader: maps = ${maps}`);
                //console.dir(maps);
                vsh = await Promise.all(vshaders.map(url => import(url) || '')).catch((e) => {
                    const err = `failure to load vshaders ${vshaders}:${e}`;
                    console.error(err);
                    reject(err);
                });
                fsh = await Promise.all(fshaders.map(url => import(url) || '')).catch((e) => {
                    const err = `failure to load fshaders ${fshaders}:${e}`;
                    console.error(err);
                    reject(err);
                });
                // NOTE: execution within load() will wait for all textures, vshaders
                // and fshaders to load, before the switch below executes, i.e all
                // maps, vsh and fsh will be loaded when switch etc.,... is executed
                let e;
                switch (geometry) {
                    case 'quad':
                        multimat_g = new THREE.PlaneGeometry(width, height, quad_widthSegments, quad_heightSegments);
                        break;
                    case 'sphere':
                        multimat_g = new THREE.SphereGeometry(radius, sphere_widthSegments, sphere_heightSegments);
                        break;
                    default:
                        e = `unrecognized geometry = ${geometry}`;
                        console.error(e);
                        reject(e);
                }
                // prepare layers
                multimat_g.clearGroups();
                // create multishader multimat_m and layered geometry multimat_g
                // NOTE: exp of creation of array a: k=4 => a = [0,1,2,3]
                const k = Math.min(vsh.length, fsh.length), a = [...Array(k).keys()];
                let m;
                //console.log(`multishader: &&& k=${k}`);
                //console.log(`multishader: &&& a=${a}`);
                if (k > 0) {
                    for (const i in a) {
                        //diagnostics
                        //            console.log(`vsh[${i}]['vsh'] = ${vsh[i]['vsh']}`);
                        //            console.log(`fsh[${i}]['fsh'] = ${fsh[i]['fsh']}`);
                        //            console.log(`fsh[${i}]['uniforms'] = ${fsh[i]['uniforms']}`);
                        //            console.dir(fsh[i]['uniforms']);
                        //            console.log(`maps[${i}] = ${maps[i]}:`);
                        //            console.dir(maps[i]);
                        // add layer to Geometry multimat_g
                        multimat_g.addGroup(0, 5192, i);
                        // create and add ShaderMaterial OR MeshBasicMaterial
                        //console.log(`multishader: &&& material[${i}] = ${material[i]}:`);
                        if (material[i] === 'shader') { //shader material (possibly texture)
                            m = new THREE.ShaderMaterial({
                                vertexShader: vsh[i]['vsh'],
                                uniforms: fsh[i]['uniforms'],
                                fragmentShader: fsh[i]['fsh'],
                                transparent: true,
                                side: THREE.DoubleSide,
                            });
                            // if textures[i], set uniform tDiffuse to maps[i] texture map
                            // send texture map to m uniform tDiffuse 
                            setTimeout(() => {
                                if (textures[i]) {
                                    m.uniforms.tDiffuse.value = maps[i];
                                    m.uniforms.tDiffuse.needsUpdate = true;
                                }
                            }, 3000);
                            //console.log(`created material ${m} using vsh=${vsh} and fsh=${fsh}`); 
                        }
                        else { // meshbasic texture-material
                            m = new THREE.MeshBasicMaterial({
                                map: maps[i],
                                transparent: true,
                                opacity: 0.5,
                                side: THREE.DoubleSide
                            });
                            //console.log(`created material ${m} using texture ${maps[i]}`); 
                        }
                        //console.log(`adding material ${m} to multimat_m`); 
                        //console.dir(m);
                        multimat_m.push(m);
                    }
                }
                else { // no shaders ! use simple default non-textured material
                    console.error(`multishader: &&&!!!  no shader entries for all indices - creating white material`);
                    multimat_m.push(new THREE.MeshBasicMaterial({ color: 'white',
                        transparent: true, opacity: 0.5, side: THREE.DoubleSide,
                    }));
                }
                // create multishader mesh
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
}; //MultiShader;
//# sourceMappingURL=multishader.js.map
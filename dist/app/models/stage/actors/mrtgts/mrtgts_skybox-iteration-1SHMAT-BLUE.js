//shaders
import { vsh } from '../../shaders/mrtgts_shaders/vsh_default.glsl.js';
//import {fsh_px} from '../../shaders/mrtgts_shaders/simple/fsh_px.glsl.js';
//import {fsh_nx} from '../../shaders/mrtgts_shaders/simple/fsh_nx.glsl.js';
//import {fsh_py} from '../../shaders/mrtgts_shaders/simple/fsh_py.glsl.js';
//import {fsh_ny} from '../../shaders/mrtgts_shaders/simple/fsh_ny.glsl.js';
//import {fsh_pz} from '../../shaders/mrtgts_shaders/simple/fsh_pz.glsl.js';
//import {fsh_nz} from '../../shaders/mrtgts_shaders/simple/fsh_nz.glsl.js';
//
//import {uniforms_px} from '../../shaders/mrtgts_shaders/simple/fsh_px.glsl.js';
//import {uniforms_nx} from '../../shaders/mrtgts_shaders/simple/fsh_nx.glsl.js';
//import {uniforms_py} from '../../shaders/mrtgts_shaders/simple/fsh_py.glsl.js';
//import {uniforms_ny} from '../../shaders/mrtgts_shaders/simple/fsh_ny.glsl.js';
//import {uniforms_pz} from '../../shaders/mrtgts_shaders/simple/fsh_pz.glsl.js';
import { fsh_px } from '../../shaders/mrtgts_shaders/test/fsh_px.glsl.js';
import { fsh_nx } from '../../shaders/mrtgts_shaders/test/fsh_nx.glsl.js';
import { fsh_py } from '../../shaders/mrtgts_shaders/test/fsh_py.glsl.js';
import { fsh_ny } from '../../shaders/mrtgts_shaders/test/fsh_ny.glsl.js';
import { fsh_pz } from '../../shaders/mrtgts_shaders/test/fsh_pz.glsl.js';
import { fsh_nz } from '../../shaders/mrtgts_shaders/test/fsh_nz.glsl.js';
// class Skybox - Factory
export const Skybox = class {
    static create(options = {}) {
        const size = options['size'] || 10000, color = options['color'] || 'black', opacity = options['opacity'] || 1.0, urls = options['urls'] || undefined;
        return new Promise((resolve, reject) => {
            const cube_g = new THREE.BoxGeometry(size, size, size, 1, 1, 1), materials = [], textureLoader = new THREE.TextureLoader(), fsh = [fsh_px, fsh_nx, fsh_py, fsh_ny, fsh_pz, fsh_nz];
            //urls must be 6 url-strings (or null) - but 6 array-elements
            try {
                if (urls) { //urls defined => texture the skybox with 6 textures
                    for (let i = 0; i < 6; i++) {
                        textureLoader.load(urls[i], (texture) => {
                            materials[i] = new THREE.ShaderMaterial({
                                vertexShader: vsh,
                                fragmentShader: fsh[i],
                                side: THREE.DoubleSide,
                                uniforms: {
                                    tDiffuse: { value: texture }
                                }
                            });
                            console.log(`&&&& materials[${i})] = ${materials[i]}`);
                            //              materials[i] = new THREE.MeshBasicMaterial({
                            //                      //vertexShader: vsh,
                            //                      //fragmentShader: fsh[i],
                            //                      color:color,
                            //                      opacity:opacity,
                            //                      side: THREE.DoubleSide,  //FrontSide sufficient
                            //                      map:texture
                            //              });
                        });
                    } //for
                }
                else { //urls undefined => no skybox texture-maps
                    //            for(let i=0; i<6; i++){
                    //              materials[i] = new THREE.ShaderMaterial({
                    //                      vertexShader: vsh,
                    //                      fragmentShader: fsh[i],
                    //                      side: THREE.DoubleSide  //FrontSide sufficient
                    //              });
                    //            }//for
                    for (let i = 0; i < 6; i++) {
                        materials[i] = new THREE.MeshBasicMaterial({
                            //vertexShader: vsh,
                            //fragmentShader: fsh[i],
                            color: color,
                            opacity: opacity,
                            side: THREE.DoubleSide //FrontSide sufficient
                        });
                    } //for
                } //if-else
                // object3D
                const cube = new THREE.Mesh(cube_g, materials);
                console.log(`\n************* mRTgts_skybox:cube = ${cube}\n`);
                console.log(`materials.length = ${materials.length}`);
                console.dir(cube);
                resolve(cube);
            }
            catch (e) {
                const err = `error in skybox.create: ${e.message}`;
                console.error(err);
                reject(err);
            }
        }); //return Promise<Actor>
    } //create
}; //class Skybox
//# sourceMappingURL=mrtgts_skybox-iteration-1SHMAT-BLUE.js.map
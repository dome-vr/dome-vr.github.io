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
//import {uniforms_px} from '../../shaders/mrtgts_shaders/test/fsh_px.glsl.js';
//import {uniforms_nx} from '../../shaders/mrtgts_shaders/test/fsh_nx.glsl.js';
//import {uniforms_py} from '../../shaders/mrtgts_shaders/test/fsh_py.glsl.js';
//import {uniforms_ny} from '../../shaders/mrtgts_shaders/test/fsh_ny.glsl.js';
//import {uniforms_pz} from '../../shaders/mrtgts_shaders/test/fsh_pz.glsl.js';
//import {uniforms_nz} from '../../shaders/mrtgts_shaders/test/fsh_nz.glsl.js';
// class Skybox - Factory
export const Skybox = class {
    static create(options = {}) {
        console.log(`$$$ create()`);
        const size = options['size'] || 10000, color = options['color'] || 'black', opacity = options['opacity'] || 1.0, urls = options['urls'] || undefined;
        const rt = [], plane = [], scene = [], lens = new THREE.PerspectiveCamera(90, 1.0, 0.1, 10000);
        let ma = [];
        //diagnostics-ONLY
        let flag = true;
        lens.position.z = 1.0;
        return new Promise((resolve, reject) => {
            const cube_g = new THREE.BoxBufferGeometry(size, size, size, 1, 1, 1), cube_m = [], plane_g = new THREE.PlaneGeometry(2, 2, 1), plane_m = [], plane = [], textureLoader = new THREE.TextureLoader(), fsh = [fsh_px, fsh_nx, fsh_py, fsh_ny, fsh_pz, fsh_nz], promise = [];
            //expt - separate renderer
            const _renderer = new THREE.WebGLRenderer();
            _renderer.setSize(2, 2);
            _renderer.xr.enabled = false;
            //urls must be 6 url-strings (or null) - but 6 array-elements
            try {
                async function f() {
                    for (let i = 0; i < 6; i++) {
                        promise[i] = new Promise((resolve, reject) => {
                            scene[i] = new THREE.Scene();
                            rt[i] = new THREE.WebGLRenderTarget();
                            //              console.log(`$$$ rt[${i}] = ${rt[i]} created`);
                            rt[i].setSize(2., 2.);
                            if (urls) { //urls defined => texture the skybox with 6 textures
                                console.log(`$$$ urls[${i}] = ${urls[i]}]`);
                                resolve([
                                    new THREE.ShaderMaterial({
                                        vertexShader: vsh,
                                        fragmentShader: fsh[i],
                                        side: THREE.DoubleSide,
                                        uniforms: {
                                            tDiffuse: { value: textureLoader.load(urls[i]) }
                                        }
                                    }),
                                    new THREE.MeshBasicMaterial({
                                        color: color,
                                        opacity: opacity,
                                        side: THREE.DoubleSide,
                                        map: null
                                    })
                                ]); //resolve
                            }
                            else { //urls undefined => no skybox texture-maps
                                console.log(`$$$ urls[] undefined!!!!!!!!!!!!!!!!!!!!`);
                                resolve([
                                    new THREE.ShaderMaterial({
                                        vertexShader: vsh,
                                        fragmentShader: fsh[i],
                                        side: THREE.DoubleSide //FrontSide sufficient
                                    }),
                                    new THREE.MeshBasicMaterial({
                                        color: color,
                                        opacity: opacity,
                                        side: THREE.DoubleSide,
                                        map: null
                                    })
                                ]); //resolve
                            } //if(urls)-else
                        }); //promise[i]=
                        ma = await promise[i];
                        plane_m[i] = ma[0];
                        cube_m[i] = ma[1];
                        ma = [];
                        //console.log(`***** mRTgts_skybox:plane_m[${i}] = ${plane_m[i]}`);
                        //console.log(`******* mRTgts_skybox:cube_m[${i}] = ${cube_m[i]}`);
                        //console.log(`\nbuild: fsh[${i}] = ${plane_m[i].fragmentShader}`);
                        //off-screen rendered plane[i]
                        plane[i] = new THREE.Mesh(plane_g, plane_m[i]);
                        scene[i].add(plane[i]);
                        //console.log(`******* mRTgts_skybox:plane[${i}] = ${plane[i]}`);
                        if (i === 5) {
                            // object3D
                            const cube = new THREE.Mesh(cube_g, cube_m);
                            console.log(`\n************* mRTgts_skybox:cube = ${cube}\n`);
                            console.dir(cube);
                            //[1] render with narrative defined renderer passed in as arg
                            //animation method - called by narrative.render() each frame
                            //critical for creating renderTarget.textures:
                            cube['animate'] = (et, renderer) => {
                                console.log(`************* cube.animate()`);
                                //frame++;
                                //console.log(`renderer = ${renderer}`);
                                //console.log(`renderer instanceof THR.WebGLRenderer = ${renderer instanceof THREE.WebGLRenderer}`);
                                const b = renderer.xr.enabled; //store state of passed-in WebGLRenderer
                                const rtgt = renderer.getRenderTarget();
                                //render shmats on planes
                                renderer.xr.enabled = false;
                                if (flag) {
                                    for (let i = 0; i < 6; i++) {
                                        //console.log(`rt[${i}] = ${rt[i]}`);
                                        //console.log(`rt[${i}] instanceof THREE.WebGLRendererTarget = ${rt[i] instanceof THREE.WebGLRenderTarget}`);
                                        renderer.setRenderTarget(rt[i]);
                                        renderer.render(scene[i], lens);
                                        //console.log(`rt[${i}] = ${rt[i]}`);
                                        //console.log(`scene[${i}] = ${scene[i]}`);
                                        //console.log(`cube_m[${i}] = ${cube_m[i]}`);
                                        //console.log(`\nanimate: fsh[${i}] = ${plane_m[i].fragmentShader}`);
                                        //console.log(`\nanimate: fsh[${i}] = ${scene[i].children[0].material.fragmentShader}`);
                                        rt[i].texture.name = `${i}`;
                                        cube_m[i].map = rt[i].texture;
                                        console.log(`cube.material[${i}].map.name = ${cube.material[i].map.name}`);
                                        console.log(`rtgt = ${rtgt}`);
                                        for (let j = 0; j < 6; j++) {
                                            console.log(`rtgt == rt[${i}] = ${rtgt == rt[i]}`);
                                        }
                                    }
                                    flag = false;
                                }
                                renderer.xr.enabled = b; //restore state of WebGLRenderer
                                renderer.setRenderTarget(rtgt);
                            }; //cube.animate
                            //[2] render with mrtgts_skybox defined _renderer defined above
                            //              cube['animate'] = (et:number, renderer:THREE.WebGLRenderer) => {
                            //                console.log(`************* cube.animate()`);
                            //                //frame++;
                            //
                            //                //console.log(`renderer = ${renderer}`);
                            //                //console.log(`renderer instanceof THR.WebGLRenderer = ${renderer instanceof THREE.WebGLRenderer}`);
                            //                //const b = renderer.xr.enabled;  //store state of passed-in WebGLRenderer
                            //                //const rtgt = renderer.getRenderTarget();
                            //      
                            //                //render shmats on planes
                            //                if(flag){
                            //                  for(let i=0; i<6; i++){
                            //                      //console.log(`rt[${i}] = ${rt[i]}`);
                            //                      //console.log(`rt[${i}] instanceof THREE.WebGLRendererTarget = ${rt[i] instanceof THREE.WebGLRenderTarget}`);
                            //                      _renderer.setRenderTarget(rt[i]);
                            //                      _renderer.render(scene[i], lens);
                            //                      //console.log(`rt[${i}] = ${rt[i]}`);
                            //                      //console.log(`scene[${i}] = ${scene[i]}`);
                            //                      //console.log(`cube_m[${i}] = ${cube_m[i]}`);
                            //                      //console.log(`\nanimate: fsh[${i}] = ${plane_m[i].fragmentShader}`);
                            //                      //console.log(`\nanimate: fsh[${i}] = ${scene[i].children[0].material.fragmentShader}`);
                            //                      rt[i].texture.name = `${i}`;
                            //                      cube_m[i].map = rt[i].texture;
                            //                      console.log(`cube.material[${i}].map.name = ${cube.material[i].map.name}`);
                            //                      _renderer.setRenderTarget(null);
                            //                  }
                            //                  flag=false;
                            //                }
                            //      
                            //                //renderer.xr.enabled = b;  //restore state of WebGLRenderer
                            //                //renderer.setRenderTarget(rtgt);
                            //              }//cube.animate
                            //console.log(`cube.animate() = ${cube['animate']}`);
                            console.log(`resolving cube...`);
                            resolve(cube);
                        } //if(i===5)
                    } //for
                } //f
                f();
            }
            catch (e) {
                let err = `error in skybox.create: ${e.message}`;
                console.error(err);
                reject(err);
            }
        }); //return Promise<Actor>
    } //create
}; //class Skybox
//# sourceMappingURL=mrtgts_skybox-et-renderer.js.map
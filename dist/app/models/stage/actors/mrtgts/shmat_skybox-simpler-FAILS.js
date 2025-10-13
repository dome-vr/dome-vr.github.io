import { transform3d } from '../../../../services/transform3d.js';
//shaders
import { vsh } from '../../shaders/template_shaders/vsh_template.glsl.js';
import { fsh } from '../../shaders/template_shaders/fsh_rm_template_expt1.glsl.js';
// class Skybox - Factory
export const Skybox = class {
    static create(options = {}) {
        const size = options['size'] || 10000, color = options['color'] || 'black', opacity = options['opacity'] || 1.0, urls = options['textures'], //string[6]
        transform = (options['transform'] || {});
        let cube_g, materials = [], cube, textureLoader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            cube_g = new THREE.BoxGeometry(size, size, size, 1, 1, 1);
            //console.log(`fsh = ${fsh}`);
            //urls must be 6 url-strings (or null) - but 6 array-elements
            try {
                if (urls[0] !== null) { //6 urls => texture the skybox
                    for (let i = 0; i < 6; i++) {
                        textureLoader.load(urls[i], (texture) => {
                            materials[i] = new THREE.ShaderMaterial({
                                vertexShader: vsh,
                                fragmentShader: fsh,
                                side: THREE.DoubleSide,
                                uniforms: {
                                    tDiffuse: { value: texture }
                                }
                            });
                            //material.uniforms.tDiffuse.value = texture;
                            //material.uniforms.tDiffuse.needsUpdate = true;
                            //console.log(`material.uniforms.tDiffuse.value = ${material.uniforms.tDiffuse.value}`);
                            console.log(`materials_ = ${materials}`);
                            console.dir(materials[0]);
                            console.dir(materials[1]);
                            console.dir(materials[2]);
                            console.dir(materials[3]);
                            console.dir(materials[4]);
                            console.dir(materials[5]);
                        });
                    } //for
                }
                else {
                    materials[i] = new THREE.MeshBasicMaterial({
                        color: color,
                        opacity: opacity,
                        fog: true,
                        side: THREE.DoubleSide,
                    });
                }
                // object3D
                cube = new THREE.Mesh(cube_g, materials);
                //console.log(`cube = ${cube}`);
                //console.dir(cube);
                // render order - try to render first - i.e background
                cube.renderOrder = 10; // larger rO is rendered first
                // cube rendered 'behind' vr stage & actors
                // transform
                if (Object.keys(transform).length > 0) {
                    transform3d.apply(transform, cube);
                }
                // delta() for property modification required by Actor interface
                cube['delta'] = (options = {}) => {
                    if (options['color']) {
                        cube.material.color = options['color'];
                    }
                    if (options['opacity']) {
                        cube.material.opacity = options['opacity'];
                    }
                    const transform = options['transform'];
                    if (transform && Object.keys(transform).length > 0) {
                        //console.log(`cube.delta: transform = ${transform}`);
                        transform3d.apply(transform, cube);
                    }
                }; //delta
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
//# sourceMappingURL=shmat_skybox-simpler-FAILS.js.map
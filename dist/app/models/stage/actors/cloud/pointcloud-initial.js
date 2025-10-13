import { transform3d } from '../../../../services/transform3d.js';
import { vsh } from '../../shaders/webgl1/quad_vsh/vsh_pointcloud2.glsl.js';
import { fsh } from '../../shaders/webgl1/quad_fsh/fsh_pointcloud2.glsl.js';
import { uniforms } from '../../shaders/webgl1/quad_fsh/fsh_pointcloud2.glsl.js';
// closure vars and default values
//three options 
export const Pointcloud = class {
    static create(options = {}) {
        console.log(`\n\n$$$ pointcloud: o['radius'] = ${options['radius']}`);
        const radius = options['radius'] || 100, rotation_speed = options['rotation_speed'] || .005, transform = options['transform'], pcloud_g = new THREE.SphereBufferGeometry(radius, 160, 80), pcloud_m = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vsh,
            fragmentShader: fsh,
            transparent: true
        }), pcloud = new THREE.Points(pcloud_g, pcloud_m), nvertices = pcloud_g.attributes.position.count, alphas = new Float32Array(nvertices * 1);
        //initialize alphas - add attribute 'alpha' to pcloud_g
        for (let i = 0; i < nvertices; i++) {
            alphas[i] = Math.random();
        }
        //setAtrribute NOT addAttribute
        pcloud_g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        //diagnostics
        //    console.log(`$$$ pointcloud: radius = ${radius}`);
        //    console.log(`$$$ pcloud_g['attributes'] = ${pcloud_g['attributes']}`);
        //    console.dir(pcloud_g['attributes']);
        //    console.log(`$$$ alphas[27] = ${alphas[27]}`);
        //    console.log(`$$$ pointcloud: pcloud = ${pcloud}:`);
        //    console.dir(pcloud);
        return new Promise((resolve, reject) => {
            pcloud['animate'] = (et) => {
                const alphas = pcloud_g['attributes']['alpha'], count = alphas['count'];
                for (let i = 0; i < count; i++) {
                    // dynamically change alphas
                    alphas.array[i] *= 0.95;
                    if (alphas.array[i] < 0.01) {
                        alphas.array[i] = Math.random(); //1.0;
                    }
                }
                alphas.needsUpdate = true; // important!
                pcloud.rotation.x += rotation_speed;
                pcloud.rotation.y += rotation_speed;
                //pcloud.rotation.z += rotation_speed;
            };
            //transform
            if (transform) {
                transform3d.apply(transform, pcloud);
            }
            resolve(pcloud);
        }); //return new Promise
    } //create()
}; //Pointcloud
//# sourceMappingURL=pointcloud-initial.js.map
import { transform3d } from '../../../../services/transform3d.js';
import { vsh } from '../../shaders/webgl1/quad_vsh/vsh_pointcloud3.glsl.js';
import { fsh } from '../../shaders/webgl1/quad_fsh/fsh_pointcloud3.glsl.js';
import { uniforms } from '../../shaders/webgl1/quad_fsh/fsh_pointcloud3.glsl.js';
// closure vars and default values
let pcloud;
export const Pointcloud = class {
    static create(options = {}) {
        console.log(`\n\n$$$ pointcloud: o['radius'] = ${options['radius']}`);
        const pointsize = options['pointsize'] || 2.0, radius = options['radius'] || 100, rotation_speed = options['rotation_speed'] || .005, pcloud_g = new THREE.SphereBufferGeometry(radius, 160, 80), pcloud_m = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vsh,
            fragmentShader: fsh,
            transparent: true
        }), nvertices = pcloud_g.attributes.position.count, alphas = new Float32Array(nvertices * 1), psizes = new Float32Array(nvertices * 1);
        let color = options['color'] || 'red', transform = options['transform'];
        //create pointcloud
        pcloud = new THREE.Points(pcloud_g, pcloud_m);
        //initialize alphas - add attribute 'alpha' to pcloud_g
        for (let i = 0; i < nvertices; i++) {
            alphas[i] = Math.random();
            psizes[i] = pointsize; //pointsize*Math.random();
        }
        //setAtrribute NOT addAttribute
        //set alpha
        pcloud_g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        //set pointsize
        console.log(`pointsize = ${pointsize}`);
        pcloud_g.setAttribute('pointsize', new THREE.BufferAttribute(psizes, 1));
        //diagnostics
        console.log(`$$$ pointcloud: pcloud_m['uniforms']:`);
        console.dir(uniforms);
        //set color
        uniforms['uColor']['value'] = new THREE.Color(color);
        uniforms['uColor']['needsUpdate'] = true;
        return new Promise((resolve, reject) => {
            pcloud['delta'] = (options) => {
                color = options['color'];
                transform = options['transform'];
                //set color
                if (color) {
                    uniforms['uColor']['value'] = new THREE.Color(color);
                    uniforms['uColor']['needsUpdate'] = true;
                }
                if (transform) {
                    transform3d.apply(transform, pcloud);
                }
            };
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
            };
            //transform
            if (transform) {
                transform3d.apply(transform, pcloud);
            }
            resolve(pcloud);
        }); //return new Promise
    } //create()
}; //Pointcloud
//# sourceMappingURL=dyn_pointcloud.js.map
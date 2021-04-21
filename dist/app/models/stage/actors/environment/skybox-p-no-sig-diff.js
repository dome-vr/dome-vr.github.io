import { transform3d } from '../../../../services/transform3d.js';
// class Skybox - Factory
export const Skybox = class {
    static create(options = {}) {
        const size = options['size'] || 10000, color = options['color'] || 'black', opacity = options['opacity'] || 1.0, urls = options['textures'], transform = (options['transform'] || {}), create_material = (url_) => {
            const loader = new THREE.TextureLoader();
            let material;
            return new Promise((resolve, reject) => {
                try {
                    loader.load(url_, (texture) => {
                        //console.log(`create_material((${url_}) texture = ${texture}:`);
                        //console.dir(texture);
                        material = new THREE.MeshBasicMaterial({
                            color: color,
                            opacity: opacity,
                            fog: true,
                            side: THREE.DoubleSide,
                            map: texture
                        });
                        material.blending = THREE.CustomBlending;
                        material.blendSrc = THREE.SrcAlphaFactor; // default
                        material.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                        material.blendEquation = THREE.AddEquation; // default
                        //console.log(`create_material((${url_}) material = ${material}:`);
                        //console.dir(material);
                        resolve(material);
                    }); //load
                }
                catch (e) {
                    const err = `error in skybox.create_material: ${e.message}`;
                    console.error(err);
                    reject(err);
                }
            });
        }, create_materials = (urls_) => {
            try {
                return Promise.all([
                    create_material(urls_[0]),
                    create_material(urls_[1]),
                    create_material(urls_[2]),
                    create_material(urls_[3]),
                    create_material(urls_[4]),
                    create_material(urls_[5])
                ]); //resolve
            }
            catch (e) {
                const err = `error in skybox.create_materials: ${e.message}`;
                console.error(err);
            }
        };
        let cube_g, materials, cube_m, cube;
        //diagnostics
        //    console.log(`\n\n!!! Skybox.create():`);
        //    console.log(`size = ${size}`);
        //    console.log(`color = ${color}`);
        //    console.log(`opacity = ${opacity}`);
        //    console.log(`urls = ${urls}`);
        //    console.log(`transform = ${transform}:`);
        //    console.dir(transform);
        return new Promise((resolve, reject) => {
            cube_g = new THREE.BoxBufferGeometry(size, size, size, 1, 1, 1);
            try {
                if (urls) {
                    create_materials(urls).then((materials_) => {
                        materials = materials_;
                        //console.log(`materials = ${materials}`);
                        //console.dir(materials[0]);
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
                        // return created skybox instance
                        resolve(cube);
                    });
                }
                else { //urls=undefined
                    cube_m = new THREE.MeshBasicMaterial({
                        color: color,
                        opacity: opacity,
                        fog: true,
                        side: THREE.BackSide
                    });
                    // blending
                    // check: need gl.enable(gl.BLEND)
                    cube_m.blending = THREE.CustomBlending;
                    cube_m.blendSrc = THREE.SrcAlphaFactor; // default
                    cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                    cube_m.blendEquation = THREE.AddEquation; // default
                    //cube_m.depthTest = false;  //default
                    // object3D
                    cube = new THREE.Mesh(cube_g, cube_m);
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
                    // return created skybox instance
                    resolve(cube);
                } //urls
            }
            catch (e) {
                const err = `error in skybox.create: ${e.message}`;
                console.error(err);
                reject(err);
            }
        }); //return Promise<Actor>
    } //create
}; //class Skybox
//# sourceMappingURL=skybox-p-no-sig-diff.js.map
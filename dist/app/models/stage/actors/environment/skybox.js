import { transform3d } from '../../../../services/transform3d.js';
// class Skybox - Factory
export const Skybox = class {
    static create(options = {}) {
        const size = options['size'] || 10000, color = options['color'] || 'black', opacity = options['opacity'] || 1.0, urls = options['textures'], //string[6]
        transform = (options['transform'] || {}), 
        //function to create single textured-material given url
        create_material = (url_) => {
            const loader = new THREE.TextureLoader();
            let material;
            //**************
            //console.log(`create_material:url_ = ${url_}`);
            //**************
            return new Promise((resolve, reject) => {
                try {
                    if (url_ !== null) { //6 urls => texture the skybox
                        loader.load(url_, (texture) => {
                            //***********
                            //console.log(`create_material((${url_}) texture = ${texture}:`);
                            //console.dir(texture);
                            //***********
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
                            material.map = texture;
                            //material.needsUpdate = true;
                            resolve(material);
                        }); //load
                    }
                    else { // url null => no texture
                        material = new THREE.MeshBasicMaterial({
                            color: color,
                            opacity: opacity,
                            fog: true,
                            side: THREE.DoubleSide,
                        });
                        resolve(material);
                    }
                }
                catch (e) {
                    const err = `error in skybox.create_material: ${e.message}`;
                    console.error(err);
                    reject(err);
                }
            });
        }, 
        //function to create materials[]
        create_materials = (urls_) => {
            try {
                //**************
                //console.log(`create_materials:urls_.length = ${urls_.length}`);
                for (let i = 0; i < urls.length; i++) {
                    //console.log(`urls_[${i}] = ${urls_[i]}`);
                }
                //**************
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
        let cube_g, materials, cube;
        return new Promise((resolve, reject) => {
            cube_g = new THREE.BoxGeometry(size, size, size, 1, 1, 1);
            //urls must be 6 url-strings (or null) - but 6 array-elements
            try {
                //**************
                //console.log(`initial Promise:urls.length = ${urls.length}`);
                for (let i = 0; i < urls.length; i++) {
                    //console.log(`urls[${i}] = ${urls[i]}`);
                }
                //**************
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
            catch (e) {
                const err = `error in skybox.create: ${e.message}`;
                console.error(err);
                reject(err);
            }
        }); //return Promise<Actor>
    } //create
}; //class Skybox
//# sourceMappingURL=skybox.js.map
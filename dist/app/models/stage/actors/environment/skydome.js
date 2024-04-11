import { transform3d } from '../../../../services/transform3d.js';
// class Skydome - Factory
export const Skydome = class {
    static create(options = {}, narrative) {
        const width = options['width'] || 5000, height = options['height'] || 10000, color = options['color'] || 'black', opacity = options['opacity'] || 1.0, url = options['texture'] || '', transparent = options['transparent'] || true, rotate = options['rotate'] || true, transform = (options['transform'] || {}), textureLoader = new THREE.TextureLoader();
        let dome_g, dome_m, dome;
        //diagnostics
        //    console.log(`\n\n&&& Skydome.create():`);
        //    console.log(`width = ${width}`);
        //    console.log(`height = ${height}`);
        //    console.log(`color = ${color}`);
        //    console.log(`opacity = ${opacity}`);
        //    console.log(`url = ${url}`);
        //    console.log(`transform = ${transform}:`);
        //    console.dir(transform);
        return new Promise((resolve, reject) => {
            try {
                dome_g = new THREE.SphereGeometry(1.0); // unit sphere
                dome_m = new THREE.MeshBasicMaterial({
                    color: color,
                    opacity: opacity,
                    fog: true,
                    side: THREE.DoubleSide,
                    map: textureLoader.load(url)
                });
                dome_m.blending = THREE.CustomBlending;
                dome_m.blendSrc = THREE.SrcAlphaFactor; // default
                dome_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                dome_m.blendEquation = THREE.AddEquation; // default
                // object3D
                dome = new THREE.Mesh(dome_g, dome_m);
                // apply width and height scaling
                transform3d.apply({ s: [width, height, width] }, dome);
                // render order - try to render first - i.e background
                dome.renderOrder = 10; // larger rO is rendered first
                // dome rendered 'behind' vr stage & actors
                // transform
                if (Object.keys(transform).length > 0) {
                    transform3d.apply(transform, dome);
                }
                //rotate dome
                dome['animate'] = (et) => {
                    if (rotate) {
                        dome.rotation.y = et * 0.00005; //0.00001
                    }
                };
                // delta() for property modification required by Actor interface
                dome['delta'] = (options = {}) => {
                    const color_ = options['color'] || color, opacity_ = options['opacity'] || opacity, url_ = options['texture'] || url, transform = options['transform'];
                    dome.material = new THREE.MeshBasicMaterial({
                        color: color_,
                        opacity: opacity_,
                        fog: true,
                        side: THREE.BackSide,
                        map: textureLoader.load(url_)
                    });
                    dome.material.blending = THREE.CustomBlending;
                    dome.material.blendSrc = THREE.SrcAlphaFactor; // default
                    dome.material.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                    dome.material.blendEquation = THREE.AddEquation; // default
                    if (transform && Object.keys(transform).length > 0) {
                        //console.log(`dome.delta: transform = ${transform}`);
                        transform3d.apply(transform, dome);
                    }
                }; //delta
                // return created skydome instance
                resolve(dome);
            }
            catch (e) {
                const err = `error in skydome.create: ${e.message}`;
                console.error(err);
                reject(err);
            }
        }); //return Promise<Actor>
    } //create
};
//# sourceMappingURL=skydome.js.map
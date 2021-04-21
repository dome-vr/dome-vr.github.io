import { transform3d } from '../../../../services/transform3d.js';
// class Sghud - Factory
export const Sghud = class {
    static create(options = {}) {
        // options
        const color = options['color'] || 'white', opacity = options['opacity'] || 0.5, vsh = options['vsh'] || './app/models/stage/shaders/webgl/vertex/vsh_tex_default.glsl', fsh = options['fsh'] || './app/models/stage/shaders/webgl/fragment/fsh_tex_default.glsl', texture = options['texture'], scaleX = options['scaleX'] || 1.0, scaleY = options['scaleY'] || 1.0, transform = options['transform'];
        return new Promise((resolve, reject) => {
            let sghud_g, sghud_m, vshader, fshader, uniforms, sghud;
            const loader = new THREE.TextureLoader();
            async function load() {
                const a = await Promise.all([
                    import(vsh),
                    import(fsh)
                ]).catch((e) => {
                    console.error(`error loading module: ${e}`);
                });
                vshader = a[0].vsh;
                fshader = a[1].fsh;
                uniforms = a[1].uniforms;
                sghud_g = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
                sghud_m = new THREE.ShaderMaterial({
                    vertexShader: vshader,
                    uniforms: uniforms,
                    fragmentShader: fshader,
                    transparent: true,
                    side: THREE.DoubleSide,
                });
                // blending
                // check: need gl.enable(gl.BLEND)
                sghud_m.blendSrc = THREE.SrcAlphaFactor; // default
                sghud_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                //grid_m.depthTest = false;  //default
                // sghud
                sghud = new THREE.Mesh(sghud_g, sghud_m);
                // transform
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, sghud);
                }
                //scale
                sghud.scale.set(scaleX, scaleY, 1.0);
                // test ONLY!!!
                if (texture) {
                    loader.load(texture, (t) => {
                        console.log(`\n\n\n\n!!!!!!!!!loaded texture t=${t}`);
                        console.log(`scaleX = ${scaleX} scaleY = ${scaleY}`);
                        sghud_m.uniforms.tDiffuse.value = t;
                        sghud_m.uniforms.tDiffuse.needsUpdate = true;
                        resolve(sghud);
                    });
                }
                else {
                    resolve(sghud);
                }
                // ACTOR.INTERFACE method
                // delta method for modifying properties
                sghud['delta'] = (options = {}) => {
                    //console.log(`sghud.delta: options = ${options}:`);
                    //console.dir(options);
                    const color = options['color'], opacity = options['opacity'];
                    if (color !== undefined) {
                        sghud_m.color = color;
                    }
                    if (opacity !== undefined) {
                        sghud_m.opacity = opacity;
                    }
                };
            } //load
            load();
        }); //return new Promise
    } //create
}; //Sghud;
//# sourceMappingURL=sghud.js.map
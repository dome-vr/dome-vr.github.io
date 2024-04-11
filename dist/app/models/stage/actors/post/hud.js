import { transform3d } from '../../../../services/transform3d.js';
// class Hud - Factory
export const Hud = class {
    static create(options = {}) {
        // options
        const opacity = options['opacity'] || 0.5, fog = options['fog'] || true, glslVersion = options['glslVersion'] || THREE.GLSL1, vsh = options['vsh'] || '../../shaders/webgl1/quad_vsh/vsh_default.glsl.js', fsh = options['fsh'] || '../../shaders/webgl1/quad_fsh/fsh_default.glsl.js', texture = options['texture'], scaleX = options['scaleX'] || 1.0, scaleY = options['scaleY'] || 1.0, transform = options['transform'];
        return new Promise((resolve, reject) => {
            let hud_g, hud_m, vshader, fshader, uniforms, hud;
            const loader = new THREE.TextureLoader();
            async function load() {
                const w = 2.0 * scaleX, h = 2.0 * scaleY, a = await Promise.all([
                    import(vsh),
                    import(fsh)
                ]).catch((e) => {
                    console.error(`error loading module: ${e}`);
                });
                vshader = a[0].vsh;
                fshader = a[1].fsh;
                uniforms = a[1].uniforms;
                hud_g = new THREE.PlaneGeometry(w, h, 1, 1);
                hud_m = new THREE.ShaderMaterial({
                    vertexShader: vshader,
                    uniforms: uniforms,
                    fragmentShader: fshader,
                    transparent: true,
                    opacity: opacity,
                    fog: fog,
                    glslVersion: glslVersion,
                    side: THREE.DoubleSide,
                });
                // blending
                // check: need gl.enable(gl.BLEND)
                hud_m.blending = THREE.CustomBlending;
                hud_m.blendSrc = THREE.SrcAlphaFactor; // default
                hud_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                //grid_m.depthTest = false;  //default
                // hud
                hud = new THREE.Mesh(hud_g, hud_m);
                // transform
                if (transform && Object.keys(transform).length > 0) {
                    transform3d.apply(transform, hud);
                }
                // test ONLY!!!
                if (texture) {
                    loader.load(texture, (t) => {
                        //console.log(`\n\n\n\n!!!!!!!!!loaded texture t=${t}`);
                        //console.log(`scaleX = ${scaleX} scaleY = ${scaleY}`);
                        hud_m.uniforms.tDiffuse.value = t;
                        hud_m.uniforms.tDiffuse.needsUpdate = true;
                        resolve(hud);
                    });
                }
                else {
                    resolve(hud);
                }
                // ACTOR.INTERFACE method
                // delta method for modifying properties
                hud['delta'] = (options = {}) => {
                    //console.log(`hud.delta: options = ${options}:`);
                    //console.dir(options);
                    const opacity = options['opacity'], transform = options['transform'];
                    if (opacity !== undefined) {
                        hud_m.opacity = opacity;
                    }
                    //transform
                    if (transform && Object.keys(transform).length > 0) {
                        transform3d.apply(transform, hud);
                    }
                };
            } //load
            load();
        }); //return new Promise
    } //create
}; //Hud;
//# sourceMappingURL=hud.js.map
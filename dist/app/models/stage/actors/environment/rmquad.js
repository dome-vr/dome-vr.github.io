// class Rmquad - Factory
export const Rmquad = class {
    static create(options = {}) {
        // options
        const color = options['color'] || 'white', opacity = options['opacity'] || 1.0, vsh = options['vsh'] || '../models/stage/shaders/webgl2/vertex/vsh_default.glsl.js', fsh = options['fsh'] || '../models/stage/shaders/webgl2/fragment/fsh_rm_texquad.glsl.js', texture = options['texture'];
        return new Promise((resolve, reject) => {
            let plane_g, plane_m, vshader, fshader, uniforms, plane;
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
                plane_g = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
                plane_m = new THREE.ShaderMaterial({
                    vertexShader: vshader,
                    uniforms: uniforms,
                    fragmentShader: fshader,
                    transparent: true,
                    side: THREE.DoubleSide,
                });
                // blending - check: need gl.enable(gl.BLEND)
                plane_m.blendSrc = THREE.SrcAlphaFactor; // default
                plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                //grid_m.depthTest = false;  //default
                // plane
                plane = new THREE.Mesh(plane_g, plane_m);
                // test ONLY!!!
                if (texture) {
                    loader.load(texture, (t) => {
                        plane_m.uniforms.tDiffuse.value = t;
                        plane_m.uniforms.tDiffuse.needsUpdate = true;
                    });
                }
                // ACTOR.INTERFACE delta method for modifying properties
                plane['delta'] = (options = {}) => {
                    //console.log(`rmquad.delta: options = ${options}:`);
                    //console.dir(options); 
                    const color = options['color'] || 'black', opacity = options['opacity'] || 0.0;
                    if (color !== undefined) {
                        plane_m.color = color;
                    }
                    if (opacity !== undefined) {
                        plane_m.opacity = opacity;
                    }
                };
                // return actor ready to be added to scene
                resolve(plane);
            } //load()
            load();
        }); //return new Promise
    } //create
}; //Rmquad;
//# sourceMappingURL=rmquad.js.map
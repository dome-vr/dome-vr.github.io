import { transform3d } from '../../../../services/transform3d.js';
// class Rmquad - Factory
export const Rmquad = class {
    static create(options = {}) {
        // options
        const opacity = options['opacity'] || 1.0, fog = options['fog'] || true, glslVersion = options['glslVersion'] || THREE.GLSL1, vsh = options['vsh'] || '../../shaders/webgl2/vertex/vsh_default.glsl.js', fsh = options['fsh'] || '../../shaders/webgl2/fragment/fsh_rm_texquad.glsl.js', texture = options['texture'], transform = options['transform'];
        return new Promise((resolve, reject) => {
            let plane_g, plane_m, vshader, fshader, uniforms, 
            //aspect:number = window.innerWidth/window.innerHeight, //aspect ratio
            //aspectp:number = window.innerWidth/window.innerHeight, //prev aspect 
            plane;
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
                plane_g = new THREE.PlaneGeometry(2, 2);
                plane_m = new THREE.ShaderMaterial({
                    transparent: true,
                    opacity: opacity,
                    fog: fog,
                    glslVersion: glslVersion,
                    vertexShader: vshader,
                    uniforms: uniforms,
                    fragmentShader: fshader,
                    side: THREE.DoubleSide,
                });
                // blending - check: need gl.enable(gl.BLEND)
                plane_m.blending = THREE.CustomBlending;
                plane_m.blendSrc = THREE.SrcAlphaFactor; // default
                plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                //plane_m.depthTest = true;  //default is f
                // plane
                plane = new THREE.Mesh(plane_g, plane_m);
                //transform
                //        console.log(`rmquad: transform = ${transform}:`);
                //        console.dir(transform);
                if (transform && Object.keys(transform).length > 0) {
                    //          console.log(`rmquad: *** executing transform`);
                    transform3d.apply(transform, plane);
                    //          console.log(`rmquad.position.x = ${plane.position.x}`);
                    //          console.log(`rmquad.position.y = ${plane.position.y}`);
                    //          console.log(`rmquad.position.z = ${plane.position.z}`);
                }
                plane['animate'] = function (et) {
                    if (plane_m.uniforms && plane_m.uniforms['uTime']) {
                        plane_m.uniforms.uTime.value = et / 1000.0;
                        plane_m.uniforms.uTime.needsUpdate = true;
                    }
                    //          aspect = window.innerWidth/window.innerHeight;
                    //          if(aspect !== aspectp){
                    //            if(plane_m.uniforms && plane_m.uniforms['uAspect']){
                    //              //console.log('aspect');
                    //              plane_m.uniforms.uAspect.value = aspect;
                    //              plane_m.uniforms.uAspect.needsUpdate = true;
                    //            }
                    //          }
                    //          aspectp = aspect;
                    //plane_m.uniforms.uResolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
                    //plane_m.uniforms.uResolution.needsUpdate = true;
                };
                // ACTOR.INTERFACE delta method for modifying properties
                plane['delta'] = (options = {}) => {
                    //console.log(`rmquad.delta: options = ${options}:`);
                    //console.dir(options); 
                    const opacity = options['opacity'], transform = options['transform'];
                    if (opacity !== undefined) {
                        plane_m.opacity = opacity;
                    }
                    //transform
                    if (transform && Object.keys(transform).length > 0) {
                        transform3d.apply(transform, plane);
                    }
                };
                // test ONLY!!!
                if (texture) {
                    loader.load(texture, (t) => {
                        plane_m.uniforms.tDiffuse.value = t;
                        plane_m.uniforms.tDiffuse.needsUpdate = true;
                        // return textured rmquad ready to be added to scene
                        resolve(plane);
                    });
                }
                else {
                    // return untextured rmquad ready to be added to scene
                    resolve(plane);
                }
            } //load()
            load();
        }); //return new Promise
    } //create
}; //Rmquad;
//# sourceMappingURL=rmquad.js.map
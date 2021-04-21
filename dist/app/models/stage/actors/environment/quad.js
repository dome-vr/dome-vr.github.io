// class Quad - Factory
export const Quad = class {
    static create(options = {}) {
        // const options
        const width = options['width'] || 2, height = options['height'] || 2, color = options['color'] || 'white', opacity = options['opacity'] || 1.0, vsh_url = options['vsh'], fsh_url = options['fsh'];
        // const but unassigned
        let vsh, fsh, uniforms, shaders;
        //diagnostics
        console.log(`\n&&& Quad vsh_url=${vsh_url} fsh_url=${fsh_url}; options:`);
        console.dir(options);
        try {
            (async () => {
                shaders = await Promise.all([
                    import(vsh_url),
                    import(fsh_url)
                ]);
                vsh = shaders[0];
                fsh = shaders[1]['fsh'];
                uniforms = shaders[1]['uniforms'];
            })();
        }
        catch (e) {
            console.log(`quad shaders Promise rejected: ${e}`);
            return new Promise((resolve, reject) => {
                reject(e);
            });
        }
        return new Promise((resolve, reject) => {
            const plane_g = new THREE.PlaneBufferGeometry(width, height, 1, 1), plane_m = new THREE.ShaderMaterial({
                vertexShader: vsh,
                fragmentShader: fsh,
                uniforms: uniforms,
                transparent: true,
                side: THREE.DoubleSide,
            });
            //plane:THREE.Mesh;
            // blending
            // check: need gl.enable(gl.BLEND)
            plane_m.blendSrc = THREE.SrcAlphaFactor; // default
            plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
            //grid_m.depthTest = false;  //default
            // plane
            const plane = new THREE.Mesh(plane_g, plane_m);
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            plane['delta'] = (options = {}) => {
                //console.log(`rmquad.delta: options = ${options}:`);
                //console.dir(options);
                const color = options['color'], opacity = options['opacity'];
                if (color !== undefined) {
                    plane_m.color = color;
                }
                if (opacity !== undefined) {
                    plane_m.opacity = opacity;
                }
            };
            // render method - not needed in this case
            //plane['render'] = (et:number=0, options:object={}) => {}
            // return actor ready to be added to scene
            resolve(plane);
        }); //return new Promise
    } //create
}; //Quad;
//# sourceMappingURL=quad.js.map
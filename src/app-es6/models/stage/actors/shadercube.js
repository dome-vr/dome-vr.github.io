// shadercube.ts
// requires options={vsh:vsh, fsh:fsh, uniforms:uniforms}!!
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var create;
    return {
        setters:[],
        execute: function() {
            exports_1("create", create = (options = {}) => {
                var cube_g, cube_m, cube, 
                // options
                vsh = options['vsh'], fsh = options['fsh'], uniforms = options['uniforms'];
                // diagnostics
                //console.log(`shadercube: vsh = ${vsh}`);
                //console.log(`shadercube: fsh = ${fsh}`);
                //console.log(`shadercube: uniforms = ${uniforms}`);
                return new Promise((resolve, reject) => {
                    cube_g = new THREE.BoxBufferGeometry(2.0, 2.0, 2.0);
                    cube_m = new THREE.ShaderMaterial({
                        vertexShader: vsh,
                        fragmentShader: fsh,
                        uniforms: uniforms,
                        transparent: true,
                        side: THREE.DoubleSide
                    });
                    cube_m.blendSrc = THREE.SrcAlphaFactor; // default
                    cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                    cube_m.depthTest = false;
                    cube = new THREE.Mesh(cube_g, cube_m);
                    // delta method for modifying properties
                    cube['delta'] = (options = {}) => {
                        cube_m.transparent = options['transparent'] || cube_m.transparent;
                        cube_m.vertexShader = options['vsh'] || vsh;
                        cube_m.fragmentShader = options['fsh'] || fsh;
                        cube_m.uniforms = options['uniforms'] || uniforms;
                    };
                    // render method - not needed in this case
                    //cube['render'] = (et:number=0, options:object={}) => {}
                    // return actor ready to be added to scene
                    resolve(cube);
                }); //return new Promise
            });
        }
    }
});
//# sourceMappingURL=shadercube.js.map
System.register(['../services/mediator', '../models/space/quad_vsh/vsh_default.glsl', '../models/space/quad_fsh/fsh_default.glsl'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1, vsh_default_glsl_1, fsh_default_glsl_1, fsh_default_glsl_2;
    var space, vsh, fsh, uniforms, Space;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            },
            function (vsh_default_glsl_1_1) {
                vsh_default_glsl_1 = vsh_default_glsl_1_1;
            },
            function (fsh_default_glsl_1_1) {
                fsh_default_glsl_1 = fsh_default_glsl_1_1;
                fsh_default_glsl_2 = fsh_default_glsl_1_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            vsh = vsh_default_glsl_1.vsh, fsh = fsh_default_glsl_1.fsh, uniforms = fsh_default_glsl_2.uniforms;
            class Space {
                // ctor
                constructor() {
                    space = this;
                } //ctor
                delta(state, sgTarget, callback) {
                    mediator_1.mediator.log(`space delta: state = ${state}`);
                    // function builds ShaderMaterial to return in callback
                    var _shMat = () => {
                        //console.log(`_shMat() called`);
                        try {
                            callback(null, { rm_shMat: new THREE.ShaderMaterial({
                                    uniforms: uniforms,
                                    vertexShader: vsh,
                                    fragmentShader: fsh,
                                    transparent: true,
                                    depthWrite: false
                                })
                            });
                        }
                        catch (e) {
                            callback(e, null);
                        }
                    };
                    mediator_1.mediator.log(`^^^^ space: state['_space'] = ${state['_space']}`);
                    if (state['_space'] !== undefined) {
                        if (state['_space']) {
                            if (state['fsh']) {
                                console.log(`importing fsh ${state['fsh']}`);
                                System.import(state['fsh'])
                                    .then((Shader) => {
                                    fsh = Shader.fsh || fsh; // export
                                    uniforms = Shader.uniforms || uniforms; // export
                                    //mediator.log(`imported fsh = ${Shader.fsh}`);
                                    //for(let p of Object.keys(uniforms)){
                                    //  mediator.logc(`uniforms contains = ${p}`);
                                    //}
                                    _shMat();
                                }).catch((e) => {
                                    console.error(`space:import ${state['fsh']} caused error: ${e}`);
                                    callback(e, null);
                                });
                            }
                            else {
                                _shMat();
                            }
                        }
                        else {
                            vsh = vsh;
                            fsh = fsh;
                            uniforms = uniforms;
                            _shMat();
                        }
                    }
                    else {
                        mediator_1.mediator.logc(` modify rm-quad-shader uniforms TBD!!`);
                        callback(null, {});
                    }
                } //delta
            }
             //Space
            // enforce singleton export
            if (space === undefined) {
                space = new Space();
            }
            exports_1("space", space);
        }
    }
});
//# sourceMappingURL=space.js.map
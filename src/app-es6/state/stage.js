// stage.ts
System.register(['../services/mediator', '../services/actors'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1, actors_1;
    var stage, axes, ambient_light, ambient_color, ambient_intensity, fog, fog_color, fog_near, fog_far, cube, cube_urls, cube_opacity, cubeLoader, dome, dome_url, dome_opacity, textureLoader, environment, skycube, skydome, Stage;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            },
            function (actors_1_1) {
                actors_1 = actors_1_1;
            }],
        execute: function() {
            // singleton closure-instance variables 
            // defaults for ambient_light, fog, skycube and skydome
            ambient_color = 'white', ambient_intensity = 1.0, fog_color = 'white', fog_near = 0.5, fog_far = 5.0, cube_urls = ['', '', '', '', '', ''], cube_opacity = 1.0, cubeLoader = new THREE.CubeTextureLoader(), dome_url = '', dome_opacity = 1.0, textureLoader = new THREE.TextureLoader(), 
            // generative functions
            // RECALL: _p = t => create, _p = f => remove, _p undefined => modify
            environment = (state, callback) => {
                try {
                    // axes
                    if (state['axes']) {
                        let _axes = state['axes']['_axes']; // t/f
                        axes = (_axes ? new THREE.AxesHelper(100000) : null);
                    }
                    // ambient_light
                    if (state['ambient_light']) {
                        let _ambient_light = state['ambient_light']['_ambient_light']; // t/f/undefined
                        ambient_color = state['ambient_light']['color'] || ambient_color;
                        ambient_intensity = state['ambient_light']['intensity'] || ambient_intensity;
                        if (_ambient_light !== undefined) {
                            ambient_light = (_ambient_light ? new THREE.AmbientLight(ambient_color, ambient_intensity) : null);
                        }
                        else {
                            ambient_light.color = ambient_color;
                            ambient_light.intensity = ambient_intensity;
                        }
                    }
                    // fog
                    if (state['fog']) {
                        let _fog = state['fog']['_fog']; // t/f/undefined
                        fog_color = state['fog']['color'] || fog_color;
                        fog_near = state['fog']['near'] || fog_near;
                        fog_far = state['fog']['far'] || fog_far;
                        if (_fog !== undefined) {
                            fog = (_fog ? fog = new THREE.Fog(fog_color, fog_near, fog_far) : null);
                        }
                        else {
                            fog.color = fog_color;
                            fog.near = fog_near;
                            fog.far = fog_far;
                            callback(null, {});
                        }
                    }
                }
                catch (e) {
                    mediator_1.mediator.loge(`error in environment_init: ${e.message}`);
                    callback(null, {});
                }
                callback(null, { axes: axes, ambient_light: ambient_light, fog: fog });
            }, 
            // environment
            skycube = (state, callback) => {
                var cube_g, cube_m, cube_shader;
                if (Object.keys(state).length === 0) {
                    callback(null, {});
                }
                try {
                    let _skycube = state['_skycube'];
                    if (_skycube !== undefined) {
                        if (_skycube) {
                            cube_opacity = state['opacity'] || cube_opacity;
                            cube_urls = state['cube_urls'] || cube_urls;
                            cube_g = new THREE.BoxBufferGeometry(10000, 10000, 10000, 1, 1, 1);
                            // load
                            cubeLoader.load(cube_urls, (t) => {
                                console.log(`\n\n&&&&&&& skycube textures t:`);
                                console.dir(t);
                                cube_shader = THREE.ShaderLib['cube'];
                                cube_shader.uniforms['tCube'].value = t;
                                cube_m = new THREE.ShaderMaterial({
                                    vertexShader: cube_shader.vertexShader,
                                    fragmentShader: cube_shader.fragmentShader,
                                    uniforms: cube_shader.uniforms,
                                    depthWrite: false,
                                    opacity: cube_opacity,
                                    side: THREE.BackSide
                                });
                                //cube_m.blendDst = THREE.DstAlphaFactor;
                                //cube_m.depthTest = false;
                                //cube_m.blending = THREE.AdditiveBlending;
                                cube_m.blending = THREE.CustomBlending;
                                cube_m.blendSrc = THREE.SrcAlphaFactor; // default
                                //cube_m.blendDst = THREE.DstAlphaFactor;
                                cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                                cube_m.blendEquation = THREE.AddEquation; // default
                                cube = new THREE.Mesh(cube_g, cube_m);
                                cube.renderOrder = 8.5; // larger rO is rendered first ?!
                                // cube rendered 'behind' dome & actors
                                mediator_1.mediator.log(`@@@skycube() cube = ${cube}`);
                                if (state['visible'] !== undefined) {
                                    cube.visible = state['visible'];
                                }
                                callback(null, { skycube: cube });
                            });
                        }
                        else {
                            callback(null, { skycube: null }); // false => remove
                        }
                    }
                    else {
                        if (state['visible'] !== undefined) {
                            cube.visible = state['visible'];
                        }
                    }
                }
                catch (e) {
                    mediator_1.mediator.loge(`error in skycube_init: ${e.message}`);
                    callback(null, {});
                }
            }, 
            // skycube
            skydome = (state, callback) => {
                var dome_g, dome_m;
                try {
                    if (Object.keys(state).length === 0) {
                        callback(null, {});
                    }
                    let _skydome = state['_skydome'];
                    if (_skydome !== undefined) {
                        if (_skydome) {
                            dome_opacity = state['opacity'] || dome_opacity;
                            dome_url = state['dome_url'] || dome_url;
                            dome_g = new THREE.SphereBufferGeometry(2000, 16, 12);
                            dome_g.applyMatrix(new THREE.Matrix4().makeScale(1.0, 2.4, 1.0));
                            textureLoader.load(dome_url, (texture) => {
                                dome_m = new THREE.MeshBasicMaterial({
                                    map: texture,
                                    transparent: true,
                                    opacity: dome_opacity
                                });
                                dome_m.side = THREE.BackSide;
                                //dome_m.blendDst = THREE.DstAlphaFactor;
                                //dome_m.depthTest = false;
                                //dome_m.blending = THREE.CustomBlending;
                                dome_m.blendSrc = THREE.SrcAlphaFactor; // default
                                //dome_m.blendDst = THREE.DstAlphaFactor;
                                dome_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                                //dome_m.blendEquation = THREE.AddEquation; // default
                                dome = new THREE.Mesh(dome_g, dome_m);
                                dome.position.z = -1.01;
                                dome.renderOrder = 9; // larger rO is rendered first ?!
                                mediator_1.mediator.log(`@@@skydome() dome = ${dome}`);
                                if (_skydome['visible'] !== undefined) {
                                    dome.visible = state['visible'];
                                }
                                callback(null, { skydome: dome });
                            });
                        }
                        else {
                            callback(null, { skydome: null }); // false => remove
                        }
                    }
                    else {
                        if (state['visible'] !== undefined) {
                            dome.visible = state['visible'];
                        }
                    }
                }
                catch (e) {
                    mediator_1.mediator.loge(`error in skydome_init: ${e.message}`);
                    callback(null, {});
                }
            };
            // skydome
            class Stage {
                // ctor
                constructor() {
                    stage = this;
                } //ctor
                delta(state = {}, narrative, callback) {
                    mediator_1.mediator.log(`Stage.delta: state = ${state}`);
                    async.parallel({
                        frame: function (callback) {
                            try {
                                if (state['frame']) {
                                    callback(null, { _stats: state['frame']['_stats'] });
                                }
                                else {
                                    callback(null, {});
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`stage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        },
                        environment: function (callback) {
                            try {
                                if (state['environment']) {
                                    environment(state['environment'], callback);
                                }
                                else {
                                    callback(null, {});
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`stage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        },
                        actors: function (callback) {
                            try {
                                if (state['actors']) {
                                    actors_1.actors.create(state['actors'], narrative, callback);
                                }
                                else {
                                    callback(null, {});
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`stage.delta caused error: ${e}`);
                                callback(e, {});
                            }
                        },
                        skycube: function (callback) {
                            try {
                                if (state['skycube']) {
                                    skycube(state['skycube'], callback);
                                }
                                else {
                                    callback(null, {});
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`stage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        },
                        skydome: function (callback) {
                            try {
                                if (state['skydome']) {
                                    skydome(state['skydome'], callback);
                                }
                                else {
                                    callback(null, {});
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`stage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        }
                    }, //first arg
                        (err, o) => {
                        if (err) {
                            mediator_1.mediator.loge("error: " + err);
                            return;
                        }
                        mediator_1.mediator.log(`stage: o['environemt']['axes'] = ${o['environment']['axes']}`);
                        mediator_1.mediator.log(`stage: o['environemt']['ambient_light'] = ${o['environment']['ambient_light']}`);
                        mediator_1.mediator.log(`stage: o['environemt']['fog'] = ${o['environment']['fog']}`);
                        mediator_1.mediator.log(`stage: o['skycube']['skycube'] = ${o['skycube']['skycube']}`);
                        mediator_1.mediator.log(`stage: o['skydome']['skydome'] = ${o['skydome']['skydome']}`);
                        callback(null, {
                            actors: o['actors']['actors'],
                            axes: o['environment']['axes'],
                            ambient_light: o['environment']['ambient_light'],
                            fog: o['environment']['fog'],
                            skycube: o['skycube']['skycube'],
                            skydome: o['skydome']['skydome'],
                            frame: o['frame']
                        });
                    } //2nd arg
                     //2nd arg
                    ); //async.parallel
                } //delta
            }
             //Stage
            // enforce singleton export
            if (stage === undefined) {
                stage = new Stage();
            }
            exports_1("stage", stage);
        }
    }
});
//# sourceMappingURL=stage.js.map
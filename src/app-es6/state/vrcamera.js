System.register(['../services/mediator', '../models/space/quad_vsh/vsh_default.glsl', '../models/space/quad_fsh/fsh_default.glsl'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1, vsh_default_glsl_1, fsh_default_glsl_1, fsh_default_glsl_2;
    var vrcamera, fsh, uniforms, csphere_radius, csphere_g, csphere_m, csphere, csphere_visible, csphere_wireframe, csphere_opacity, csphere_color, lens, aspect, fov, near, far, controls, key, fill, back, transparent_texture, _post, hud_scaleX, hud_scaleY, hud_texture, VrCamera;
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
            fsh = fsh_default_glsl_1.fsh, uniforms = fsh_default_glsl_2.uniforms;
            // vrcamera instrument components - csphere, controls, lens, hud, key, fill, back
            // vrcamera - properties modified by vrcamera.delta
            // NOTE: controls and lens are defined and used in narrative
            // csphere
            csphere_radius = 1.0;
            csphere_g = new THREE.SphereBufferGeometry, csphere_visible = false, csphere_wireframe = true, csphere_opacity = 1.0, csphere_color = 'green', fov = 90.0, near = 0.001, far = 100000, 
            // HUD - z=0 plane for vrcamera-'lens' 
            // NOTE: HUD is at distance csphere.scale * Math.tan(0.5 * vrcamera.fov)
            //   from the lens along the lens fwd-vector
            // HUD defaults:
            transparent_texture = './assets/images/transparent_pixel.png', _post = false;
            class VrCamera {
                // ctor
                constructor() {
                    vrcamera = this;
                }
                // initialize and return csphere, lens, hud, key, fill, back
                initialize() {
                    var state = config['initial_vrcamera'], o = {}; // used to return csphere, lens, controls, lights. hud
                    return new Promise((resolve, reject) => {
                        async.series({
                            vrcamera: (callback) => {
                                // vrcamerasphere
                                if (state['csphere']) {
                                    let c = state['csphere'];
                                    if ((c['visible'] !== undefined) && (c['visible'] === false)) {
                                        csphere_visible = false;
                                    }
                                    else {
                                        csphere_visible = c['visible'] || csphere_visible;
                                    }
                                    if ((c['wireframe'] !== undefined) && (c['wireframe'] === false)) {
                                        csphere_wireframe = false;
                                    }
                                    else {
                                        csphere_wireframe = c['wireframe'] || csphere_wireframe;
                                    }
                                    if ((c['opacity'] !== undefined) && (c['opacity'] === 0.0)) {
                                        csphere_opacity = 0.0;
                                    }
                                    else {
                                        csphere_opacity = c['opacity'] || csphere_opacity;
                                    }
                                    csphere_g = new THREE.SphereBufferGeometry(csphere_radius);
                                    csphere_m = new THREE.MeshBasicMaterial({
                                        visible: csphere_visible,
                                        color: c['color'] || csphere_color,
                                        transparent: true,
                                        opacity: csphere_opacity,
                                        wireframe: csphere_wireframe
                                    });
                                    csphere = new THREE.Mesh(csphere_g, csphere_m);
                                }
                                // initial vrcamera 'lens' - can be immediately modified by state['vrcamera']
                                aspect = window.innerWidth / window.innerHeight;
                                if (state['lens']) {
                                    let l = state['lens'];
                                    fov = l['fov'] || fov;
                                    near = l['near'] || near;
                                    far = l['far'] || far;
                                    mediator_1.mediator.logc(`lens fov = ${fov}`);
                                }
                                lens = new THREE.PerspectiveCamera(fov, aspect, near, far);
                                // diagnostic
                                lens.updateMatrixWorld(true);
                                vrcamera.report_vrcamera_world();
                                // lights
                                [key, fill, back] = ['key', 'fill', 'map'].map((name) => {
                                    var o = state[name] || {}, l = new THREE.PointLight(), pos_a = o['position'] || lens.position.toArray();
                                    l.color = o['color'] || 'white'; // default white
                                    l.intensity = o['intensity'] || 1.0; // default 1.0
                                    l.distance = o['distance'] || 0.0,
                                        l.position.fromArray(pos_a); // default lens 'headlight'
                                    return l;
                                });
                                callback();
                            },
                            controls: (callback) => {
                                // csphere-controls
                                if (config._controls) {
                                    System.import(config._controls)
                                        .then((Controls) => {
                                        controls = Controls.controls; // exports singleton instance
                                        //mediator.log(`&&&& vrcamera: controls has properties: ${Object.getOwnPropertyNames(controls.__proto__)}`);
                                        //mediator.log(`csphere = ${csphere}`);
                                        controls.initialize(csphere, config.controlsOptions);
                                        controls.controller.connect();
                                        console.log(`&&&& controls initialized and connected!`);
                                        callback();
                                    })
                                        .catch((e) => {
                                        mediator_1.mediator.loge(`vrcamera: import of Controls caused error: ${e}`);
                                    });
                                }
                                else {
                                    callback();
                                }
                            }
                        }, (err) => {
                            // collect results and send back to narrative
                            o['csphere'] = csphere;
                            o['controls'] = controls;
                            o['lens'] = lens;
                            o['key'] = key;
                            o['fill'] = fill;
                            o['back'] = back;
                            resolve(o);
                        });
                    });
                } //initialize
                // diagnostics utility functions - vrcamera world information
                // local position
                // world position
                // world up
                // world fwd
                // world R
                report_vrcamera_world() {
                    var cam_wp = new THREE.Vector3(), cam_up = new THREE.Vector3(), world_q = new THREE.Quaternion(), cam_fwd = new THREE.Vector3(), cam_right = new THREE.Vector3();
                    // cam_wp
                    lens.updateMatrixWorld(); // Object3D matrixAutoUpdate default true
                    //cam_wp = vrcamera.matrixWorld.getPosition(); // same as next
                    cam_wp = lens.getWorldPosition(cam_wp);
                    // cam_up
                    lens.getWorldQuaternion(world_q);
                    cam_up.copy(lens.up).applyQuaternion(world_q);
                    // cam_fwd
                    cam_fwd = lens.getWorldDirection(cam_fwd);
                    // cam_right
                    cam_right.crossVectors(cam_fwd, cam_up);
                    // report
                    //    console.log(`lens object position is:`);
                    //    console.dir(lens.position.toArray());
                    //    console.log(`lens world position is:`);
                    //    console.dir(cam_wp.toArray());
                    //    console.log(`lens up is:`);
                    //    console.dir(cam_up.toArray());
                    //    console.log(`lens fwd is:`);
                    //    console.dir(cam_fwd.toArray());
                    //    console.log(`lens right is:`);
                    //    console.dir(cam_right.toArray());
                }
                // report_vrcamera_world
                // examine information from o3d.matrix - local matrix unless world=true
                // in which case examines o3d.matrixWorld
                // * NOTE: if o3d has no object parent (i.e is at the root of the scenegraph)
                //   then o3d.matrix === o3d.matrixWorld<br>
                //   This is true for csphere (vrcamerasphere) for example<br>
                // reports:<br>
                //   translation Vector3<br>
                //   rotation    Quaternion<br>
                //   scalar      Vector3
                examine_matrix(m) {
                    //for(var i=0; i<16; i++){
                    //  mediator.logc(`examine_matrix: m[${i}] = ${m.elements[i]}`);
                    //}
                    // component representation - t-ranslation, q-uaternion rotation, s-cale
                    var t = new THREE.Vector3();
                    var q = new THREE.Quaternion();
                    var s = new THREE.Vector3();
                    m.decompose(t, q, s);
                    mediator_1.mediator.logc(`examine_matrix: translation.x = ${t.x}`);
                    mediator_1.mediator.logc(`examine_matrix: translation.y = ${t.y}`);
                    mediator_1.mediator.logc(`examine_matrix: translation.z = ${t.z}`);
                    mediator_1.mediator.logc(`\nexamine_matrix: quaternion.x = ${q.x}`);
                    mediator_1.mediator.logc(`examine_matrix: quaternion.y = ${q.y}`);
                    mediator_1.mediator.logc(`examine_matrix: quaternion.z = ${q.z}`);
                    mediator_1.mediator.logc(`examine_matrix: quaternion.w = ${q.w}`);
                    mediator_1.mediator.logc(`\nexamine_matrix: scale.x = ${s.x}`);
                    mediator_1.mediator.logc(`examine_matrix: scale.y = ${s.y}`);
                    mediator_1.mediator.logc(`examine_matrix: scale.z = ${s.z}`);
                }
                delta(state, hud, callback) {
                    mediator_1.mediator.log(`VrCamera.delta: state = ${state} hud = ${hud}`);
                    // controls
                    if (state['controls']) {
                        let _c = state['controls'];
                        controls.invert = (_c['invert'] === undefined ? true : _c['invert']);
                        controls.translationSpeed = _c['translationSpeed'] || controls.translationSpeed;
                        controls.rotationSpeed = _c['rotationSpeed'] || controls.rotationSpeed;
                        controls.transSmoothing = _c['transSmoothing'] || controls.transSmoothing;
                        controls.rotationSmoothing = _c['rotationSmoothing'] || controls.rotationSmoothing;
                        controls.translationDecay = _c['translationDecay'] || controls.translationDecay;
                        controls.scaleDecay = _c['scaleDecay'] || controls.scaleDecay;
                        controls.rotationSlerp = _c['rotationSlerp'] || controls.rotationSlerp;
                        controls.pinchThreshold = _c['pinchThreshold'] || controls.pinchThreshold;
                    }
                    // lens
                    if (state['lens']) {
                        let _lens = state['lens'];
                        lens.fov = _lens['fov'] || lens.fov;
                        lens.near = _lens['near'] || lens.near;
                        lens.far = _lens['far'] || lens.far;
                        if (_lens['position']) {
                            let _pos = _lens['position'];
                            lens.position.x = _pos['x'] || lens.position.x;
                            lens.position.y = _pos['y'] || lens.position.y;
                            lens.position.z = _pos['z'] || lens.position.z;
                        }
                    }
                    // csphere
                    // NOTE: csphere_radius (= csphere.geometry.parameters.radius) is fixed
                    //   and non-modifiable by vrcamera.delta !!
                    if (state['csphere']) {
                        let c = state['csphere'];
                        if ((c['visible'] !== undefined) && (c['visible'] === false)) {
                            csphere.visible = false;
                        }
                        else {
                            csphere.visible = c['visible'] || csphere_visible;
                        }
                        if ((c['wireframe'] !== undefined) && (c['wireframe'] === false)) {
                            csphere.material.wireframe = false;
                        }
                        else {
                            csphere.material.wireframe = c['wireframe'] || csphere.material.wireframe;
                        }
                        csphere.material.color = c['color'] || csphere.material.color;
                    }
                    // key
                    if (state['key']) {
                        let _key = state['key'];
                        key.color = _key['color'] || key.color;
                        key.intensity = _key['intensity'] || key.intensity;
                        key.distance = _key['distance'] || key.distance;
                        if (_key['position']) {
                            key.position.fromArray(_key['position']);
                        }
                    } //key
                    // fill
                    if (state['fill']) {
                        let _fill = state['fill'];
                        fill.color = _fill['color'] || fill.color;
                        fill.intensity = _fill['intensity'] || fill.intensity;
                        fill.distance = _fill['distance'] || fill.distance;
                        if (_fill['position']) {
                            fill.position.fromArray(_fill['position']);
                        }
                    } //fill
                    // back
                    if (state['back']) {
                        let _back = state['back'];
                        back.color = _back['color'] || back.color;
                        back.intensity = _back['intensity'] || back.intensity;
                        back.distance = _back['distance'] || back.distance;
                        if (_back['position']) {
                            back.position.fromArray(_back['position']);
                        }
                    } //back
                    // hud
                    if (state['hud']) {
                        let _hud = state['hud'], prepare_hud = () => {
                            hud.visible = _hud['_hud_rendered'] || hud.visible; // rendered?
                            _post = _hud['_post'];
                            hud.opacity = _hud['opacity'] || hud.opacity;
                            if (_hud['scaleX'] || _hud['scaleY']) {
                                hud_scaleX = _hud['scaleX'] || hud.scale.x;
                                hud_scaleY = _hud['scaleY'] || hud.scale.y;
                                hud.scale.set(hud_scaleX, hud_scaleY, 1.0);
                            }
                            if (_hud['texture']) {
                                hud_texture = _hud['texture'];
                                if (hud_texture === undefined || hud_texture === '') {
                                    hud_texture = transparent_texture;
                                }
                                (new THREE.TextureLoader()).load(hud_texture, (t) => {
                                    hud.material.uniforms.tDiffuse.value = t;
                                    hud.material.uniforms.tDiffuse.needsUpdate = true;
                                    callback(null, { _post: _post });
                                });
                            }
                            else {
                                callback(null, { _post: _post });
                            }
                        }; //prepare_hud
                        if (_hud['fsh']) {
                            System.import(_hud['fsh'])
                                .then((Shader) => {
                                fsh = Shader.fsh || fsh; // export
                                uniforms = Shader.uniforms || uniforms; // export
                                hud.material.vertexShader = vsh_default_glsl_1.vsh;
                                hud.material.fragmentShader = fsh;
                                hud.material.uniforms = uniforms;
                                hud.material.needsUpdate = true; // needed?
                                //console.log(`System.import(_hud['fsh']) returns fsh = ${fsh}`);
                                prepare_hud();
                            })
                                .catch((e) => {
                                console.error(`index: import of ${_hud['fsh']} caused error: ${e}`);
                            });
                        }
                        else {
                            prepare_hud();
                        }
                    }
                    else {
                        callback(null, {});
                    }
                } //delta
            }
             //VrCamera
            // enforce singleton export
            if (vrcamera === undefined) {
                vrcamera = new VrCamera();
            }
            exports_1("vrcamera", vrcamera);
        }
    }
});
//# sourceMappingURL=vrcamera.js.map
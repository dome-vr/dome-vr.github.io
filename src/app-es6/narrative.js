System.register(['./state/camera', './state/stage', './state/cloud', './state/space', './state/audio', './state/vrstage', './state/vrcloud', './state/action', './services/queue', './services/mediator', './services/animation', './services/camera3d', './services/vrspace', './models/space/quad_vsh/vsh_default.glsl', './models/space/quad_fsh/fsh_default.glsl'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var camera_1, stage_1, cloud_1, space_1, audio_1, vrstage_1, vrcloud_1, action_1, queue_1, mediator_1, animation_1, camera3d_1, vrspace_1, vsh_default_glsl_1, fsh_default_glsl_1, fsh_default_glsl_2;
    var narrative, state, stats, TWEEN, _stats, _cloud, _vrcloud, clock, _deltaTime, et, t0, at, animating, csph_r, canvas, scene, rm_scene, renderer, clearColor, alpha, antialias, csphere, key, fill, back, controls, lens, orbitcontrols, hud_g, hud_m, hud, hud_scaleX, hud_scaleY, quad_g, quad_m, quad, width, height, _space, a, sgTarget, rmTarget, cube, dome, axes, ambient_light, fog, cloud_pivot, vrcloud_pivot, spritegroup, vr_spritegroup, _action, actions, rm_point, rm_pivot, world_q, world_qp, lens_q, cam_up, lens_posp, delta_pos, fov_initial, fovp, aspect, aspectp, transparent_texture, _webvr, _webvr_skybox, _webvr_skycube, _webvr_skycube_faces, _webvr_skydome, vr_scene, vr_cube, vr_dome, vr_group, vr_face, _vive, vive_controller1, vive_controller2, _sg3D, vr_ambient_light, vr_axes, vr_fog, frame, vcopy, onWindowResize, render, animate, Narrative;
    return {
        setters:[
            function (camera_1_1) {
                camera_1 = camera_1_1;
            },
            function (stage_1_1) {
                stage_1 = stage_1_1;
            },
            function (cloud_1_1) {
                cloud_1 = cloud_1_1;
            },
            function (space_1_1) {
                space_1 = space_1_1;
            },
            function (audio_1_1) {
                audio_1 = audio_1_1;
            },
            function (vrstage_1_1) {
                vrstage_1 = vrstage_1_1;
            },
            function (vrcloud_1_1) {
                vrcloud_1 = vrcloud_1_1;
            },
            function (action_1_1) {
                action_1 = action_1_1;
            },
            function (queue_1_1) {
                queue_1 = queue_1_1;
            },
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            },
            function (animation_1_1) {
                animation_1 = animation_1_1;
            },
            function (camera3d_1_1) {
                camera3d_1 = camera3d_1_1;
            },
            function (vrspace_1_1) {
                vrspace_1 = vrspace_1_1;
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
            // needed in animate-render-loop
            _stats = true, _cloud = false, _vrcloud = false, 
            // start time (first nar.changeState()) and elapsed time from start
            // animating is flag indicating whether animation has begun (t) or not (f)
            clock = new THREE.Clock(), _deltaTime = true, 
            //dt:number = 0,  // deltaTime from clock  
            et = 0, t0 = 0, at = 0, animating = false, 
            // scale factor for stage actor objects = csphere_radius
            csph_r = 1.0, clearColor = 0xffffff, alpha = 1.0, antialias = false, hud_scaleX = 1.0, hud_scaleY = 1.0, 
            // resize
            width = window.innerWidth, height = window.innerHeight, 
            // animate-render
            _space = false, 
            // render variables
            rm_point = new THREE.Object3D(), rm_pivot = new THREE.Object3D(), world_q = new THREE.Quaternion(), world_qp = new THREE.Quaternion(), lens_q = new THREE.Quaternion(), cam_up = new THREE.Vector3(), 
            //cam_fwd:THREE.Vector3 = new THREE.Vector3(),
            //cam_right:THREE.Vector3 = new THREE.Vector3(),
            lens_posp = new THREE.Vector3(), delta_pos = new THREE.Vector3(), fov_initial = 90, 
            // post
            transparent_texture = (new THREE.TextureLoader()).load('./assets/images/transparent_pixel.png'), 
            // webvr
            _webvr = false, _webvr_skybox = false, _webvr_skycube = false, _webvr_skycube_faces = false, _webvr_skydome = false, vr_face = [], 
            // vive
            _vive = false, 
            // send sg-scenegraph to headset => no raymarch/gpgpu and no vrstage
            _sg3D = false, 
            // TEMP !!!!
            frame = 0, 
            //test_texture:THREE.Texture = (new THREE.TextureLoader()).load('./assets/images/glad.png'),
            // useless Vector3 copy in getWorldDirection and getworldPosition
            vcopy = new THREE.Vector3, onWindowResize = () => {
                var aspect;
                width = window.innerWidth;
                height = window.innerHeight;
                aspect = width / height;
                canvas.width = width;
                canvas.height = height;
                lens.aspect = aspect;
                lens.updateProjectionMatrix();
                renderer.setSize(width, height);
                // resolution
                quad.material.uniforms.uResolution.value = new THREE.Vector2(width, height);
                quad.material.uniforms.uResolution.needsUpdate = true;
                //hud.scale.set(aspect, 1.0, 1.0);     // one-half width, height
                hud.scale.set(2.0 * aspect, 2.0, 1.0); // full-screen
                //mediator.log(`canvas w=${canvas.width} h=${canvas.height}`);
            }, render = () => {
                // ellapsedTime in seconds - used in simulations
                et = clock.getElapsedTime();
                quad.material.uniforms.uTime.value = et;
                quad.material.uniforms.uTime.needsUpdate = true;
                // simulate camera shot animations
                // * csphere
                // slow examine-rotation
                //csphere.rotation.y = Math.PI * Math.sin(0.1*et);
                //csphere.rotation.x = Math.PI * Math.sin(0.1*et);
                //csphere.rotation.z = Math.PI * Math.sin(0.1*et); //same effect as roll
                // dolly-translation XYZ of csphere
                //csphere.position.x = 0.5*csph_r*Math.sin(.05*et);
                //csphere.position.y = 0.5*csph_r*Math.sin(.05*et);
                //csphere.position.z = 0.5*csph_r*Math.sin(.05*et);
                // * camera-lens
                // pan - 'OK'
                //lens.rotation.y = 0.5*Math.sin(0.1*et); 
                // tilt - 'OK'
                //lens.rotation.x = 0.5*Math.sin(0.1*et); 
                // roll - 'OK'
                //lens.rotation.z = 0.5*Math.sin(0.1*et); 
                // camera fov-zoom
                //lens.fov = 90.0 + 30.0*(Math.sin(.05*et));
                //lens.updateProjectionMatrix();
                // rotate skydome
                if (dome) {
                    dome.rotation.y = et * 0.01;
                }
                // actors
                for (let actor in narrative.actors) {
                    let _actor = narrative.actors[actor];
                    if (_actor['render']) {
                        //console.log(`${actor} is rendering`);
                        _actor['render'](et);
                    }
                }
                for (let actor in narrative.vractors) {
                    let _actor = narrative.vractors[actor];
                    let options = { texture: rmTarget.texture }; // could be ignored!
                    if (_actor['render']) {
                        //console.log(`${actor} is rendering`);
                        _actor['render'](et, options);
                    }
                }
                // animate sg scene spritecloud
                if (_cloud) {
                    //period = 0.1 + Math.random() * 0.1;  //period = 0.001;
                    let period = 0.01 + 0.01 * Math.random(); //period = 0.001;
                    for (let i = 0, l = spritegroup.children.length; i < l; i++) {
                        let sprite = spritegroup.children[i];
                        let material = sprite.material;
                        // orig - exceeds screen to much
                        //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 1.0;
                        // more constrained
                        // orig
                        //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 0.5;
                        //scale = Math.sin( et + sprite.position.z * 0.01 ) * 0.3 + 0.5;
                        let scale = Math.sin(et + sprite.position.z * 0.1) * 0.3 + 0.5;
                        let imageWidth = 1;
                        let imageHeight = 1;
                        if (material.map && material.map.image && material.map.image.width) {
                            imageWidth = material.map.image.width;
                            imageHeight = material.map.image.height;
                        }
                        material.rotation += period * 0.1; // ( i / l ); 
                        sprite.scale.set(scale * imageWidth, scale * imageHeight, 1.0);
                    }
                    // EXPT!!!!! - no spritegroup rotation in X or Y
                    //spritegroup.rotation.x = et * 0.5;
                    //spritegroup.rotation.y = et * 0.75;
                    //spritegroup.rotation.z = et * 1.0;
                    cloud_pivot.rotation.x = et * 0.2;
                    //cloud_pivot.rotation.y = et * 0.4;
                    cloud_pivot.rotation.z = et * 0.3; //0.6;
                }
                // animate vr_scene spritecloud
                if (_vrcloud) {
                    //period = 0.1 + Math.random() * 0.1;  //period = 0.001;
                    let period = 0.01 + 0.01 * Math.random(); //period = 0.001;
                    for (let i = 0, l = vr_spritegroup.children.length; i < l; i++) {
                        let sprite = vr_spritegroup.children[i];
                        let material = sprite.material;
                        // orig - exceeds screen to much
                        //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 1.0;
                        // more constrained
                        // orig
                        //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 0.5;
                        //scale = Math.sin( et + sprite.position.z * 0.01 ) * 0.3 + 0.5;
                        let scale = Math.sin(et + sprite.position.z * 0.1) * 0.3 + 0.5;
                        let imageWidth = 1;
                        let imageHeight = 1;
                        if (material.map && material.map.image && material.map.image.width) {
                            imageWidth = material.map.image.width;
                            imageHeight = material.map.image.height;
                        }
                        material.rotation += period * 0.1; // ( i / l ); 
                        sprite.scale.set(scale * imageWidth, scale * imageHeight, 1.0);
                    }
                    // EXPT!!!!! - no vr_spritegroup rotation in X or Y
                    //vr_spritegroup.rotation.x = et * 0.5;
                    //vr_spritgroup.rotation.y = et * 0.75;
                    //vr_spritegroup.rotation.z = et * 1.0;
                    vrcloud_pivot.rotation.x = et * 0.2;
                    //vrcloud_pivot.rotation.y = et * 0.4;
                    vrcloud_pivot.rotation.z = et * 0.3; //0.6;
                }
                // if quad shading-raymarch
                if (_space) {
                    // update uVertex = rm_point.position for csphere dolly
                    if (!lens.getWorldPosition(vcopy).equals(lens_posp)) {
                        delta_pos.copy(lens_posp);
                        delta_pos.addScaledVector(lens.getWorldPosition(vcopy), -1.0);
                        // KEY! normalize the lens position dimensions - as if csphere_radius
                        // had unit radius - thus scale by 1.0/csphr_r
                        delta_pos.divideScalar(csph_r);
                        rm_point.position.add(delta_pos); // delta_pos = csph_posp-csph.pos
                        lens_posp.copy(lens.getWorldPosition(vcopy));
                    }
                    // set rm_pivot counter-rotation to camera-lens for pan/tilt/roll
                    // cam_up aspect adjustments to rm-object geometry dimensions
                    lens.updateMatrixWorld();
                    lens.getWorldQuaternion(world_q);
                    if (!world_q.equals(world_qp)) {
                        // set rm_pivot counter-rotation to camera-lens for pan/tilt/roll
                        lens_q.copy(lens.quaternion);
                        rm_pivot.quaternion.copy(lens_q.inverse());
                        // cam_up
                        //cam_fwd = camera.getWorldDirection(cam_fwd);
                        //cam_right.crossVectors(cam_fwd, cam_up);
                        cam_up.copy(lens.up).applyQuaternion(world_q);
                        quad.material.uniforms.uCam_up.value = cam_up;
                        quad.material.uniforms.uCam_up.needsUpdate = true;
                        // for next frame
                        world_qp.copy(world_q);
                    }
                    // sync hud-size to lens.fov
                    // update rm-geom scaling due to effects of camera-lens fov-zoom
                    // multiply w,h,d by uFovscale
                    if (lens.fov !== fovp) {
                        let s = 2.0 * Math.tan(0.008726646 * lens.fov); // 0.5 * degr->radians
                        hud.scale.set(s, s, 1.0);
                        lens.updateProjectionMatrix();
                        quad.material.uniforms.uFovscale.value = fov_initial / lens.fov;
                        quad.material.uniforms.uFovscale.needsUpdate = true;
                        fovp = lens.fov;
                    }
                    // update rm-geom x,z to compensate for screen aspectratio distortion
                    // divide width and depth by uAspect
                    if (aspect !== aspectp) {
                        quad.material.uniforms.uAspect.value = aspect;
                        quad.material.uniforms.uAspect.needsUpdate = true;
                        aspectp = aspect;
                    }
                    // uVertex
                    // update uVertex = rm_point.getWorldPosition = rm_point.position
                    // since rm_point is a root-child of scene
                    quad.material.uniforms.uVertex.value = rm_point.getWorldPosition(vcopy);
                    quad.material.uniforms.uVertex.needsUpdate = true;
                } //if(_space)
                // @@@@render scene to target
                renderer.render(scene, lens, sgTarget);
                quad.material.uniforms.tDiffuse.value = sgTarget.texture;
                quad.material.uniforms.tDiffuse.needsUpdate = true;
                // if _webvr texture vrspace with rmTarget.texture 
                // and render vr_scene to webVR output
                // else, render rm_scene to webGL output
                if (_webvr || hud['_post']) {
                    // render rm_scene to rmTarget
                    renderer.render(rm_scene, lens, rmTarget);
                    // post-processing - rmTarget.texture to hud ShaderMaterial
                    if (hud['_post']) {
                        //if(frame%1000===0){console.log(`^^^^^^^^^^^^^^^ wr hud rmT.tx`)}; 
                        hud.material.uniforms.tDiffuse.value = rmTarget.texture;
                        hud.material.uniforms.tDiffuse.needsUpdate = true;
                    }
                    // webvr - rmTarget.texture to vrspace ShaderMaterial/Material
                    // turn on vr for third 'webvr' render of vr_scene to webvr display 
                    if (_webvr) {
                        if (frame % 1000 === 0) {
                            console.log(`_webvr:t _webvr_skycube=${_webvr_skycube} _sg3D=${_sg3D}`);
                        }
                        ;
                        renderer.vr.enabled = true;
                        // update ViveControllers
                        if (_vive) {
                            vive_controller1.update();
                            vive_controller2.update();
                        }
                        // FAILS! - rm_scene.add(vr_cubeCamera) also commented out
                        //            if(_webvr_skybox && _webvr_skybox_dynamic){  
                        //              vr_cubeCamera.updateCubeMap(renderer, rm_scene);
                        //              vr_cube.material.uniforms.tCube.value = vr_cubeCamera.renderTarget.texture;
                        //              vr_cube.material.uniforms.tCube.needsUpdate = true;
                        //            }
                        if (_webvr_skycube_faces) {
                            let i = 0;
                            ['bottom', 'top', 'left', 'right', 'back', 'front'].map((n) => {
                                vr_face[i] = vr_group.getObjectByName(n);
                                if (_sg3D) {
                                    if (frame % 1000 === 0) {
                                        console.log(`_webvr_skycube_faces uses sgT.tx in vr_scene`);
                                    }
                                    ;
                                    vr_face[i].material.map = sgTarget.texture;
                                }
                                else {
                                    vr_face[i].material.map = rmTarget.texture;
                                }
                                //vr_face[i].material.map = rmTarget.texture;
                                vr_face[i].material.needsUpdate = true;
                            });
                        }
                        if (_webvr_skycube) {
                            if (frame % 1000 === 0) {
                                console.log(`!!!! _webvr:t _webvr_skycube=${_webvr_skycube} _sg3D:${_sg3D} (t=>sgT.tx f=>rmT.tx)`);
                            }
                            ;
                            if (_sg3D) {
                                vr_cube.material.map = sgTarget.texture;
                            }
                            else {
                                vr_cube.material.map = rmTarget.texture;
                            }
                            //vr_cube.material.map = rmTarget.texture;
                            vr_cube.material.needsUpdate = true;
                        }
                        if (_webvr_skydome) {
                            if (_sg3D) {
                                if (frame % 1000 === 0) {
                                    console.log(`_webvr_skydome uses sgT.tx in vr_scene`);
                                }
                                ;
                                vr_dome.material.map = sgTarget.texture;
                            }
                            else {
                                vr_dome.material.map = rmTarget.texture;
                            }
                            //vr_dome.material.map = rmTarget.texture;
                            vr_dome.material.needsUpdate = true;
                        }
                        // _sg3D => render scene VR-OUT;  else vr_scene VR-OUT
                        //            if(_sg3D){
                        //              if(frame%1000){console.log(`^^^^&&&& webvr:t post:${hud._post} sg3D:t => scene-VR`)};
                        //              renderer.render(scene, lens);
                        //            }else{
                        //              if(frame%1000){console.log(`webvr:t post:${hud._post} sg3D:f => scene-VR`)};
                        //              renderer.render(vr_scene, lens);
                        //            }
                        // _webvr true _post:t or f => render scene VR-OUT;  else vr_scene VR-OUT
                        if (frame % 1000 === 0) {
                            console.log(`webvr:t post:t-or-f sg3D:t-or-f => vr_scene`);
                        }
                        ;
                        renderer.render(vr_scene, lens);
                    }
                    else {
                        // _webvr:f => render scene&post 3D-OUT 
                        if (frame % 1000 === 0) {
                            console.log(`webvr:f post:t sg3D:t-or-f => scene-3D`);
                        }
                        ;
                        renderer.render(scene, lens);
                    }
                }
                else {
                    // _webvr:f _post:f => render scene 3D-OUT
                    if (frame % 1000 === 0) {
                        console.log(`webvr:f post:f sg3D:t => scene-3D`);
                    }
                    ;
                    renderer.render(scene, lens);
                }
                // report
                if (frame++ % 600 === 0) {
                    if (_webvr_skycube_faces) {
                        console.log(`*******`);
                        console.log(`vr_face[0] = ${vr_face[0]}`);
                        console.log(`vr_face[0].material.color.r = ${vr_face[0].material.color.r}`);
                        console.log(`vr_face[0].material.color.g = ${vr_face[0].material.color.g}`);
                        console.log(`vr_face[0].material.color.b = ${vr_face[0].material.color.b}`);
                        console.log(`vr_face[0].material.map = ${vr_face[0].material.map}`);
                        console.log(`vr_face[0].visible = ${vr_face[0].visible}`);
                        console.log(`vr_group.visible = ${vr_group.visible}`);
                    }
                }
            }, animate = () => {
                //turn off vr for first two webGL render-passes
                if (_webvr) {
                    renderer.vr.enabled = false;
                }
                // Leap Motion csphere-controls
                if (controls) {
                    controls.update();
                }
                // delta-t - accumulate
                // _deltaTime = f => dt is ellapsed time
                // _deltaTime = t => dt is reset to 0 after every action exec
                // NOTE: et = clock.getEllapsedTime() not used - except temporarily in 
                //   render for camera animation simulation
                t0 += clock.getDelta();
                // check queue for pending actions - at undefined or at < dt => exec
                if (a = queue_1.queue.peek()) {
                    if (_deltaTime) {
                        at = a['dt'];
                    }
                    else {
                        at = a['et'];
                    }
                    if (!at || at <= t0) {
                        if (_deltaTime) {
                            t0 = 0; // reset startTime for reset of ellapsedTime t0
                        }
                        try {
                            narrative.exec(queue_1.queue.pop());
                        }
                        catch (e) {
                            mediator_1.mediator.loge(e);
                            console.trace();
                        }
                    }
                }
                if (_cloud) {
                    TWEEN.update();
                }
                if (_stats) {
                    stats.update();
                }
                render();
            };
            class Narrative {
                // ctor
                constructor() {
                    // narrative.exec targets 't' in actions 
                    this.targets = {};
                    // named management(add, remove, properties, animation) of objects in scene
                    this.actors = {};
                    this.vractors = {};
                    narrative = this;
                } //ctor
                // ingest injection vars, set testTarget if test
                bootstrap(injection) {
                    _webvr = config.webvr;
                    _vive = config.vive;
                    _sg3D = config.sg3D;
                    console.log(`\n*** n.bootstrap: _webvr is ${_webvr} _sg3D=${_sg3D}!!!!!`);
                    console.log(`*** WEBVR is ${WEBVR} !!!!!!!!`);
                    console.log(`*** injection:`);
                    console.dir(injection);
                    state = injection['state'];
                    TWEEN = injection['TWEEN'];
                    stats = injection['stats'];
                    // freeze config => no modifications of scene.config properties
                    Object.freeze(config);
                    console.log(`!!!!!! config is frozen is ${Object.isFrozen(config)}`);
                    if (config.test) {
                        System.import(config._testTarget)
                            .then((TestTarget) => {
                            narrative['targets']['testTarget'] = TestTarget.testTarget; // export
                            narrative.initialize();
                        })
                            .catch((e) => {
                            mediator_1.mediator.loge(`narrative: import of testTarget caused error: ${e}`);
                            console.trace();
                        });
                    }
                    else {
                        narrative.initialize();
                    }
                } //bootstrap
                initialize() {
                    mediator_1.mediator.logc(`*** narrative.initialize()`);
                    mediator_1.mediator.log(`scene is ${config['_state']}`);
                    // stats - create and append stats to body but initially hide
                    document.body.appendChild(stats.dom);
                    stats.dom.style.display = 'none';
                    // bg - clearColor
                    clearColor = config['clearColor'] || clearColor;
                    alpha = config['alpha'] || alpha;
                    antialias = config['antialias'] || antialias;
                    // scene - written to sgTarget, rm_scene - written to output
                    // sgTarget is the result renderer.render(scene, camera, sgTarget)
                    // which renders the three.js scenegraph to a WebGLRenderTarget sent
                    // to the space fragmentshader as sgTarget.texture uniform 'tDiffuse'
                    scene = new THREE.Scene();
                    rm_scene = new THREE.Scene();
                    // WebGLRenderTarget for initial quad for gpgpu/rm fsh-rendering,
                    sgTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, maxFilter: THREE.NearestFilter });
                    // WebGLRenderTarget for post-process feedback and vrspace texturing
                    rmTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, maxFilter: THREE.NearestFilter });
                    // initialize rm_scene output 'screen' quad
                    // quad must be bi-unit to fill NDC-cube near plane [-1,1]x[-1,1]
                    // NOTE: quad is centered at origin
                    // NOTE: size of quad is CRITICAL! raymarch assumes a virtual camera
                    //   with fov=90 positioned one unit in positive z direction relative
                    //   to the quad, orthogonal, and looking at the center of the quad.
                    //   The quad is textured with the renderTarget scenegraph 'scene',
                    //   blended with the raymarch projection
                    //   Thus the textured-quad (2x2) perfectly fills the camera view.
                    //   A larger quad would move the outer texture regions outside the
                    //   camera view creating a 'zoom-in' effect. A smaller size would
                    //   prevent the texture from filling the camera view so the quad
                    //   would be seen as a rectangle within the background of the frame
                    quad_g = new THREE.PlaneBufferGeometry(2, 2);
                    quad_m = new THREE.ShaderMaterial({
                        uniforms: fsh_default_glsl_2.uniforms,
                        vertexShader: vsh_default_glsl_1.vsh,
                        fragmentShader: fsh_default_glsl_1.fsh,
                        transparent: true,
                        depthWrite: false
                    });
                    quad = new THREE.Mesh(quad_g, quad_m);
                    rm_scene.add(quad);
                    // initialize hud
                    hud_scaleX = config.initial_camera.hud['scaleX'] || hud_scaleX;
                    hud_scaleY = config.initial_camera.hud['scaleY'] || hud_scaleY;
                    hud_g = new THREE.PlaneBufferGeometry(2 * hud_scaleX, 2 * hud_scaleY);
                    hud_m = new THREE.ShaderMaterial({
                        uniforms: fsh_default_glsl_2.uniforms,
                        vertexShader: vsh_default_glsl_1.vsh,
                        fragmentShader: fsh_default_glsl_1.fsh,
                        transparent: true,
                        depthWrite: false,
                        opacity: config.initial_camera.hud['opacity'] || 0.5
                    });
                    // alpha-blend
                    hud_m.depthTest = false;
                    hud_m.blendSrc = THREE.SrcAlphaFactor; // default
                    hud_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                    // hud
                    hud = new THREE.Mesh(hud_g, hud_m);
                    // post and visible
                    hud._post = config.initial_camera.hud['_post'] || false;
                    console.log(`^^^^^^^^^^^^^^^^^ config.init_c.hud[_post] = ${config.initial_camera.hud['_post']}`);
                    console.log(`^^^^^^^^^^^^^^^^^ hud[_post] = ${hud['_post']}`);
                    hud.visible = config.initial_camera['_hud_rendered'] || true;
                    // scale hud to aspect ratio
                    aspect = window.innerWidth / window.innerHeight;
                    //hud.scale.set(aspect, 1.0, 1.0);     // one-half width, height
                    hud.scale.set(2.0 * aspect, 2.0, 1.0); // full-screeen
                    // renderOrder
                    hud.renderOrder = 10; //rendered after dome rO=9, skybox,objects rO=0
                    // renderer
                    canvas = document.getElementById(config['canvas_id']);
                    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: antialias, alpha: true });
                    //renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true, alpha:true});  // slower!
                    renderer.setClearColor(clearColor, alpha);
                    renderer.setPixelRatio(window.devicePixelRatio);
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    //renderer.autoClear = false; // To allow render overlay on top of sprited sphere
                    // webvr
                    // disable vr for sgTarget and rmTarget passes - set true in render
                    renderer.vr.enabled = false;
                    if (_webvr) {
                        // initialize WebVR and create 'enter VR' button
                        document.body.appendChild(WEBVR.createButton(renderer, {}));
                        console.log(`\n!!!!! _webvr is true - VR display set and button added!`);
                        // create vr_scene
                        vr_scene = new THREE.Scene();
                        // vive controllers - RECALL - two! Add to vr_scene
                        if (_vive) {
                            vive_controller1 = new THREE.ViveController(0);
                            vive_controller1.standingMatrix = renderer.vr.getStandingMatrix();
                            vr_scene.add(vive_controller1);
                            vive_controller2 = new THREE.ViveController(1);
                            vive_controller2.standingMatrix = renderer.vr.getStandingMatrix();
                            vr_scene.add(vive_controller1);
                        }
                        // create vrspace
                        _webvr_skybox = config.webvr_skybox || false;
                        _webvr_skycube = config.webvr_skycube || false;
                        _webvr_skycube_faces = config.webvr_skycube_faces || false;
                        _webvr_skydome = config.webvr_skydome || false;
                        console.log(`_webvr_skybox is ${_webvr_skybox}`);
                        console.log(`_webvr_skycube is ${_webvr_skycube}`);
                        console.log(`_webvr_skycube_faces is ${_webvr_skycube_faces}`);
                        console.log(`_webvr_skydome is ${_webvr_skydome}`);
                        if (_webvr_skybox) {
                            vrspace_1.vrspace.createSkyBox(config.webvr_radius, config.webvr_cube_urls).then((cube) => {
                                vr_cube = cube;
                                vr_scene.add(vr_cube);
                                console.log(`vr_cube is ${vr_cube}`);
                                console.dir(vr_cube);
                            });
                        }
                        if (_webvr_skycube) {
                            vrspace_1.vrspace.createCube(config.webvr_radius).then((cube) => {
                                vr_cube = cube;
                                vr_scene.add(vr_cube);
                                console.log(`vr_cube is ${vr_cube}`);
                                //console.dir(vr_cube);
                            });
                        }
                        if (_webvr_skycube_faces) {
                            vr_group = vrspace_1.vrspace.createPolyhedra(config.webvr_radius);
                            console.log(`vr_group is ${vr_group}`);
                            console.dir(vr_group);
                            vr_scene.add(vr_group);
                            let i = 0;
                            ['bottom', 'top', 'left', 'right', 'back', 'front'].map((n) => {
                                vr_face[i] = vr_group.getObjectByName(n);
                                //console.log(`test_texture is ${test_texture}`);
                                //vr_face[i].material.map = test_texture;
                                //vr_face[i].material.needsUpdate = true;
                                console.log(`$$$$$$$$$$$$$$$ vr_face[${n}] = ${vr_face[i]}`);
                                i++;
                            });
                            console.log(`vr_face[0] = ${vr_face[0]}`);
                            console.log(`vr_face[0].material.color.r = ${vr_face[0].material.color.r}`);
                            console.log(`vr_face[0].material.color.g = ${vr_face[0].material.color.g}`);
                            console.log(`vr_face[0].material.color.b = ${vr_face[0].material.color.b}`);
                        }
                        if (_webvr_skydome) {
                            vr_dome = vrspace_1.vrspace.createDome(config.webvr_radius); // 5000
                            vr_scene.add(vr_dome);
                            console.log(`vr_dome is ${vr_dome}`);
                        }
                    }
                    // initialize camera instrument components
                    camera_1.camera.initialize().then((o) => {
                        console.dir(o);
                        csphere = o['csphere'];
                        controls = o['controls'];
                        lens = o['lens'];
                        key = o['key'];
                        fill = o['fill'];
                        back = o['back'];
                        fovp = lens.fov; // used to detect need for HUD quad re-size
                        fov_initial = lens.fov;
                        lens.lookAt(csphere.position); // origin
                        // if _sg3D and NOT _webvr - attach orbitcontrols
                        if (_sg3D && !_webvr) {
                            orbitcontrols = new THREE.OrbitControls(lens);
                        }
                        // construct csphere 
                        lens.add(hud);
                        csphere.add(lens);
                        csphere.add(key);
                        csphere.add(fill);
                        csphere.add(back);
                        // initialize rm_point and rm_pivot for use in space-fsh
                        rm_point.translateZ(-0.5);
                        rm_pivot.add(rm_point);
                        // add camera actors
                        narrative.addActor('csphere', csphere);
                        narrative.addActor('rm_pivot', rm_pivot);
                        narrative.addActor('rm_point', rm_point, false);
                        narrative.addActor('lens', lens, false);
                        narrative.addActor('hud', hud, false);
                        narrative.addActor('key', key, false);
                        narrative.addActor('fill', fill, false);
                        narrative.addActor('back', back, false);
                        // scalar for all non csphere-child actors
                        csph_r = csphere.geometry.parameters.radius;
                        // put lens at (0,0,csph_r)
                        lens.translateZ(csph_r);
                        // put hud at world origin - RECALL:hud is child of lens at (0,0,csph_r)
                        hud.translateZ(-1.0 * csph_r);
                        mediator_1.mediator.log(`csph_r = ${csph_r}`);
                        mediator_1.mediator.logc(`lens world pos = ${lens.getWorldPosition(vcopy).toArray()}`);
                        mediator_1.mediator.logc(`hud world pos = ${hud.getWorldPosition(vcopy).toArray()}`);
                        mediator_1.mediator.logc(`*** narrative initialized scenegraph phase`);
                        // set n.quad a.hud - initialize animation and camera3d - 'c3d'
                        narrative.quad = quad;
                        narrative.hud = hud;
                        animation_1.animation.initialize(narrative);
                        camera3d_1.c3d.initialize(lens, csphere, animation_1.animation);
                        // initialize audio
                        audio_1.audio.initialize(lens);
                        // resolution
                        quad.material.uniforms.uResolution.value = new THREE.Vector2(width, height);
                        quad.material.uniforms.uResolution.needsUpdate = true;
                        // set narrative.exec target objects
                        narrative['targets']['narrative'] = narrative;
                        narrative['targets']['mediator'] = mediator_1.mediator;
                        narrative['targets']['camera3d'] = camera3d_1.c3d;
                        narrative['targets']['controls'] = controls;
                        narrative['targets']['animation'] = animation_1.animation;
                        mediator_1.mediator.log(`narrative.targets = ${Object.keys(this.targets)}`);
                        // resize - why 3rd arg non-default 'true' in 2nd listener ???
                        window.addEventListener('resize', onWindowResize, false);
                        // diagnostic
                        if (controls) {
                            console.log(`controls:`);
                            console.dir(controls.report());
                        }
                        narrative.reportActorsInScene();
                        // initial scene 
                        narrative.changeState(state);
                    }); //camera.initialize
                } //initialize()
                foo(s) {
                    mediator_1.mediator.logc(`~~~foo: ${s}`);
                }
                // change component loading and animations according to absolute path, i.e
                // all present and transitional substate template:model pairs are represented
                // in the path argument.
                // Also, the path appears in address bar and is available from state service
                changeState(state) {
                    mediator_1.mediator.logc(`*** narrative.changeState()`);
                    // component changes
                    async.parallel({
                        camera: function (callback) {
                            try {
                                if (state['camera'] !== undefined && Object.keys(state['camera']).length > 0) {
                                    //console.log(`^^^^^^^^^^^^^^ narrative CALLING camera.delta!`);
                                    //console.dir(state['camera']);
                                    camera_1.camera.delta(state['camera'], hud, callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^^^^ narrative NOT calling camera.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: camera.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        },
                        stage: function (callback) {
                            try {
                                if (state['stage'] !== undefined && Object.keys(state['stage']).length > 0) {
                                    //console.log(`^^^^^^^^^^^^^^ narrative CALLING stage.delta!`);
                                    stage_1.stage.delta(state['stage'], narrative, callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^^^^ narrative NOT calling stage.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: stage.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        },
                        cloud: function (callback) {
                            try {
                                if (state['cloud'] !== undefined && Object.keys(state['cloud']).length > 0) {
                                    //console.log(`^^^^^^^^^^^^^^ narrative CALLING cloud.delta!`);
                                    cloud_1.cloud.delta(state['cloud'], TWEEN, callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^^^^ narrative NOT calling cloud.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: cloud.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        },
                        space: function (callback) {
                            try {
                                if (state['space'] !== undefined && Object.keys(state['space']).length > 0) {
                                    //console.log(`^^^^^^^^^^^^^^ narrative CALLING space.delta!`);
                                    space_1.space.delta(state['space'], sgTarget, callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^^^^ narrative NOT calling space.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: space.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        },
                        audio: function (callback) {
                            try {
                                if (state['audio'] !== undefined && Object.keys(state['audio']).length > 0) {
                                    //console.log(`^^^^^^^^^^^^^^ narrative CALLING audio.delta!`);
                                    audio_1.audio.delta(state['audio'], narrative, callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^^^^ narrative NOT calling audio.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: audio.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        },
                        vrstage: function (callback) {
                            if (_webvr) {
                                try {
                                    if (state['vrstage'] !== undefined && Object.keys(state['vrstage']).length > 0) {
                                        console.log(`^^^^^^^^^^^^^^ narrative CALLING vrstage.delta!`);
                                        // fourth var (boolean) true => vrstage in vr_scene
                                        vrstage_1.vrstage.delta(state['vrstage'], narrative, callback);
                                    }
                                    else {
                                        console.log(`^^^^^^^^^^^^^^ narrative NOT calling vrstage.delta!`);
                                        callback(null, null);
                                    }
                                }
                                catch (e) {
                                    mediator_1.mediator.loge(`changeState: vrstage.delta caused error: ${e}`);
                                    console.trace();
                                    callback(e, null);
                                }
                            }
                            else {
                                callback(null, null);
                            }
                        },
                        vrcloud: function (callback) {
                            try {
                                if (state['vrcloud'] !== undefined && Object.keys(state['vrcloud']).length > 0) {
                                    //console.log(`^^^^^^^^^^^ narrative CALLING vrcloud.delta!`);
                                    vrcloud_1.vrcloud.delta(state['vrcloud'], TWEEN, callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^ narrative NOT calling vrcloud.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: vrcloud.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        },
                        action: function (callback) {
                            try {
                                if (state['action'] !== undefined && Object.keys(state['action']).length > 0) {
                                    //console.log(`^^^^^^^^^^^^^^ narrative CALLING action.delta!`);
                                    action_1.action.delta(state['action'], callback);
                                }
                                else {
                                    //console.log(`^^^^^^^^^^^^^^ narrative NOT calling action.delta!`);
                                    callback(null, null);
                                }
                            }
                            catch (e) {
                                mediator_1.mediator.loge(`changeState: action.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        }
                    }, //first arg
                    function (err, o) {
                        if (err) {
                            mediator_1.mediator.loge("error: " + err);
                            console.trace();
                            return;
                        }
                        console.log(`n.changeState result o:`);
                        console.dir(o);
                        // returned by Camera.delta
                        // RECALL: transparent_texture is a texture NOT a url
                        if (o['camera']) {
                            let _p = o['camera']['_post'];
                            //console.log(`^^^^^^^^^^^^^^^^^ 985 _p = ${_p}`); 
                            // if there exists camera['post'] then change the hud._post value
                            if (_p !== undefined) {
                                if (_p === false) {
                                    hud['_post'] = false;
                                    hud.material.uniforms.tDiffuse.value = transparent_texture;
                                    hud.material.uniforms.tDiffuse.needsUpdate = true;
                                }
                                else {
                                    hud['_post'] = true;
                                }
                            }
                        }
                        // returned by Stage.delta
                        //mediator.log(`o['stage'] = ${o['stage']}`);
                        if (o['stage']) {
                            // frame
                            if (o['stage']['frame']) {
                                if (o['stage']['frame']['_stats'] === false) {
                                    _stats = false; // hide stats
                                    stats.dom.style.display = 'none';
                                }
                                if (o['stage']['frame']['_stats'] === true) {
                                    _stats = true; // show stats
                                    stats.dom.style.display = 'block';
                                }
                            }
                            // stage[actors] returns nothing 
                            // However _actor:t => narrative.addActor(a=name, o) to scene 
                            // _actor:f => narrative.removeActor(a=name) from scene 
                            // _actor:undefined => modifies narrative.actors(a=name) 
                            //skycube
                            cube = o['stage']['skycube'];
                            mediator_1.mediator.log(`cube = ${cube}`);
                            if (cube !== undefined) {
                                if (cube) {
                                    narrative.addActor('skycube', cube);
                                }
                                else {
                                    narrative.removeActor('skycube');
                                }
                            }
                            // skydome
                            dome = o['stage']['skydome'];
                            mediator_1.mediator.log(`dome = ${dome}`);
                            if (dome !== undefined) {
                                if (dome) {
                                    narrative.addActor('skydome', dome);
                                }
                                else {
                                    narrative.removeActor('skydome');
                                }
                            }
                            // ambient_light
                            ambient_light = o['stage']['ambient_light'];
                            mediator_1.mediator.log(`ambient_light = ${ambient_light}`);
                            if (ambient_light !== undefined) {
                                if (ambient_light) {
                                    narrative.addActor('ambient_light', ambient_light);
                                }
                                else {
                                    narrative.removeActor('ambient_light');
                                }
                            }
                            // axes
                            axes = o['stage']['axes'];
                            mediator_1.mediator.log(`axes = ${axes}`);
                            if (axes !== undefined) {
                                if (axes) {
                                    narrative.addActor('axes', axes);
                                }
                                else {
                                    narrative.removeActor('axes');
                                }
                            }
                            // fog
                            fog = o['stage']['fog'];
                            mediator_1.mediator.log(`fog = ${fog}`);
                            if (fog !== undefined) {
                                if (fog) {
                                    scene.fog = fog;
                                }
                                else {
                                    scene.fog = null;
                                }
                            }
                        }
                        // returned by cloud
                        //mediator.log(`o['cloud'] = ${o['cloud']}`);
                        if (o['cloud']) {
                            _cloud = o['cloud']['_cloud'] || _cloud;
                            mediator_1.mediator.log(`_cloud = ${_cloud}`);
                            if (o['cloud']['group']) {
                                spritegroup = o['cloud']['group'];
                                mediator_1.mediator.log(`cloud spritegroup = ${spritegroup}`);
                                if (spritegroup) {
                                    if (!cloud_pivot) {
                                        cloud_pivot = new THREE.Object3D();
                                        cloud_pivot.translateZ(state['cloud']['translateZ'] || -1000);
                                    }
                                    cloud_pivot.add(spritegroup);
                                    narrative.addActor('cloud_pivot', cloud_pivot, true);
                                }
                            }
                            else {
                                narrative.removeActor('cloud_pivot');
                            }
                        }
                        // returned by Space.delta - don't add to scene!
                        //mediator.log(`o['space'] = ${o['space']}`);
                        if (o['space']) {
                            // set render flag if needed
                            if (state['space']['_space'] !== undefined) {
                                _space = state['space']['_space'];
                            }
                            if (o['space']['rm_shMat']) {
                                mediator_1.mediator.log(`space returns shMat with fsh = ${o['space']['rm_shMat'].fragmentShader}`);
                                mediator_1.mediator.log(`quad.material = ${quad.material}`);
                                quad.material = o['space']['rm_shMat'];
                                quad.material.needsUpdate = true; // needed?
                            }
                            else {
                                console.log(`o['space']['rm_shMat'] is undefined`);
                            }
                        }
                        // returned by VrStage.delta
                        //mediator.log(`o['vrstage'] = ${o['vrstage']}`);
                        if (o['vrstage']) {
                            if (_webvr) {
                                // vrstage[actors] returns nothing 
                                // However _vractor:t => narrative.addvrActor(a=name, o) to vrscene 
                                // _vractor:f => narrative.removevrActor(a=name) from vrscene 
                                // _vractor:undefined => modifies narrative.vractors(a=name) 
                                // ambient_light
                                vr_ambient_light = o['vrstage']['ambient_light'];
                                mediator_1.mediator.log(`vrstage: vr_ambient_light = ${vr_ambient_light}`);
                                if (vr_ambient_light !== undefined) {
                                    if (vr_ambient_light) {
                                        narrative.addvrActor('vr_ambient_light', vr_ambient_light, true);
                                    }
                                    else {
                                        narrative.removevrActor('vr_ambient_light');
                                    }
                                }
                                // axes
                                vr_axes = o['vrstage']['axes'];
                                mediator_1.mediator.log(`vrstage: vr_axes = ${vr_axes}`);
                                if (vr_axes !== undefined) {
                                    if (vr_axes) {
                                        narrative.addvrActor('vr_axes', vr_axes, true);
                                    }
                                    else {
                                        narrative.removevrActor('vr_axes');
                                    }
                                }
                                // fog
                                vr_fog = o['vrstage']['fog'];
                                mediator_1.mediator.log(`vrstage: vr_fog = ${vr_fog}`);
                                if (vr_fog !== undefined) {
                                    if (vr_fog) {
                                        vr_scene.fog = vr_fog;
                                    }
                                    else {
                                        vr_scene.fog = null;
                                    }
                                }
                            }
                        }
                        // returned by vrcloud
                        //mediator.log(`o['vrcloud'] = ${o['vrcloud']}`);
                        if (o['vrcloud']) {
                            if (_webvr) {
                                _vrcloud = o['vrcloud']['_vrcloud'] || _vrcloud;
                                mediator_1.mediator.log(`_vrcloud = ${_vrcloud}`);
                                if (o['vrcloud']['group']) {
                                    vr_spritegroup = o['vrcloud']['group'];
                                    console.log(`%%%%%%%%%%%%%%%%% vrcloud vr_spritegroup = ${vr_spritegroup}`);
                                    console.dir(vr_spritegroup);
                                    mediator_1.mediator.log(`vrcloud vr_spritegroup = ${vr_spritegroup}`);
                                    if (vr_spritegroup) {
                                        if (!vrcloud_pivot) {
                                            vrcloud_pivot = new THREE.Object3D();
                                            vrcloud_pivot.translateZ(state['vrcloud']['translateZ'] || -1000);
                                        }
                                        vrcloud_pivot.add(vr_spritegroup);
                                        narrative.addvrActor('vrcloud_pivot', vrcloud_pivot, true);
                                    }
                                }
                                else {
                                    narrative.removevrActor('vrcloud_pivot');
                                }
                            }
                        }
                        // returned Action.delta
                        //mediator.logc(`o['action'] = ${o['action']}`);
                        if (o['action']) {
                            let _a = o['action'];
                            if (Object.keys(_a).length > 0) {
                                _action = _a['_action'];
                                actions = _a['actions'] || [];
                                mediator_1.mediator.log(`_a['_deltaTime'] = ${_a['_deltaTime']}`);
                                if ((_a['_deltaTime'] !== undefined) && _a['_deltaTime'] === false) {
                                    _deltaTime = false;
                                }
                                else {
                                    _deltaTime = _a['_deltaTime'] || _deltaTime;
                                }
                                mediator_1.mediator.log(`_action= ${_action}`);
                                mediator_1.mediator.log(`actions.length = ${actions.length}`);
                                mediator_1.mediator.logc(`_deltaTime= ${_deltaTime}`);
                                if (actions.length > 0) {
                                    if (_action === undefined) {
                                        console.log(`_action undef => append actions = ${actions}`);
                                        for (let a of actions) {
                                            queue_1.queue.fifo.push(a); // undefined => append each action
                                        }
                                    }
                                    else {
                                        if (_action) {
                                            queue_1.queue.load(actions); // true => replace
                                        }
                                        else {
                                            queue_1.queue.load([]); // f => empty
                                        }
                                    }
                                }
                                mediator_1.mediator.log(`queue.fifo.length = ${queue_1.queue.fifo.length}`);
                            }
                        }
                        // if not started, start clock and begin rendering cycle
                        if (animating) {
                            return;
                        }
                        animating = true;
                        // gsap
                        TweenMax.ticker.addEventListener('tick', animate);
                        console.log(`** starting TweenMax`);
                        clock.start();
                        console.log(`** starting clock`);
                        // start render-cycle
                    } //2nd arg
                     //2nd arg
                    );
                    //async.parallel
                } //changeState
                // manage actors and scene - adding {name, null} removes named actor
                addActor(name, o, addToScene = true) {
                    narrative.removeActor(name);
                    if (o) {
                        mediator_1.mediator.log(`addActor: before add sc.ch.l = ${scene.children.length}`);
                        o['name'] = name;
                        if (addToScene) {
                            console.log(`!!!!!!!!!!!!!!!****************** added actor ${name}`);
                            scene.add(o);
                        }
                        narrative.actors[name] = o;
                        mediator_1.mediator.log(`addActor: added o.name = ${o.name}`);
                        mediator_1.mediator.log(`addActor: after add narrative.actors[${name}] = ${narrative.actors[name]} `);
                        mediator_1.mediator.log(`addActor: after add sc.ch.l = ${scene.children.length}`);
                    }
                }
                removeActor(name) {
                    if (narrative.actors[name]) {
                        mediator_1.mediator.log(`rmActor: before delete sc.ch.l = ${scene.children.length}`);
                        mediator_1.mediator.log(`rmActor: removing narrative.actors[${name}] = ${narrative.actors[name]}`);
                        scene.remove(narrative.actors[name]);
                        delete narrative.actors[name];
                        //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! removed actor ${name}`);
                        mediator_1.mediator.log(`rmActor: after delete narrative.actors[${name}] = ${narrative.actors[name]} `);
                        mediator_1.mediator.log(`rmActor: after delete sc.ch.l = ${scene.children.length}`);
                    }
                }
                // report state of actors in scene
                reportActorsInScene() {
                    var actors = [];
                    mediator_1.mediator.log(`reportActors: sc.ch.l = ${scene.children.length}`);
                    for (let o of scene.children) {
                        mediator_1.mediator.log(`reportActors: scene contains child ${o.name}`);
                        mediator_1.mediator.log(`reportActors: narrative.actors[${o.name}] is ${narrative.actors[o.name]}`);
                        if (o !== narrative.actors[o.name]) {
                            mediator_1.mediator.log(`reportActors: there is name ambiguity!!: scene child ${o.name} is not actor ${o.name}`);
                        }
                    }
                    ;
                    for (let a of scene.children) {
                        actors.push(a.name);
                    }
                    return (actors);
                }
                // vr_scene
                // manage vractors and vr_scene - adding {name, null} removes named actor
                addvrActor(name, o, addToScene = true) {
                    narrative.removevrActor(name);
                    if (o) {
                        mediator_1.mediator.log(`addvrActor: before add vr_sc.ch.l = ${vr_scene.children.length}`);
                        o['name'] = name;
                        if (addToScene) {
                            console.log(`!!!!!!!!!!!!!!********** added vractor ${name}`);
                            vr_scene.add(o);
                        }
                        narrative.vractors[name] = o;
                        mediator_1.mediator.log(`addvrActor: added o.name = ${o.name}`);
                        mediator_1.mediator.log(`addvrActor: after add narrative.vractors[${name}] = ${narrative.vractors[name]} `);
                        mediator_1.mediator.log(`addvrActor: after add vr_sc.ch.l = ${vr_scene.children.length}`);
                    }
                }
                removevrActor(name) {
                    if (narrative.vractors[name]) {
                        mediator_1.mediator.log(`rmvrActor: before delete vr_sc.ch.l = ${vr_scene.children.length}`);
                        mediator_1.mediator.log(`rmvrActor: removing narrative.vractors[${name}] = ${narrative.vractors[name]}`);
                        vr_scene.remove(narrative.vractors[name]);
                        delete narrative.vractors[name];
                        //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! removed vractor ${name}`);
                        mediator_1.mediator.log(`rmvrActor: after delete narrative.vractors[${name}] = ${narrative.vractors[name]} `);
                        mediator_1.mediator.log(`rmvrActor: after delete vr_sc.ch.l = ${vr_scene.children.length}`);
                    }
                }
                // report state of vractors in vr_scene
                reportvrActorsInvrScene() {
                    var actors = [];
                    mediator_1.mediator.log(`reportvrActors: vr_sc.ch.l = ${vr_scene.children.length}`);
                    for (let o of vr_scene.children) {
                        mediator_1.mediator.log(`reportvrActors: vr_scene contains child ${o.name}`);
                        mediator_1.mediator.log(`reportvrActors: narrative.vractors[${o.name}] is ${narrative.vractors[o.name]}`);
                        if (o !== narrative.vractors[o.name]) {
                            mediator_1.mediator.log(`reportvrActors: there is name ambiguity!!: vr_scene child ${o.name} is not vractor ${o.name}`);
                        }
                    }
                    ;
                    for (let a of vr_scene.children) {
                        actors.push(a.name);
                    }
                    return (actors);
                }
                // execute actions - declarative function invocations
                // message-based function invocation
                // NOTE: structure of action is as follows:
                //   {t/id: string,  // required
                //    f:    string,  // required
                //    one of following seven arg types: // required
                //      s: string
                //      o: object
                //      n: number
                //      a: array of multiple csv-args ([] => no-arg)
                //      as: array of strings
                //      ao: array of objects
                //      an: array of numbers
                //    dt: deltaTime (secs) from prev action
                //    et: ellapsedTime (secs) from prev action - absolute 'schedule'
                //   }
                //
                // NOTE: actions with timestamp are executed iff the elapsed time of the 
                //   application exceeds action.ms. If actions.ms is undefined then the
                //   action is executed upon 'first opportunity' after receipt. (see
                //   narrative.animate() for queue handling.
                // RECALL narrative.animate() - the single point which invokes narrative.exec
                //   does so in a try-catch block to immediately catch throws from exec
                exec(action) {
                    var target, // target = narrative.targets[action.t] or actors[action.id] 
                    f, // f = target[action.f]
                    arg, // f(arg) where arg is one of seven types above
                    execute = () => {
                        try {
                            mediator_1.mediator.log(`nar.exec invoking action ${action['f']}`);
                            f(arg);
                            if (config['record_actions']) {
                                mediator_1.mediator.record(action);
                            }
                        }
                        catch (e) {
                            throw e;
                        }
                    };
                    // diagnostic
                    //mediator.log(`*** narrative.exec action:`);
                    //console.dir(action);
                    // empty action - bail
                    if (!action || action === {}) {
                        return;
                    }
                    // action has target 'id' or 't' giving the execution context 
                    // actors(action.id) or narrative.target[action.t]
                    if (action['id']) {
                        mediator_1.mediator.log(`action['id'] = ${action['id']}`);
                        target = narrative.actors[action['id']]; // target object for function f
                        if (!target) {
                            throw new Error(`narrative.actors[${action['id']}] is not defined!`);
                        }
                    }
                    else {
                        mediator_1.mediator.log(`action['t'] = ${action['t']}`);
                        target = narrative.targets[action['t']];
                        if (!target) {
                            throw new Error(`narrative.targets[${action['t']}] is not defined!`);
                        }
                    }
                    // function
                    f = target[action['f']];
                    if (!f) {
                        throw new Error(`${action['f']} is not defined on target!`);
                    }
                    // arg
                    // RECALL: Array.isArray([]) is true, but typeof [] is 'object'
                    if (arg = action['o']) {
                        if (typeof arg === 'object') {
                            execute();
                        }
                        else {
                            throw new Error(`typeof action['o'] is NOT 'object'!`);
                        }
                    }
                    if (arg = action['ao']) {
                        if (Array.isArray(arg)) {
                            execute();
                        }
                        else {
                            throw new Error(`action['ao'] is NOT an array!`);
                        }
                    }
                    if (arg = action['n']) {
                        if (typeof arg === 'number') {
                            execute();
                        }
                        else {
                            throw new Error(`typeof action['n'] is NOT 'number'!`);
                        }
                    }
                    if (arg = action['an']) {
                        if (Array.isArray(arg)) {
                            execute();
                        }
                        else {
                            throw new Error(`action['an'] is NOT an array!`);
                        }
                    }
                    if (arg = action['s']) {
                        if (typeof arg === 'string') {
                            execute();
                        }
                        else {
                            throw new Error(`typeof action['s'] is NOT 'string'!`);
                        }
                    }
                    if (arg = action['an']) {
                        if (Array.isArray(arg)) {
                            execute();
                        }
                        else {
                            throw new Error(`action['as'] is NOT an array!`);
                        }
                    }
                    if (arg = action['a']) {
                        if (Array.isArray(arg)) {
                            let j, k, l, m, n, o, p, q;
                            [j, k, l, m, n, o, p, q] = arg; // destructure the individual args 
                            // a 'tail' of 0-8 args may be undefined
                            try {
                                f(j, k, l, m, n, o, p, q);
                            }
                            catch (e) {
                                throw e;
                            }
                        }
                        else {
                            throw new Error(`action['a'] is NOT an array!`);
                        }
                    }
                } //exec
            }
             //class Narrative
            // enforce singleton export
            if (narrative === undefined) {
                narrative = new Narrative();
            }
            exports_1("narrative", narrative);
        }
    }
});
//# sourceMappingURL=narrative.js.map
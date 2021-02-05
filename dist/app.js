System.register("services/queue", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var queue, Queue;
    return {
        setters:[],
        execute: function() {
            // queue.ts - holds timed actions 
            class Queue {
                constructor() {
                    this.fifo = [];
                    this.ready = true;
                }
                load(actions = []) {
                    this.fifo = actions;
                }
                push(s) {
                    this.fifo.push(s);
                }
                pop() {
                    return (this.fifo.length > 0 ? this.fifo.shift() : undefined);
                }
                peek() {
                    return (this.fifo.length > 0 ? this.fifo[0] : undefined);
                }
            }
            // enforce singleton export
            if (queue === undefined) {
                queue = new Queue();
            }
            exports_1("queue", queue);
        }
    }
});
// mediator.ts 
System.register("services/mediator", ["services/queue"], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var queue_1;
    var mediator, Mediator;
    return {
        setters:[
            function (queue_1_1) {
                queue_1 = queue_1_1;
            }],
        execute: function() {
            // singleton instance - exported
            class Mediator {
                constructor() {
                    mediator = this;
                    if (config.server_connect) {
                        this.connect();
                    }
                    else {
                        console.log(`*** mediator: running without server`);
                    }
                }
                // connect to index.js server = config.server_host 
                // on port config.channels_port (default is 8081)
                // set up channels with names specified in config.channels
                connect() {
                    var host = config.server_host, port = config.server_port;
                    console.log(`*** mediator: ${config['_state']} connecting to server ${host}:${port}`);
                    this.socket = io.connect("http://" + host + ":" + port);
                    for (let channel of config.channels) {
                        this.log(`Mediator created channel with name = ${channel}`);
                        this.socket.on(channel, (o) => {
                            queue_1.queue.push(o);
                        });
                    }
                }
                // broadcast usable by external services
                emit(channel, msg) {
                    // guard
                    if (config.channels.indexOf(channel) !== -1) {
                        this.socket.emit(channel, msg);
                    }
                    else {
                        return false;
                    }
                }
                // quick method for emit('actions', action)
                // record to server - used to record application actions to actions-files
                record(action) {
                    this.socket.emit('actions', action);
                }
                // quick method for emit('log', s)
                // record to server - used to record application log strings to log-files
                log(s) {
                    if (config.log) {
                        s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
                        s = `[${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${s}`;
                        this.socket.emit('log', s);
                    }
                }
                // quick method for emit('log', s) AND console.log
                // record to server - used to record application log strings to log-files
                logc(s) {
                    console.log(s);
                    // for temp locating ts lineno of m.logc call and stacktrace
                    //console.log(`\n${s}`); 
                    //console.trace('from mediator.logc');
                    if (config.log) {
                        s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
                        s = `[${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${s}`;
                        this.socket.emit('log', s);
                    }
                }
                // quick method for emit('log', s) AND console.error
                // record to server - used to record application log strings to log-files
                loge(s) {
                    console.trace();
                    console.error(s);
                    if (config.log) {
                        s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
                        s = `!!![${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${console.error(s)}`;
                        this.socket.emit('log', s);
                    }
                }
            }
            exports_2("Mediator", Mediator); //class Mediator
            // enforce singleton export
            if (mediator === undefined) {
                mediator = new Mediator();
            }
            exports_2("mediator", mediator);
        }
    }
});
System.register("models/space/quad_vsh/vsh_default.glsl", [], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var vsh;
    return {
        setters:[],
        execute: function() {
            exports_3("vsh", vsh = `
      varying vec2 vuv;
      void main() {
        gl_Position = vec4(position.xy, 1.0, 1.0);
        vuv = uv;
      }
      `);
        }
    }
});
System.register("models/space/quad_fsh/fsh_default.glsl", [], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // Fragment shader program 
            // fsh_default - texture map
            exports_4("uniforms", uniforms = {
                tDiffuse: { type: 't', value: null },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            });
            exports_4("fsh", fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      varying vec2 vuv;

      void main() {
        // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
        vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

        // paint
        gl_FragColor = texture2D(tDiffuse, vuv); 
      }`);
        }
    }
});
System.register("state/camera", ["services/mediator", "models/space/quad_vsh/vsh_default.glsl", "models/space/quad_fsh/fsh_default.glsl"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var mediator_1, vsh_default_glsl_1, fsh_default_glsl_1, fsh_default_glsl_2;
    var camera, fsh, uniforms, csphere_radius, csphere_g, csphere_m, csphere, csphere_visible, csphere_wireframe, csphere_opacity, csphere_color, lens, aspect, fov, near, far, controls, key, fill, back, transparent_texture, _post, hud_scaleX, hud_scaleY, hud_texture, Camera;
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
            // camera instrument components - csphere, controls, lens, hud, key, fill, back
            // camera - properties modified by camera.delta
            // NOTE: controls and lens are defined and used in narrative
            // csphere
            csphere_radius = 1.0;
            csphere_g = new THREE.SphereBufferGeometry, csphere_visible = false, csphere_wireframe = true, csphere_opacity = 1.0, csphere_color = 'green', fov = 90.0, near = 0.001, far = 100000, 
            // HUD - z=0 plane for camera-'lens' 
            // NOTE: HUD is at distance csphere.scale * Math.tan(0.5 * camera.fov)
            //   from the lens along the lens fwd-vector
            // HUD defaults:
            transparent_texture = './assets/images/transparent_pixel.png', _post = false;
            class Camera {
                // ctor
                constructor() {
                    camera = this;
                }
                // initialize and return csphere, lens, hud, key, fill, back
                initialize() {
                    var state = config['initial_camera'], o = {}; // used to return csphere, lens, controls, lights. hud
                    return new Promise((resolve, reject) => {
                        async.series({
                            camera: (callback) => {
                                // camerasphere
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
                                // initial camera 'lens' - can be immediately modified by state['camera']
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
                                camera.report_camera_world();
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
                                        //mediator.log(`&&&& camera: controls has properties: ${Object.getOwnPropertyNames(controls.__proto__)}`);
                                        //mediator.log(`csphere = ${csphere}`);
                                        controls.initialize(csphere, config.controlsOptions);
                                        controls.controller.connect();
                                        console.log(`&&&& controls initialized and connected!`);
                                        callback();
                                    })
                                        .catch((e) => {
                                        mediator_1.mediator.loge(`camera: import of Controls caused error: ${e}`);
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
                // diagnostics utility functions - camera world information
                // local position
                // world position
                // world up
                // world fwd
                // world R
                report_camera_world() {
                    var cam_wp = new THREE.Vector3(), cam_up = new THREE.Vector3(), world_q = new THREE.Quaternion(), cam_fwd = new THREE.Vector3(), cam_right = new THREE.Vector3();
                    // cam_wp
                    lens.updateMatrixWorld(); // Object3D matrixAutoUpdate default true
                    //cam_wp = camera.matrixWorld.getPosition(); // same as next
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
                // report_camera_world
                // examine information from o3d.matrix - local matrix unless world=true
                // in which case examines o3d.matrixWorld
                // * NOTE: if o3d has no object parent (i.e is at the root of the scenegraph)
                //   then o3d.matrix === o3d.matrixWorld<br>
                //   This is true for csphere (camerasphere) for example<br>
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
                    mediator_1.mediator.log(`Camera.delta: state = ${state} hud = ${hud}`);
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
                    //   and non-modifiable by camera.delta !!
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
             //Camera
            // enforce singleton export
            if (camera === undefined) {
                camera = new Camera();
            }
            exports_5("camera", camera);
        }
    }
});
// * transform3d.ts
// * creates a transform matrix from a transform model.
// * transform model has form: transform:<br> 
// ```{t: [tx,ty,tz],
//     q: [qx,qy,qz,qw],
//     e: [ep,ey,er],
//     s: [sx,sy,sz]}```
// where t is translation, q is quaternion-rotation, e is euler-rotation
// and s is scale.<br> 
// Each has canonical identity default<br>
// At most one of q or e should be used 
//
// * ```Transform3d.apply(transform, [actor])``` takes as first arg a (JSON.parsed)
// transform model, i.e. a javascript object containing numeric arrays.<br>
// A transform matrix is created and returned<br>
// An optional second arg is a THREE.js Object3d on which the created
// matrix is applied.
//
// * NOTE: mm = (new THREE.Matrix4()).set(e0,e1,...,e15) takes arguments in
//   row-major order, i.e set(m11,m12,m13,m14,m21,...m44) (using math indices).
//   However, when a matrix is decomposed into elements, for example,
//   [a0,a1,a2,...,a15] = mm.elements, the a-array is in column-major order,
//   i.e [m11,m21,m31,m41,m12,...m44] (using math indices).
//   Thus [ei] !== [ai]
System.register("services/transform3d", ["services/mediator"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var mediator_2;
    var transform3d, Transform3d;
    return {
        setters:[
            function (mediator_2_1) {
                mediator_2 = mediator_2_1;
            }],
        execute: function() {
            // singleton instance - exported
            class Transform3d {
                constructor() {
                    mediator_2.mediator.log(`Transform3d ctor:`);
                }
                apply(transform, actor) {
                    var m = new THREE.Matrix4(), // identity matrix
                    mr = undefined, mt = undefined, ms = undefined;
                    // transform matrix component matrices
                    if (transform['q']) {
                        let qa = transform.q;
                        let q = new THREE.Quaternion(qa[0], qa[1], qa[2], qa[3]);
                        mr = (new THREE.Matrix4()).makeRotationFromQuaternion(q);
                    }
                    if (transform['e']) {
                        let ea = transform.e;
                        let euler = new THREE.Euler(ea[0], ea[1], ea[2]); //default pyr (xyz)
                        mr = (new THREE.Matrix4()).makeRotationFromEuler(euler);
                    }
                    if (transform['t']) {
                        let ta = transform.t;
                        mt = (new THREE.Matrix4()).makeTranslation(ta[0], ta[1], ta[2]);
                    }
                    if (transform['s']) {
                        let sa = transform.s;
                        ms = (new THREE.Matrix4()).makeScale(sa[0], sa[1], sa[2]);
                    }
                    // * transform matrix - first scale, then rotate, then translate
                    // * NOTE: m = [mt*mr*ms], so m*v = mt*(mr*(ms*v)))
                    m = mt || m;
                    if (mr) {
                        m = m.multiply(mr);
                    }
                    if (ms) {
                        m = m.multiply(ms);
                    }
                    // if Object3d-actor is sent as second arg apply matrix to it
                    if (actor) {
                        actor.applyMatrix(m);
                    }
                    // return created matrix representing model transform input
                    return m;
                }
                // for unit test verification - does m1 equal m2?
                // careful of precision - .01 error is very generous
                // * NOTE: m.elements is given in column-major!
                //   Thus m[i][j].elements = [m00, m10, m20, m30, m01, m11, m21, m31, ...]
                //                            column0           , column1 etc...
                verify(m, mm) {
                    var a = m.elements, aa = mm.elements, flag = true, d = [], sa = [], i;
                    for (i = 0; i < a.length; i++) {
                        d[i] = Math.abs(a[i] - aa[i]);
                        sa.push("a[" + i + "]=" + a[i] + " aa[" + i + "]=" + aa[i] + " d[i]=" + d[i]);
                        if (Math.abs(d[i]) > 0.01) {
                            flag = false;
                            for (i = 0; i < sa.length; i++) {
                                mediator_2.mediator.loge("error: " + sa[i]);
                            }
                            break;
                        }
                    }
                    return flag;
                }
            }
            // enforce singleton export
            if (transform3d === undefined) {
                transform3d = new Transform3d();
            }
            exports_6("transform3d", transform3d);
        }
    }
});
// actors.ts - holds timed actions 
//
// from state/stage.ts
//      actors: function(callback){
//        try{
//          if(state['actors']){
//            actors.create(state['actors'], narrative, callback);
//          }else{
//            callback(null, {});
//          }
//        }
//        catch(e) {
//          mediator.loge(`stage.delta caused error: ${e}`);
//          callback(e, {});
//        }
//      }, 
System.register("services/actors", ["services/transform3d"], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var transform3d_1;
    var actors, Actors;
    return {
        setters:[
            function (transform3d_1_1) {
                transform3d_1 = transform3d_1_1;
            }],
        execute: function() {
            // singleton instance
            class Actors {
                create(state = {}, narrative, callback, vr = false) {
                    var actor; // actor-instance
                    // iterate through actor names-options
                    // three cases: _actor = f/t/undefined => create/remove/modify
                    // NOTE: _actors:true not needed so _actors ignored if used
                    for (let a of Object.keys(state)) {
                        if (a === '_actors') {
                            console.log(`key is '_actors'!`);
                            continue;
                        }
                        console.log(`actor-name is a = ${a}`);
                        let _actor = state[a]['_actor'];
                        // f => remove
                        if (_actor === false) {
                            if (vr) {
                                console.log(`_actor=f ~ removing vractor ${a} from vr_scene`);
                                narrative.removevrActor(a);
                            }
                            else {
                                console.log(`_actor=f ~ removing actor ${a} from scene`);
                                narrative.removeActor(a);
                            }
                        } //f=>remove                      
                        // options for modify/create
                        let options = state[a]['options']; // defaults are in specific actor 
                        console.log(`options:`);
                        console.dir(options);
                        // undef => modify
                        if (_actor === undefined) {
                            if (vr) {
                                actor = narrative.vractors[a];
                            }
                            else {
                                actor = narrative.actors[a];
                            }
                            actor.delta(options);
                        } //undef=>modify
                        // url for create
                        let url = state[a]['url'] || '';
                        // true => create
                        if (_actor) {
                            console.log(`\n!!!!!!!!!!!!!!!!!!!! actor url = ${url}`);
                            System.import(url).then((Actor) => {
                                //actor = Actor.create(options);   // actor-instance
                                Actor.create(options).then((actor) => {
                                    console.log(`\n\n!!!!!!!!!!!!!!!!!! imported actor = ${actor}`);
                                    console.log(`actor ${url} loaded:`);
                                    console.dir(actor);
                                    console.log(`actor vr = ${vr}`);
                                    // apply transform3d in options to actor
                                    if (options && options['transform']) {
                                        console.log(`initial actor.pos = ${actor.position.toArray()}`);
                                        transform3d_1.transform3d.apply(options['transform'], actor);
                                        console.log(`transf actor.pos = ${actor.position.toArray()}`);
                                    }
                                    if (vr) {
                                        // fourth var true => add to scene
                                        console.log(`before add: reportvrActorsInvrScene = ${narrative.reportvrActorsInvrScene()}`);
                                        console.log(`actor = ${actor}  a = ${a}`);
                                        narrative.addvrActor(a, actor, true);
                                        console.log(`after add: reportvrActorsInvrScene = ${narrative.reportvrActorsInvrScene()}`);
                                    }
                                    else {
                                        console.log(`before add: reportActorsInScene = ${narrative.reportActorsInScene()}`);
                                        narrative.addActor(a, actor, true);
                                        console.log(`after add: reportActorsInScene = ${narrative.reportActorsInScene()}`);
                                    }
                                }); //Actor.create.then
                            }); //System.import.then
                        } //_actor=t => create
                        callback(null, {});
                    } //for(a of state['actors'])
                } //create
            }
             //Actor
            // enforce singleton export
            if (actors === undefined) {
                actors = new Actors();
            }
            exports_7("actors", actors);
        }
    }
});
// stage.ts
System.register("state/stage", ["services/mediator", "services/actors"], function(exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var mediator_3, actors_1;
    var stage, axes, ambient_light, ambient_color, ambient_intensity, fog, fog_color, fog_near, fog_far, cube, cube_urls, cube_opacity, cubeLoader, dome, dome_url, dome_opacity, textureLoader, environment, skycube, skydome, Stage;
    return {
        setters:[
            function (mediator_3_1) {
                mediator_3 = mediator_3_1;
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
                    mediator_3.mediator.loge(`error in environment_init: ${e.message}`);
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
                                mediator_3.mediator.log(`@@@skycube() cube = ${cube}`);
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
                    mediator_3.mediator.loge(`error in skycube_init: ${e.message}`);
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
                                mediator_3.mediator.log(`@@@skydome() dome = ${dome}`);
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
                    mediator_3.mediator.loge(`error in skydome_init: ${e.message}`);
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
                    mediator_3.mediator.log(`Stage.delta: state = ${state}`);
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
                                mediator_3.mediator.loge(`stage.delta caused error: ${e}`);
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
                                mediator_3.mediator.loge(`stage.delta caused error: ${e}`);
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
                                mediator_3.mediator.loge(`stage.delta caused error: ${e}`);
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
                                mediator_3.mediator.loge(`stage.delta caused error: ${e}`);
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
                                mediator_3.mediator.loge(`stage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        }
                    }, //first arg
                        (err, o) => {
                        if (err) {
                            mediator_3.mediator.loge("error: " + err);
                            return;
                        }
                        mediator_3.mediator.log(`stage: o['environemt']['axes'] = ${o['environment']['axes']}`);
                        mediator_3.mediator.log(`stage: o['environemt']['ambient_light'] = ${o['environment']['ambient_light']}`);
                        mediator_3.mediator.log(`stage: o['environemt']['fog'] = ${o['environment']['fog']}`);
                        mediator_3.mediator.log(`stage: o['skycube']['skycube'] = ${o['skycube']['skycube']}`);
                        mediator_3.mediator.log(`stage: o['skydome']['skydome'] = ${o['skydome']['skydome']}`);
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
            exports_8("stage", stage);
        }
    }
});
System.register("models/cloud/generators/cube", [], function(exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var cube;
    return {
        setters:[],
        execute: function() {
            exports_9("cube", cube = (state) => {
                var vertices = [], amount = 8, separation = 0.15 * state['cloudRadius'], //150 
                offset = ((amount - 1) * separation) / 2;
                for (var i = 0; i < state['particles']; i++) {
                    var x = (i % amount) * separation;
                    var y = Math.floor((i / amount) % amount) * separation;
                    var z = Math.floor(i / (amount * amount)) * separation;
                    vertices.push(x - offset, y - offset, z - offset);
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/helix1", [], function(exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var helix1;
    return {
        setters:[],
        execute: function() {
            exports_10("helix1", helix1 = (state) => {
                const TWOPI = 2 * Math.PI;
                var radius = 0.3 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'];
                for (var i = 0; i < particles; i++) {
                    var p = i / particles;
                    vertices.push(radius * Math.cos(p * TWOPI), 2 * p * radius - 300, radius * Math.sin(p * TWOPI));
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/helix2", [], function(exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var helix2;
    return {
        setters:[],
        execute: function() {
            exports_11("helix2", helix2 = (state) => {
                const TWOPI = 2 * Math.PI;
                var radius = 0.6 * state['cloudRadius'], // 600
                vertices = [], particles = state['particles'], i, j, p;
                for (j = 0; j < particles; j++) {
                    if (j % 2 === 0) {
                        i = j;
                    }
                    else {
                        i = particles / 2.0 + j;
                    }
                    p = i / particles;
                    vertices.push(radius * Math.cos(3 * p * TWOPI), 2 * p * radius - 600, radius * Math.sin(3 * p * TWOPI));
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/helix3", [], function(exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var helix3;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // helix3
            exports_12("helix3", helix3 = (state) => {
                const TWOPI = 2 * Math.PI;
                var radius = 0.6 * state['cloudRadius'], // 600
                vertices = [], particles = state['particles'], j, p;
                for (j = 0; j < particles; j++) {
                    if (j % 2 === 0) {
                        p = (j + particles / 2.0 - particles) / particles;
                    }
                    else {
                        p = j / particles;
                    }
                    vertices.push(radius * Math.cos(3 * p * TWOPI), 2 * p * radius - 600, radius * Math.sin(3 * p * TWOPI));
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/plane", [], function(exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var plane;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // plane
            exports_13("plane", plane = (state) => {
                var vertices = [], amountX = 12, amountZ = 16, separation = 0.15 * state['cloudRadius'], //150 
                offsetX = ((amountX - 1) * separation) / 2, offsetZ = ((amountZ - 1) * separation) / 2;
                for (var i = 0; i < state['particles']; i++) {
                    var x = (i % amountX) * separation;
                    var z = Math.floor(i / amountX) * separation;
                    var y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200;
                    vertices.push(x - offsetX, y, z - offsetZ);
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/sphere1", [], function(exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var sphere1;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere1
            exports_14("sphere1", sphere1 = (state) => {
                var radius = 0.75 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'];
                for (var i = 0; i < particles; i++) {
                    let phi = Math.acos(-1 + (2 * i) / particles), theta = Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/sphere2", [], function(exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var sphere2;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere2
            exports_15("sphere2", sphere2 = (state) => {
                var radius = 0.75 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'];
                for (var i = 0; i < particles; i++) {
                    let phi = 3 * Math.acos(-1 + (2 * i) / particles), theta = 0.5 * Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/sphere3", [], function(exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var sphere3;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere3
            exports_16("sphere3", sphere3 = (state) => {
                var radius = 0.3 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'], i;
                for (var i = 0; i < particles; i++) {
                    let phi = Math.acos(-1 + (2 * i) / particles), theta = Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), 2 * radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
System.register("models/cloud/generators/sphere4", [], function(exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    var sphere4;
    return {
        setters:[],
        execute: function() {
            // morphtarget generators
            // sphere4
            exports_17("sphere4", sphere4 = (state) => {
                var radius = 0.3 * state['cloudRadius'], // 750
                vertices = [], particles = state['particles'], i;
                for (var i = 0; i < particles; i++) {
                    let phi = Math.acos(-1 + (2 * i) / particles), theta = 0.5 * Math.sqrt(particles * Math.PI) * phi;
                    vertices.push(0.5 * radius * Math.cos(theta) * Math.sin(phi), 4 * radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi));
                }
                return vertices;
            });
        }
    }
});
// _generators.ts
// imports specific generator functions from models/cloud/generators/*.ts
System.register("models/cloud/generators/_generators", ["models/cloud/generators/cube", "models/cloud/generators/helix1", "models/cloud/generators/helix2", "models/cloud/generators/helix3", "models/cloud/generators/plane", "models/cloud/generators/sphere1", "models/cloud/generators/sphere2", "models/cloud/generators/sphere3", "models/cloud/generators/sphere4"], function(exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    var cube_1, helix1_1, helix2_1, helix3_1, plane_1, sphere1_1, sphere2_1, sphere3_1, sphere4_1;
    var generators;
    return {
        setters:[
            function (cube_1_1) {
                cube_1 = cube_1_1;
            },
            function (helix1_1_1) {
                helix1_1 = helix1_1_1;
            },
            function (helix2_1_1) {
                helix2_1 = helix2_1_1;
            },
            function (helix3_1_1) {
                helix3_1 = helix3_1_1;
            },
            function (plane_1_1) {
                plane_1 = plane_1_1;
            },
            function (sphere1_1_1) {
                sphere1_1 = sphere1_1_1;
            },
            function (sphere2_1_1) {
                sphere2_1 = sphere2_1_1;
            },
            function (sphere3_1_1) {
                sphere3_1 = sphere3_1_1;
            },
            function (sphere4_1_1) {
                sphere4_1 = sphere4_1_1;
            }],
        execute: function() {
            generators = { cube: cube_1.cube,
                helix1: helix1_1.helix1,
                helix2: helix2_1.helix2,
                helix3: helix3_1.helix3,
                plane: plane_1.plane,
                sphere1: sphere1_1.sphere1,
                sphere2: sphere2_1.sphere2,
                sphere3: sphere3_1.sphere3,
                sphere4: sphere4_1.sphere4 };
            exports_18("generators", generators);
        }
    }
});
System.register("services/morphtargets", ["services/mediator", "models/cloud/generators/_generators"], function(exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    var mediator_4, _generators_1;
    var targets, morphTargets, positions, MorphTargets;
    return {
        setters:[
            function (mediator_4_1) {
                mediator_4 = mediator_4_1;
            },
            function (_generators_1_1) {
                _generators_1 = _generators_1_1;
            }],
        execute: function() {
            // constants - targets is all names of position generators
            targets = Object.keys(_generators_1.generators);
            // singleton closure-instance variable
            positions = [];
            class MorphTargets {
                // ctor
                constructor() {
                    morphTargets = this;
                } //ctor
                // generate positions array = [x,y,z, ...]
                generate(state) {
                    var vertices = [], requestedTargets = state['morphtargets'] || targets;
                    // generate positions 
                    //    for(let s of targets){
                    //      console.log(`type of generators[${s}] is ${typeof generators[s]}`);
                    //    }
                    for (let t of requestedTargets) {
                        vertices = _generators_1.generators[t](state);
                        //console.log(`vertices = ${vertices}`);
                        mediator_4.mediator.log(`${t} generated vertices has length ${vertices.length}`);
                        for (let i = 0; i < vertices.length; i++) {
                            positions.push(vertices[i]);
                        }
                    }
                    // sanity
                    //mediator.logc(`morphTarget generated positions.l = ${positions.length}`);
                    return positions;
                } //generate
            }
             //MorphTargets
            // enforce singleton export
            if (morphTargets === undefined) {
                morphTargets = new MorphTargets();
            }
            exports_19("morphTargets", morphTargets);
        }
    }
});
System.register("state/cloud", ["services/mediator", "services/morphtargets"], function(exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    var mediator_5, morphtargets_1;
    var cloud, TWEEN, N, urls, transparent, opacity, lights, fog, particles, particlesByN, duration, targets, cloudRadius, translateZ, objects, object, positions, state_positions, current, group, transition, Cloud;
    return {
        setters:[
            function (mediator_5_1) {
                mediator_5 = mediator_5_1;
            },
            function (morphtargets_1_1) {
                morphtargets_1 = morphtargets_1_1;
            }],
        execute: function() {
            // singleton closure-instance variable, cloud param defaults
            N = 4, urls = ["./assets/images/sprite_redlight.png",
                "./assets/images/moon_256.png",
                "./assets/images/lotus_64.png",
                "./assets/images/sprites/ball.png"], transparent = true, opacity = 1.0, lights = false, fog = false, particles = 128, particlesByN = particles / N, duration = 1000, cloudRadius = 500, translateZ = 1000, objects = [], positions = [], state_positions = [], current = 0, group = new THREE.Group(), 
            // animations
            transition = () => {
                var offset = current * particles * 3, i, j;
                //tween1,
                //tween2,
                //o:object={x:0};
                mediator_5.mediator.log(`current target = ${current} offset=${offset}`);
                for (i = 0, j = offset; i < particles; i++, j += 3) {
                    object = objects[i];
                    // TWEEN
                    new TWEEN.Tween(object.position)
                        .to({
                        x: positions[j],
                        y: positions[j + 1],
                        z: positions[j + 2]
                    }, Math.random() * duration + duration)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .start();
                }
                // TWEEN  
                new TWEEN.Tween({ x: 0, y: 0, z: 0 }) // z=0
                    .to({ x: 0, y: 0, z: 0 }, duration * 3) // z=0
                    .onComplete(transition)
                    .start();
                // GSAP
                //      tween2 = TweenLite.to(o,
                //                    duration*3,
                //                    {x:0,
                //                     onComplete:transition});
                current = (current + 1) % targets; // modulo total morph-targets
            };
            class Cloud {
                constructor() {
                    cloud = this;
                } //ctor
                delta(state, TWEEN_, callback) {
                    mediator_5.mediator.log(`delta: state = ${state} TWEEN_ = ${TWEEN_}`);
                    var _cloud = state['_cloud'], loaded = 0, mat, spr, textureLoader = new THREE.TextureLoader(), o = {};
                    // globals
                    TWEEN = TWEEN_;
                    // _cloud=undefined => modify/create _cloud=true => create
                    mediator_5.mediator.logc(`cloud.delta: state['_cloud'] = ${state['_cloud']}`);
                    if (_cloud === undefined || _cloud === true) {
                        o['_cloud'] = state['_cloud'];
                        particles = state['particles'] || particles;
                        targets = state['targets'] || targets;
                        N = state['N'] || N;
                        particlesByN = particles / N;
                        current = 0;
                        urls = state['urls'] || urls;
                        duration = state['duration'] || duration;
                        state_positions = state['positions'] || [];
                        cloudRadius = state['cloudRadius'] || cloudRadius;
                        translateZ = state['translateZ'] || translateZ;
                        if (state['options']) {
                            transparent = state['options']['transparent'] || transparent;
                            opacity = state['options']['opacity'] || opacity;
                            lights = state['options']['lights'] || lights;
                            fog = state['options']['fog'] || fog;
                        }
                        try {
                            // delta sprites and morph-targets
                            for (let i = 0; i < N; i++) {
                                textureLoader.load(urls[i], 
                                // load
                                    (texture) => {
                                    loaded += 1;
                                    mat = new THREE.SpriteMaterial({ map: texture, color: 'white', fog: true });
                                    for (let j = 0; j < particlesByN; j++) {
                                        spr = new THREE.Sprite(mat);
                                        let x = Math.random() - 0.5;
                                        let y = Math.random() - 0.5;
                                        let z = Math.random() - 0.5;
                                        spr.position.set(x, y, z);
                                        spr.position.normalize();
                                        spr.position.multiplyScalar(cloudRadius);
                                        x = spr.position.x;
                                        y = spr.position.y;
                                        z = spr.position.z;
                                        positions.push(x, y, z);
                                        objects.push(spr);
                                        group.add(spr);
                                        mediator_5.mediator.log(`spritecloud positions i=${i} j=${j}`);
                                    }
                                    if (loaded === N) {
                                        mediator_5.mediator.log(`cld texture loading complete - ${loaded} images`);
                                        mediator_5.mediator.log(`textures complete - objs.l = ${objects.length}`);
                                        // if state_positions = [] or undefined generate morph positions
                                        if (state_positions.length === 0) {
                                            positions = morphtargets_1.morphTargets.generate(state);
                                        }
                                        else {
                                            positions = state_position;
                                        }
                                        // calculate number of targets
                                        // NOTE: positions is array of (x,y,z) (3) for each vertex 
                                        // (particles) for each target
                                        targets = positions.length / (particles * 3);
                                        // start animation cycle
                                        mediator_5.mediator.log(`at cld.transition: pos.l=${positions.length}`);
                                        transition();
                                        // create cloud
                                        callback(null, { _cloud: _cloud, group: group });
                                    }
                                }, 
                                // progress
                                    (xhr) => {
                                    mediator_5.mediator.log(`cloud loading textures...`);
                                }, 
                                // error
                                    (xhr) => {
                                    mediator_5.mediator.loge(`error loading url ${urls[i]}`);
                                });
                            }
                        }
                        catch (e) {
                            mediator_5.mediator.loge(`error in spritecloud_init: ${e.message}`);
                            callback(null, null);
                        }
                    }
                    else {
                        callback(null, { _cloud: _cloud, group: null });
                    } //if(state['_cloud'])
                } //delta()
            }
             //Cloud
            // enforce singleton export
            if (cloud === undefined) {
                cloud = new Cloud();
            }
            exports_20("cloud", cloud);
        }
    }
});
System.register("state/space", ["services/mediator", "models/space/quad_vsh/vsh_default.glsl", "models/space/quad_fsh/fsh_default.glsl"], function(exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    var mediator_6, vsh_default_glsl_2, fsh_default_glsl_3, fsh_default_glsl_4;
    var space, vsh, fsh, uniforms, Space;
    return {
        setters:[
            function (mediator_6_1) {
                mediator_6 = mediator_6_1;
            },
            function (vsh_default_glsl_2_1) {
                vsh_default_glsl_2 = vsh_default_glsl_2_1;
            },
            function (fsh_default_glsl_3_1) {
                fsh_default_glsl_3 = fsh_default_glsl_3_1;
                fsh_default_glsl_4 = fsh_default_glsl_3_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            vsh = vsh_default_glsl_2.vsh, fsh = fsh_default_glsl_3.fsh, uniforms = fsh_default_glsl_4.uniforms;
            class Space {
                // ctor
                constructor() {
                    space = this;
                } //ctor
                delta(state, sgTarget, callback) {
                    mediator_6.mediator.log(`space delta: state = ${state}`);
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
                    mediator_6.mediator.log(`^^^^ space: state['_space'] = ${state['_space']}`);
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
                        mediator_6.mediator.logc(` modify rm-quad-shader uniforms TBD!!`);
                        callback(null, {});
                    }
                } //delta
            }
             //Space
            // enforce singleton export
            if (space === undefined) {
                space = new Space();
            }
            exports_21("space", space);
        }
    }
});
/**
 * @author mrdoob / http://mrdoob.com/
 * rudolph - added delay node
 */
//import { Vector3 } from '../math/Vector3';
//import { Quaternion } from '../math/Quaternion';
//import { Object3D } from '../core/Object3D';
//import { AudioContext } from './AudioContext';
System.register("services/audio_listener_delay", [], function(exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var listener, delayTime;
    // constructor - wire gain to delay, gain to output, delay to output (dest)
    function AudioListenerDelay() {
        THREE.Object3D.call(this);
        this.type = 'AudioListener';
        this.context = THREE.AudioContext.getContext();
        this.gain = this.context.createGain();
        // delay
        this.delay = this.context.createDelay(10);
        this.delay.delayTime.value = delayTime;
        // integrate delay
        this.gain.connect(this.delay);
        this.delay.connect(this.context.destination);
        // undelayed output
        this.gain.connect(this.context.destination);
        this.filter = null;
    }
    return {
        setters:[],
        execute: function() {
            delayTime = 0.0;
            AudioListenerDelay.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
                constructor: AudioListener,
                setDelay(d) {
                    this.delay.delayTime.value = d;
                },
                getInput: function () {
                    return this.gain;
                },
                removeFilter: function () {
                    if (this.filter !== null) {
                        this.gain.disconnect(this.filter);
                        this.filter.disconnect(this.context.destination);
                        this.gain.connect(this.context.destination);
                        this.filter = null;
                    }
                },
                getFilter: function () {
                    return this.filter;
                },
                setFilter: function (value) {
                    if (this.filter !== null) {
                        this.gain.disconnect(this.filter);
                        this.filter.disconnect(this.context.destination);
                    }
                    else {
                        this.gain.disconnect(this.context.destination);
                    }
                    this.filter = value;
                    this.gain.connect(this.filter);
                    this.filter.connect(this.context.destination);
                },
                getMasterVolume: function () {
                    return this.gain.gain.value;
                },
                setMasterVolume: function (value) {
                    this.gain.gain.value = value;
                },
                updateMatrixWorld: (function () {
                    var position = new THREE.Vector3();
                    var quaternion = new THREE.Quaternion();
                    var scale = new THREE.Vector3();
                    var orientation = new THREE.Vector3();
                    return function updateMatrixWorld(force) {
                        //o.prototype.updateMatrixWorld.call( this, force );
                        var listener = this.context.listener;
                        var up = this.up;
                        this.matrixWorld.decompose(position, quaternion, scale);
                        orientation.set(0, 0, -1).applyQuaternion(quaternion);
                        if (listener.positionX) {
                            listener.positionX.setValueAtTime(position.x, this.context.currentTime);
                            listener.positionY.setValueAtTime(position.y, this.context.currentTime);
                            listener.positionZ.setValueAtTime(position.z, this.context.currentTime);
                            listener.forwardX.setValueAtTime(orientation.x, this.context.currentTime);
                            listener.forwardY.setValueAtTime(orientation.y, this.context.currentTime);
                            listener.forwardZ.setValueAtTime(orientation.z, this.context.currentTime);
                            listener.upX.setValueAtTime(up.x, this.context.currentTime);
                            listener.upY.setValueAtTime(up.y, this.context.currentTime);
                            listener.upZ.setValueAtTime(up.z, this.context.currentTime);
                        }
                        else {
                            listener.setPosition(position.x, position.y, position.z);
                            listener.setOrientation(orientation.x, orientation.y, orientation.z, up.x, up.y, up.z);
                        }
                    };
                })()
            });
            if (!listener) {
                listener = new AudioListenerDelay();
            }
            exports_22("listener", listener);
        }
    }
});
System.register("state/audio", ["services/mediator", "services/audio_listener_delay"], function(exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var mediator_7, audio_listener_delay_1;
    var audio, loader, sound, parent, _refDistance, _maxDistance, _volume, _playbackRate, _loop, _actor, url, refDistance, maxDistance, volume, playbackRate, delay, loop, panner, coneInnerAngle, coneOuterAngle, coneOuterGain, actor, Audio;
    return {
        setters:[
            function (mediator_7_1) {
                mediator_7 = mediator_7_1;
            },
            function (audio_listener_delay_1_1) {
                audio_listener_delay_1 = audio_listener_delay_1_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            // defaults
            _refDistance = 1000, _maxDistance = 1000, _volume = 0.5, _playbackRate = 1.0, _loop = true, _actor = 'lens', 
            // dynamic
            url = '', refDistance = 1000, maxDistance = 1000, volume = 1.0, playbackRate = 1.0, delay = 0.0, loop = true, coneInnerAngle = 360, coneOuterAngle = 360, coneOuterGain = 0, actor = 'lens';
            class Audio {
                // ctor
                constructor() {
                    audio = this;
                    //console.log(`listener = ${listener}`);
                } //ctor
                // initialization
                initialize(lens) {
                    lens.add(audio_listener_delay_1.listener);
                    loader = new THREE.AudioLoader();
                }
                delta(state, narrative, callback) {
                    mediator_7.mediator.log(`Audio.delta: state = ${state} _audio = ${state['_audio']}`);
                    //for(let p of Object.keys(state)){
                    //  console.log(`audio: state has property ${p} val ${state[p]}`);
                    //}
                    // _audio
                    if (state['_audio'] !== undefined) {
                        if (state['_audio']) {
                            sound = new THREE.PositionalAudio(audio_listener_delay_1.listener);
                            panner = sound.getOutput();
                            // delay
                            delay = state['delay'] || delay;
                            audio_listener_delay_1.listener.setDelay(delay);
                            // properties
                            // panner
                            panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
                            panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
                            if (state['coneOuterGain'] === 0.0) {
                                panner.coneOuterGain = 0.0;
                            }
                            else {
                                panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
                            }
                            refDistance = state['refDistance'] || _refDistance;
                            maxDistance = state['maxDistance'] || _maxDistance;
                            if (state['volume'] !== undefined && (state['volume'] === 0.0)) {
                                volume = 0.0;
                            }
                            else {
                                volume = state['volume'] || _volume;
                            }
                            playbackRate = state['playbackRate'] || _playbackRate;
                            if (state['loop'] !== undefined && (state['loop'] === false)) {
                                loop = false;
                            }
                            else {
                                loop = state['loop'] || _loop;
                            }
                            actor = state['actor'] || _actor;
                            if (state['url']) {
                                url = state['url'];
                                loader.load(url, (buffer) => {
                                    sound.setBuffer(buffer);
                                    sound.setRefDistance(refDistance);
                                    sound.setMaxDistance(maxDistance);
                                    sound.setVolume(volume);
                                    sound.setLoop(_loop);
                                    sound.playbackRate = playbackRate;
                                    parent = narrative.actors[actor];
                                    if (parent) {
                                        //mediator.logc(`adding sound ${url} to ${state['actor']}`);
                                        //mediator.logc(`sound vol = ${volume} playbackRate = ${playbackRate}`);
                                        parent.add(sound);
                                        sound.play();
                                    }
                                    else {
                                        mediator_7.mediator.loge(`audio: actor ${actor} not found!`);
                                    }
                                    //mediator.logc(`sound ${url} is playing is ${sound.isPlaying}`);
                                });
                            }
                        }
                        else {
                            if (sound) {
                                sound.stop();
                                parent.remove(sound);
                                sound = null;
                                mediator_7.mediator.logc(`soundnode removed`);
                            }
                        }
                    }
                    else {
                        if (sound) {
                            // properties
                            // panner
                            panner = sound.getOutput();
                            panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
                            panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
                            if (state['coneOuterGain'] === 0.0) {
                                panner.coneOuterGain = 0.0;
                            }
                            else {
                                panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
                            }
                            sound.setRefDistance(state['refDistance'] || refDistance);
                            sound.setMaxDistance(state['maxDistance'] || maxDistance);
                            if (state['volume']) {
                                sound.setVolume(state['volume']);
                            }
                            sound.playbackRate = state['playbackRate'] || playbackRate;
                            if (state['loop'] !== undefined && (state['loop'] === false)) {
                                sound.setLoop(false);
                            }
                            else {
                                sound.setLoop(state['loop'] || loop);
                            }
                            if (state['actor']) {
                                parent.remove(sound);
                                parent = narrative.actors(state['actor']);
                                if (parent) {
                                    parent.add(sound);
                                }
                            }
                            // play
                            if (state['play']) {
                                audio.play();
                            }
                            // pause
                            if (state['pause']) {
                                audio.pause();
                            }
                            // stop
                            if (state['stop']) {
                                audio.stop();
                            }
                        }
                    }
                    callback(null, {});
                } //delta
                play() {
                    if (sound) {
                        sound.play();
                    }
                }
                pause() {
                    if (sound) {
                        sound.pause();
                    }
                }
                stop() {
                    if (sound) {
                        sound.stop();
                    }
                }
                setVolume(level) {
                    if (sound) {
                        sound.setVolume(level);
                    }
                }
            }
             //Audio
            // enforce singleton export
            if (audio === undefined) {
                audio = new Audio();
            }
            exports_23("audio", audio);
        }
    }
});
// vrstage.ts
System.register("state/vrstage", ["services/mediator", "services/actors"], function(exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    var mediator_8, actors_2;
    var vrstage, axes, ambient_light, ambient_color, ambient_intensity, fog, fog_color, fog_near, fog_far, cube, cube_urls, cube_opacity, cubeLoader, dome, dome_url, dome_opacity, textureLoader, environment, skycube, skydome, VRVrStage;
    return {
        setters:[
            function (mediator_8_1) {
                mediator_8 = mediator_8_1;
            },
            function (actors_2_1) {
                actors_2 = actors_2_1;
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
                    mediator_8.mediator.loge(`error in environment_init: ${e.message}`);
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
                                mediator_8.mediator.log(`@@@skycube() cube = ${cube}`);
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
                    mediator_8.mediator.loge(`error in skycube_init: ${e.message}`);
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
                                mediator_8.mediator.log(`@@@skydome() dome = ${dome}`);
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
                    mediator_8.mediator.loge(`error in skydome_init: ${e.message}`);
                    callback(null, {});
                }
            };
            // skydome
            class VRVrStage {
                // ctor
                constructor() {
                    vrstage = this;
                } //ctor
                delta(state = {}, narrative, callback) {
                    mediator_8.mediator.log(`VRVrStage.delta: state = ${state}`);
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
                                mediator_8.mediator.loge(`vrstage.delta caused error: ${e}`);
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
                                mediator_8.mediator.loge(`vrstage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        },
                        actors: function (callback) {
                            try {
                                if (state['actors']) {
                                    // 4th var is vr=true!
                                    actors_2.actors.create(state['actors'], narrative, callback, true);
                                }
                                else {
                                    callback(null, {});
                                }
                            }
                            catch (e) {
                                mediator_8.mediator.loge(`vrstage.delta caused error: ${e}`);
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
                                mediator_8.mediator.loge(`vrstage.delta caused error: ${e}`);
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
                                mediator_8.mediator.loge(`vrstage.delta caused error: ${e}`);
                                callback(null, {});
                            }
                        }
                    }, //first arg
                        (err, o) => {
                        if (err) {
                            mediator_8.mediator.loge("error: " + err);
                            return;
                        }
                        mediator_8.mediator.log(`vrstage: o['environemt']['axes'] = ${o['environment']['axes']}`);
                        mediator_8.mediator.log(`vrstage: o['environemt']['ambient_light'] = ${o['environment']['ambient_light']}`);
                        mediator_8.mediator.log(`vrstage: o['environemt']['fog'] = ${o['environment']['fog']}`);
                        mediator_8.mediator.log(`vrstage: o['skycube']['skycube'] = ${o['skycube']['skycube']}`);
                        mediator_8.mediator.log(`vrstage: o['skydome']['skydome'] = ${o['skydome']['skydome']}`);
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
             //VRVrStage
            // enforce singleton export
            if (vrstage === undefined) {
                vrstage = new VRVrStage();
            }
            exports_24("vrstage", vrstage);
        }
    }
});
System.register("state/vrcloud", ["services/mediator", "services/morphtargets"], function(exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    var mediator_9, morphtargets_2;
    var vrcloud, TWEEN, N, urls, transparent, opacity, lights, fog, particles, particlesByN, duration, targets, cloudRadius, translateZ, objects, object, positions, state_positions, current, group, transition, VrCloud;
    return {
        setters:[
            function (mediator_9_1) {
                mediator_9 = mediator_9_1;
            },
            function (morphtargets_2_1) {
                morphtargets_2 = morphtargets_2_1;
            }],
        execute: function() {
            // singleton closure-instance variable, vrcloud param defaults
            N = 4, urls = ["./assets/images/sprite_redlight.png",
                "./assets/images/moon_256.png",
                "./assets/images/lotus_64.png",
                "./assets/images/sprites/ball.png"], transparent = true, opacity = 1.0, lights = false, fog = false, particles = 128, particlesByN = particles / N, duration = 1000, cloudRadius = 500, translateZ = 1000, objects = [], positions = [], state_positions = [], current = 0, group = new THREE.Group(), 
            // animations
            transition = () => {
                var offset = current * particles * 3, i, j;
                //tween1,
                //tween2,
                //o:object={x:0};
                mediator_9.mediator.log(`current target = ${current} offset=${offset}`);
                for (i = 0, j = offset; i < particles; i++, j += 3) {
                    object = objects[i];
                    // TWEEN
                    new TWEEN.Tween(object.position)
                        .to({
                        x: positions[j],
                        y: positions[j + 1],
                        z: positions[j + 2]
                    }, Math.random() * duration + duration)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .start();
                }
                // TWEEN  
                new TWEEN.Tween({ x: 0, y: 0, z: 0 }) // z=0
                    .to({ x: 0, y: 0, z: 0 }, duration * 3) // z=0
                    .onComplete(transition)
                    .start();
                // GSAP
                //      tween2 = TweenLite.to(o,
                //                    duration*3,
                //                    {x:0,
                //                     onComplete:transition});
                current = (current + 1) % targets; // modulo total morph-targets
            };
            class VrCloud {
                constructor() {
                    vrcloud = this;
                } //ctor
                delta(state, TWEEN_, callback) {
                    mediator_9.mediator.log(`delta: state = ${state} TWEEN_ = ${TWEEN_}`);
                    var _vrcloud = state['_vrcloud'], loaded = 0, mat, spr, textureLoader = new THREE.TextureLoader(), o = {};
                    // globals
                    TWEEN = TWEEN_;
                    // _vrcloud=undefined => modify/create _vrcloud=true => create
                    mediator_9.mediator.logc(`vrcloud.delta: state['_vrcloud'] = ${state['_vrcloud']}`);
                    if (_vrcloud === undefined || _vrcloud === true) {
                        o['_vrcloud'] = state['_vrcloud'];
                        particles = state['particles'] || particles;
                        targets = state['targets'] || targets;
                        N = state['N'] || N;
                        particlesByN = particles / N;
                        current = 0;
                        urls = state['urls'] || urls;
                        duration = state['duration'] || duration;
                        state_positions = state['positions'] || [];
                        cloudRadius = state['cloudRadius'] || cloudRadius;
                        translateZ = state['translateZ'] || translateZ;
                        if (state['options']) {
                            transparent = state['options']['transparent'] || transparent;
                            opacity = state['options']['opacity'] || opacity;
                            lights = state['options']['lights'] || lights;
                            fog = state['options']['fog'] || fog;
                        }
                        try {
                            // delta sprites and morph-targets
                            for (let i = 0; i < N; i++) {
                                textureLoader.load(urls[i], 
                                // load
                                    (texture) => {
                                    loaded += 1;
                                    mat = new THREE.SpriteMaterial({ map: texture, color: 'white', fog: true });
                                    for (let j = 0; j < particlesByN; j++) {
                                        spr = new THREE.Sprite(mat);
                                        let x = Math.random() - 0.5;
                                        let y = Math.random() - 0.5;
                                        let z = Math.random() - 0.5;
                                        spr.position.set(x, y, z);
                                        spr.position.normalize();
                                        spr.position.multiplyScalar(cloudRadius);
                                        x = spr.position.x;
                                        y = spr.position.y;
                                        z = spr.position.z;
                                        positions.push(x, y, z);
                                        objects.push(spr);
                                        group.add(spr);
                                        mediator_9.mediator.log(`spritevrcloud positions i=${i} j=${j}`);
                                    }
                                    if (loaded === N) {
                                        mediator_9.mediator.log(`cld texture loading complete - ${loaded} images`);
                                        mediator_9.mediator.log(`textures complete - objs.l = ${objects.length}`);
                                        // if state_positions = [] or undefined generate morph positions
                                        if (state_positions.length === 0) {
                                            positions = morphtargets_2.morphTargets.generate(state);
                                        }
                                        else {
                                            positions = state_position;
                                        }
                                        // calculate number of targets
                                        // NOTE: positions is array of (x,y,z) (3) for each vertex 
                                        // (particles) for each target
                                        targets = positions.length / (particles * 3);
                                        // start animation cycle
                                        console.log(`######## at vrcloud.transition: pos.l=${positions.length}`);
                                        mediator_9.mediator.log(`######## at vrcloud.transition: pos.l=${positions.length}`);
                                        transition();
                                        // create vrcloud
                                        callback(null, { _vrcloud: _vrcloud, group: group });
                                    }
                                }, 
                                // progress
                                    (xhr) => {
                                    mediator_9.mediator.log(`vrcloud loading textures...`);
                                }, 
                                // error
                                    (xhr) => {
                                    mediator_9.mediator.loge(`error loading url ${urls[i]}`);
                                });
                            }
                        }
                        catch (e) {
                            mediator_9.mediator.loge(`error in spritevrcloud_init: ${e.message}`);
                            callback(null, null);
                        }
                    }
                    else {
                        callback(null, { _vrcloud: _vrcloud, group: null });
                    } //if(state['_vrcloud'])
                } //delta()
            }
             //VrCloud
            // enforce singleton export
            if (vrcloud === undefined) {
                vrcloud = new VrCloud();
            }
            exports_25("vrcloud", vrcloud);
        }
    }
});
System.register("state/action", ["services/mediator"], function(exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    var mediator_10;
    var action, Action;
    return {
        setters:[
            function (mediator_10_1) {
                mediator_10 = mediator_10_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            class Action {
                // ctor
                constructor() {
                    action = this;
                } //ctor
                delta(state, callback) {
                    mediator_10.mediator.log(`Action.delta: state = ${state}`);
                    // return Queue of timed actions - future: may need additions?
                    callback(null, state);
                }
            }
             //Action
            // enforce singleton export
            if (action === undefined) {
                action = new Action();
            }
            exports_26("action", action);
        }
    }
});
// animation.ts
// NOTE!: need TweenMax, TimelineMax Quad
System.register("services/animation", ["services/mediator"], function(exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    var mediator_11;
    var animation, narrative, timeline, Animation;
    return {
        setters:[
            function (mediator_11_1) {
                mediator_11 = mediator_11_1;
            }],
        execute: function() {
            // singleton instance - exported
             // source for actors and callbacks narrative.exec({})
            timeline = (shot) => {
                var _timeline = shot['timeline'] || {}, tlp = _timeline['p'] || {}, actors = _timeline['actors'] || {}, ntuple, target, // target obj for property to be tweened - animated
                tweens, quad_m, hud_m;
                // timeline ctor params - tlp
                tlp.timeScale = tlp['timeScale'] || 1.0;
                tlp.repeat = tlp['repeat'] || 0;
                tlp.repeatDelay = tlp['repeatDelay'] || 0;
                tlp.yoyo = tlp['yoyo'] || true;
                tlp.ease = tlp['ease'] || Quad.easeInOut;
                tlp.paused = tlp['paused'] || false; // default
                tlp.immediateRender = tlp['immediateRender'] || false; // default
                // callbacks & params
                tlp.onStart = tlp['onStart'];
                tlp.onStartParams = tlp['onStartParams'] || [];
                // TEMP !!!!
                tlp.onUpdate = tlp['onUpdate'];
                tlp.onUpdateParams = tlp['onUpdateParams'] || [];
                //tlp.onUpdate = console.log;      
                //tlp.onUpdateParams = [`timeline-update`];
                tlp.onComplete = tlp['onComplete'];
                tlp.onCompleteParams = tlp['onCompleteParams'] || [];
                tlp.onReverseComplete = tlp['onReverseComplete'];
                tlp.onReverseCompleteParams = tlp['onReverseCompleteParams'] || [];
                // iterate through actors on which one or more tweens are defined
                for (let a of Object.keys(actors)) {
                    mediator_11.mediator.log(`actor = ${a}`);
                    ntuple = a.split('~');
                    mediator_11.mediator.log(`ntuple = ${ntuple.join('~')}`);
                    if (!ntuple[0]) {
                        continue; // bail if first slot is empty
                    }
                    // determine target of property animation
                    target = undefined;
                    if (ntuple[0].match(/target/)) {
                        target = narrative.targets[ntuple[0]];
                        if (ntuple[1]) {
                            target = target[ntuple[1]];
                        }
                        if (ntuple[2]) {
                            target = target[ntuple[2]];
                        }
                    }
                    else {
                        if (ntuple[0].match(/uniform/)) {
                            //console.log(`ntuple[0] matches /uniform/`);
                            //console.log(`ntuple[1] = ${ntuple[1]}`);
                            if (ntuple[1].match(/quad/)) {
                                quad_m = narrative.quad.material;
                                //console.log(`ntuple[1] matches /quad/`);
                                //for(let p of Object.keys(quad_m.uniforms)){
                                //  console.log(`quad_m has uniform ${p}`);
                                //}
                                //console.log(`ntuple[2] = ${ntuple[2]}`);
                                target = quad_m.uniforms[ntuple[2]];
                            }
                            if (ntuple[1].match(/hud/)) {
                                hud_m = narrative.quad.material;
                                //console.log(`ntuple[1] matches /hud/`);
                                //for(let p of Object.keys(hud_m.uniforms)){
                                //  console.log(`hud_m has uniform ${p}`);
                                //}
                                target = hud_m.uniforms[ntuple[2]];
                            }
                        }
                        else {
                            target = narrative.actors[ntuple[0]];
                            if (ntuple[1]) {
                                target = target[ntuple[1]];
                            }
                            if (ntuple[2]) {
                                target = target[ntuple[2]];
                            }
                        }
                    }
                    //mediator.logc(`target = ${target}`);
                    //if(target && target['value']){
                    //  mediator.logc(`target['value'] = ${target['value']}`);
                    //}
                    if (!target) {
                        continue; // bail if target is undefined/unknown
                    }
                    // insert tween defaults if not specified
                    // add actor tween array(s) to tlp.tweens array
                    tlp.tweens = tlp['tweens'] || [];
                    tweens = actors[a];
                    for (let tween of tweens) {
                        // dur - duration of the tween animation
                        if (tween.dur === undefined) {
                            tween.dur = 10;
                        }
                        // property to animate - tween['p'] = {{name:value}, ...}
                        tween.p = tween['p'] || {};
                        // other tween.p properties - nearly identical to timeline-tlp properties
                        tween.p.timeScale = tween.p['timeScale'] || 1.0;
                        tween.p.repeat = tween.p['repeat'] || 0;
                        tween.p.repeatDelay = tween.p['repeatDelay'] || 0;
                        tween.p.yoyo = tween.p['yoyo'] || true;
                        tween.p.ease = tween.p['ease'] || Quad.easeInOut;
                        //      tween.p.paused = tween.p['paused'] || true; // default DO NOT USE!!!!
                        tween.p.immediateRender = tween.p['immediateRender'] || false; // default
                        tween.p.delay = tween['delay'] || '0';
                        // callbacks & params
                        tween.p.onStart = tween.p['onStart'];
                        tween.p.onStartParams = tween.p['onStartParams'] || [];
                        // update - if target is uniform target.needsUpdate=true
                        //quad.material.uniforms.uCam_up.needsUpdate = true;
                        if (ntuple[0].match(/uniform/)) {
                            if (ntuple[1].match(/quad/)) {
                                //console.log(`tween:ntuple[1] matches /quad/`);
                                tween.p.onUpdate = () => {
                                    quad_m.uniforms[ntuple[2]]['needsUpdate'] = true;
                                    //console.log(`u.value = ${quad_m.uniforms[ntuple[2]]['value']}`);
                                };
                                quad_m.uniforms[ntuple[2]]['needsUpdate'] = true;
                            }
                            else {
                                console.log(`tween:ntuple[1] matches /hud/`);
                                tween.p.onUpdate = () => { hud_m.uniforms[ntuple[2]]['needsUpdate'] = true; };
                                hud.uniforms[ntuple[2]]['needsUpdate'] = true;
                            }
                        }
                        else {
                            tween.p.onUpdate = tween.p['onUpdate'];
                        }
                        tween.p.onUpdateParams = tween.p['onUpdateParams'] || [];
                        // onComplete
                        tween.p.onComplete = tween.p['onComplete'];
                        tween.p.onCompleteParams = tween.p['onCompleteParams'] || [];
                        tween.p.onReverseComplete = tween.p['onReverseComplete'];
                        tween.p.onReverseCompleteParams = tween.p['onReverseCompleteParams'] || [];
                        // add tween to tlp.tweens array
                        tlp.tweens.push(TweenMax.to(target, tween.dur, tween.p));
                    }
                } //actors
                // return primed timeline
                return new TimelineMax(tlp);
            }; //timeline() 
            class Animation {
                constructor() {
                    mediator_11.mediator.log(`Animation ctor`);
                }
                initialize(_narrative) {
                    narrative = _narrative;
                    //console.log(`&&& quad = ${narrative.quad} hud = ${narrative.hud}`);
                }
                // NOTE: reverse=true if back-button, but also if choosing scene sequence
                // such as: (1) sceneA, (2) sceneB, (3) sceneA => reverse=true
                perform(shot = {}, reverse = false) {
                    var tl;
                    // diagnostics
                    mediator_11.mediator.logc(`Animation.perform: shot = ${shot}`);
                    //mediator.logc(`Animation.perform: reverse = ${reverse}`);
                    // prepare timeline for shot
                    tl = timeline(shot);
                    //console.log(`tl = ${tl}`);
                    //console.dir(tl);
                    // timeline - if back - run anim in reverse, else forward
                    //mediator.logc(`Animation.perform: playing tl = ${tl}`);
                    if (reverse === true) {
                        tl.seek(tl.duration());
                        tl.reverse();
                    }
                    else {
                        tl.play();
                    }
                } //perform
            }
             //class Animation
            // enforce singleton export
            if (animation === undefined) {
                animation = new Animation();
            }
            exports_27("animation", animation);
        }
    }
});
System.register("services/camera3d", ["services/mediator"], function(exports_28, context_28) {
    "use strict";
    var __moduleName = context_28 && context_28.id;
    var mediator_12;
    var c3d, csphere, map, lens, animation, zoom, pan, tilt, pitch, yaw, roll, shot, record_shots, matrixa, matrixb, Camera3d;
    return {
        setters:[
            function (mediator_12_1) {
                mediator_12 = mediator_12_1;
            }],
        execute: function() {
            // reference to singleton instance of Camera3d
            // NOTE: needed since first call by browser after requestAnimationFrame
            // resets the execution context (this) to 'window' and thus fails
            zoom = 90.0, 
            // by default the lens looks at the csphere center - pan/tilt look away
            pan = 0.0, tilt = 0.0, 
            // euler
            pitch = 0.0, yaw = 0.0, roll = 0.0, 
            // faster conditional
            record_shots = false, 
            // tmp matrices used in diagnostics transforms and diagnostics
            matrixa = new THREE.Matrix4(), matrixb = new THREE.Matrix4();
            class Camera3d {
                constructor() {
                    //medaitor.log(`camera3d ctor`);
                    c3d = this;
                    record_shots = config.record_shots; // faster conditional test
                }
                initialize(_lens, _csphere, _animation) {
                    lens = _lens;
                    csphere = _csphere;
                    animation = _animation;
                    // keyboard functions - use imported map
                    System.import(config._map)
                        .then((Keymap) => {
                        map = Keymap.map; // export
                        map.initialize(c3d, csphere, lens, config.record_shots);
                        window.addEventListener("keyup", map.keys);
                    })
                        .catch((e) => {
                        mediator_12.mediator.loge(`camera3d: import of keymap caused error: ${e}`);
                    });
                } //initialize
                // camera keybd-functions
                // normalize position orientation of csphere and lens - AND zoom
                home(a) {
                    a.d = a.d || 0.0;
                    //shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { 'x': 0.0, 'y': 0.0, 'z': 0.0 } }],
                                'csphere~position': [{ dur: a.d, p: { 'x': 0.0, 'y': 0.0, 'z': 0.0 } }],
                                'csphere~rotation': [{ dur: a.d, p: { 'x': 0.0, 'y': 0.0, 'z': 0.0 } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                    // lens
                    lens.position.x = 0.0;
                    lens.position.y = 0.0;
                    lens.up.x = 0.0;
                    lens.up.y = 1.0;
                    lens.up.z = 0.0;
                    if (lens.fov !== zoom) {
                        lens.fov = zoom;
                        lens.updateProjectionMatrix();
                    }
                    // dynamic trackers
                    zoom = 90.0;
                    roll = 0.0;
                    pan = 0.0;
                    tilt = 0.0;
                    yaw = 0.0;
                    pitch = 0.0;
                }
                // lens keybd-functions
                // normalize position orientation of csphere and lens - but NOT zoom
                center(a) {
                    a.d = a.d || 0.0;
                    //shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: a.d, p: { 'x': 0.0, 'y': 0.0, 'z': 0.0 } }],
                                'lens~rotation': [{ dur: a.d,
                                        p: { 'x': 0.0, 'y': 0.0, 'z': 0.0 } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                    // lens
                    lens.position.x = 0.0;
                    lens.position.y = 0.0;
                    lens.up.x = 0.0;
                    lens.up.y = 1.0;
                    lens.up.z = 0.0;
                    if (lens.fov !== zoom) {
                        lens.fov = zoom;
                        lens.updateProjectionMatrix();
                    }
                    // dynamic trackers
                    zoom = 90.0;
                    roll = 0.0;
                    pan = 0.0;
                    tilt = 0.0;
                    yaw = 0.0;
                    pitch = 0.0;
                }
                // ZOOM<br>
                // modify csphere.scale 
                // * NOTE: dynamic lens.fov animation updates of three.js 
                // lens.updateProjectionMatrix() find an undefined projectionMatrix!<br>
                // For this reason zoom is not implemented by lens.fov<br>
                // cut - no animation
                zoomcutTo(a) {
                    zoom = a.s;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~': [{ dur: 0, p: { fov: zoom } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                zoomcutBy(a) {
                    zoom *= a.s;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~': [{ dur: 0, p: { fov: zoom } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // fly - animate
                zoomflyTo(a) {
                    zoom = a.s;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~': [{ dur: a.d, p: { fov: zoom } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                zoomflyBy(a) {
                    zoom *= a.s;
                    console.log(`zoom = ${zoom}`);
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~': [{ dur: a.d, p: { fov: zoom } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // ROLL<br>
                // modify lens.rotation.z<br> 
                // cut - no animation
                rollcutTo(a) {
                    roll = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: 0, p: { z: roll } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                rollcutBy(a) {
                    roll += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: 0, p: { z: roll } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // fly - animate
                rollflyTo(a) {
                    roll = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { z: roll } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                rollflyBy(a) {
                    roll += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { z: roll } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // PAN/TILT<br>
                // modify lens.rotation.y/lens.rotation.x 
                panflyTo(a) {
                    pan = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { y: pan } }]
                            }
                        } //tl
                    }; //shot
                    console.dir(shot);
                    animation.perform(shot);
                }
                panflyBy(a) {
                    pan += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { y: pan } }]
                            }
                        } //tl
                    }; //shot
                    console.dir(shot);
                    animation.perform(shot);
                }
                tiltflyTo(a) {
                    tilt = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { x: tilt } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                tiltflyBy(a) {
                    tilt += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'lens~rotation': [{ dur: a.d, p: { x: tilt } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // EXAMINE-YAW<br>
                // longitudinal examination - rotate csphere around y-axis<br> 
                // modify csphere.rotation.y<br>
                // cut - no animation
                yawcutTo(a) {
                    yaw = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: 0, p: { y: yaw } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                yawcutBy(a) {
                    yaw += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: 0, p: { y: yaw } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // fly - animate
                yawflyTo(a) {
                    yaw = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: a.d, p: { y: yaw } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                yawflyBy(a) {
                    yaw += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: a.d, p: { y: yaw } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // EXAMINE-PITCH<br>
                // lattitudinal examination - rotate csphere around x-axis<br> 
                // modify csphere.rotation.x<br>
                // cut - no animation
                pitchcutTo(a) {
                    pitch = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: 0, p: { x: pitch } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                pitchcutBy(a) {
                    pitch += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: 0, p: { x: pitch } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // fly - animate
                pitchflyTo(a) {
                    pitch = a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: a.d, p: { x: pitch } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                pitchflyBy(a) {
                    pitch += a.r;
                    // shot
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~rotation': [{ dur: a.d, p: { x: pitch } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // csphere-camera shot implementations
                // DOLLY - csphere translation<br>
                // fly - animate (default dur=3.0)
                dollyflyTo(a) {
                    a.d = a.d || 3.0;
                    a.x = a.x || csphere.position.x;
                    a.y = a.y || csphere.position.y;
                    a.z = a.z || csphere.position.z;
                    // shot microstate-change
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~position': [{ dur: a.d,
                                        p: { x: a.x, y: a.y, z: a.z } }]
                            }
                        } //tl
                    }; //shot
                    mediator_12.mediator.log(`dollyflyTo: shot = ${shot}`);
                    animation.perform(shot);
                }
                dollyflyBy(a) {
                    a.d = a.d || 3.0;
                    a.x = a.x || 0.0;
                    a.y = a.y || 0.0;
                    a.z = a.z || 0.0;
                    a.x = csphere.position.x + a.x;
                    a.y = csphere.position.y + a.y;
                    a.z = csphere.position.z + a.z;
                    // shot microstate-change
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~position': [{ dur: a.d,
                                        p: { x: a.x, y: a.y, z: a.z } }]
                            }
                        } //tl
                    }; //shot
                    mediator_12.mediator.log(`dollyflyBy: shot = ${shot}`);
                    animation.perform(shot);
                }
                // cut - no animation (dur=0)
                dollycutTo(a) {
                    a.x = a.x || csphere.position.x;
                    a.y = a.y || csphere.position.y;
                    a.z = a.z || csphere.position.z;
                    // shot microstate-change
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~position': [{ dur: 0,
                                        p: { x: a.x, y: a.y, z: a.z } }]
                            }
                        } //tl
                    }; //shot
                    mediator_12.mediator.log(`dollycutTo: shot = ${shot}`);
                    animation.perform(shot);
                }
                dollycutBy(a) {
                    a.d = 0.0;
                    a.x = a.x || 0.0;
                    a.y = a.y || 0.0;
                    a.z = a.z || 0.0;
                    a.x = csphere.position.x + a.x;
                    a.y = csphere.position.y + a.y;
                    a.z = csphere.position.z + a.z;
                    // shot microstate-change
                    shot = { timeline: { p: { paused: true, repeat: 0 },
                            actors: {
                                'csphere~position': [{ dur: 0,
                                        p: { x: a.x, y: a.y, z: a.z } }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // random 2d-bezier camera nav<br> 
                // use default 6 points and 'through' bezier curve type
                bezier(a = { d: 20, n: 6, z: true }) {
                    var i, x = [], y = [], z = [], v = [], bezier;
                    // bezier 'through' curve points - z:true => fly in z dimension also
                    if (a.z) {
                        z[0] = 0.0;
                    }
                    x[0] = 0.0;
                    y[0] = 0.0;
                    if (Math.random() > 0.5) {
                        x[1] = 0.5 * Math.random(); // ++
                        y[1] = 0.5 * Math.random();
                        x[2] = -0.5 * Math.random(); // -+
                        y[2] = 0.5 * Math.random();
                        x[3] = -0.5 * Math.random(); // --
                        y[3] = -0.5 * Math.random();
                        x[4] = 0.5 * Math.random(); // +-
                        y[4] = -0.5 * Math.random();
                        if (a.z) {
                            z[1] = -0.2 * Math.random();
                            z[2] = z[1] - 30 * Math.random();
                            z[3] = z[2] + 30 * Math.random();
                            z[4] = -0.2 * Math.random();
                        }
                    }
                    else {
                        x[1] = -0.5 * Math.random(); // --
                        y[1] = -0.5 * Math.random();
                        x[2] = -0.5 * Math.random(); // -+
                        y[2] = 0.5 * Math.random();
                        x[3] = 0.5 * Math.random(); // ++
                        y[3] = 0.5 * Math.random();
                        x[4] = 0.5 * Math.random(); // +-
                        y[4] = -0.5 * Math.random();
                        if (a.z) {
                            z[1] = -0.2 * Math.random();
                            z[2] = z[1] - 30 * Math.random();
                            z[3] = z[2] + 30 * Math.random();
                            z[4] = -0.2 * Math.random();
                        }
                    }
                    x[5] = 0.0;
                    y[5] = 0.0;
                    if (a.z) {
                        z[5] = 0.0;
                    }
                    // create values array
                    for (i = 0; i < a.n; i++) {
                        if (a.z) {
                            v.push({ x: x[i], y: y[i], z: z[i] });
                        }
                        else {
                            v.push({ x: x[i], y: y[i] });
                        }
                    }
                    bezier = { bezier: { autoRotate: true,
                            curviness: 2,
                            values: v,
                        } };
                    // shot<br>
                    // y-coords are webgl 
                    shot = {
                        timeline: { p: { paused: true, repeat: 0, tweens: [] },
                            actors: {
                                'csphere~position': [{ dur: a.d, p: bezier }]
                            }
                        } //tl
                    }; //shot
                    animation.perform(shot);
                }
                // camera change with NO Substate change !!! - for studio usage only!
                // translation on arbitrary axis - transform is relative and cumulative<br>
                // axis is Vector3 - will be normalized if not already
                translateAxisDistance(axis, d) {
                    axis.normalize();
                    csphere.translateOnAxis(axis, d);
                }
                // camera change with NO Substate change !!! - for studio usage only!
                // rotate the camerasphere csphere by ordered pitch, yaw, roll
                rotate(params) {
                    var pitch = params.pitch || 0.0;
                    var yaw = params.yaw || 0.0;
                    var roll = params.roll || 0.0;
                    matrixa.makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll));
                    csphere.applyMatrix(matrixa);
                }
                // camera change with NO Substate change !!! - for studio usage only!
                // rotation around arbitraray axis - transform is relative and cumulative<br>
                // axis is Vector3 - will be normalized if not already
                rotateAxisAngle(x, y, z, angle) {
                    var axis = new THREE.Vector3(x, y, z);
                    axis.normalize();
                    csphere.rotateOnAxis(axis, angle);
                }
                // camera change with NO Substate change !!! - for studio usage only!
                // relative rotation/scale 
                // * NOTE: params = {pitch:p, yaw:y, roll:r, zoom:scale}
                relRotateScale(params) {
                    //Object.keys(params).forEach(function(p){
                    //});
                    var pitch = params.pitch || 0.0;
                    var yaw = params.yaw || 0.0;
                    var roll = params.roll || 0.0;
                    var scale = params.zoom || 1.0;
                    // rotate-scale-translate (by x/y/z* scale)
                    matrixa.makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll));
                    matrixa.multiplyScalar(scale); // scale
                    //examine_matrix(matrixa);
                    // apply relative rotation-scale to csphere
                    csphere.applyMatrix(matrixa);
                    //examine_matrix(csphere.matrix);
                }
                // camera change with NO Substate change !!! - for studio usage only!
                // transform the camerasphere csphere by combination of translation,
                // rotation and zoom
                // * NOTE: params = { tx:x, ty:y, tz:z, pitch:p, yaw:y, roll:r, zoom:z}
                transform(params) {
                    var x = params.tx || 0.0;
                    var y = params.ty || 0.0;
                    var z = params.tz || 0.0;
                    var pitch = params.pitch || 0.0;
                    var yaw = params.yaw || 0.0;
                    var roll = params.roll || 0.0;
                    var scale = params.zoom || 1.0;
                    //Object.keys(params).forEach(function(p){
                    //  mediator.log(`params[${p}] = ${params[p]}`);
                    //});
                    // examine initial csphere matrix
                    //examine_matrix(csphere.matrix);
                    // absolute translation - matrixb
                    matrixb.makeTranslation(x, y, z);
                    //examine_matrix(matrixb);
                    // apply absolute translation to csphere
                    csphere.applyMatrix(matrixb);
                    //examine_matrix(csphere.matrix);
                    // rotate-scale-translate (by x/y/z* scale)
                    matrixa.makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll));
                    matrixa.multiplyScalar(scale); // scale
                    //examine_matrix(matrixa);
                    // apply relative rotation-scale to csphere
                    csphere.applyMatrix(matrixa);
                    examine_matrix(csphere.matrix);
                } //transform - no substate change!
            }
             //Camera3d
            // enforce singleton export
            if (c3d === undefined) {
                c3d = new Camera3d();
            }
            exports_28("c3d", c3d);
        }
    }
});
System.register("services/vrspace", ["services/mediator"], function(exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    var mediator_13;
    var vrspace, cube, Vrspace;
    return {
        setters:[
            function (mediator_13_1) {
                mediator_13 = mediator_13_1;
            }],
        execute: function() {
            class Vrspace {
                constructor() {
                    vrspace = this;
                }
                createSkyBox(size = 10000, _cube_urls) {
                    var cube_g, cube_m, cube_shader, cubeLoader, cube_urls = _cube_urls || [
                        './assets/images/skycube/sky/sky_posX.jpg',
                        './assets/images/skycube/sky/sky_negX.jpg',
                        './assets/images/skycube/sky/sky_posY.jpg',
                        './assets/images/skycube/sky/sky_negY.jpg',
                        './assets/images/skycube/sky/sky_posZ.jpg',
                        './assets/images/skycube/sky/sky_negZ.jpg'];
                    return new Promise((resolve, reject) => {
                        try {
                            cube_g = new THREE.BoxBufferGeometry(size, size, size, 1, 1, 1);
                            cubeLoader = new THREE.CubeTextureLoader();
                            cubeLoader.load(cube_urls, (t) => {
                                console.log(`t = ${t}`);
                                cube_shader = THREE.ShaderLib['cube'];
                                cube_shader.uniforms['tCube'].value = t;
                                cube_m = new THREE.ShaderMaterial({
                                    vertexShader: cube_shader.vertexShader,
                                    fragmentShader: cube_shader.fragmentShader,
                                    uniforms: cube_shader.uniforms,
                                    depthWrite: false,
                                    opacity: 1.0,
                                    fog: true,
                                    side: THREE.BackSide
                                });
                                cube_m.blending = THREE.CustomBlending;
                                cube_m.blendSrc = THREE.SrcAlphaFactor; // default
                                cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                                cube_m.blendEquation = THREE.AddEquation; // default
                                cube = new THREE.Mesh(cube_g, cube_m);
                                cube.renderOrder = 10; // larger rO is rendered first
                                // cube rendered 'behind' vr stage & actors
                                cube.visible = true;
                                console.log(`cube = ${cube}`);
                                console.dir(cube);
                                resolve(cube);
                            });
                        }
                        catch (e) {
                            mediator_13.mediator.loge(`error in vrspace.createCube: ${e.message}`);
                            reject(e);
                        }
                    }); //new Promise
                } //createSkyBox
                createCube(size = 10000) {
                    var cube_g, cube_m;
                    return new Promise((resolve, reject) => {
                        try {
                            cube_g = new THREE.BoxBufferGeometry(size, size, size, 1, 1, 1);
                            cube_m = new THREE.MeshBasicMaterial({
                                color: 0xaa77ff,
                                depthWrite: false,
                                opacity: 1.0,
                                fog: true,
                                side: THREE.BackSide
                            });
                            cube_m.blending = THREE.CustomBlending;
                            cube_m.blendSrc = THREE.SrcAlphaFactor; // default
                            cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                            cube_m.blendEquation = THREE.AddEquation; // default
                            cube = new THREE.Mesh(cube_g, cube_m);
                            cube.renderOrder = 10; // larger rO is rendered first
                            // cube rendered 'behind' vr stage & actors
                            cube.visible = true;
                            resolve(cube);
                        }
                        catch (e) {
                            mediator_13.mediator.loge(`error in vrspace.createCube: ${e.message}`);
                        }
                    }); //new Promise
                } //createCube
                createPolyhedra(radius = 5000) {
                    var group = new THREE.Group(), faces = [2, 1, 0, 0, 3, 2], face_m, 
                    //vertex = [[-1,-1,1], [-1,-1,-1], [1,-1,-1], [1,-1,1],
                    //                       [-1,1,1], [-1,1,-1], [1,1,-1], [1,1,1]],
                    //vertex = [[-1,-1,-1], [-1,1,-1], [1,1,-1], [1,-1,-1],
                    //                       [-1,-1,1], [-1,1,1], [1,1,1], [1,-1,1]],
                    //        shMat:THREE.ShaderMaterial = new THREE.ShaderMaterial({
                    //          vertexShader:
                    //          fragmentShader: 
                    //          uniforms: cube_shader.uniforms,
                    //          depthWrite: false,
                    //          opacity: 1.0,
                    //          fog:true,
                    //          side: THREE.BackSide
                    //        }),
                    meshBMat = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        //depthWrite: false,
                        opacity: 1.0,
                        //fog:true,
                        side: THREE.BackSide,
                        //side: THREE.DoubleSide,
                        visible: true
                    }), bottom_v = [], bottom_g, bottom, back_v = [], back_g, back, left_v = [], left_g, left, front_v = [], front_g, front, right_v = [], right_g, right, top_v = [], top_g, top;
                    // build quad-face vertices-arrays
                    bottom_v = [1, -1, -1, -1, -1, -1, -1, -1, 1, 1, -1, 1]; // me
                    //bottom_v = [1,-1,1,  -1,-1,-1,  -1,-1,1,  1,-1,1]; 
                    console.log(`bottom_v = ${bottom_v}`);
                    back_v = [-1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1];
                    console.log(`back_v = ${back_v}`);
                    left_v = [-1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1];
                    console.log(`left_v = ${left_v}`);
                    front_v = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1];
                    //front_v = [-1,-1,-1,  1,-1,-1,  1,1,-1,  -1,1,-1]; 
                    console.log(`front_v = ${front_v}`);
                    right_v = [1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1];
                    console.log(`right_v = ${right_v}`);
                    top_v = [-1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1];
                    console.log(`top_v = ${top_v}`);
                    console.log(`bottom_v.length = ${bottom_v.length}`);
                    console.log(`top_v.length = ${top_v.length}`);
                    console.log(`right_v.length = ${right_v.length}`);
                    console.log(`left_v.length = ${left_v.length}`);
                    console.log(`back_v.length = ${back_v.length}`);
                    console.log(`front_v.length = ${front_v.length}`);
                    // build PolyhedronGeometries
                    console.log(`radius = ${radius}`);
                    bottom_g = new THREE.PolyhedronGeometry(bottom_v, faces, radius, 1);
                    back_g = new THREE.PolyhedronGeometry(back_v, faces, radius, 1);
                    left_g = new THREE.PolyhedronGeometry(left_v, faces, radius, 1);
                    front_g = new THREE.PolyhedronGeometry(front_v, faces, radius, 1);
                    right_g = new THREE.PolyhedronGeometry(right_v, faces, radius, 1);
                    top_g = new THREE.PolyhedronGeometry(top_v, faces, radius, 1);
                    console.log(`bottom_g = ${bottom_g}`);
                    // set face material (for all faces)
                    //face_m =  _shMat ? shMat : meshBMat;
                    face_m = meshBMat;
                    // build quad-faces and add to cube object
                    // TEMP - use indexed face_m !!!!
                    bottom = new THREE.Mesh(bottom_g, face_m);
                    bottom.name = 'bottom';
                    bottom.visible = true;
                    group.add(bottom);
                    back = new THREE.Mesh(back_g, face_m);
                    back.name = 'back';
                    back.visible = true;
                    group.add(back);
                    left = new THREE.Mesh(left_g, face_m);
                    left.name = 'left';
                    left.visible = true;
                    group.add(left);
                    front = new THREE.Mesh(front_g, face_m);
                    front.name = 'front';
                    front.visible = true;
                    group.add(front);
                    right = new THREE.Mesh(right_g, face_m);
                    right.name = 'right';
                    right.visible = true;
                    group.add(right);
                    top = new THREE.Mesh(top_g, face_m);
                    top.name = 'top';
                    top.visible = true;
                    group.add(top);
                    return group;
                } //createPolyhedra
                createDome(radius = 5000) {
                    var dome_g, dome_m, dome;
                    try {
                        dome_g = new THREE.SphereBufferGeometry(radius, 16, 12);
                        dome_g.applyMatrix(new THREE.Matrix4().makeScale(1.0, 2.4, 1.0));
                        dome_m = new THREE.MeshBasicMaterial({
                            map: '',
                            depthWrite: false,
                            opacity: 1.0,
                            fog: true,
                            side: THREE.BackSide
                        });
                        dome_m.blending = THREE.CustomBlending;
                        dome_m.blendSrc = THREE.SrcAlphaFactor; // default
                        dome_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                        dome_m.blendEquation = THREE.AddEquation; // default
                        dome = new THREE.Mesh(dome_g, dome_m);
                        dome.renderOrder = 10; // larger rO is rendered first
                        // dome rendered 'behind' vr stage & actors
                        dome.visible = true;
                        return dome;
                    }
                    catch (e) {
                        mediator_13.mediator.loge(`error in vr_dome_init: ${e.message}`);
                    }
                }
            }
             //Vrspace
            // enforce singleton export
            if (vrspace === undefined) {
                vrspace = new Vrspace();
            }
            exports_29("vrspace", vrspace);
        }
    }
});
System.register("narrative", ["state/camera", "state/stage", "state/cloud", "state/space", "state/audio", "state/vrstage", "state/vrcloud", "state/action", "services/queue", "services/mediator", "services/animation", "services/camera3d", "services/vrspace", "models/space/quad_vsh/vsh_default.glsl", "models/space/quad_fsh/fsh_default.glsl"], function(exports_30, context_30) {
    "use strict";
    var __moduleName = context_30 && context_30.id;
    var camera_1, stage_1, cloud_1, space_1, audio_1, vrstage_1, vrcloud_1, action_1, queue_2, mediator_14, animation_1, camera3d_1, vrspace_1, vsh_default_glsl_3, fsh_default_glsl_5, fsh_default_glsl_6;
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
            function (queue_2_1) {
                queue_2 = queue_2_1;
            },
            function (mediator_14_1) {
                mediator_14 = mediator_14_1;
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
            function (vsh_default_glsl_3_1) {
                vsh_default_glsl_3 = vsh_default_glsl_3_1;
            },
            function (fsh_default_glsl_5_1) {
                fsh_default_glsl_5 = fsh_default_glsl_5_1;
                fsh_default_glsl_6 = fsh_default_glsl_5_1;
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
                if (a = queue_2.queue.peek()) {
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
                            narrative.exec(queue_2.queue.pop());
                        }
                        catch (e) {
                            mediator_14.mediator.loge(e);
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
                            mediator_14.mediator.loge(`narrative: import of testTarget caused error: ${e}`);
                            console.trace();
                        });
                    }
                    else {
                        narrative.initialize();
                    }
                } //bootstrap
                initialize() {
                    mediator_14.mediator.logc(`*** narrative.initialize()`);
                    mediator_14.mediator.log(`scene is ${config['_state']}`);
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
                        uniforms: fsh_default_glsl_6.uniforms,
                        vertexShader: vsh_default_glsl_3.vsh,
                        fragmentShader: fsh_default_glsl_5.fsh,
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
                        uniforms: fsh_default_glsl_6.uniforms,
                        vertexShader: vsh_default_glsl_3.vsh,
                        fragmentShader: fsh_default_glsl_5.fsh,
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
                        mediator_14.mediator.log(`csph_r = ${csph_r}`);
                        mediator_14.mediator.logc(`lens world pos = ${lens.getWorldPosition(vcopy).toArray()}`);
                        mediator_14.mediator.logc(`hud world pos = ${hud.getWorldPosition(vcopy).toArray()}`);
                        mediator_14.mediator.logc(`*** narrative initialized scenegraph phase`);
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
                        narrative['targets']['mediator'] = mediator_14.mediator;
                        narrative['targets']['camera3d'] = camera3d_1.c3d;
                        narrative['targets']['controls'] = controls;
                        narrative['targets']['animation'] = animation_1.animation;
                        mediator_14.mediator.log(`narrative.targets = ${Object.keys(this.targets)}`);
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
                    mediator_14.mediator.logc(`~~~foo: ${s}`);
                }
                // change component loading and animations according to absolute path, i.e
                // all present and transitional substate template:model pairs are represented
                // in the path argument.
                // Also, the path appears in address bar and is available from state service
                changeState(state) {
                    mediator_14.mediator.logc(`*** narrative.changeState()`);
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
                                mediator_14.mediator.loge(`changeState: camera.delta caused error: ${e}`);
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
                                mediator_14.mediator.loge(`changeState: stage.delta caused error: ${e}`);
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
                                mediator_14.mediator.loge(`changeState: cloud.delta caused error: ${e}`);
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
                                mediator_14.mediator.loge(`changeState: space.delta caused error: ${e}`);
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
                                mediator_14.mediator.loge(`changeState: audio.delta caused error: ${e}`);
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
                                    mediator_14.mediator.loge(`changeState: vrstage.delta caused error: ${e}`);
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
                                mediator_14.mediator.loge(`changeState: vrcloud.delta caused error: ${e}`);
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
                                mediator_14.mediator.loge(`changeState: action.delta caused error: ${e}`);
                                console.trace();
                                callback(e, null);
                            }
                        }
                    }, //first arg
                    function (err, o) {
                        if (err) {
                            mediator_14.mediator.loge("error: " + err);
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
                            mediator_14.mediator.log(`cube = ${cube}`);
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
                            mediator_14.mediator.log(`dome = ${dome}`);
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
                            mediator_14.mediator.log(`ambient_light = ${ambient_light}`);
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
                            mediator_14.mediator.log(`axes = ${axes}`);
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
                            mediator_14.mediator.log(`fog = ${fog}`);
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
                            mediator_14.mediator.log(`_cloud = ${_cloud}`);
                            if (o['cloud']['group']) {
                                spritegroup = o['cloud']['group'];
                                mediator_14.mediator.log(`cloud spritegroup = ${spritegroup}`);
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
                                mediator_14.mediator.log(`space returns shMat with fsh = ${o['space']['rm_shMat'].fragmentShader}`);
                                mediator_14.mediator.log(`quad.material = ${quad.material}`);
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
                                mediator_14.mediator.log(`vrstage: vr_ambient_light = ${vr_ambient_light}`);
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
                                mediator_14.mediator.log(`vrstage: vr_axes = ${vr_axes}`);
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
                                mediator_14.mediator.log(`vrstage: vr_fog = ${vr_fog}`);
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
                                mediator_14.mediator.log(`_vrcloud = ${_vrcloud}`);
                                if (o['vrcloud']['group']) {
                                    vr_spritegroup = o['vrcloud']['group'];
                                    console.log(`%%%%%%%%%%%%%%%%% vrcloud vr_spritegroup = ${vr_spritegroup}`);
                                    console.dir(vr_spritegroup);
                                    mediator_14.mediator.log(`vrcloud vr_spritegroup = ${vr_spritegroup}`);
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
                                mediator_14.mediator.log(`_a['_deltaTime'] = ${_a['_deltaTime']}`);
                                if ((_a['_deltaTime'] !== undefined) && _a['_deltaTime'] === false) {
                                    _deltaTime = false;
                                }
                                else {
                                    _deltaTime = _a['_deltaTime'] || _deltaTime;
                                }
                                mediator_14.mediator.log(`_action= ${_action}`);
                                mediator_14.mediator.log(`actions.length = ${actions.length}`);
                                mediator_14.mediator.logc(`_deltaTime= ${_deltaTime}`);
                                if (actions.length > 0) {
                                    if (_action === undefined) {
                                        console.log(`_action undef => append actions = ${actions}`);
                                        for (let a of actions) {
                                            queue_2.queue.fifo.push(a); // undefined => append each action
                                        }
                                    }
                                    else {
                                        if (_action) {
                                            queue_2.queue.load(actions); // true => replace
                                        }
                                        else {
                                            queue_2.queue.load([]); // f => empty
                                        }
                                    }
                                }
                                mediator_14.mediator.log(`queue.fifo.length = ${queue_2.queue.fifo.length}`);
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
                        mediator_14.mediator.log(`addActor: before add sc.ch.l = ${scene.children.length}`);
                        o['name'] = name;
                        if (addToScene) {
                            console.log(`!!!!!!!!!!!!!!!****************** added actor ${name}`);
                            scene.add(o);
                        }
                        narrative.actors[name] = o;
                        mediator_14.mediator.log(`addActor: added o.name = ${o.name}`);
                        mediator_14.mediator.log(`addActor: after add narrative.actors[${name}] = ${narrative.actors[name]} `);
                        mediator_14.mediator.log(`addActor: after add sc.ch.l = ${scene.children.length}`);
                    }
                }
                removeActor(name) {
                    if (narrative.actors[name]) {
                        mediator_14.mediator.log(`rmActor: before delete sc.ch.l = ${scene.children.length}`);
                        mediator_14.mediator.log(`rmActor: removing narrative.actors[${name}] = ${narrative.actors[name]}`);
                        scene.remove(narrative.actors[name]);
                        delete narrative.actors[name];
                        //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! removed actor ${name}`);
                        mediator_14.mediator.log(`rmActor: after delete narrative.actors[${name}] = ${narrative.actors[name]} `);
                        mediator_14.mediator.log(`rmActor: after delete sc.ch.l = ${scene.children.length}`);
                    }
                }
                // report state of actors in scene
                reportActorsInScene() {
                    var actors = [];
                    mediator_14.mediator.log(`reportActors: sc.ch.l = ${scene.children.length}`);
                    for (let o of scene.children) {
                        mediator_14.mediator.log(`reportActors: scene contains child ${o.name}`);
                        mediator_14.mediator.log(`reportActors: narrative.actors[${o.name}] is ${narrative.actors[o.name]}`);
                        if (o !== narrative.actors[o.name]) {
                            mediator_14.mediator.log(`reportActors: there is name ambiguity!!: scene child ${o.name} is not actor ${o.name}`);
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
                        mediator_14.mediator.log(`addvrActor: before add vr_sc.ch.l = ${vr_scene.children.length}`);
                        o['name'] = name;
                        if (addToScene) {
                            console.log(`!!!!!!!!!!!!!!********** added vractor ${name}`);
                            vr_scene.add(o);
                        }
                        narrative.vractors[name] = o;
                        mediator_14.mediator.log(`addvrActor: added o.name = ${o.name}`);
                        mediator_14.mediator.log(`addvrActor: after add narrative.vractors[${name}] = ${narrative.vractors[name]} `);
                        mediator_14.mediator.log(`addvrActor: after add vr_sc.ch.l = ${vr_scene.children.length}`);
                    }
                }
                removevrActor(name) {
                    if (narrative.vractors[name]) {
                        mediator_14.mediator.log(`rmvrActor: before delete vr_sc.ch.l = ${vr_scene.children.length}`);
                        mediator_14.mediator.log(`rmvrActor: removing narrative.vractors[${name}] = ${narrative.vractors[name]}`);
                        vr_scene.remove(narrative.vractors[name]);
                        delete narrative.vractors[name];
                        //console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! removed vractor ${name}`);
                        mediator_14.mediator.log(`rmvrActor: after delete narrative.vractors[${name}] = ${narrative.vractors[name]} `);
                        mediator_14.mediator.log(`rmvrActor: after delete vr_sc.ch.l = ${vr_scene.children.length}`);
                    }
                }
                // report state of vractors in vr_scene
                reportvrActorsInvrScene() {
                    var actors = [];
                    mediator_14.mediator.log(`reportvrActors: vr_sc.ch.l = ${vr_scene.children.length}`);
                    for (let o of vr_scene.children) {
                        mediator_14.mediator.log(`reportvrActors: vr_scene contains child ${o.name}`);
                        mediator_14.mediator.log(`reportvrActors: narrative.vractors[${o.name}] is ${narrative.vractors[o.name]}`);
                        if (o !== narrative.vractors[o.name]) {
                            mediator_14.mediator.log(`reportvrActors: there is name ambiguity!!: vr_scene child ${o.name} is not vractor ${o.name}`);
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
                            mediator_14.mediator.log(`nar.exec invoking action ${action['f']}`);
                            f(arg);
                            if (config['record_actions']) {
                                mediator_14.mediator.record(action);
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
                        mediator_14.mediator.log(`action['id'] = ${action['id']}`);
                        target = narrative.actors[action['id']]; // target object for function f
                        if (!target) {
                            throw new Error(`narrative.actors[${action['id']}] is not defined!`);
                        }
                    }
                    else {
                        mediator_14.mediator.log(`action['t'] = ${action['t']}`);
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
            exports_30("narrative", narrative);
        }
    }
});
/*
 * Leap Eye Look Controls
 * Author: @Nashira
 *
 * http://github.com/leapmotion/Leap-Three-Camera-Controls/
 *
 * Copyright 2014 LeapMotion, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
System.register("models/camera/controls/controls-onehand", [], function(exports_31, context_31) {
    "use strict";
    var __moduleName = context_31 && context_31.id;
    var LowPassFilter, PI_2, X_AXIS, Y_AXIS, Z_AXIS, controls, object, anchorDelta, invert, translationSpeed, rotationSpeed, transSmoothing, rotationSmoothing, translationDecay, scaleDecay, rotationSlerp, pinchThreshold, vector, quaternion, rotationMomentum, translationMomentum, scaleMomentum, transLP, rotLP, LeapTwoHandControls;
    return {
        setters:[],
        execute: function() {
            // modified by Rudolph - singleton class instance with closure vars
            // and initialization function
            // aux class
            class LowPassFilter {
                constructor(_cutoff) {
                    this.accumulator = 0;
                    this.cutoff = _cutoff;
                }
                ;
                sample(_sample) {
                    this.accumulator += (_sample - this.accumulator) * this.cutoff;
                    return this.accumulator;
                }
            }
            ;
            // constants  
            PI_2 = Math.PI * 2, X_AXIS = new THREE.Vector3(1, 0, 0), Y_AXIS = new THREE.Vector3(0, 1, 0), Z_AXIS = new THREE.Vector3(0, 0, 1);
            // singleton instance controls and closure vars
            anchorDelta = 1, invert = true, 
            // rudolph: speed is also range of movement
            // rudolph: decreased smooting coef. ESSENTIAL
            translationSpeed = .01, rotationSpeed = 1.0, transSmoothing = 0.000025, rotationSmoothing = 0.001, translationDecay = 0.3, scaleDecay = 0.5, rotationSlerp = 0.8, pinchThreshold = 0.5, vector = new THREE.Vector3(), quaternion = new THREE.Quaternion(), rotationMomentum = new THREE.Quaternion(), translationMomentum = new THREE.Vector3(), scaleMomentum = new THREE.Vector3(1, 1, 1), transLP = [
                new LowPassFilter(transSmoothing),
                new LowPassFilter(transSmoothing),
                new LowPassFilter(transSmoothing)], rotLP = [
                new LowPassFilter(rotationSmoothing),
                new LowPassFilter(rotationSmoothing),
                new LowPassFilter(rotationSmoothing)];
            class LeapTwoHandControls {
                constructor() {
                    controls = this;
                    controls.controller = new Leap.Controller();
                }
                initialize(csph, options = {}) {
                    object = csph;
                    rotationMomentum = object.quaternion.clone(),
                        // rudolph: speed is also range of movement
                        // rudolph: decreased smooting coef. ESSENTIAL
                        invert = (options['invert'] === undefined ? true : options['invert']);
                    translationSpeed = options['translationSpeed'] || translationSpeed;
                    rotationSpeed = options['rotationSpeed'] || rotationSpeed;
                    transSmoothing = options['transSmoothing'] || transSmoothing;
                    rotationSmoothing = options['rotationSmoothing'] || rotationSmoothing;
                    translationDecay = options['translationDecay'] || translationDecay;
                    scaleDecay = options['scaleDecay'] || scaleDecay;
                    rotationSlerp = options['rotationSlerp'] || rotationSlerp;
                    pinchThreshold = options['pinchThreshold'] || pinchThreshold;
                }
                report() {
                    return { tspeed: translationSpeed,
                        rspeed: rotationSpeed,
                        tsmooth: transSmoothing,
                        rsmooth: rotationSmoothing,
                        tdecay: translationDecay,
                        scaledecay: scaleDecay,
                        rslerp: rotationSlerp,
                        pinchthresh: pinchThreshold
                    };
                }
                update() {
                    var frame = controls.controller.frame();
                    var anchorFrame = controls.controller.frame(anchorDelta);
                    // do we have a frame
                    if (!frame || !frame.valid || !anchorFrame || !anchorFrame.valid) {
                        return;
                    }
                    // match hands to anchors
                    // remove hands that have disappeared
                    // add hands that have appeared
                    var rawHands = frame.hands;
                    var hands = [];
                    var anchorHands = [];
                    rawHands.forEach(function (hand, hIdx) {
                        var anchorHand = anchorFrame.hand(hand.id);
                        if (anchorHand.valid) {
                            hands.push(hand);
                            anchorHands.push(anchorHand);
                        }
                    });
                    if (hands.length) {
                        // translation
                        if (controls.shouldTranslate(anchorHands, hands)) {
                            controls.applyTranslation(anchorHands, hands);
                        }
                        // rotation
                        //      if (controls.shouldRotate(anchorHands, hands)) {
                        //        controls.applyRotation(anchorHands, hands);
                        //      }
                        // scale
                        if (controls.shouldScale(anchorHands, hands)) {
                            controls.applyScale(anchorHands, hands);
                        }
                    }
                    object.position.add(translationMomentum);
                    translationMomentum.multiplyScalar(translationDecay);
                    //    object.quaternion.slerp(rotationMomentum, rotationSlerp);
                    //    object.quaternion.normalize();
                    object.scale.lerp(scaleMomentum, scaleDecay);
                }
                shouldTranslate(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return hands.some(isEngaged);
                }
                shouldScale(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return anchorHands.every(isEngaged) && hands.every(isEngaged);
                }
                shouldRotate(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return anchorHands.length > 1
                        && hands.length > 1
                        && anchorHands.every(isEngaged)
                        && hands.every(isEngaged);
                }
                applyTranslation(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    var translation = controls.getTranslation(anchorHands.filter(isEngaged), hands.filter(isEngaged));
                    translation[0] = transLP[0].sample(translation[0]);
                    translation[1] = 0.5 * transLP[1].sample(translation[1]);
                    translation[2] = transLP[2].sample(translation[2]);
                    vector.fromArray(translation);
                    if (invert) {
                        vector.negate();
                    }
                    vector.multiplyScalar(translationSpeed);
                    vector.applyQuaternion(object.quaternion);
                    translationMomentum.add(vector);
                }
                applyRotation(anchorHands, hands) {
                    var rotation = controls.getRotation(anchorHands, hands);
                    rotation[0] = rotLP[0].sample(rotation[0]);
                    rotation[1] = rotLP[1].sample(rotation[1]);
                    //rotation[2] = rotLP[2].sample(rotation[2]);
                    vector.fromArray(rotation);
                    vector.multiplyScalar(rotationSpeed);
                    if (invert) {
                        vector.negate();
                    }
                    quaternion.setFromAxisAngle(X_AXIS, vector.x);
                    rotationMomentum.multiply(quaternion);
                    quaternion.setFromAxisAngle(Y_AXIS, vector.y);
                    rotationMomentum.multiply(quaternion);
                    quaternion.setFromAxisAngle(Z_AXIS, vector.z);
                    //rotationMomentum.multiply(quaternion);
                    rotationMomentum.normalize();
                }
                applyScale(anchorHands, hands) {
                    var scale = controls.getScale(anchorHands, hands);
                    scaleMomentum.multiplyScalar(scale[3]);
                }
                getTranslation(anchorHands, hands) {
                    if (anchorHands.length !== hands.length) {
                        return [0, 0, 0];
                    }
                    var centerAnchor = controls.getCenter(anchorHands);
                    var centerCurrent = controls.getCenter(hands);
                    return [
                        centerCurrent[0] - centerAnchor[0],
                        centerCurrent[1] - centerAnchor[1],
                        centerCurrent[2] - centerAnchor[2]
                    ];
                }
                getScale(anchorHands, hands) {
                    if (hands.length < 2 || anchorHands.length < 2) {
                        return [1, 1, 1, 1];
                    }
                    var centerAnchor = controls.getCenter(anchorHands);
                    var centerCurrent = controls.getCenter(hands);
                    var aveRadiusAnchor = controls.aveDistance(centerAnchor, anchorHands);
                    var aveRadiusCurrent = controls.aveDistance(centerCurrent, hands);
                    // scale of current over previous
                    return [
                        aveRadiusCurrent[0] / aveRadiusAnchor[0],
                        aveRadiusCurrent[1] / aveRadiusAnchor[1],
                        aveRadiusCurrent[2] / aveRadiusAnchor[2],
                        controls.length(aveRadiusCurrent) / controls.length(aveRadiusAnchor)
                    ];
                }
                getRotation(anchorHands, hands) {
                    if (hands.length < 1 || anchorHands.length < 1
                        || hands.length !== anchorHands.length) {
                        return [0, 0, 0];
                    }
                    var am = controls.getAxisMag(hands);
                    if (am[3] < 6000) {
                        return [0, 0, 0];
                    }
                    var mi = 1 / am[3];
                    am[0] *= mi;
                    am[1] *= mi;
                    am[2] *= mi;
                    var anchorAngles = controls.getAngles(anchorHands);
                    var angles = controls.getAngles(hands);
                    var dx = angles[0] - anchorAngles[0];
                    var dy = angles[1] - anchorAngles[1];
                    var dz = angles[2] - anchorAngles[2];
                    //@@@@@
                    dz = 0;
                    if (dx > Math.PI) {
                        dx = dx - PI_2;
                    }
                    else {
                        if (dx < -Math.PI) {
                            dx = dx + PI_2;
                        }
                    }
                    if (dy > Math.PI) {
                        dy = dy - PI_2;
                    }
                    else {
                        if (dy < -Math.PI) {
                            dy = dy + PI_2;
                        }
                    }
                    if (dz > Math.PI) {
                        dz = dz - PI_2;
                    }
                    else {
                        if (dz < -Math.PI) {
                            dz = dz + PI_2;
                        }
                    }
                    return [dx * am[0], dy * am[1], dz * am[2]];
                }
                isEngaged(h) {
                    return h && (h.pinchStrength > pinchThreshold);
                }
                getCenter(hands) {
                    var l = hands.length;
                    if (l === 0) {
                        return [0, 0, 0];
                    }
                    else if (l === 1) {
                        return hands[0].palmPosition;
                    }
                    var x = 0, y = 0, z = 0;
                    hands.forEach(function (hand, i) {
                        x += hand.palmPosition[0];
                        y += hand.palmPosition[1];
                        z += hand.palmPosition[2];
                    });
                    return [x / l, y / l, z / l];
                }
                getAngles(hands) {
                    if (hands.length === 0) {
                        return [0, 0, 0];
                    }
                    var pos1;
                    var hand = hands[0];
                    if (hands.length > 1) {
                        pos1 = hands[1].palmPosition;
                    }
                    else {
                        pos1 = hand.frame.interactionBox.center;
                    }
                    var pos2 = hand.palmPosition;
                    var dx = pos2[0] - pos1[0];
                    var dy = pos2[1] - pos1[1];
                    var dz = pos2[2] - pos1[2];
                    var ax = Math.atan2(dy, dz);
                    var ay = Math.atan2(dx, dz);
                    var az = Math.atan2(dy, dx);
                    return [ax, ay, az];
                }
                getAxisMag(hands) {
                    if (hands.length === 0) {
                        return [0, 0, 0, 0];
                    }
                    var pos1;
                    var hand = hands[0];
                    if (hands.length > 1) {
                        pos1 = hands[1].palmPosition;
                    }
                    else {
                        pos1 = hand.frame.interactionBox.center;
                    }
                    var pos2 = hand.palmPosition;
                    var dx = pos2[0] - pos1[0];
                    var dy = pos2[1] - pos1[1];
                    var dz = pos2[2] - pos1[2];
                    var mag = dx * dx + dy * dy + dz * dz;
                    var ax = dy * dy + dz * dz;
                    var ay = dx * dx + dz * dz;
                    var az = dy * dy + dx * dx;
                    return [ax, ay, az, mag];
                }
                aveDistance(center, hands) {
                    var aveDistance = [0, 0, 0];
                    hands.forEach(function (hand) {
                        var p = hand.palmPosition;
                        aveDistance[0] += Math.abs(p[0] - center[0]);
                        aveDistance[1] += Math.abs(p[1] - center[1]);
                        aveDistance[2] += Math.abs(p[2] - center[2]);
                    });
                    aveDistance[0] /= hands.length;
                    aveDistance[1] /= hands.length;
                    aveDistance[2] /= hands.length;
                    return aveDistance;
                }
                length(arr) {
                    var sum = 0;
                    arr.forEach(function (v) {
                        sum += v * v;
                    });
                    return Math.sqrt(sum);
                }
                dist(arr1, arr2) {
                    var sum = 0;
                    arr1.forEach(function (v, i) {
                        var d = v - arr2[i];
                        sum += d * d;
                    });
                    return Math.sqrt(sum);
                }
            }
             //class LeapTwoHandControls  
            // enforce singleton export
            if (!controls) {
                controls = new LeapTwoHandControls();
            }
            exports_31("controls", controls);
        }
    }
});
/*
 * Leap Eye Look Controls
 * Author: @Nashira
 *
 * http://github.com/leapmotion/Leap-Three-Camera-Controls/
 *
 * Copyright 2014 LeapMotion, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
System.register("models/camera/controls/controls-twohands", [], function(exports_32, context_32) {
    "use strict";
    var __moduleName = context_32 && context_32.id;
    var LowPassFilter, PI_2, X_AXIS, Y_AXIS, Z_AXIS, controls, object, anchorDelta, invert, translationSpeed, translationDecay, scaleDecay, rotationSlerp, rotationSpeed, pinchThreshold, transSmoothing, rotationSmoothing, vector, quaternion, rotationMomentum, translationMomentum, scaleMomentum, transLP, rotLP, LeapTwoHandControls;
    return {
        setters:[],
        execute: function() {
            // modified by Rudolph - singleton class instance with closure vars
            // and initialization function
            // aux class
            class LowPassFilter {
                constructor(_cutoff) {
                    this.accumulator = 0;
                    this.cutoff = _cutoff;
                }
                ;
                sample(_sample) {
                    this.accumulator += (_sample - this.accumulator) * this.cutoff;
                    return this.accumulator;
                }
            }
            ;
            //    LowPassFilter = (cutoff) => {   // ctor
            //      var accumulator = 0;
            //  
            //      var setCutoff = (value) => {
            //        cutoff = value;
            //      };
            //  
            //      var sample = (sample) => {
            //        accumulator += (sample - accumulator) * cutoff;
            //        return accumulator;
            //      };
            //    },
            // constants  
            PI_2 = Math.PI * 2, X_AXIS = new THREE.Vector3(1, 0, 0), Y_AXIS = new THREE.Vector3(0, 1, 0), Z_AXIS = new THREE.Vector3(0, 0, 1);
            // singleton instance controls and closure vars
            anchorDelta = 1, invert = true, 
            // rudolph: speed is also range of movement
            // rudolph: decreased smooting coef. ESSENTIAL
            translationSpeed = 10, translationDecay = 0.3, scaleDecay = 0.5, rotationSlerp = 0.8, rotationSpeed = 1.0, pinchThreshold = 0.5, transSmoothing = 0.0025, rotationSmoothing = 0.001, vector = new THREE.Vector3(), quaternion = new THREE.Quaternion(), rotationMomentum = new THREE.Quaternion(), translationMomentum = new THREE.Vector3(), scaleMomentum = new THREE.Vector3(1, 1, 1), transLP = [
                new LowPassFilter(transSmoothing),
                new LowPassFilter(transSmoothing),
                new LowPassFilter(transSmoothing)], rotLP = [
                new LowPassFilter(rotationSmoothing),
                new LowPassFilter(rotationSmoothing),
                new LowPassFilter(rotationSmoothing)];
            class LeapTwoHandControls {
                constructor() {
                    controls = this;
                    controls.controller = new Leap.Controller();
                }
                initialize(csph, options = {}) {
                    object = csph;
                    rotationMomentum = object.quaternion.clone(),
                        // rudolph: speed is also range of movement
                        // rudolph: decreased smooting coef. ESSENTIAL
                        invert = (options['invert'] === undefined ? true : options['invert']);
                    translationSpeed = options['translationSpeed'] || translationSpeed;
                    rotationSpeed = options['rotationSpeed'] || rotationSpeed;
                    transSmoothing = options['transSmoothing'] || transSmoothing;
                    rotationSmoothing = options['rotationSmoothing'] || rotationSmoothing;
                    translationDecay = options['translationDecay'] || translationDecay;
                    scaleDecay = options['scaleDecay'] || scaleDecay;
                    rotationSlerp = options['rotationSlerp'] || rotationSlerp;
                    pinchThreshold = options['pinchThreshold'] || pinchThreshold;
                }
                report() {
                    return { tspeed: translationSpeed,
                        rspeed: rotationSpeed,
                        tsmooth: transSmoothing,
                        rsmooth: rotationSmoothing,
                        tdecay: translationDecay,
                        scaledecay: scaleDecay,
                        rslerp: rotationSlerp,
                        pinchthresh: pinchThreshold
                    };
                }
                update() {
                    var frame = controls.controller.frame();
                    var anchorFrame = controls.controller.frame(anchorDelta);
                    // do we have a frame
                    if (!frame || !frame.valid || !anchorFrame || !anchorFrame.valid) {
                        return;
                    }
                    // match hands to anchors
                    // remove hands that have disappeared
                    // add hands that have appeared
                    var rawHands = frame.hands;
                    var hands = [];
                    var anchorHands = [];
                    rawHands.forEach(function (hand, hIdx) {
                        var anchorHand = anchorFrame.hand(hand.id);
                        if (anchorHand.valid) {
                            hands.push(hand);
                            anchorHands.push(anchorHand);
                        }
                    });
                    if (hands.length) {
                        // translation
                        if (controls.shouldTranslate(anchorHands, hands)) {
                            controls.applyTranslation(anchorHands, hands);
                        }
                        // rotation
                        if (controls.shouldRotate(anchorHands, hands)) {
                            controls.applyRotation(anchorHands, hands);
                        }
                        // scale
                        if (controls.shouldScale(anchorHands, hands)) {
                            controls.applyScale(anchorHands, hands);
                        }
                    }
                    object.position.add(translationMomentum);
                    translationMomentum.multiplyScalar(translationDecay);
                    object.quaternion.slerp(rotationMomentum, rotationSlerp);
                    object.quaternion.normalize();
                    object.scale.lerp(scaleMomentum, scaleDecay);
                }
                shouldTranslate(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return hands.some(isEngaged);
                }
                shouldScale(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return anchorHands.every(isEngaged) && hands.every(isEngaged);
                }
                shouldRotate(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return anchorHands.length > 1
                        && hands.length > 1
                        && anchorHands.every(isEngaged)
                        && hands.every(isEngaged);
                }
                applyTranslation(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    var translation = controls.getTranslation(anchorHands.filter(isEngaged), hands.filter(isEngaged));
                    translation[0] = -1.0 * transLP[0].sample(translation[0]);
                    translation[1] = 0.5 * transLP[1].sample(translation[1]);
                    translation[2] = -1.0 * transLP[2].sample(translation[2]);
                    vector.fromArray(translation);
                    if (invert) {
                        vector.negate();
                    }
                    vector.multiplyScalar(translationSpeed);
                    vector.applyQuaternion(object.quaternion);
                    translationMomentum.add(vector);
                }
                applyRotation(anchorHands, hands) {
                    var rotation = controls.getRotation(anchorHands, hands);
                    rotation[0] = rotLP[0].sample(rotation[0]);
                    rotation[1] = rotLP[1].sample(rotation[1]);
                    rotation[2] = rotLP[2].sample(rotation[2]);
                    vector.fromArray(rotation);
                    vector.multiplyScalar(rotationSpeed);
                    if (invert) {
                        vector.negate();
                    }
                    quaternion.setFromAxisAngle(X_AXIS, vector.x);
                    rotationMomentum.multiply(quaternion);
                    quaternion.setFromAxisAngle(Y_AXIS, vector.y);
                    rotationMomentum.multiply(quaternion);
                    quaternion.setFromAxisAngle(Z_AXIS, vector.z);
                    rotationMomentum.multiply(quaternion);
                    rotationMomentum.normalize();
                }
                applyScale(anchorHands, hands) {
                    var scale = controls.getScale(anchorHands, hands);
                    scaleMomentum.multiplyScalar(scale[3]);
                }
                getTranslation(anchorHands, hands) {
                    if (anchorHands.length !== hands.length) {
                        return [0, 0, 0];
                    }
                    var centerAnchor = controls.getCenter(anchorHands);
                    var centerCurrent = controls.getCenter(hands);
                    return [
                        centerCurrent[0] - centerAnchor[0],
                        centerCurrent[1] - centerAnchor[1],
                        centerCurrent[2] - centerAnchor[2]
                    ];
                }
                getScale(anchorHands, hands) {
                    if (hands.length < 2 || anchorHands.length < 2) {
                        return [1, 1, 1, 1];
                    }
                    var centerAnchor = controls.getCenter(anchorHands);
                    var centerCurrent = controls.getCenter(hands);
                    var aveRadiusAnchor = controls.aveDistance(centerAnchor, anchorHands);
                    var aveRadiusCurrent = controls.aveDistance(centerCurrent, hands);
                    // scale of current over previous
                    return [
                        aveRadiusCurrent[0] / aveRadiusAnchor[0],
                        aveRadiusCurrent[1] / aveRadiusAnchor[1],
                        aveRadiusCurrent[2] / aveRadiusAnchor[2],
                        controls.length(aveRadiusCurrent) / controls.length(aveRadiusAnchor)
                    ];
                }
                getRotation(anchorHands, hands) {
                    if (hands.length < 1 || anchorHands.length < 1
                        || hands.length !== anchorHands.length) {
                        return [0, 0, 0];
                    }
                    var am = controls.getAxisMag(hands);
                    if (am[3] < 6000) {
                        return [0, 0, 0];
                    }
                    var mi = 1 / am[3];
                    am[0] *= mi;
                    am[1] *= mi;
                    am[2] *= mi;
                    var anchorAngles = controls.getAngles(anchorHands);
                    var angles = controls.getAngles(hands);
                    var dx = angles[0] - anchorAngles[0];
                    var dy = angles[1] - anchorAngles[1];
                    var dz = angles[2] - anchorAngles[2];
                    if (dx > Math.PI) {
                        dx = dx - PI_2;
                    }
                    else {
                        if (dx < -Math.PI) {
                            dx = dx + PI_2;
                        }
                    }
                    if (dy > Math.PI) {
                        dy = dy - PI_2;
                    }
                    else {
                        if (dy < -Math.PI) {
                            dy = dy + PI_2;
                        }
                    }
                    if (dz > Math.PI) {
                        dz = dz - PI_2;
                    }
                    else {
                        if (dz < -Math.PI) {
                            dz = dz + PI_2;
                        }
                    }
                    return [dx * am[0], dy * am[1], dz * am[2]];
                }
                isEngaged(h) {
                    return h && (h.pinchStrength > pinchThreshold);
                }
                getCenter(hands) {
                    var l = hands.length;
                    if (l === 0) {
                        return [0, 0, 0];
                    }
                    else if (l === 1) {
                        return hands[0].palmPosition;
                    }
                    var x = 0, y = 0, z = 0;
                    hands.forEach(function (hand, i) {
                        x += hand.palmPosition[0];
                        y += hand.palmPosition[1];
                        z += hand.palmPosition[2];
                    });
                    return [x / l, y / l, z / l];
                }
                getAngles(hands) {
                    if (hands.length === 0) {
                        return [0, 0, 0];
                    }
                    var pos1;
                    var hand = hands[0];
                    if (hands.length > 1) {
                        pos1 = hands[1].palmPosition;
                    }
                    else {
                        pos1 = hand.frame.interactionBox.center;
                    }
                    var pos2 = hand.palmPosition;
                    var dx = pos2[0] - pos1[0];
                    var dy = pos2[1] - pos1[1];
                    var dz = pos2[2] - pos1[2];
                    var ax = Math.atan2(dy, dz);
                    var ay = Math.atan2(dx, dz);
                    var az = Math.atan2(dy, dx);
                    return [ax, ay, az];
                }
                getAxisMag(hands) {
                    if (hands.length === 0) {
                        return [0, 0, 0, 0];
                    }
                    var pos1;
                    var hand = hands[0];
                    if (hands.length > 1) {
                        pos1 = hands[1].palmPosition;
                    }
                    else {
                        pos1 = hand.frame.interactionBox.center;
                    }
                    var pos2 = hand.palmPosition;
                    var dx = pos2[0] - pos1[0];
                    var dy = pos2[1] - pos1[1];
                    var dz = pos2[2] - pos1[2];
                    var mag = dx * dx + dy * dy + dz * dz;
                    var ax = dy * dy + dz * dz;
                    var ay = dx * dx + dz * dz;
                    var az = dy * dy + dx * dx;
                    return [ax, ay, az, mag];
                }
                aveDistance(center, hands) {
                    var aveDistance = [0, 0, 0];
                    hands.forEach(function (hand) {
                        var p = hand.palmPosition;
                        aveDistance[0] += Math.abs(p[0] - center[0]);
                        aveDistance[1] += Math.abs(p[1] - center[1]);
                        aveDistance[2] += Math.abs(p[2] - center[2]);
                    });
                    aveDistance[0] /= hands.length;
                    aveDistance[1] /= hands.length;
                    aveDistance[2] /= hands.length;
                    return aveDistance;
                }
                length(arr) {
                    var sum = 0;
                    arr.forEach(function (v) {
                        sum += v * v;
                    });
                    return Math.sqrt(sum);
                }
                dist(arr1, arr2) {
                    var sum = 0;
                    arr1.forEach(function (v, i) {
                        var d = v - arr2[i];
                        sum += d * d;
                    });
                    return Math.sqrt(sum);
                }
            }
             //class LeapTwoHandControls  
            // enforce singleton export
            if (!controls) {
                controls = new LeapTwoHandControls();
            }
            exports_32("controls", controls);
        }
    }
});
System.register("models/camera/hud_fsh/fsh_post.glsl", [], function(exports_33, context_33) {
    "use strict";
    var __moduleName = context_33 && context_33.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            exports_33("uniforms", uniforms = {
                tDiffuse: { type: 't', value: null }
            });
            exports_33("fsh", fsh = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D tDiffuse; 
  varying vec2 vuv;

  void main() {
    // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
    vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

    // paint
    gl_FragColor = texture2D(tDiffuse, vuv); 
    //gl_FragColor += vec4(1.0, 0.0, 0.0, 0.5);
    gl_FragColor.r *= 0.5;
    //gl_FragColor.g *= 0.5;
    //gl_FragColor.b *= 0.5;
    //gl_FragColor.a = 0.5;
  }
`);
        }
    }
});
System.register("models/camera/keymaps/dome2-alt-cut", ["services/mediator"], function(exports_34, context_34) {
    "use strict";
    var __moduleName = context_34 && context_34.id;
    var mediator_15;
    var map, c3d, csphere, camera, record_shots, a, Keymap;
    return {
        setters:[
            function (mediator_15_1) {
                mediator_15 = mediator_15_1;
            }],
        execute: function() {
            // singleton instance and param object
            class Keymap {
                constructor() {
                    map = this;
                }
                initialize(_c3d, _csphere, _camera, _record_shots) {
                    c3d = _c3d;
                    csphere = _csphere;
                    camera = _camera;
                    record_shots = _record_shots;
                }
                keys(e) {
                    mediator_15.mediator.log(`keyup: key = ${e.keyCode}`);
                    switch (e.keyCode) {
                        // CENTER/HOME - normalize camera and csphere<br>
                        // m - center
                        case 77:
                            a = { d: 3 };
                            if (e.shiftKey) {
                                c3d.home(a);
                                //log({t:'camera3d', f:'home', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'home', a: a });
                                }
                            }
                            else {
                                c3d.center(a);
                                //log({t:'camera3d', f:'center', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'center', a: a });
                                }
                            }
                            break;
                        // ZOOM<br>
                        // a - zoom in          
                        case 65:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 60 }; // 90/120
                                    c3d.zoomcutTo(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9 };
                                    c3d.zoomcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { s: 60, d: 5 };
                                    c3d.zoomflyTo(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9, d: 5 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // s - zoom out          
                        case 83:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 120 };
                                    c3d.zoomcutTo(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.111 };
                                    c3d.zoomcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { s: 120, d: 5 };
                                    c3d.zoomflyTo(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.111, d: 5 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // ROLL<br>
                        // b - roll neg => ccw         
                        case 66:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.rollcutTo(a);
                                    //log({t:'camera3d', f:'rollcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'rollcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    c3d.rollflyTo(a);
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // n - roll pos => cw         
                        case 78:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                    c3d.rollcutTo(a);
                                }
                                else {
                                    a = { r: 0.3927 };
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.rollflyTo(a);
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // PAN/TILT<br>
                        // left arrow - pan (look) left          
                        case 37:
                            console.log(`\n[[[[[ left arrow - 37`);
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // right arrow - pan (look) right          
                        case 39:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // up arrow - tilt (look) up          
                        case 38:
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // down arrow - tilt (look) down          
                        case 40:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_15.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // EXAMINE - longitudinal - 'yaw' - rotate csphere around y-axis<br>  
                        // g => yaw neg => ccw         
                        case 71:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.1 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // h - yaw pos => cw         
                        case 72:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // EXAMINE - latitudinal - 'pitch' - rotate csphere around x-axis<br>
                        // j => pitch neg => ccw         
                        case 74:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // k - pitch pos => cw          
                        case 75:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // DOLLY - translation along axes and more generally<br>
                        // 1 => dollyx+        
                        case 49:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { x: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { x: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            } //dollyx+
                            break;
                        // 2 - dollyx-        
                        case 50:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { x: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { x: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            } //50-dollyx-
                            break;
                        // 6 => dollyy+        
                        case 54:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { y: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { y: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 7 - dollyy-        
                        case 55:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { y: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { y: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // O => dollyz+        
                        case 79:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { z: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { z: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // P - dollyz-        
                        case 80:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { z: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { z: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_15.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 0 - bezier 'through' curve          
                        // * NOTE: bezier() will always fail e2e-spec test because at each run
                        //   the vertices and control points are chosen by Math.random() so
                        //   one run will never match another.
                        case 48:
                            // uses default dur=10 npoints=6
                            if (e.altKey) {
                                a = { d: 20, n: 6, z: false };
                            }
                            else {
                                a = { d: 20, n: 6, z: true };
                            }
                            c3d.bezier(a);
                            //log({t:'camera3d', f:'bezier', a:a});
                            if (record_shots) {
                                mediator_15.mediator.record({ t: 'camera3d', f: 'bezier', a: a });
                            }
                            break;
                        default:
                            mediator_15.mediator.log(`key '${e.keyCode}' not associated with c3d function`);
                    }
                } //keys()
            }
            ;
            // enforce singleton
            if (!map) {
                map = new Keymap();
            }
            exports_34("map", map);
        }
    }
});
System.register("models/camera/keymaps/dome2-orig-alt-fly", ["services/mediator"], function(exports_35, context_35) {
    "use strict";
    var __moduleName = context_35 && context_35.id;
    var mediator_16;
    var map, c3d, csphere, camera, record_shots, a, Keymap;
    return {
        setters:[
            function (mediator_16_1) {
                mediator_16 = mediator_16_1;
            }],
        execute: function() {
            // singleton instance and param object
            class Keymap {
                constructor() {
                    map = this;
                }
                initialize(_c3d, _csphere, _camera, _record_shots) {
                    c3d = _c3d;
                    csphere = _csphere;
                    camera = _camera;
                    record_shots = _record_shots;
                }
                keys(e) {
                    mediator_16.mediator.log(`keyup: key = ${e.keyCode}`);
                    switch (e.keyCode) {
                        // CENTER/HOME - normalize camera and csphere<br>
                        // m - center
                        case 77:
                            a = { d: 3 };
                            if (e.shiftKey) {
                                c3d.home(a);
                                //log({t:'camera3d', f:'home', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'home', a: a });
                                }
                            }
                            else {
                                c3d.center(a);
                                //log({t:'camera3d', f:'center', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'center', a: a });
                                }
                            }
                            break;
                        // ZOOM<br>
                        // a - zoom in          
                        case 65:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 60, d: 5 };
                                    c3d.zoomflyTo(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9, d: 5 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { s: 60 }; // 90/120
                                    c3d.zoomcutTo(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9 };
                                    c3d.zoomcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // s - zoom out          
                        case 83:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 120, d: 5 };
                                    c3d.zoomflyTo(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.111, d: 5 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { s: 120 };
                                    c3d.zoomcutTo(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.111 };
                                    c3d.zoomcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // ROLL<br>
                        // b - roll neg => ccw         
                        case 66:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    c3d.rollflyTo(a);
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.rollcutTo(a);
                                    //log({t:'camera3d', f:'rollcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'rollcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // n - roll pos => cw         
                        case 78:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.rollflyTo(a);
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                    c3d.rollcutTo(a);
                                }
                                else {
                                    a = { r: 0.3927 };
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                }
                            }
                            break;
                        // PAN/TILT<br>
                        // left arrow - pan (look) left          
                        case 37:
                            console.log(`\n[[[[[ left arrow - 37`);
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // right arrow - pan (look) right          
                        case 39:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // up arrow - tilt (look) up          
                        case 38:
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // down arrow - tilt (look) down          
                        case 40:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_16.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // EXAMINE - longitudinal - 'yaw' - rotate csphere around y-axis<br>  
                        // g => yaw neg => ccw         
                        case 71:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.1 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // h - yaw pos => cw         
                        case 72:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // EXAMINE - latitudinal - 'pitch' - rotate csphere around x-axis<br>
                        // j => pitch neg => ccw         
                        case 74:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // k - pitch pos => cw          
                        case 75:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // DOLLY - translation along axes and more generally<br>
                        // 1 => dollyx+        
                        case 49:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { x: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { x: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            } //dollyx+
                            break;
                        // 2 - dollyx-        
                        case 50:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { x: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { x: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            } //50-dollyx-
                            break;
                        // 6 => dollyy+        
                        case 54:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { y: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { y: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 7 - dollyy-        
                        case 55:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { y: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { y: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // O => dollyz+        
                        case 79:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { z: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { z: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // P - dollyz-        
                        case 80:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { z: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { z: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_16.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 0 - bezier 'through' curve          
                        // * NOTE: bezier() will always fail e2e-spec test because at each run
                        //   the vertices and control points are chosen by Math.random() so
                        //   one run will never match another.
                        case 48:
                            // uses default dur=10 npoints=6
                            if (e.altKey) {
                                a = { d: 20, n: 6, z: true };
                            }
                            else {
                                a = { d: 20, n: 6, z: false };
                            }
                            c3d.bezier(a);
                            //log({t:'camera3d', f:'bezier', a:a});
                            if (record_shots) {
                                mediator_16.mediator.record({ t: 'camera3d', f: 'bezier', a: a });
                            }
                            break;
                        default:
                            mediator_16.mediator.log(`key '${e.keyCode}' not associated with c3d function`);
                    }
                } //keys()
            }
            ;
            // enforce singleton
            if (!map) {
                map = new Keymap();
            }
            exports_35("map", map);
        }
    }
});
System.register("models/camera/keymaps/i3d", ["services/mediator"], function(exports_36, context_36) {
    "use strict";
    var __moduleName = context_36 && context_36.id;
    var mediator_17;
    var map, c3d, csphere, camera, record_shots, a, Keymap;
    return {
        setters:[
            function (mediator_17_1) {
                mediator_17 = mediator_17_1;
            }],
        execute: function() {
            // singleton instance and param object
            class Keymap {
                constructor() {
                    map = this;
                }
                initialize(_c3d, _csphere, _camera, _record_shots) {
                    c3d = _c3d;
                    csphere = _csphere;
                    camera = _camera;
                    record_shots = _record_shots;
                }
                keys(e) {
                    mediator_17.mediator.log(`keyup: key = ${e.keyCode}`);
                    switch (e.keyCode) {
                        // CENTER/HOME - normalize camera and csphere<br>
                        // a - center
                        case 65:
                            a = { d: 3 };
                            if (e.shiftKey) {
                                c3d.home(a);
                                //log({t:'camera3d', f:'home', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'home', a: a });
                                }
                            }
                            else {
                                c3d.center(a);
                                //log({t:'camera3d', f:'center', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'center', a: a });
                                }
                            }
                            break;
                        // ZOOM - EXAMINE
                        // z - zoom in/clockwise examine          
                        case 90:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 0.9 };
                                    c3d.zoomcutBy(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9, d: 3 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // x - zoom out          
                        case 88:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 1.111 };
                                    c3d.zoomcutBy(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.1111, d: 3 };
                                    c3d.zoomflyBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // DOLLY - arrows
                        // left arrow - LEFT X-         
                        case 37:
                            a = { x: -0.1, d: 3 };
                            c3d.dollyflyBy(a);
                            //log({t:'camera3d', f:'dollyflyBy', a:a});
                            if (record_shots) {
                                mediator_17.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                            }
                            break;
                        // right arrow - RIGHT X+
                        case 39:
                            a = { x: 0.1, d: 3 };
                            c3d.dollyflyBy(a);
                            //log({t:'camera3d', f:'dollyflyBy', a:a});
                            if (record_shots) {
                                mediator_17.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                            }
                            break;
                        // up arrow - FWD Z-/UP Y+          
                        case 38:
                            if (e.shiftKey) {
                                a = { y: 0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            else {
                                a = { z: -0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            break;
                        // down arrow - BACK Z+/DOWN Y-          
                        case 40:
                            if (e.shiftKey) {
                                a = { y: -0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            else {
                                a = { z: 0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            break;
                        // PAN/TILT
                        // Q - pan (look) left          
                        case 81:
                            console.log(`\n[[[[[ left arrow - 37`);
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // W - pan (look) right          
                        case 87:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // E - tilt (look) up          
                        case 69:
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // R - tilt (look) down          
                        case 82:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_17.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // ROLL<br>
                        // b - roll neg => ccw         
                        case 66:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.rollcutTo(a);
                                    //log({t:'camera3d', f:'rollcutTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'rollcutBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    c3d.rollflyTo(a);
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // n - roll pos => cw         
                        case 78:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                    c3d.rollcutTo(a);
                                }
                                else {
                                    a = { r: 0.3927 };
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.rollflyTo(a);
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // EXAMINE - longitudinal - 'yaw' - rotate csphere around y-axis<br>  
                        // g => yaw neg => ccw         
                        case 71:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.1 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // h - yaw pos => cw         
                        case 72:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // EXAMINE - latitudinal - 'pitch' - rotate csphere around x-axis<br>
                        // j => pitch neg => ccw         
                        case 74:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // k - pitch pos => cw          
                        case 75:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_17.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 0 - bezier 'through' curve          
                        // * NOTE: bezier() will always fail e2e-spec test because at each run
                        //   the vertices and control points are chosen by Math.random() so
                        //   one run will never match another.
                        case 48:
                            // uses default dur=10 npoints=6
                            if (e.altKey) {
                                a = { d: 20, n: 6, z: false };
                            }
                            else {
                                a = { d: 20, n: 6, z: true };
                            }
                            c3d.bezier(a);
                            //log({t:'camera3d', f:'bezier', a:a});
                            if (record_shots) {
                                mediator_17.mediator.record({ t: 'camera3d', f: 'bezier', a: a });
                            }
                            break;
                        default:
                            mediator_17.mediator.log(`key '${e.keyCode}' not associated with c3d function`);
                    }
                } //keys()
            }
            ;
            // enforce singleton
            if (!map) {
                map = new Keymap();
            }
            exports_36("map", map);
        }
    }
});
System.register("models/camera/keymaps/vr", ["services/mediator"], function(exports_37, context_37) {
    "use strict";
    var __moduleName = context_37 && context_37.id;
    var mediator_18;
    var map, c3d, csphere, camera, record_shots, a, Keymap;
    return {
        setters:[
            function (mediator_18_1) {
                mediator_18 = mediator_18_1;
            }],
        execute: function() {
            // singleton instance and param object
            class Keymap {
                constructor() {
                    map = this;
                }
                initialize(_c3d, _csphere, _camera, _record_shots) {
                    c3d = _c3d;
                    csphere = _csphere;
                    camera = _camera;
                    record_shots = _record_shots;
                }
                keys(e) {
                    mediator_18.mediator.log(`keyup: key = ${e.keyCode}`);
                    switch (e.keyCode) {
                        // CENTER/HOME - normalize camera and csphere<br>
                        // a - center
                        case 65:
                            a = { d: 3 };
                            if (e.shiftKey) {
                                c3d.home(a);
                                //log({t:'camera3d', f:'home', a:a});
                                if (record_shots) {
                                    mediator_18.mediator.record({ t: 'camera3d', f: 'home', a: a });
                                }
                            }
                            else {
                                c3d.center(a);
                                //log({t:'camera3d', f:'center', a:a});
                                if (record_shots) {
                                    mediator_18.mediator.record({ t: 'camera3d', f: 'center', a: a });
                                }
                            }
                            break;
                        // ZOOM - EXAMINE
                        // z - zoom in/clockwise examine          
                        case 90:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 0.9 };
                                    c3d.zoomcutBy(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9, d: 3 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // x - zoom out          
                        case 88:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 1.111 };
                                    c3d.zoomcutBy(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.1111, d: 3 };
                                    c3d.zoomflyBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_18.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // DOLLY - arrows
                        // left arrow - LEFT X-         
                        case 37:
                            a = { x: -0.1, d: 3 };
                            c3d.dollyflyBy(a);
                            //log({t:'camera3d', f:'dollyflyBy', a:a});
                            if (record_shots) {
                                mediator_18.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                            }
                            break;
                        // right arrow - RIGHT X+
                        case 39:
                            a = { x: 0.1, d: 3 };
                            c3d.dollyflyBy(a);
                            //log({t:'camera3d', f:'dollyflyBy', a:a});
                            if (record_shots) {
                                mediator_18.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                            }
                            break;
                        // up arrow - FWD Z-/UP Y+          
                        case 38:
                            if (e.shiftKey) {
                                a = { y: 0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_18.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            else {
                                a = { z: -0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_18.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            break;
                        // down arrow - BACK Z+/DOWN Y-          
                        case 40:
                            if (e.shiftKey) {
                                a = { y: -0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_18.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            else {
                                a = { z: 0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_18.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                }
                            }
                            break;
                        default:
                            mediator_18.mediator.log(`key '${e.keyCode}' not associated with c3d function`);
                    }
                } //keys()
            }
            ;
            // enforce singleton
            if (!map) {
                map = new Keymap();
            }
            exports_37("map", map);
        }
    }
});
System.register("models/space/cube_fsh/fsh_cube.glsl", [], function(exports_38, context_38) {
    "use strict";
    var __moduleName = context_38 && context_38.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            exports_38("uniforms", uniforms = {
                tCube: { type: 'samplerCube', value: '' },
                tFlip: { type: 'float', value: 0.0 },
                opacity: { type: 'float', value: 1.0 },
                time: { type: 'float', value: 0.0 }
            });
            exports_38("fsh", fsh = `

varying vec3 vWorldPosition;

#include <common>
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform float time;

void main() {

	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	gl_FragColor.a *= opacity;
        gl_FragColor.r *= 0.5;
        gl_FragColor.b *= 1.2;
}`);
        }
    }
});
System.register("models/space/cube_fsh/fsh_cube_sin.glsl", [], function(exports_39, context_39) {
    "use strict";
    var __moduleName = context_39 && context_39.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            exports_39("uniforms", uniforms = {
                tCube: { type: 'samplerCube', value: '' },
                tFlip: { type: 'float', value: 0.0 },
                opacity: { type: 'float', value: 1.0 },
                uTime: { type: 'float', value: 0.0 }
            });
            exports_39("fsh", fsh = `
#include <common>
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform float uTime;

varying vec3 vWorldPosition;

void main() {

	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	gl_FragColor.a *= opacity;
        gl_FragColor.r += 0.1*sin(uTime);
        gl_FragColor.b += 0.1*sin(2.0*uTime);
}`);
        }
    }
});
System.register("models/space/cube_fsh/fsh_cube_sin2.glsl", [], function(exports_40, context_40) {
    "use strict";
    var __moduleName = context_40 && context_40.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // Fragment shader program 
            // fsh_cube - texture map
            exports_40("uniforms", uniforms = {
                tCube: { type: 'samplerCube', value: '' },
                tFlip: { type: 'float', value: 0.0 },
                opacity: { type: 'float', value: 1.0 },
                uTime: { type: 'float', value: 0.0 }
            });
            exports_40("fsh", fsh = `

varying vec3 vWorldPosition;

#include <common>
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform float uTime;

void main() {

	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	gl_FragColor.a *= opacity;
        gl_FragColor.r += 0.2*sin(uTime);
        gl_FragColor.b += 0.1*sin(2.0*uTime);
}`);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_cubes.glsl", [], function(exports_41, context_41) {
    "use strict";
    var __moduleName = context_41 && context_41.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - cubes
            exports_41("uniforms", uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            });
            exports_41("fsh", fsh = `
#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;
uniform vec2 uResolution;

#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01

const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;


float Hash(in float n) {
    return fract(sin(n)*43758.5453123);
}

float Noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*157.0 + 113.0*p.z;
    return mix(mix(mix( Hash(n+  0.0), Hash(n+  1.0),f.x),
                   mix( Hash(n+157.0), Hash(n+158.0),f.x),f.y),
               mix(mix( Hash(n+113.0), Hash(n+114.0),f.x),
                   mix( Hash(n+270.0), Hash(n+271.0),f.x),f.y),f.z);
}

vec3 RotateZ(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.y;
	p.y = s * q.x + c * q.y;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}

float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   return smax(distBox, distTorus, 0.2);
   //return Torus(q, vec2(1,0.4));
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateZ(pos, sin(uTime));
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n * d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos + delta.xyy ) - Dist( pos - delta.xyy );
   n.y = Dist( pos + delta.yxy ) - Dist( pos - delta.yxy );
   n.z = Dist( pos + delta.yyx ) - Dist( pos - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(in vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}

vec3 GetRay(vec3 dir, vec2 pos) {
   pos = pos - 0.5;
   pos.x *= uResolution.x/uResolution.y;
   
   dir = normalize(dir);
   vec3 right = normalize(cross(vec3(0.,1.,0.),dir));
   vec3 up = normalize(cross(dir,right));
   
   return dir + right*pos.x + up*pos.y;
}

vec4 March(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      vec3 p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         return vec4(p, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   return vec4(0.0);
}

void main() {
   vec2 p = gl_FragCoord.xy / uResolution.xy;
   vec3 ro = CamPos;
   vec3 rd = normalize(GetRay(CamLook-CamPos, p));
   vec4 res = March(ro, rd);
   if (res.a == 1.0) res.xyz = clamp(Shading(res.xyz, rd, GetNormal(res.xyz)).xyz, 0.0, 1.0);
   else res.xyz = Sky(res.xyz);
   
   gl_FragColor = vec4(res.rgb, 1.0);
}
`);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_expt1.glsl", [], function(exports_42, context_42) {
    "use strict";
    var __moduleName = context_42 && context_42.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt1-fogcubes
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
   


     // distance - used by march
     float distance(vec3 p, vec3 v, vec3 b){
       vec3 p_v = p - v;
       //return length(max(abs(p_v)-b, 0.0));  // single-cube

       //vec3 q = fract(p) * 2.0 -1.0;  // multiple ellipsoids
       //return length(q) - 2.36;
       vec3 q = fract(p - v) * (2.0 + 0.1*sin(uTime)) -1.0;
       //vec3 q = fract(max(abs(p_v)-b, 0.0)) * (2.0 + 0.1*sin(uTime)) -1.0;
       return length(max(abs(q)-b, 0.0)) - 0.25;  // multiple cuboids
       //return length(q) - 0.25;
     }


     // march(eye, fwd) - uses distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         float s = uFovscale;
         float sx = abs(uCam_up.y) * uAspect + (1.0 - abs(uCam_up.y));
         float sy = (1.0 - abs(uCam_up.y)) * uAspect + abs(uCam_up.y);
         float ssx = s/sx;
         float ssy = s/sy;

         for (int i=0; i<32; i++) {       // 32 iterations
             // screen uv point p
             vec3 p = eye + t*fwd;

             // object vertex obtained from scenegraph
             vec3 v = uVertex;

             // modify p by sg-camera viewMatrix = camera.matrixWorldInverse
             vec4 pp = vec4(p.xyz, 1.0) * viewMatrix;
             p = pp.xyz;

             // scale the rm-objects virtual geometry 
             // modify coords by uFovscale to match fov-zoom effect
             // modify width, depth by uAspect to compensate for screen
             // distortion due to non-uniform aspect ratio 
             vec3 b = vec3(ssx*0.1, ssy*0.1, s*0.1);

             // distance
             float d = distance(p, v, b);  
             t += d*0.5;
         }
         return t;
     }


     // color(march(), fwd)
     vec4 color(float d, vec3 fwd){
         d *= 2.0;
         float fog = 50.0/(d*d + 2.0);  // 50.0/ +2.0/
         return vec4(0.8*fog, 0.5*fog, 2.0*fog, 0.9);
     }
 

     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       float alpha = 0.1 * pixel.a;  // 0.5
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 0.5 + 0.5 * sin(0.2*uTime);
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
            exports_42("fsh", fsh);
            exports_42("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_expt2.glsl", [], function(exports_43, context_43) {
    "use strict";
    var __moduleName = context_43 && context_43.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt2-infinite cubes/toruses - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.5 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 
#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01
  
const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.78,.6,.6); //vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;



vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = s * q.x + c * q.z;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}

float cone(vec3 p, vec2 t) {
   vec2 c = normalize(t);
   float q = length(p.xz);
   return dot(t, vec2(q, p.z));
}



float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   //float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   //return smax(distBox, distTorus, 3.0);  //0.2
   //return Torus(q, vec2(1,0.4));
   //return smax(0.2*distBox, distTorus, 0.3);  //0.2
   return smax(0.05*cone(q, vec2(1,5)), 1.6*distTorus, 0.9);  //0.9  
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateY(pos, 0.01*uTime);
   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n*d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos.xyz + delta.xyy ) - Dist( pos.xyz - delta.xyy );
   n.y = Dist( pos.xyz + delta.yxy ) - Dist( pos.xyz - delta.yxy );
   n.z = Dist( pos.xyz + delta.yyx ) - Dist( pos.xyz - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}



vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.z > ro.z) break; 
      //if(rd.y > 0.0) break; 
      //if(rd.x < 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   //return vec4(Sky(p), 1.0);
   return vec4(0.0,0.0,0.0,1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 1.2 + 0.5 * sin(0.2*uTime);   //0.8 + 0.5*
       //blnd.r *= 1.5*uRed + 0.2 * sin(0.2*uTime); 
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       //vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1
       vec3 eye = cameraPosition;

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_43("fsh", fsh);
            exports_43("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_expt3.glsl", [], function(exports_44, context_44) {
    "use strict";
    var __moduleName = context_44 && context_44.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt3-infinite mengersponge - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.5 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 


uniform vec2 resolution; // GLSL built-in ?
//uniform vec3 uCam_fwd;  //cameraLookat; // 0,0,0

#define GAMMA 0.8
#define AO_SAMPLES 5
#define RAY_DEPTH 256
#define MAX_DEPTH 200.0
#define SHADOW_RAY_DEPTH 16
#define DISTANCE_MIN 0.001
#define PI 3.14159265
#define PIOV4 0.785398 

const vec2 delta = vec2(0.001, 0.);
const vec3 cameraPos = vec3(0,0,1);  //cameraPos; // 0,0,0
const vec3 cameraLookat = vec3(0,0,-1);  //cameraLookat; // 0,0,0
const vec3 lightDir = vec3(-2.0,0.8,-1.0);
const vec3 lightColour = vec3(2.0,1.8,1.5);
const float specular = 64.0;
const float specularHardness = 512.0;
const vec3 diffuse = vec3(0.25,0.25,0.25);
const float ambientFactor = 2.65;  // 0.65
const bool ao = true;
const bool shadows = true;
const bool antialias = false;
const bool rotateWorld = true;











vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = -s * q.x + c * q.z;
	return p;
}

float Cross(vec3 p)
{
   p = abs(p);
   vec3 d = vec3(max(p.x, p.y),
                 max(p.y, p.z),
                 max(p.z, p.x));
   return min(d.x, min(d.y, d.z)) - (1.0 / 3.0);
}

float CrossRep(vec3 p)
{
   vec3 q = mod(p + 1.0, 2.0) - 1.0;
   return Cross(q);
}

float CrossRepScale(vec3 p, float s)
{
   return CrossRep(p * s) / s;   
}

const int MENGER_ITERATIONS = 4;

float Dist(vec3 pos)
{
   //if (rotateWorld) pos = RotateY(pos, sin(uTime*0.025)*PI);
   //if (rotateWorld) pos = RotateY(pos, sin(uTime*0.025)*PIOV4);
   //if (rotateWorld) pos = RotateY(pos, sin(uTime*0.025)*0.5);

   pos.xyz += uVertex.xyz;
  
   float scale = 0.05;
   float dist = 0.0;
   for (int i = 0; i < MENGER_ITERATIONS; i++)
   {
      dist = max(dist, -CrossRepScale(pos, scale));
      scale *= 3.0;
   }
   return dist;
}

// Based on original by IQ - optimized to remove a divide
float CalcAO(vec3 p, vec3 n)
{
   float r = 0.0;
   float w = 1.0;
   for (int i=1; i<=AO_SAMPLES; i++)
   {
      float d0 = float(i) * 0.3;
      r += w * (d0 - Dist(p + n * d0));
      w *= 0.5;
   }
   return 1.0 - clamp(r,0.0,1.0);
}

// Based on original code by IQ
float SoftShadow(vec3 ro, vec3 rd, float k)
{
   float res = 1.0;
   float t = 0.1;          // min-t see http://www.iquilezles.org/www/articles/rmshadows/rmshadows.htm
   for (int i=0; i<SHADOW_RAY_DEPTH; i++)
   {
      if (t < 20.0)  // max-t
      {
         float h = Dist(ro + rd * t);
         res = min(res, k*h/t);
         t += h;
      }
   }
   return clamp(res, 0.0, 1.0);
}

vec3 GetNormal(vec3 pos)
{
   vec3 n;
   n.x = Dist( pos + delta.xyy ) - Dist( pos - delta.xyy );
   n.y = Dist( pos + delta.yxy ) - Dist( pos - delta.yxy );
   n.z = Dist( pos + delta.yyx ) - Dist( pos - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO and SoftShadows to original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm)
{
   vec3 light = lightColour * max(0.0, dot(norm, lightDir));
   vec3 heading = normalize(-rd + lightDir);
   float spec = pow(max(0.0, dot(heading, norm)), specularHardness);
   
   light = (diffuse * light) + (spec * specular * lightColour);
   if (shadows) light *= SoftShadow(pos, lightDir, 16.0);
   if (ao) light += CalcAO(pos, norm) * ambientFactor;
   return vec4(light, 1.0);
}

// Original method by David Hoskins
vec3 Sky(in vec3 rd)
{
   float sunAmount = max(dot(rd, lightDir), 0.0);
   float v = pow(1.0 - max(rd.y,0.0),6.);
   vec3 sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
   sky += lightColour * sunAmount * sunAmount * .25 + lightColour * min(pow(sunAmount, 800.0)*1.5, .3);
   
   return clamp(sky, 0.0, 1.0);
}







vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.z > ro.z) break; 
      //if(rd.y > 0.0) break; 
      //if(rd.x < 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   //return vec4(Sky(p), 1.0);
   return vec4(0.0,0.0,0.0,1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 1.2 + 0.5 * sin(0.2*uTime);   //0.8 + 0.5*
       //blnd.r *= 1.5*uRed + 0.2 * sin(0.2*uTime); 
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       //vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1
       vec3 eye = cameraPosition;

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_44("fsh", fsh);
            exports_44("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_expt_df1.glsl", [], function(exports_45, context_45) {
    "use strict";
    var __moduleName = context_45 && context_45.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt1-fogcubes
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
   


     // distance - used by march
     float distance(vec3 p, vec3 v, vec3 b){
       vec3 p_v = p - v;
       //return length(max(abs(p_v)-b, 0.0));  // single-cube

       //vec3 q = fract(p) * 2.0 -1.0;  // multiple ellipsoids
       //return length(q) - 2.36;
       vec3 q = fract(p - v) * (2.0 + 0.1*sin(uTime)) -1.0;
       //vec3 q = fract(max(abs(p_v)-b, 0.0)) * (2.0 + 0.1*sin(uTime)) -1.0;
       return length(max(abs(q)-b, 0.0)) - 0.25;  // multiple cuboids
       //return length(q) - 0.25;
     }


     // march(eye, fwd) - uses distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         float s = uFovscale;
         float sx = abs(uCam_up.y) * uAspect + (1.0 - abs(uCam_up.y));
         float sy = (1.0 - abs(uCam_up.y)) * uAspect + abs(uCam_up.y);
         float ssx = s/sx;
         float ssy = s/sy;

         for (int i=0; i<32; i++) {       // 32 iterations
             // screen uv point p
             vec3 p = eye + t*fwd;

             // object vertex obtained from scenegraph
             vec3 v = uVertex;

             // modify p by sg-camera viewMatrix = camera.matrixWorldInverse
             vec4 pp = vec4(p.xyz, 1.0) * viewMatrix;
             p = pp.xyz;

             // scale the rm-objects virtual geometry 
             // modify coords by uFovscale to match fov-zoom effect
             // modify width, depth by uAspect to compensate for screen
             // distortion due to non-uniform aspect ratio 
             vec3 b = vec3(ssx*0.1, ssy*0.1, s*0.1);

             // distance
             float d = distance(p, v, b);  
             t += d*0.5;
         }
         return t;
     }


     // color(march(), fwd)
     vec4 color(float d, vec3 fwd){
         d *= 2.0;
         float fog = 50.0/(d*d + 2.0);  // 50.0/ +2.0/
         return vec4(0.8*fog, 0.5*fog, 2.0*fog, 0.9);
     }
 

     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       float alpha = 0.1 * pixel.a;  // 0.5
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 0.5 + 0.5 * sin(0.2*uTime);
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
            exports_45("fsh", fsh);
            exports_45("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_fogcubes.glsl", [], function(exports_46, context_46) {
    "use strict";
    var __moduleName = context_46 && context_46.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - fogcubes
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
   


     // distance - used by march
     float distance(vec3 p, vec3 v, vec3 b){
       vec3 p_v = p - v;
       //return length(max(abs(p_v)-b, 0.0));  // single-cube

       //vec3 q = fract(p) * 2.0 -1.0;  // multiple ellipsoids
       //return length(q) - 2.36;
       vec3 q = fract(p - v) * (2.0 + 0.1*sin(uTime)) -1.0;
       //vec3 q = fract(max(abs(p_v)-b, 0.0)) * (2.0 + 0.1*sin(uTime)) -1.0;
       return length(max(abs(q)-b, 0.0)) - 0.25;  // multiple cuboids
       //return length(q) - 0.25;
     }


     // march(eye, fwd) - uses distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         float s = uFovscale;
         float sx = abs(uCam_up.y) * uAspect + (1.0 - abs(uCam_up.y));
         float sy = (1.0 - abs(uCam_up.y)) * uAspect + abs(uCam_up.y);
         float ssx = s/sx;
         float ssy = s/sy;

         for (int i=0; i<32; i++) {       // 32 iterations
             // screen uv point p
             vec3 p = eye + t*fwd;

             // object vertex obtained from scenegraph
             vec3 v = uVertex;

             // modify p by sg-camera viewMatrix = camera.matrixWorldInverse
             vec4 pp = vec4(p.xyz, 1.0) * viewMatrix;
             p = pp.xyz;

             // scale the rm-objects virtual geometry 
             // modify coords by uFovscale to match fov-zoom effect
             // modify width, depth by uAspect to compensate for screen
             // distortion due to non-uniform aspect ratio 
             vec3 b = vec3(ssx*0.1, ssy*0.1, s*0.1);

             // distance
             float d = distance(p, v, b);  
             t += d*0.5;
         }
         return t;
     }


     // color(march(), fwd)
     vec4 color(float d, vec3 fwd){
         d *= 2.0;
         float fog = 50.0/(d*d + 2.0);  // 50.0/ +2.0/
         return vec4(0.8*fog, 0.5*fog, 2.0*fog, 0.9);
     }
 

     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       float alpha = 0.1 * pixel.a;  // 0.5
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 0.5 + 0.5 * sin(0.2*uTime);
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
            exports_46("fsh", fsh);
            exports_46("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_full-infsmoothcubes.glsl", [], function(exports_47, context_47) {
    "use strict";
    var __moduleName = context_47 && context_47.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt2-infinite cubes/toruses - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 
#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01
  
const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.78,.6,.6); //vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;



vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = s * q.x + c * q.z;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}



float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   return smax(distBox, distTorus, 3.0);  //0.2
   //return Torus(q, vec2(1,0.4));
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateY(pos, 0.01*uTime);
   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n*d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos.xyz + delta.xyy ) - Dist( pos.xyz - delta.xyy );
   n.y = Dist( pos.xyz + delta.yxy ) - Dist( pos.xyz - delta.yxy );
   n.z = Dist( pos.xyz + delta.yyx ) - Dist( pos.xyz - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}



vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      //if(rd.y > 0.0) break; 
      //if(rd.x < 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   //return vec4(Sky(p), 1.0);
   //return vec4(0.0,0.0,0.0,1.0);
   return vec4(0.5,1.0,1.0,1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 1.2 + 0.5 * sin(0.2*uTime);   //0.8 + 0.5*
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       //vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1
       vec3 eye = cameraPosition;

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_47("fsh", fsh);
            exports_47("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_infcubes.glsl", [], function(exports_48, context_48) {
    "use strict";
    var __moduleName = context_48 && context_48.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - infinite cubes - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 
#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01
  
const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;



vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = s * q.x + c * q.z;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}



float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   return smax(distBox, distTorus, 0.5);  //0.2
   //return Torus(q, vec2(1,0.4));
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateY(pos, 0.01*uTime);
   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n*d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos.xyz + delta.xyy ) - Dist( pos.xyz - delta.xyy );
   n.y = Dist( pos.xyz + delta.yxy ) - Dist( pos.xyz - delta.yxy );
   n.z = Dist( pos.xyz + delta.yyx ) - Dist( pos.xyz - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}



vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.y > 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   //return vec4(Sky(p), 1.0);
   return vec4(0.5,1.0,1.0,1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 0.8 + 0.5 * sin(0.2*uTime);
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_48("fsh", fsh);
            exports_48("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_infsmoothcubes.glsl", [], function(exports_49, context_49) {
    "use strict";
    var __moduleName = context_49 && context_49.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt2-infinite cubes/toruses - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 
#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01
  
const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.78,.6,.6); //vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;



vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = s * q.x + c * q.z;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}



float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   return smax(distBox, distTorus, 3.0);  //0.2
   //return Torus(q, vec2(1,0.4));
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateY(pos, 0.01*uTime);
   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n*d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos.xyz + delta.xyy ) - Dist( pos.xyz - delta.xyy );
   n.y = Dist( pos.xyz + delta.yxy ) - Dist( pos.xyz - delta.yxy );
   n.z = Dist( pos.xyz + delta.yyx ) - Dist( pos.xyz - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}



vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.y > 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   return vec4(Sky(p), 1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 1.2 + 0.5 * sin(0.2*uTime);   //0.8 + 0.5*
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_49("fsh", fsh);
            exports_49("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_inftori.glsl", [], function(exports_50, context_50) {
    "use strict";
    var __moduleName = context_50 && context_50.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt2-infinite toruses - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 
#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01
  
const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;



vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = s * q.x + c * q.z;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}



float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   //return smax(distBox, distTorus, 0.5);  //0.2
   return Torus(q, vec2(1,0.4));
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateY(pos, 0.01*uTime);
   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n*d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos.xyz + delta.xyy ) - Dist( pos.xyz - delta.xyy );
   n.y = Dist( pos.xyz + delta.yxy ) - Dist( pos.xyz - delta.yxy );
   n.z = Dist( pos.xyz + delta.yyx ) - Dist( pos.xyz - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}



vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.y > 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   return vec4(Sky(p), 1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 0.8 + 0.5 * sin(0.2*uTime);
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_50("fsh", fsh);
            exports_50("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_inftorimorph.glsl", [], function(exports_51, context_51) {
    "use strict";
    var __moduleName = context_51 && context_51.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt2-infinite cubes/toruses - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.5 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 
#define RAY_DEPTH 128
#define MAX_DEPTH 100.0
#define DISTANCE_MIN 0.01
  
const vec3 CamPos = vec3(0,0,1);  //vec3(5,10.0,6.0);
const vec3 CamLook = vec3(0,0,-1); // vec3(0,0,0)
const vec3 LightDir1 = vec3(.7,1,-1.0);
const vec3 LightColour1 = vec3(1.2,1.05,1);
const vec3 LightDir2 = vec3(0,0,1);
const vec3 LightColour2 = vec3(.78,.6,.6); //vec3(.38,.4,.6);
const float LightSpecular = 64.0;
const float LightSpecularHardness = 256.0;
const vec3 Diffuse = vec3(0.85);
const float AmbientFactor = 0.05;
const float NoiseSize = 128.0;
const float NoiseRoughness = 0.5;



vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = s * q.x + c * q.z;
	return p;
}

// polynomial smooth
float smax(float a, float b, float k) {
   float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
   return mix(a, b, h) - k*h*h;
}

float RoundBox(vec3 p, vec3 b, float r) {
   return length(max(abs(p)-b,0.0))-r;
}

float Torus(vec3 p, vec2 t) {
   vec2 q = vec2(length(p.xz)-t.x,p.y);
   return length(q)-t.y;
}

float cone(vec3 p, vec2 t) {
   vec2 c = normalize(t);
   float q = length(p.xz);
   return dot(t, vec2(q, p.z));
}



float Replicate(vec3 p, vec3 c) {
   vec3 q = mod(p,c) - 0.5 * c;
   //float distBox = RoundBox(q, vec3(0.5,0.5,0.5), 0.15);
   float distTorus = Torus(q, vec2(0.75,0.4+(sin(uTime/2.0))*0.25));
   //return smax(distBox, distTorus, 3.0);  //0.2
   //return Torus(q, vec2(1,0.4));
   //return smax(0.2*distBox, distTorus, 0.3);  //0.2
   return smax(0.05*cone(q, vec2(1,5)), 1.6*distTorus, 0.9);  //0.9  
}

// This should return continuous positive values when outside and negative values inside,
// which roughly indicate the distance of the nearest surface.
float Dist(vec3 pos) {
   pos = RotateY(pos, 0.01*uTime);
   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
   return Replicate(pos, vec3(5));// + Noise(pos*NoiseSize)*NoiseRoughness/NoiseSize;
}

float CalcAO(vec3 p, vec3 n) {
	float r = 0.0;
	float w = 1.0;
	for (float i=1.0; i<=5.0; i++)
	{
		float d0 = (i / 5.0) * 1.25;
		r += w * (d0 - Dist(p + n*d0));
		w *= 0.5;
	}
	float ao = 1.0 - clamp(r,0.0,1.0);
	return ao;
}

vec3 GetNormal(vec3 pos) {
   const vec2 delta = vec2(0.01, 0);
   
   vec3 n;
   n.x = Dist( pos.xyz + delta.xyy ) - Dist( pos.xyz - delta.xyy );
   n.y = Dist( pos.xyz + delta.yxy ) - Dist( pos.xyz - delta.yxy );
   n.z = Dist( pos.xyz + delta.yyx ) - Dist( pos.xyz - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO to the original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   float ao = CalcAO(pos, norm) * AmbientFactor;
	vec3 light1 = LightColour1 * max(0.0, dot(norm, normalize(LightDir1))) + ao;
	vec3 light2 = LightColour2 * max(0.0, dot(norm, normalize(LightDir2))) + ao;
	
	vec3 view = normalize(-rd);
	vec3 heading = normalize(view + LightDir1);
	float specular = pow(max(0.0, dot(heading, norm)), LightSpecularHardness);
	
	return vec4(Diffuse * (light1 + light2) + (specular * LightSpecular * LightColour1), 1.0 );
}

vec3 sunLight  = normalize( vec3(0.35, 0.2, .3) );
vec3 sunColour = vec3(1.0, .75, .6);
vec3 Sky(vec3 rd) {
	float sunAmount = max(dot(rd, sunLight), 0.0);
	float v = pow(1.0 - max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	
	return clamp(sky, 0.0, 1.0);
}



vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.z > ro.z) break; 
      //if(rd.y > 0.0) break; 
      //if(rd.x < 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   //return vec4(Sky(p), 1.0);
   return vec4(0.0,0.0,0.0,1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 1.2 + 0.5 * sin(0.2*uTime);   //0.8 + 0.5*
       //blnd.r *= 1.5*uRed + 0.2 * sin(0.2*uTime); 
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       //vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1
       vec3 eye = cameraPosition;

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_51("fsh", fsh);
            exports_51("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_mengersponge-nav.glsl", [], function(exports_52, context_52) {
    "use strict";
    var __moduleName = context_52 && context_52.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - expt3-infinite mengersponge - adapted from Roast
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.5 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
 


uniform vec2 resolution; // GLSL built-in ?
//uniform vec3 uCam_fwd;  //cameraLookat; // 0,0,0

#define GAMMA 0.8
#define AO_SAMPLES 5
#define RAY_DEPTH 256
#define MAX_DEPTH 200.0
#define SHADOW_RAY_DEPTH 16
#define DISTANCE_MIN 0.001
#define PI 3.14159265

const vec2 delta = vec2(0.001, 0.);
const vec3 cameraPos = vec3(0,0,1);  //cameraPos; // 0,0,0
const vec3 cameraLookat = vec3(0,0,-1);  //cameraLookat; // 0,0,0
const vec3 lightDir = vec3(-2.0,0.8,-1.0);
const vec3 lightColour = vec3(2.0,1.8,1.5);
const float specular = 64.0;
const float specularHardness = 512.0;
const vec3 diffuse = vec3(0.25,0.25,0.25);
const float ambientFactor = 2.65;  // 0.65
const bool ao = true;
const bool shadows = true;
const bool antialias = false;
const bool rotateWorld = false;











vec3 RotateY(vec3 p, float a) {
	float c,s;
	vec3 q=p;
	c = cos(a);
	s = sin(a);
	p.x = c * q.x - s * q.z;
	p.z = -s * q.x + c * q.z;
	return p;
}

float Cross(vec3 p)
{
   p = abs(p);
   vec3 d = vec3(max(p.x, p.y),
                 max(p.y, p.z),
                 max(p.z, p.x));
   return min(d.x, min(d.y, d.z)) - (1.0 / 3.0);
}

float CrossRep(vec3 p)
{
   vec3 q = mod(p + 1.0, 2.0) - 1.0;
   return Cross(q);
}

float CrossRepScale(vec3 p, float s)
{
   return CrossRep(p * s) / s;   
}

const int MENGER_ITERATIONS = 4;

float Dist(vec3 pos)
{
   if (rotateWorld) pos = RotateY(pos, sin(uTime*0.025)*PI);

   pos.x += uVertex.x;
   pos.y += uVertex.y;
   pos.z += uVertex.z;
  
   float scale = 0.05;
   float dist = 0.0;
   for (int i = 0; i < MENGER_ITERATIONS; i++)
   {
      dist = max(dist, -CrossRepScale(pos, scale));
      scale *= 3.0;
   }
   return dist;
}

// Based on original by IQ - optimized to remove a divide
float CalcAO(vec3 p, vec3 n)
{
   float r = 0.0;
   float w = 1.0;
   for (int i=1; i<=AO_SAMPLES; i++)
   {
      float d0 = float(i) * 0.3;
      r += w * (d0 - Dist(p + n * d0));
      w *= 0.5;
   }
   return 1.0 - clamp(r,0.0,1.0);
}

// Based on original code by IQ
float SoftShadow(vec3 ro, vec3 rd, float k)
{
   float res = 1.0;
   float t = 0.1;          // min-t see http://www.iquilezles.org/www/articles/rmshadows/rmshadows.htm
   for (int i=0; i<SHADOW_RAY_DEPTH; i++)
   {
      if (t < 20.0)  // max-t
      {
         float h = Dist(ro + rd * t);
         res = min(res, k*h/t);
         t += h;
      }
   }
   return clamp(res, 0.0, 1.0);
}

vec3 GetNormal(vec3 pos)
{
   vec3 n;
   n.x = Dist( pos + delta.xyy ) - Dist( pos - delta.xyy );
   n.y = Dist( pos + delta.yxy ) - Dist( pos - delta.yxy );
   n.z = Dist( pos + delta.yyx ) - Dist( pos - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO and SoftShadows to original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm)
{
   vec3 light = lightColour * max(0.0, dot(norm, lightDir));
   vec3 heading = normalize(-rd + lightDir);
   float spec = pow(max(0.0, dot(heading, norm)), specularHardness);
   
   light = (diffuse * light) + (spec * specular * lightColour);
   if (shadows) light *= SoftShadow(pos, lightDir, 16.0);
   if (ao) light += CalcAO(pos, norm) * ambientFactor;
   return vec4(light, 1.0);
}

// Original method by David Hoskins
vec3 Sky(in vec3 rd)
{
   float sunAmount = max(dot(rd, lightDir), 0.0);
   float v = pow(1.0 - max(rd.y,0.0),6.);
   vec3 sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
   sky += lightColour * sunAmount * sunAmount * .25 + lightColour * min(pow(sunAmount, 800.0)*1.5, .3);
   
   return clamp(sky, 0.0, 1.0);
}







vec4 colormarch(vec3 ro, vec3 rd) {
   float t = 0.0;
   float d = 1.0;
   vec3 p;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      if(rd.z > ro.z) break; 
      //if(rd.y > 0.0) break; 
      //if(rd.x < 0.0) break; 
      p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         vec3 c = clamp(Shading(p, rd, GetNormal(p)).xyz, 0.0, 1.0);
         return vec4(c, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   //return vec4(Sky(p), 1.0);
   return vec4(0.0,0.0,0.0,1.0);
}



     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5

       float alpha = 0.6;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 1.2 + 0.5 * sin(0.2*uTime);   //0.8 + 0.5*
       //blnd.r *= 1.5*uRed + 0.2 * sin(0.2*uTime); 
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       //vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1
       vec3 eye = cameraPosition;

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(colormarch(eye,fwd));
     }`;
            exports_52("fsh", fsh);
            exports_52("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_mengersponge.glsl", [], function(exports_53, context_53) {
    "use strict";
    var __moduleName = context_53 && context_53.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - mengersponge
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;   //time;  
uniform vec2 resolution; // GLSL built-in ?
//uniform vec3 uCam_fwd;  //cameraLookat; // 0,0,0

#define GAMMA 0.8
#define AO_SAMPLES 5
#define RAY_DEPTH 256
#define MAX_DEPTH 200.0
#define SHADOW_RAY_DEPTH 16
#define DISTANCE_MIN 0.001
#define PI 3.14159265

const vec2 delta = vec2(0.001, 0.);
const vec3 cameraPos = vec3(0,0,1);  //cameraPos; // 0,0,0
const vec3 cameraLookat = vec3(0,0,-1);  //cameraLookat; // 0,0,0
const vec3 lightDir = vec3(-2.0,0.8,-1.0);
const vec3 lightColour = vec3(2.0,1.8,1.5);
const float specular = 64.0;
const float specularHardness = 512.0;
const vec3 diffuse = vec3(0.25,0.25,0.25);
const float ambientFactor = 2.65;  // 0.65
const bool ao = true;
const bool shadows = true;
const bool rotateWorld = true;
const bool antialias = false;


vec3 RotateY(vec3 p, float a)
{
   float c,s;
   vec3 q=p;
   c = cos(a);
   s = sin(a);
   p.x = c * q.x + s * q.z;
   p.z = -s * q.x + c * q.z;
   return p;
}

float Cross(vec3 p)
{
   p = abs(p);
   vec3 d = vec3(max(p.x, p.y),
                 max(p.y, p.z),
                 max(p.z, p.x));
   return min(d.x, min(d.y, d.z)) - (1.0 / 3.0);
}

float CrossRep(vec3 p)
{
   vec3 q = mod(p + 1.0, 2.0) - 1.0;
   return Cross(q);
}

float CrossRepScale(vec3 p, float s)
{
   return CrossRep(p * s) / s;   
}

const int MENGER_ITERATIONS = 4;

float Dist(vec3 pos)
{
   if (rotateWorld) pos = RotateY(pos, sin(uTime*0.025)*PI);
   
   float scale = 0.05;
   float dist = 0.0;
   for (int i = 0; i < MENGER_ITERATIONS; i++)
   {
      dist = max(dist, -CrossRepScale(pos, scale));
      scale *= 3.0;
   }
   return dist;
}

// Based on original by IQ - optimized to remove a divide
float CalcAO(vec3 p, vec3 n)
{
   float r = 0.0;
   float w = 1.0;
   for (int i=1; i<=AO_SAMPLES; i++)
   {
      float d0 = float(i) * 0.3;
      r += w * (d0 - Dist(p + n * d0));
      w *= 0.5;
   }
   return 1.0 - clamp(r,0.0,1.0);
}

// Based on original code by IQ
float SoftShadow(vec3 ro, vec3 rd, float k)
{
   float res = 1.0;
   float t = 0.1;          // min-t see http://www.iquilezles.org/www/articles/rmshadows/rmshadows.htm
   for (int i=0; i<SHADOW_RAY_DEPTH; i++)
   {
      if (t < 20.0)  // max-t
      {
         float h = Dist(ro + rd * t);
         res = min(res, k*h/t);
         t += h;
      }
   }
   return clamp(res, 0.0, 1.0);
}

vec3 GetNormal(vec3 pos)
{
   vec3 n;
   n.x = Dist( pos + delta.xyy ) - Dist( pos - delta.xyy );
   n.y = Dist( pos + delta.yxy ) - Dist( pos - delta.yxy );
   n.z = Dist( pos + delta.yyx ) - Dist( pos - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO and SoftShadows to original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm)
{
   vec3 light = lightColour * max(0.0, dot(norm, lightDir));
   vec3 heading = normalize(-rd + lightDir);
   float spec = pow(max(0.0, dot(heading, norm)), specularHardness);
   
   light = (diffuse * light) + (spec * specular * lightColour);
   if (shadows) light *= SoftShadow(pos, lightDir, 16.0);
   if (ao) light += CalcAO(pos, norm) * ambientFactor;
   return vec4(light, 1.0);
}

// Original method by David Hoskins
vec3 Sky(in vec3 rd)
{
   float sunAmount = max(dot(rd, lightDir), 0.0);
   float v = pow(1.0 - max(rd.y,0.0),6.);
   vec3 sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
   sky += lightColour * sunAmount * sunAmount * .25 + lightColour * min(pow(sunAmount, 800.0)*1.5, .3);
   
   return clamp(sky, 0.0, 1.0);
}

// Camera function by TekF
// Compute ray from camera parameters
vec3 GetRay(vec3 dir, vec2 pos)
{
   pos = pos - 0.5;
   pos.x *= resolution.x/resolution.y;
   
   dir = normalize(dir);
   vec3 right = normalize(cross(vec3(0.,1.,0.),dir));
   vec3 up = normalize(cross(dir,right));
   
   return dir + right*pos.x + up*pos.y;
}

vec4 March(vec3 ro, vec3 rd)
{
   float t = 0.0;
   float d = 1.0;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      vec3 p = ro + rd * t;
      d = Dist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         return vec4(p, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   return vec4(0.0);
}

void main()
{
   const int ANTIALIAS_SAMPLES = 4;
   
   vec4 res = vec4(0.0);
   
   if (antialias)
   {
      float d_ang = 2.*PI / float(ANTIALIAS_SAMPLES);
      float ang = d_ang * 0.33333;
      float r = .3;
      for (int i = 0; i < ANTIALIAS_SAMPLES; i++)
      {
         vec2 p = vec2((gl_FragCoord.x + cos(ang)*r) / resolution.x, (gl_FragCoord.y + sin(ang)*r) / resolution.y);
         vec3 ro = cameraPos;
         vec3 rd = normalize(GetRay(cameraLookat-cameraPos, p));
         vec4 _res = March(ro, rd);
         if (_res.a == 1.0) res.xyz += clamp(Shading(_res.xyz, rd, GetNormal(_res.xyz)).xyz, 0.0, 1.0);
         else res.xyz += Sky(_res.xyz);
         ang += d_ang;
      }
      res /= float(ANTIALIAS_SAMPLES);
   }
   else
   {
      vec2 p = gl_FragCoord.xy / resolution.xy;
      vec3 ro = cameraPos;
      vec3 rd = normalize(GetRay(cameraLookat-cameraPos, p));
      res = March(ro, rd);
      if (res.a == 1.0) res.xyz = clamp(Shading(res.xyz, rd, GetNormal(res.xyz)).xyz, 0.0, 1.0);
      else res.xyz = Sky(res.xyz);
   }
   
   gl_FragColor = vec4(res.xyz, 1.0);
}
`; //fsh
            exports_53("fsh", fsh);
            exports_53("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_rm_template.glsl", [], function(exports_54, context_54) {
    "use strict";
    var __moduleName = context_54 && context_54.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // fragment shader
            // raymarch - cube
            uniforms = {
                tDiffuse: { type: 't', value: null },
                uVertex: { type: 'v3', value: new THREE.Vector3() },
                uAspect: { type: 'f', value: 1.0 },
                uFovscale: { type: 'f', value: 1.0 },
                uCam_fwd: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
                uCam_up: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
                uCam_right: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
                uRed: { type: 'f', value: 0.0 },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            };
            fsh = `
     #ifdef GL_ES
     precision mediump float;
     #endif
     uniform sampler2D tDiffuse; // quad-sgTarget texture map 
     uniform vec3 uVertex;       // custom sg-vertex to use in raymarch
     uniform float uFovscale;    // custom scalar to sync zoom fov changes
     uniform float uAspect;      // custom scalar to correct for screen aspect
     uniform vec3 uCam_up;       // custom up-vector to modify rm objects.xyz
     uniform vec3 uCam_fwd;      // custom fwd-vector to modify rm objects.xyz
     uniform vec3 uCam_right;    // custom R-vector to modify rm objects.xyz
     uniform float uRed;         // test scalar for uniform animation
     uniform float uTime;        // scalar for ellapsed time - for animation
     varying vec2 vuv;
   

     
     // distance - used by march
     float distance(vec3 p, vec3 v, vec3 b){
       vec3 p_v = p - v;
       return length(max(abs(p_v)-b, 0.0));
     }
     

     // march(eye, fwd) - uses distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         float s = uFovscale;
         float sx = abs(uCam_up.y) * uAspect + (1.0 - abs(uCam_up.y));
         float sy = (1.0 - abs(uCam_up.y)) * uAspect + abs(uCam_up.y);
         float ssx = s/sx;
         float ssy = s/sy;

         for (int i=0; i<32; i++) {       // 32 iterations
             // screen uv point p
             vec3 p = eye + t*fwd;

             // object vertex obtained from scenegraph
             vec3 v = uVertex;

             // modify p by sg-camera viewMatrix = camera.matrixWorldInverse
             vec4 pp = vec4(p.xyz, 1.0) * viewMatrix;
             p = pp.xyz;

             // scale the rm-objects virtual geometry 
             // modify coords by uFovscale to match fov-zoom effect
             // modify width, depth by uAspect to compensate for screen
             // distortion due to non-uniform aspect ratio 
             vec3 b = vec3(ssx*0.1, ssy*0.1, s*0.1);

             // distance
             float d = distance(p, v, b);  
             t += d*0.5;
         }
         return t;
     }
     

     // color(march(), fwd)
     vec4 color(float d, vec3 fwd){
         float fog = 5.0/(d*d + 2.0);  // 1.0/
         return vec4(0.8*fog, 0.5*fog, 2.0*fog, 0.9);
     }


     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       float alpha = 0.5 * pixel.a;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color mix
       //blnd.r *= 1.2;
       blnd.r *= 2.0*uRed;
       blnd.g *= 1.8; // 2.0
       blnd.b *= 1.7;
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
            exports_54("fsh", fsh);
            exports_54("uniforms", uniforms);
        }
    }
});
System.register("models/space/quad_fsh/fsh_texturemap.glsl", [], function(exports_55, context_55) {
    "use strict";
    var __moduleName = context_55 && context_55.id;
    var uniforms, fsh;
    return {
        setters:[],
        execute: function() {
            // Fragment shader program 
            exports_55("uniforms", uniforms = {
                tDiffuse: { type: 't', value: null },
                uTime: { type: 'f', value: 0.0 },
                uResolution: { type: 'v2', value: new THREE.Vector2(960, 1080) }
            });
            exports_55("fsh", fsh = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      varying vec2 vuv;

      void main() {
        // paint
        gl_FragColor = texture2D(tDiffuse, vuv); 
      }`);
        }
    }
});
// Vertex shader program 
// vsh_pointcloud - varying gl_PointSize
// custom attributes: size, customColor
System.register("models/space/quad_vsh/vsh_pointcloud.glsl", [], function(exports_56, context_56) {
    "use strict";
    var __moduleName = context_56 && context_56.id;
    var vsh;
    return {
        setters:[],
        execute: function() {
            exports_56("vsh", vsh = `
      attribute float size;
      attribute vec3 customColor;

      varying vec3 vColor;

      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( 300.0 / -mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
      }
      `);
        }
    }
});
// actor: pointcloud-lines
System.register("models/stage/actors/pointcloud-lines", [], function(exports_57, context_57) {
    "use strict";
    var __moduleName = context_57 && context_57.id;
    var effectController, particlesData, positions, colors, pointCloud, particlePositions, linesMesh, create;
    return {
        setters:[],
        execute: function() {
            // closure vars
            particlesData = [];
            //flag:boolean = true;   // TEMP !!!!
            // create
            exports_57("create", create = (options = {}) => {
                // options
                var maxParticleCount = 1000, particleCount = options['particleCount'] || 500, // no effect ?!
                showDots = options['showDots'] || true, // no effect ?!
                showLines = options['showLines'] || true, // no effect ?!
                maxConnections = options['maxConnections'] || 20, //1,  
                minDistance = options['minDistance'] || 250, //90,  //150,    
                limitConnections = options['limitConnections'] || true, //false,
                particles, r = 800, rHalf = r / 2, group = new THREE.Group(), helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(r, r, r)));
                return new Promise((resolve, reject) => {
                    //effectController = options;  //might be missing properties not supplied!
                    effectController = {
                        maxParticleCount: maxParticleCount,
                        particleCount: particleCount,
                        showDots: showDots,
                        showLines: showLines,
                        maxConnections: maxConnections,
                        minDistance: minDistance,
                        limitConnections: limitConnections
                    };
                    helper.material.color.setHex(0x080808);
                    helper.material.blending = THREE.AdditiveBlending;
                    helper.material.transparent = true;
                    group.add(helper);
                    var segments = maxParticleCount * maxParticleCount;
                    positions = new Float32Array(segments * 3);
                    colors = new Float32Array(segments * 3);
                    var pMaterial = new THREE.PointsMaterial({
                        color: 0xFFFFFF,
                        size: 3,
                        blending: THREE.AdditiveBlending,
                        transparent: true,
                        sizeAttenuation: false
                    });
                    particles = new THREE.BufferGeometry();
                    particlePositions = new Float32Array(maxParticleCount * 3);
                    for (var i = 0; i < maxParticleCount; i++) {
                        var x = Math.random() * r - r / 2;
                        var y = Math.random() * r - r / 2;
                        var z = Math.random() * r - r / 2;
                        particlePositions[i * 3] = x;
                        particlePositions[i * 3 + 1] = y;
                        particlePositions[i * 3 + 2] = z;
                        // add it to the geometry
                        particlesData.push({
                            velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
                            numConnections: 0
                        });
                    }
                    particles.setDrawRange(0, particleCount);
                    particles.addAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setDynamic(true));
                    // create the particle system
                    pointCloud = new THREE.Points(particles, pMaterial);
                    group.add(pointCloud);
                    var geometry = new THREE.BufferGeometry();
                    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true));
                    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true));
                    geometry.computeBoundingSphere();
                    geometry.setDrawRange(0, 0);
                    var material = new THREE.LineBasicMaterial({
                        vertexColors: THREE.VertexColors,
                        blending: THREE.AdditiveBlending,
                        transparent: true
                    });
                    linesMesh = new THREE.LineSegments(geometry, material);
                    group.add(linesMesh);
                    //    console.log(`group.children = ${group.children}`);
                    //    for(let c of group.children){
                    //      console.dir(c);
                    //    }
                    // render method
                    group['render'] = (et = 0, options = {}) => {
                        var vertexpos = 0, colorpos = 0, numConnected = 0;
                        for (var i = 0; i < particleCount; i++) {
                            particlesData[i].numConnections = 0;
                        }
                        for (var i = 0; i < particleCount; i++) {
                            // get the particle
                            var particleData = particlesData[i];
                            particlePositions[i * 3] += particleData.velocity.x;
                            particlePositions[i * 3 + 1] += particleData.velocity.y;
                            particlePositions[i * 3 + 2] += particleData.velocity.z;
                            if (particlePositions[i * 3 + 1] < -rHalf || particlePositions[i * 3 + 1] > rHalf) {
                                particleData.velocity.y = -particleData.velocity.y;
                            }
                            if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf) {
                                particleData.velocity.x = -particleData.velocity.x;
                            }
                            if (particlePositions[i * 3 + 2] < -rHalf || particlePositions[i * 3 + 2] > rHalf) {
                                particleData.velocity.z = -particleData.velocity.z;
                            }
                            if (effectController['limitConnections'] && particleData.numConnections >= effectController['maxConnections']) {
                                continue;
                            }
                            // Check collision
                            for (var j = i + 1; j < particleCount; j++) {
                                var particleDataB = particlesData[j];
                                if (effectController['limitConnections'] && particleDataB.numConnections >= effectController['maxConnections']) {
                                    continue;
                                }
                                var dx = particlePositions[i * 3] - particlePositions[j * 3];
                                var dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
                                var dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
                                var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                                if (dist < effectController['minDistance']) {
                                    particleData.numConnections++;
                                    particleDataB.numConnections++;
                                    var alpha = 1.0 - dist / effectController['minDistance'];
                                    positions[vertexpos++] = particlePositions[i * 3];
                                    positions[vertexpos++] = particlePositions[i * 3 + 1];
                                    positions[vertexpos++] = particlePositions[i * 3 + 2];
                                    positions[vertexpos++] = particlePositions[j * 3];
                                    positions[vertexpos++] = particlePositions[j * 3 + 1];
                                    positions[vertexpos++] = particlePositions[j * 3 + 2];
                                    colors[colorpos++] = alpha;
                                    colors[colorpos++] = alpha;
                                    colors[colorpos++] = alpha;
                                    colors[colorpos++] = alpha;
                                    colors[colorpos++] = alpha;
                                    colors[colorpos++] = alpha;
                                    numConnected++;
                                }
                            }
                        } //for i<particlecount
                        // TEMP !!!!!
                        //console.log(`numConnected = ${numConnected} linesMeash = ${linesMesh}`);
                        //      if(flag){
                        //        console.log(`linesMesh.geometry.attributes:`);
                        //        console.dir(linesMesh.geometry.attributes);
                        //        console.log(`pointCloud.geometry.attributes:`);
                        //        console.dir(pointCloud.geometry.attributes);
                        //        flag = false;
                        //      }
                        linesMesh.geometry.setDrawRange(0, 1000); //numConnected * 2 );
                        linesMesh.geometry.attributes.position.needsUpdate = true;
                        linesMesh.geometry.attributes.color.needsUpdate = true;
                        pointCloud.geometry.attributes.position.needsUpdate = true;
                    }; //render
                    resolve(group);
                }); //return new Promise 
            }); //create
        }
    }
});
// actor: pointcloud-sine
System.register("models/stage/actors/pointcloud-sine-texture", [], function(exports_58, context_58) {
    "use strict";
    var __moduleName = context_58 && context_58.id;
    var pointcloud, geometry, material, image_url, n_vertices, i, j, create;
    return {
        setters:[],
        execute: function() {
            //import {camera} from "../../../state/camera";
            // closure vars
            // create
            exports_58("create", create = (options = {}) => {
                // options
                image_url = options['image_url'] || './assets/images/sprites/disc.png';
                n_vertices = options['n_vertices'] || 121; //|| 121;
                console.log(`@@@@ creating ${image_url} for material of pointcloud`);
                console.log(`@@@@ creating ${n_vertices} vertices for Geometry of pointcloud`);
                return new Promise((resolve, reject) => {
                    geometry = new THREE.Geometry();
                    for (i = -5; i < 6; i++) {
                        for (j = -5; j < 6; j++) {
                            //geometry.vertices.push(new THREE.Vector3(0.1*i, 0.1*j, -0.1));
                            //geometry.vertices.push(new THREE.Vector3(0.2*i, 0.0, 0.2*j));
                            geometry.vertices.push(new THREE.Vector3(0.5 * i, 0.0, 0.5 * j));
                        }
                    }
                    material = new THREE.PointsMaterial({ color: 0xff0000, size: 1.2 }); // size:1.2 // 3.2
                    pointcloud = new THREE.Points(geometry, material);
                    // pointcloud.render()
                    pointcloud['render'] = (et = 0, options = {}) => {
                        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
                            //geometry.vertices[ i ].y = 35 * Math.sin( i / 5 + ( et + i ) / 7 );
                            geometry.vertices[i].y = 100 * Math.sin(i / 5 + (0.5 * et + i) / 7);
                        }
                        pointcloud.geometry.verticesNeedUpdate = true;
                        pointcloud.material.map = options['texture'];
                        pointcloud.material.needsUpdate = true;
                    };
                    console.log(`Pointcloud-sine exporting actor ${pointcloud}:`);
                    console.dir(pointcloud);
                    resolve(pointcloud);
                }); //return new Promise
            }); //create
        }
    }
});
// actor: pointcloud-sine
System.register("models/stage/actors/pointcloud-sine", [], function(exports_59, context_59) {
    "use strict";
    var __moduleName = context_59 && context_59.id;
    var pointcloud, geometry, material, image_url, n_vertices, i, j, create;
    return {
        setters:[],
        execute: function() {
            //import {camera} from "../../../state/camera";
            // closure vars
            // create
            exports_59("create", create = (options = {}) => {
                // options
                image_url = options['image_url'] || './assets/images/sprites/disc.png';
                n_vertices = options['n_vertices'] || 121; //|| 121;
                console.log(`@@@@ creating ${image_url} for material of pointcloud`);
                console.log(`@@@@ creating ${n_vertices} vertices for Geometry of pointcloud`);
                return new Promise((resolve, reject) => {
                    geometry = new THREE.Geometry();
                    for (i = -5; i < 6; i++) {
                        for (j = -5; j < 6; j++) {
                            //geometry.vertices.push(new THREE.Vector3(0.1*i, 0.1*j, -0.1));
                            //geometry.vertices.push(new THREE.Vector3(0.2*i, 0.0, 0.2*j));
                            geometry.vertices.push(new THREE.Vector3(0.5 * i, 0.0, 0.5 * j));
                        }
                    }
                    material = new THREE.PointsMaterial({ color: 0xff0000, size: 1.2 }); // size:1.0
                    pointcloud = new THREE.Points(geometry, material);
                    // pointcloud.render()
                    pointcloud['render'] = (et = 0, options = {}) => {
                        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
                            //geometry.vertices[ i ].y = 35 * Math.sin( i / 5 + ( et + i ) / 7 );
                            geometry.vertices[i].y = 100 * Math.sin(i / 5 + (0.5 * et + i) / 7);
                        }
                        pointcloud.geometry.verticesNeedUpdate = true;
                        pointcloud.material.map = options['texture'];
                        pointcloud.material.needsUpdate = true;
                    };
                    console.log(`Pointcloud-sine exporting actor ${pointcloud}:`);
                    console.dir(pointcloud);
                    resolve(pointcloud);
                }); //return new Promise
            }); //create
        }
    }
});
// shadercube.ts
// requires options={vsh:vsh, fsh:fsh, uniforms:uniforms}!!
System.register("models/stage/actors/shadercube", [], function(exports_60, context_60) {
    "use strict";
    var __moduleName = context_60 && context_60.id;
    var create;
    return {
        setters:[],
        execute: function() {
            exports_60("create", create = (options = {}) => {
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
System.register("models/stage/actors/unitcube", [], function(exports_61, context_61) {
    "use strict";
    var __moduleName = context_61 && context_61.id;
    var create;
    return {
        setters:[],
        execute: function() {
            // unitcube.ts
            exports_61("create", create = (options = {}) => {
                var cube_g, cube_m, cube, 
                // options
                wireframe = options['wireframe'] || false, color = options['color'] || 'red', opacity = options['opacity'] || 1.0;
                return new Promise((resolve, reject) => {
                    cube_g = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
                    cube_m = new THREE.MeshBasicMaterial({
                        wireframe: wireframe,
                        color: color,
                        transparent: true,
                        opacity: opacity,
                        side: THREE.DoubleSide
                    });
                    cube_m.blendSrc = THREE.SrcAlphaFactor; // default
                    cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
                    //cube_m.depthTest = false;
                    cube = new THREE.Mesh(cube_g, cube_m);
                    // delta method for modifying properties
                    cube['delta'] = (options = {}) => {
                        cube_m.wireframe = options['wireframe'] || cube_m.wireframe;
                        cube_m.color = options['color'] || cube_m.color;
                        cube_m.transparent = options['transparent'] || cube_m.transparent;
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
System.register("state/vrcamera", ["services/mediator", "models/space/quad_vsh/vsh_default.glsl", "models/space/quad_fsh/fsh_default.glsl"], function(exports_62, context_62) {
    "use strict";
    var __moduleName = context_62 && context_62.id;
    var mediator_19, vsh_default_glsl_4, fsh_default_glsl_7, fsh_default_glsl_8;
    var vrcamera, fsh, uniforms, csphere_radius, csphere_g, csphere_m, csphere, csphere_visible, csphere_wireframe, csphere_opacity, csphere_color, lens, aspect, fov, near, far, controls, key, fill, back, transparent_texture, _post, hud_scaleX, hud_scaleY, hud_texture, VrCamera;
    return {
        setters:[
            function (mediator_19_1) {
                mediator_19 = mediator_19_1;
            },
            function (vsh_default_glsl_4_1) {
                vsh_default_glsl_4 = vsh_default_glsl_4_1;
            },
            function (fsh_default_glsl_7_1) {
                fsh_default_glsl_7 = fsh_default_glsl_7_1;
                fsh_default_glsl_8 = fsh_default_glsl_7_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            fsh = fsh_default_glsl_7.fsh, uniforms = fsh_default_glsl_8.uniforms;
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
                                    mediator_19.mediator.logc(`lens fov = ${fov}`);
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
                                        mediator_19.mediator.loge(`vrcamera: import of Controls caused error: ${e}`);
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
                    mediator_19.mediator.logc(`examine_matrix: translation.x = ${t.x}`);
                    mediator_19.mediator.logc(`examine_matrix: translation.y = ${t.y}`);
                    mediator_19.mediator.logc(`examine_matrix: translation.z = ${t.z}`);
                    mediator_19.mediator.logc(`\nexamine_matrix: quaternion.x = ${q.x}`);
                    mediator_19.mediator.logc(`examine_matrix: quaternion.y = ${q.y}`);
                    mediator_19.mediator.logc(`examine_matrix: quaternion.z = ${q.z}`);
                    mediator_19.mediator.logc(`examine_matrix: quaternion.w = ${q.w}`);
                    mediator_19.mediator.logc(`\nexamine_matrix: scale.x = ${s.x}`);
                    mediator_19.mediator.logc(`examine_matrix: scale.y = ${s.y}`);
                    mediator_19.mediator.logc(`examine_matrix: scale.z = ${s.z}`);
                }
                delta(state, hud, callback) {
                    mediator_19.mediator.log(`VrCamera.delta: state = ${state} hud = ${hud}`);
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
                                hud.material.vertexShader = vsh_default_glsl_4.vsh;
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
            exports_62("vrcamera", vrcamera);
        }
    }
});
//# sourceMappingURL=app.js.map
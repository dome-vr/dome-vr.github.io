System.register(['./mediator'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1;
    var vrspace, cube, Vrspace;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
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
                            mediator_1.mediator.loge(`error in vrspace.createCube: ${e.message}`);
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
                            mediator_1.mediator.loge(`error in vrspace.createCube: ${e.message}`);
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
                        mediator_1.mediator.loge(`error in vr_dome_init: ${e.message}`);
                    }
                }
            }
             //Vrspace
            // enforce singleton export
            if (vrspace === undefined) {
                vrspace = new Vrspace();
            }
            exports_1("vrspace", vrspace);
        }
    }
});
//# sourceMappingURL=vrspace.js.map
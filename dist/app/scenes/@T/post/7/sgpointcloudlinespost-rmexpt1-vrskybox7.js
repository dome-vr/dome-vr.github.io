// topology7/empty-rmcantor-vrskybox7.ts
// webGL2, es300 three.js ==0.125.2
const config = {
    // rendering topology
    topology: {
        // webxr?
        _webxr: true,
        topology: 7,
        // displayed_scene = 'sg|rm|vr'
        displayed_scene: 'vr',
        // render sgscene either to display, or to sgTarget offscreen for 
        // bg texturing in rmscene or texturing in vrscene
        _sg: true,
        //use frame n-1 sgTarget.tex ('sg') 
        _sgpost: false,
        // rmstage or vrstage actors 
        sgTargetNames: ['rmquad'],
        // render rmscene to display, or to rmTarget offscreen for texturing 
        // in vrscene - either skybox/skydome/etc. or actors
        // NOTE! true=>must define rmquad and rmTargetName(s)
        _rm: true,
        // rmstage or vrstage actors 
        _rmpost: true,
        rmTargetNames: ['vrskybox'],
        //skyfaces:string[];  //used if actor 'skyfaces' exists and is rmTgtName
        //value is some subset of ['px','nx','py','ny','pz','nz']
        //order-independent: front,back,left,right,top,ground
        // raymarch - via fragment shader in rmquad ShaderMaterial
        // NOTE! obviously requires rm:t and a vr-actor name in rmTargetNames
        rmvrSkyboxFaces: ['px', 'nx', 'py', 'ny', 'pz', 'nz'],
        // render vrscene - which implies displayed_scene = 'vr'
        _vr: true,
    },
    // initialization of canvas and renderer
    // canvas = document.createElement(canvas_id);
    // renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
    // renderer.setClearColor(clearColor-rgb, clearAlpha);
    // put in rendering object [?]
    renderer: {
        _stats: true,
        canvas_id: 'webgl',
        clearColor: 'black',
        clearAlpha: 1.0,
        alpha: true,
        antialias: false
    },
    // actions/log/etc. server communications
    server: {
        server_connect: false,
        server_host: 'localhost',
        server_port: 8081,
        log: false,
        channels: ['actions', 'log']
    },
};
// STATE
// for initialization AND subsequent changeState actions 
// NOTE: media assets are relative to <base href='/dist/'> so exp.
// dist/app/media/images/glad.png in scene is:
// ./app/media/images/glad.png
// NOTE: actors are relative to dist/app/state/stage.js so exp.
// dist/app/models/stage/actors/environment/panorama.js is:
// ../models/stage/actors/environment/panorama.js is:
// A substate which is undefined (not allowed by interface) or {} is IGNORED.
// the use of a non-empty substate object implies that a creation/deletion or
// modification of substate properti(es) is requested.
//
// there are two cases for substate or substate-property change:
// Let p be a substate or substate-property:
// state entries have the form:  p:{_p:boolean; ...} 
//   _p true => create new p using properties listed (previous p deleted first)
//   _p false => if object[p] does not exist - ignore. If object[p] exists,
//      set p to undefined to remove and ignore for rendering scene 
//   _p undefined => modify the properties listed (no effect on non-existent p)
// NOTE: in the special case of substate 'action': 
//   _action:true => set queue.fifo = actions
//   _action:false => set queue.fifo = []
//   _action undefined => append actions to queue.fifo
// NOTE: substate camera only creates the initial_camera or modifies 
// properties - it is NEVER removed or replaced
const state = {
    // NOTE: after initial creation of the camera, only modifications are 
    // allowed to camera - _camera is ignored
    // NOTE!: webxr:true => lens.position = [0, 1.6, 0] - avatar head position,
    // 1.6 meters 'tall'
    // since sgscene,vrscene are translated by 1.6 in y, in all
    // cases the scene and camera coincide at camera coords (0,0,0)
    camera: {
        sg: {
            lens: {
                _lens: true,
                fov: 90,
                near: 0.01,
                far: 100000,
                transform: { 't': [0, 0.01, 2] } //y=.01 allows blue z-axis to be seen
            },
        },
        vr: {
            lens: {
                _lens: true,
                _orbit: true,
                fov: 90,
                near: 0.01,
                far: 100000,
                transform: { 't': [0, 0.01, 2] } //y=.01 allows blue z-axis to be seen
            },
        }
    },
    // stage - initialization and management of stats performance meter,
    // and actors in one of two possible scenes, sgscene and/or vrscene
    stage: {
        sgscene: {
            _actors: true,
            actors: {
                //                'sgaxes': {
                //                    factory: 'Axes',
                //                    url: '../models/stage/actors/objects/axes.js',
                //                    options: {
                //                        length: 10000,
                //                        transform: { t: [0.0, 0.0, 0.0] }
                //                    }
                //                },
                'sghud': {
                    factory: 'Hud',
                    url: '../models/stage/actors/post/hud.js',
                    options: {
                        color: 'white',
                        opacity: 0.99,
                        //texture:'./app/media/images/hexagonal_tr.png',
                        // test ONLY! - not for production use!
                        scaleX: 1.01,
                        scaleY: 1.01,
                    }
                },
                //                'sgunitcube': {
                //                    factory: 'Unitcube',
                //                    url: '../models/stage/actors/objects/unitcube.js',
                //                    options: { wireframe: false,
                //                        color: 'white',
                //                        opacity: 0.7,
                //                        map: './app/media/images/glad.png',
                //                        transform: { t: [0, 0, -2], e: [0.0, 0.0, 0.0], s: [0.5, 1, 0.5] }
                //                    }
                //                },
                // spritecloud
                'sgcloud': {
                    factory: 'Spritecloud',
                    url: '../models/stage/actors/cloud/spritecloud.js',
                    options: {
                        N: 4,
                        urls: ["./app/media/images/glad.png",
                            "./app/media/images/sprites/sprite_redlight.png",
                            "./app/media/images/cloud/lotus_64.png",
                            "./app/media/images/mglory.png"],
                        //"./app/media/images/pinkLotuas.png" ],
                        transparent: true,
                        opacity: 1.0,
                        cloudRadius: 1000,
                        //translateZ:-3500,  //does nothing ?! used to translate ?!
                        morphtargets: [],
                        positions: [],
                        particles: 128,
                        duration: 10000,
                        transform: { t: [0.0, 0.0, -300.0] }
                    }
                },
            } //actors
        },
        // each scene the has two properties:
        // _actors:true=>create actors; false=>remove actors, undefined=>modify 
        // actors:Record<string,Actor>[] => iterate through actors by 'name'
        rmscene: {
            _actors: true,
            actors: {
                'rmquad': {
                    factory: 'Rmquad',
                    url: '../models/stage/actors/raymarch/rmquad.js',
                    options: {
                        opacity: 1.0,
                        //                      vsh:'../../../stage/shaders/webgl2/vertex/vsh_default.glsl.js',
                        //                      fsh:'../../../stage/shaders/webgl2/fragment/fsh_color.glsl.js',
                        vsh: '../../../stage/shaders/webgl1/quad_vsh/vsh_default.glsl.js',
                        //fsh:'../../../stage/shaders/webgl1/quad_fsh/fsh_rm_mengersponge.glsl.js',
                        fsh: '../../../stage/shaders/webgl1/quad_fsh/fsh_rm_expt1.glsl.js',
                    }
                },
                'rmhud': {
                    factory: 'Rmquad',
                    url: '../models/stage/actors/raymarch/rmquad.js',
                    options: {
                        color: 'white',
                        opacity: 0.5,
                        scaleX: 1.0,
                        scaleY: 1.0,
                        //                      vsh:'../../../stage/shaders/webgl2/vertex/vsh_default.glsl.js',
                        //                      fsh:'../../../stage/shaders/webgl2/fragment/fsh_color.glsl.js',
                        vsh: '../../../stage/shaders/webgl1/quad_vsh/vsh_default.glsl.js',
                        fsh: '../../../stage/shaders/webgl1/quad_fsh/fsh_tDiffuse.glsl.js',
                        //texture:'./app/media/images/glad.png',
                        transform: { t: [0.0, 0.0, 0.001] }
                    }
                }
            } //actors
        },
        vrscene: {
            _actors: true,
            actors: {
                //                'vraxes': {
                //                    factory: 'Axes',
                //                    url: '../models/stage/actors/objects/axes.js',
                //                    options: {
                //                        length: 10000,
                //                        transform: { t: [0.0, 0.0, 0.0] }
                //                    }
                //                },
                'vrunitcube': {
                    factory: 'Unitcube',
                    url: '../models/stage/actors/objects/unitcube.js',
                    options: { wireframe: false,
                        color: 'white',
                        transparent: true,
                        opacity: 0.5,
                        //map: './app/media/images/cloud/sprite_redlight.png',
                        map: './app/media/images/cloud/moon_tr.png',
                        //map: './app/media/images/symbols/abstract/symbols/transparent/hung_tr.png',
                        //map: './app/media/images/symbols/abstract/transparent/hung_transparent.png',
                        //map: './app/media/images/flowers_853x1280.png',
                        //transform: { t: [0, 0, -2], e: [0.0, 0.0, 0.0], s: [0.5, 8.0, 0.5] }
                        transform: { t: [0, 0, -2], e: [0.0, 0.0, 0.0], s: [40., 60., 40.] }
                    }
                },
                //                'vrground':{ 
                //                  factory:'GridXZ',
                //                  url:'../models/stage/actors/environment/gridXZ.js',
                //                  options:{
                //                        size:1000,
                //                        divisions:100,
                //                        colorGrid:'red', 
                //                        colorCenterLine:'green', 
                //                        opacity:0.9, 
                //                        transform:{t:[0.0,-2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
                //                  } 
                //                },
                'vrskybox': {
                    factory: 'Skybox',
                    url: '../models/stage/actors/environment/skybox.js',
                    options: {
                        size: 1000,
                        color: 'white',
                        opacity: 1.0,
                        textures: [
                            './app/media/images/skybox/sky/sky_posX.jpg',
                            './app/media/images/skybox/sky/sky_negX.jpg',
                            './app/media/images/skybox/sky/sky_posY.jpg',
                            './app/media/images/skybox/sky/sky_negY.jpg',
                            './app/media/images/skybox/sky/sky_posZ.jpg',
                            './app/media/images/skybox/sky/sky_negZ.jpg'
                        ]
                    }
                }
            } //actors
        } //vrscene
    },
    // actions - default fifo=[] in queue
    // _actions = t/f/undefined => load seq/remove seq:load []/append seq
    // sequence is array of actions {t:, f:, o:, ms:}
    // dt/et are in decimal seconds!!!
    // actions:{_actions:boolean,
    //          sequence_url:string}  // sequence is url of specific sequence 
    //                               // array of Action-Objects 
    //                              // (see models/actions/sequence.interface.ts
    actions: {
        _actions: true,
        sequence_url: '../models/actions/sequences/audio/startonly.js'
    } //actions:{}
};
export { config, state };
//# sourceMappingURL=scene.js.map
//# sourceMappingURL=sgpointcloudlinespost-rmexpt1-vrskybox7.js.map
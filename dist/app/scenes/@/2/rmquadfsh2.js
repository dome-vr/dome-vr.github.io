// topology2/rmquadfsh2.ts
// webGL2, es300 three.js ==0.125.2
const config = {
    // rendering topology
    // NOTE: topologies 2,3 can NOT be used for VR since they produce 
    // 2D near-plane framebuffers which cannot be rendered in stereo.
    // Use of topologies 2/3 for VR is not prevented - but should not be chosen!
    topology: {
        // webxr?
        _webxr: false,
        topology: 2,
        // displayed_scene = 'sg|rm|vr'
        displayed_scene: 'rm',
        // render sgscene either to display, or to sgTarget offscreen for 
        // bg texturing in rmscene or texturing in vrscene
        _sg: false,
        //use frame n-1 sgTarget.tex ('sg') 
        _sgpost: false,
        // rmstage or vrstage actors 
        sgTargetNames: [],
        // render rmscene to display, or to rmTarget offscreen for texturing 
        // in vrscene - either skybox/skydome/etc. or actors
        // NOTE! true=>must define rmquad and rmTargetName(s)
        _rm: true,
        // rmstage or vrstage actors 
        _rmpost: false,
        rmTargetNames: [],
        //skyfaces:string[];  //used if actor 'skyfaces' exists and is rmTgtName
        //value is some subset of ['f','b','l','r','t','g']
        //order-independent: front,back,left,right,top,ground
        // raymarch - via fragment shader in rmquad ShaderMaterial
        // NOTE! obviously requires rm:t and a vr-actor name in rmTargetNames
        // render vrscene - which implies displayed_scene = 'vr'
        _vr: false,
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
    camera: {},
    // stage - initialization and management of stats performance meter,
    // and actors in one of two possible scenes, sgscene and/or vrscene
    stage: {
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
                        //fsh:'../../../stage/shaders/webgl1/quad_fsh/fsh_rm_expt1.glsl.js',
                        fsh: '../../../stage/shaders/webgl1/quad_fsh/fsh_rm_expt2.glsl.js',
                    }
                }
                //                'rmhud': {
                //                    factory: 'Rmquad',
                //                    url: '../models/stage/actors/raymarch/rmquad.js',
                //                    options: {
                //                        opacity:0.5,
                ////                      vsh:'../../../stage/shaders/webgl2/vertex/vsh_default.glsl.js',
                ////                      fsh:'../../../stage/shaders/webgl2/fragment/fsh_color.glsl.js',
                //                      vsh:'../../../stage/shaders/webgl1/quad_vsh/vsh_default.glsl.js',
                //                      fsh:'../../../stage/shaders/webgl1/quad_fsh/fsh_tDiffuse.glsl.js',
                //                      //texture:'./app/media/images/glad.png',
                //                      transform:{t:[0.0,0.0,0.001], s:[.5,.5,1.0]}
                //                    }
                //                },
                //
                //                //hud-planeXY is at z=.001 - i.e. (0,0,.001) 
                //                //whereas rmquad (due to fsh) is at z=0, i.e (0,0,0)
                //                //rmlens is at (0,0,1)
                //                'rmplane':{ 
                //                   factory:'PlaneXY',
                //                   url:'../models/stage/actors/objects/planeXY.js',
                //                   options:{
                //                        wireframe:false, 
                //                        color:'blue', 
                //                        opacity:0.5, 
                //                        width:2,
                //                        height:2,
                //                        transform:{t:[0,0,.001]} 
                //                        //neg z-values ruin transparency  ?!!
                //                  } 
                //                }
            } //actors
        } //rmscene
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
//# sourceMappingURL=rmquadfsh2.js.map
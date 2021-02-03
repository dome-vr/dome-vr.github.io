// narrative-webvr.ts 
// substates
import {camera} from './state/camera';
import {stage} from './state/stage';
import {cloud} from './state/cloud';
import {space} from './state/space';
import {audio} from './state/audio';
import {vrstage} from './state/vrstage';
import {action} from './state/action';

//services
import {queue} from './services/queue';
import {mediator} from './services/mediator';
import {animation} from './services/animation';
import {c3d} from './services/camera3d';
import {vrspace} from './services/vrspace';

// shaders
import {vsh} from './models/space/quad_vsh/vsh_default.glsl';
import {fsh} from './models/space/quad_fsh/fsh_default.glsl';
import {uniforms} from './models/space/quad_fsh/fsh_default.glsl';



// singleton closure-instance variable
var narrative:Narrative,
    state:any,
    stats:any,
    TWEEN:any,


    // needed in animate-render-loop
    _stats:boolean = true,
    _cloud:boolean = false,
    // start time (first nar.changeState()) and elapsed time from start
    // animating is flag indicating whether animation has begun (t) or not (f)
    clock = new THREE.Clock(),
    _deltaTime:boolean = true,
    //dt:number = 0,  // deltaTime from clock  
    et:number = 0,  // elapsedTime from clock  
    t0:number = 0,  // deltaTime/elapsedTime from clock <=> _deltaTime = t/f  
    at:number = 0,  // deltaTime/elapsedTime in action msg <=> _deltaTime = t/f 
    animating:boolean = false,


    // scale factor for stage actor objects = csphere_radius
    csph_r:number = 1.0,

    // renderer
    canvas:any,
    scene:THREE.Scene,
    rm_scene:THREE.Scene,
    renderer:THREE.WebGLRenderer,
    clearColor:number = 0xffffff,
    alpha:number = 0.0,  // opaque so see clearColor white
    antialias:boolean = false,

    // camera instrument components - built and returned by camera.initialize
    csphere:THREE.Mesh,
    key:THREE.Light,
    fill:THREE.Light,
    back:THREE.Light,
    controls:any,
    lens:THREE.Camera,
    hud_g:THREE.PlaneGeometry,
    hud_m:THREE.ShaderMaterial,
    hud:THREE.Mesh,
    hud_scaleX:number = 1.0,
    hud_scaleY:number = 1.0,

    // quad for raymarch mapped by sgTarget.texture 
    quad_g:THREE.Geometry,
    quad_m:THREE.Material,
    quad:THREE.Mesh,

    // resize
    width:number = window.innerWidth,
    height:number = window.innerHeight,

    // animate-render
    _raymarch:boolean = false,
    a:any,
    period:number,
    sprite:THREE.Sprite,
    material:THREE.SpriteMaterial,
    scale:number,
    imageWidth:number,
    imageHeight:number,
    i:number,
    l:number,
    sgTarget: THREE.WebGLRenderTarget,
    postTarget: THREE.WebGLRenderTarget, // post-processing

    // for cloud rotations
    cloud_pivot:THREE.Object3D,

    // returned by stage.delta
    cube:THREE.Mesh,
    dome:THREE.Mesh,
    axes:THREE.AxesHelper,
    ambient_light:THREE.AmbientLight,
    fog:THREE.Fog,

    // returned by cloud.delta
    group:THREE.Group,

    // returned by action.delta
    _action:boolean,
    actions:Object[],

    // render variables
    rm_point:THREE.Object3D = new THREE.Object3D(),
    rm_pivot:THREE.Object3D = new THREE.Object3D(),
    world_q:THREE.Quaternion = new THREE.Quaternion(),
    world_qp:THREE.Quaternion = new THREE.Quaternion(),
    lens_q:THREE.Quaternion = new THREE.Quaternion(),
    cam_up:THREE.Vector3 = new THREE.Vector3(),
    //cam_fwd:THREE.Vector3 = new THREE.Vector3(),
    //cam_right:THREE.Vector3 = new THREE.Vector3(),
    lens_posp:THREE.Vector3 = new THREE.Vector3(),
    delta_pos:THREE.Vector3 = new THREE.Vector3(),
    fov_initial:number = 90,
    fovp:number,
    aspect:number,
    aspectp:number,

    // post
    transparent_texture:THREE.Texture = (new THREE.TextureLoader()).load('./assets/images/transparent_pixel.png'),

    // webvr
    _webvr:boolean = false, 
    _webvr_skybox:boolean = false, 
    _webvr_skycube:boolean = false, 
    _webvr_skycube_faces:boolean = false, 
    _webvr_skydome:boolean = false,
    vr_scene:THREE.Scene,
    vr_cube:THREE.Mesh,
    //vr_cubeTexture:THREE.CubeTexture,
    //vr_cubeCamera:THREE.CubeCamera,
    vr_dome:THREE.Mesh,
    vr_group:THREE.Group,
    vr_face:THREE.Mesh[] = [],

    // vive
    _vive:boolean = false, 
    vive_controller1:THREE.ViveController,
    vive_controller2:THREE.ViveController,

    // vr_scene
    vr_ambient_light:THREE.AmbientLight,
    vr_axes:THREE.AxesHelper,
    vr_fog:THREE.Fog,


    // TEMP !!!!
    frame:number = 0,
    //test_texture:THREE.Texture = (new THREE.TextureLoader()).load('./assets/images/glad.png'),
    // useless Vector3 copy in getWorldDirection and getworldPosition
    vcopy:Vector3 = new THREE.Vector3,

    onWindowResize:any = () => {
      var aspect;
      width = window.innerWidth;
      height = window.innerHeight;
      aspect = width/height;
      canvas.width = width;
      canvas.height = height;
      lens.aspect = aspect;
      lens.updateProjectionMatrix();
      renderer.setSize(width, height);

      // resolution
      quad.material.uniforms.uResolution.value = new THREE.Vector2(width,height);
      quad.material.uniforms.uResolution.needsUpdate = true;

      //hud.scale.set(aspect, 1.0, 1.0);     // one-half width, height
      hud.scale.set(2.0*aspect, 2.0, 1.0);  // full-screen
      //mediator.log(`canvas w=${canvas.width} h=${canvas.height}`);
    },   


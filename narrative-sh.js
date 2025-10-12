//narrative-sh.js
//GLSL3.0

//import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
//import { VRButton } from 'https://unpkg.com/three@0.165.0/examples/jsm/webxr/VRButton.js';
//import Stats from 'https://esm.sh/stats.js@0.17.0';

import * as THREE from './dependencies/three/build/three.module.js';
import { VRButton } from './dependencies/three/examples/jsm/webxr/VRButton.js';
import Stats from './dependencies/three/examples/jsm/libs/stats.module.js';


let Anim; // safe stub to avoid ReferenceError
let camera;


export function bootstrap(userConfig = {}) {
  initialize(normalizeConfig(userConfig)).catch(err => {
    console.error('[narrative-sh.js] initialize error:', err);
    showFatalErrorPanel(String(err?.message || err));
  });
}

// ---------- utilities ----------
const get = (a,b,c,d) => (a !== undefined ? a : (b !== undefined ? b : (c !== undefined ? c : d)));
function clamp(x,a,b){ return isFinite(x) ? Math.min(b, Math.max(a, x)) : a; }
function vec3(v,d){ return (Array.isArray(v) && v.length===3) ? [Number(v[0]),Number(v[1]),Number(v[2])] : d; }
function stripVersion(src){ return src.replace(/^\s*#version.*$/gm,''); }
async function fetchText(u){ const r = await fetch(u); if(!r.ok) throw new Error('load '+u+' failed ('+r.status+')'); return await r.text(); }
function showFatalErrorPanel(msg){
  try{
    let el = document.getElementById('fatal-error-panel');
    if(!el){
      el = document.createElement('div');
      el.id = 'fatal-error-panel';
      Object.assign(el.style, {
        position:'fixed', left:'12px', bottom:'12px', maxWidth:'50vw',
        background:'#2b2f36', color:'#ffb4b4', padding:'10px 12px',
        border:'1px solid #703', borderRadius:'8px', fontFamily:'monospace',
        fontSize:'12px', zIndex: 10002, whiteSpace:'pre-wrap'
      });
      document.body.appendChild(el);
    }
    el.textContent = '[narrative-sh] ' + msg;
  }catch(_){}
}

// ---------- config ----------
function normalizeConfig(u){
  const q = u.quality || {};
  const initialView = vec3(get(u['initial-viewpoint'], u.initialViewpoint, u.viewpoint, u.initialView), [0,0,10]);
  const initialPan  = Number(get(u['initial-pan'],  u.initialPan,  undefined, 0));
  const initialTilt = Number(get(u['initial-tilt'], u.initialTilt, undefined, 0));
  const alignTranslate = vec3(get(u['align-translate'], u.alignTranslate, undefined, undefined), [0,0,0]);

  // U-Dome
  const ud = (u.udome || u.udomeConfig || {});
  const _udCenter = get(u['udome-center'], ud.fractalCenter, u.udomeFractalCenter, [0,0,0]);
  const _udSize   = get(u['udome-size'],   ud.fractalSize,   u.udomeFractalSize,   1.0);
  const _udAmb    = get(u['udome-ambient'], ud.ambient,      u.udomeAmbient,       0.10);
  const _udHead   = get(u['udome-headlight'], ud.headlight,  u.udomeHeadlight,     1.0);

  // Color cycling configuration
  const colorCycle = u.colorCycle;
  const hasColorCycleConfig = colorCycle && 
                             typeof colorCycle === 'object' && 
                             !Array.isArray(colorCycle) &&
                             Object.keys(colorCycle).length > 0;
  
  let colorCycleActive = false;
  let colorCycleSpeed = 1.0;
  let colorCycleAmplitude = 0.3;
  let colorCycleOffset = [0.0, 0.33, 0.67];
  let colorCyclePhase = [0.0, 2.094, 4.188];
  
  if (hasColorCycleConfig) {
    // Default active to true if colorCycle object is provided
    colorCycleActive = Boolean(get(colorCycle.active, undefined, undefined, true));
    colorCycleSpeed = Number(get(colorCycle.speed, undefined, undefined, 1.0));
    colorCycleAmplitude = Number(get(colorCycle.amplitude, undefined, undefined, 0.3));
    colorCycleOffset = vec3(get(colorCycle.offset, undefined, undefined), [0.0, 0.33, 0.67]);
    colorCyclePhase = vec3(get(colorCycle.phase, undefined, undefined), [0.0, 2.094, 4.188]);
    
    console.log('[narrative-sh] Color cycling configuration found:');
    console.log('  active:', colorCycleActive);
    console.log('  speed:', colorCycleSpeed);
    console.log('  amplitude:', colorCycleAmplitude);
    console.log('  offset:', colorCycleOffset);
    console.log('  phase:', colorCyclePhase);
  } else {
    console.log('[narrative-sh] No color cycling configuration (config.colorCycle undefined/empty)');
    console.log('  colorCycleActive will be false, static colors only');
  }

  // Audio configuration
  const audioConfig = u.audio;
  let normalizedAudio = null;
  
  if (audioConfig && typeof audioConfig === 'object' && Object.keys(audioConfig).length > 0) {
    normalizedAudio = {
      url: String(audioConfig.url || ''),
      volume: Number(get(audioConfig.volume, undefined, undefined, 1.0)),
      playbackRate: Number(get(audioConfig.playbackRate, undefined, undefined, 1.0)),
      loop: Boolean(get(audioConfig.loop, undefined, undefined, false))
    };
    
    console.log('[narrative-sh] Audio configuration found:');
    console.log('  url:', normalizedAudio.url);
    console.log('  volume:', normalizedAudio.volume);
    console.log('  playbackRate:', normalizedAudio.playbackRate);
    console.log('  loop:', normalizedAudio.loop);
  } else {
    console.log('[narrative-sh] No audio configuration (config.audio undefined/empty)');
  }

  console.log(`narrative-sh.normalizeConfig`);
  return {
    animation: u.animation || null,
    shader: get(u.shader, undefined, undefined, '../shaders/sphere.frag'),
    sky: u.sky, // Pass through complete sky config
    audio: normalizedAudio, // Pass through normalized audio config

    uDomeCenter: vec3(_udCenter, [0,0,0]),
    uDomeSize:   Number(_udSize),
    uAmbient:    Number(_udAmb),
    uHeadlight:  Number(_udHead),

    alignTranslate,
    initialPan, initialTilt, initialView,
    fov:     Number(get(u.initialFov, u.fov, q.fov, undefined, 90)),
    far:     Number(get(u.far, q.far, undefined, 40000.0)),
    steps:   Number(get(u.steps,   q.steps,   undefined, 768)),
    eps:     Number(get(u.eps,     q.eps,     undefined, 0.00022)),
    ndelta:  Number(get(u.ndelta,  q.ndelta,  undefined, 0.00040)),
    ao:      Number(get(u.ao,      q.ao,      undefined, 14)),
    shadow:  Number(get(u.shadow,  q.shadow,  undefined, 96)),
    fbscale: clamp(Number(get(u.fbscale, q.fbscale, undefined, 0.90)), 0.25, 1.0),
    pr:      clamp(Number(get(u.pr,      q.pr,      undefined, 1.0)),  0.5,  2.0),
    aa:      !!get(u.aa,      q.aa,      undefined, false),
    stereo:  !!get(u.stereo,  q.stereo,  undefined, false),

    // navigation knobs
    shaderNavigation: get(u['shader-navigation'], u.shaderNavigation, undefined, false),
    yawDegPerSec:   Number(get(u.yawDegPerSec,   undefined, undefined, 45)),
    pitchDegPerSec: Number(get(u.pitchDegPerSec, undefined, undefined, 30)),
    zoomDegPerSec:  Number(get(u.zoomDegPerSec, undefined, undefined, 30)),
    navSpeed:       Number(get(u.navSpeed,       undefined, undefined, 2.5)),

    // shading path
    useOriginalShadingAndColor: !!u.useOriginalShadingAndColor, 

    // color cycling properties (5 total)
    colorCycleActive: colorCycleActive,
    colorCycleSpeed: colorCycleSpeed,
    colorCycleAmplitude: colorCycleAmplitude,
    colorCycleOffset: colorCycleOffset,
    colorCyclePhase: colorCyclePhase,

    // debug passthrough (object only)
    debug: (u.debug || {})
  };
}

// ---------- uniforms / sky ----------
function makeUniforms(w,h,C){
  const toV3 = (x)=> new THREE.Vector3(x[0],x[1],x[2]);
  const defCols = [
    new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1),
    new THREE.Vector3(1,1,0), new THREE.Vector3(1,0,1), new THREE.Vector3(0,1,1)
  ];
  
  console.log('[narrative-sh] Creating uniforms with color cycling values:');
  console.log('  uColorCycleActive:', Boolean(C.colorCycleActive));
  console.log('  uColorCycleSpeed:', C.colorCycleSpeed);
  console.log('  uColorCycleAmplitude:', C.colorCycleAmplitude);
  console.log('  uColorCycleOffset:', C.colorCycleOffset, '→', toV3(C.colorCycleOffset));
  console.log('  uColorCyclePhase:', C.colorCyclePhase, '→', toV3(C.colorCyclePhase));
  
  return {
    uDomeCenter:  { value: toV3(C.uDomeCenter) },
    uDomeSize:    { value: C.uDomeSize },
    uAmbient:     { value: C.uAmbient },
    uHeadlight:   { value: C.uHeadlight },
    uUseOriginalShadingAndColor: { value: Boolean(C.useOriginalShadingAndColor) },

    uSkyMode:        { value: 0 }, // 0=black, 1=faceColors, 2=cubeTexture
    uSkyFaceColors:  { value: defCols },
    uSkyCube:        { value: null },

    // Color cycling uniforms (5 total - 1:1 mapping with config properties)
    uColorCycleActive:    { value: Boolean(C.colorCycleActive) },
    uColorCycleSpeed:     { value: C.colorCycleSpeed },
    uColorCycleAmplitude: { value: C.colorCycleAmplitude },
    uColorCycleOffset:    { value: toV3(C.colorCycleOffset) },
    uColorCyclePhase:     { value: toV3(C.colorCyclePhase) },

    iTime:       { value: 0 },
    iTimeDelta:  { value: 0 },
    iFrame:      { value: 0 },
    iResolution: { value: new THREE.Vector3(w,h,1) },
    uInvViewMatrix: { value: new THREE.Matrix4() },
    uInvProjMatrix: { value: new THREE.Matrix4() },
    uDebugStereo:  { value: C.stereo },
    uMaxSteps:     { value: C.steps },
    uHitEps:       { value: C.eps },
    uNormalDelta:  { value: C.ndelta },
    uAoSamples:    { value: C.ao },
    uShadowSteps:  { value: C.shadow },
    uFar:          { value: C.far },
    uAlignTranslate: { value: toV3(C.alignTranslate) },
  
    // Debug uniforms (universal)
    uDebugMode:   { value: Number((C.debug && C.debug.mode != null) ? C.debug.mode : 0) },

    uDebugColor:  { value: (function(){ 
      // default red; we keep it simple here (shader may ignore unless mode==3)
      return new THREE.Vector3(1,0,0);
    })() },
    uDebugData:   { value: new THREE.Vector4(0,0,0,0) }
  };
}

function initializeAudio(audio){
  // Early exit if no audio config or empty URL
  if (!audio || typeof audio !== 'object' || !audio.url || audio.url.trim() === '') {
    console.log('[narrative-sh] No valid audio configuration - skipping audio initialization');
    return;
  }

  console.log('[narrative-sh] Initializing audio with config:', audio);
  
  // ? NEW: Create the audio button dynamically
  let startAudio = document.getElementById('startAudio');
  
  if (!startAudio) {
    console.log('[narrative-sh] Creating audio button dynamically');
    startAudio = document.createElement('button');
    startAudio.id = 'startAudio';
    startAudio.textContent = 'enable audio';
    
    // Apply the specified styles
//    Object.assign(startAudio.style, {
//      position: 'absolute',
//      zIndex: '10',
//      left: '2%',
//      top: '93.5%',
//      padding: '0',
//      margin: '0',
//      borderRadius: '0em',
//      boxSizing: 'border-box',
//      textDecoration: 'none',
//      fontFamily: "'Roboto',sans-serif",
//      fontWeight: '300',
//      color: 'gray',
//      backgroundColor: 'black',
//      textAlign: 'center',
//      transition: 'all 0.2s'
//    });

     Object.assign(startAudio.style, {
      position: 'absolute',
      zIndex: '10',

      //left: '0%',       //under stats
      //top: '9.25%',      
      //left: '13.25%',       //under Mode:world
      //top: '9.25%',      
      top: '90.5%',              // ? Changed: lower-left corner of page
      left: '1%',      

      padding: '8px 16px',    // ? Changed: added padding for better visibility
      margin: '0',
      borderRadius: '4px',    // ? Changed: slightly rounded corners
      boxSizing: 'border-box',
      textDecoration: 'none',
      fontFamily: "'Roboto',sans-serif",
      fontWeight: '400',      // ? Changed: slightly bolder
      color: '#FFFFFF',       // ? Changed: bright white text
      backgroundColor: '#1a1a1a', // ? Changed: dark but not pure black
      //border: '1px solid #444',   // ? Added: subtle border for definition
      border: '2px solid #bbb',   // ? Added: subtle border for definition
      textAlign: 'center',
      transition: 'all 0.2s',
      cursor: 'pointer'       // ? Added: shows it's clickable
    });   

    document.body.appendChild(startAudio);
    console.log('[narrative-sh] Audio button created and added to DOM');
  }

  
  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  const audioLoader = new THREE.AudioLoader();
  const _audio = new THREE.Audio(audioListener);

  if(startAudio){
    startAudio.addEventListener('click', function(){
      console.log(`[narrative-sh] Loading audio from: ${audio.url}`);
      console.log(`  loop: ${audio.loop}`);
      console.log(`  volume: ${audio.volume}`);
      console.log(`  playbackRate: ${audio.playbackRate}`);
      startAudio.remove();
      
      audioLoader.load(audio.url, function(buffer){
        _audio.setBuffer(buffer);
        _audio.setLoop(audio.loop);
        _audio.setVolume(audio.volume);
        _audio.setPlaybackRate(audio.playbackRate);
        _audio.play();
        console.log('[narrative-sh] Audio playback started');
      }, undefined, function(err){
        console.error('[narrative-sh] Audio loading failed:', err);
      });
    });
  } else {
    console.warn('[narrative-sh] startAudio button not found in DOM - audio will not be available');
  }
}

function parseColor(c) {
  const col = new THREE.Color();
  if (typeof c === 'number') col.setHex(c); else col.set(c);
  col.convertSRGBToLinear();
  return new THREE.Vector3(col.r, col.g, col.b);
}

function applySky(C, uniforms, stage, far){
  const sky = C.sky;
  
  console.log('[narrative-sh.js] applySky called with config:', sky);
  
  // BLACK BACKGROUND cases:
  // [1] config.sky undefined
  // [2] config.sky = {}
  // [3] config.sky.mode undefined
  if (!sky || 
      (typeof sky === 'object' && Object.keys(sky).length === 0) ||
      sky.mode === undefined) {
    
    console.log('[narrative-sh.js] Sky mode: BLACK (no skybox) - undefined/empty/no mode');
    uniforms.uSkyMode.value = 0; // Black background
    return;
  }

  const mode = sky.mode;
  
  if (mode === 'faceColors') {
    console.log('[narrative-sh.js] Sky mode: FACE COLORS');
    
    const faceColors = sky.faceColors;
    uniforms.uSkyMode.value = 1; // faceColors mode
    
    // Case 1: faceColors undefined or empty array -> use shader's faceColor() defaults
    if (!faceColors || (Array.isArray(faceColors) && faceColors.length === 0)) {
      console.log('[narrative-sh.js] faceColors undefined/empty -> using shader faceColor() defaults');
      return;
    }
    
    if (!Array.isArray(faceColors)) {
      console.log('[narrative-sh.js] faceColors not an array -> using shader faceColor() defaults');
      return;
    }
    
    // Case 2: Exactly 6 colors -> use custom colors via uSkyFaceColors uniform
    if (faceColors.length === 6) {
      console.log('[narrative-sh.js] Six face colors -> setting uSkyFaceColors uniform:', faceColors);
      const colors = [];
      for (let i = 0; i < 6; i++) {
        colors.push(parseColor(faceColors[i]));
      }
      uniforms.uSkyFaceColors.value = colors;
      console.log('[narrative-sh.js] INTENDED RESULT: Custom skybox with 6 specified colors in +X,-X,+Y,-Y,+Z,-Z order');
      return;
    }
    
    // Case 3: Any other length -> use shader faceColor() defaults
    console.log('[narrative-sh.js] faceColors length', faceColors.length, '-> using shader faceColor() defaults');
    return;
  }
  
  if (mode === 'cubeTextures') {
    console.log('[narrative-sh.js] Sky mode: CUBE TEXTURES');
    
    const cubeTextures = sky.cubeTextures;
    
    // Case 1: cubeTextures undefined, empty array, or wrong length -> 6-color default
    if (!cubeTextures || 
        (Array.isArray(cubeTextures) && cubeTextures.length === 0) ||
        (Array.isArray(cubeTextures) && cubeTextures.length !== 6)) {
      
      console.log('[narrative-sh.js] cubeTextures undefined/empty/wrong length -> using 6-color default');
      uniforms.uSkyMode.value = 1; // Use faceColors mode with defaults
      console.log('[narrative-sh.js] INTENDED RESULT: Default 6-color cube (shader faceColor() function)');
      return;
    }
    
    // Case 2: Array of exactly 6 URLs -> load cube texture
    if (Array.isArray(cubeTextures) && cubeTextures.length === 6) {
      console.log('[narrative-sh.js] Six cube texture URLs -> loading cube texture:', cubeTextures);
      uniforms.uSkyMode.value = 3; // cubeTextures mode (matches shader uSkyMode==3)
      
      new THREE.CubeTextureLoader().load(cubeTextures, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        uniforms.uSkyCube.value = tex;
        console.log('[narrative-sh.js] Cube texture loaded successfully');
      }, undefined, (err) => {
        console.warn('[narrative-sh.js] Cube texture loading failed:', err);
        console.log('[narrative-sh.js] Falling back to 6-color default due to texture load failure');
        uniforms.uSkyMode.value = 1; // Fallback to faceColors
      });
      
      console.log('[narrative-sh.js] INTENDED RESULT: Cube texture skybox with 6 loaded textures in +X,-X,+Y,-Y,+Z,-Z order');
      return;
    }
    
    // Case 3: Invalid cubeTextures format -> 6-color default
    console.log('[narrative-sh.js] Invalid cubeTextures format -> using 6-color default');
    uniforms.uSkyMode.value = 1;
    console.log('[narrative-sh.js] INTENDED RESULT: Default 6-color cube due to invalid cubeTextures format');
    return;
  }
  
  // Unrecognized mode -> use shader faceColors default (mode 1)
  console.log('[narrative-sh.js] Unrecognized sky mode:', mode, '-> using faceColors default');
  uniforms.uSkyMode.value = 1; // faceColors mode with shader defaults
  console.log('[narrative-sh.js] INTENDED RESULT: Default 6-color cube due to unrecognized mode');
}

function buildMaterial(fragmentSource,C,uniforms){
  const fragUser = stripVersion(fragmentSource);
  
  // FIXED: Remove the #version 300 es from prelude since Three.js RawShaderMaterial adds it automatically
  const prelude = `precision highp float;
  precision highp int;
  precision highp sampler2D;      
  precision highp samplerCube;   
  #ifndef MAX_MARCH_STEPS
  #define MAX_MARCH_STEPS ${C.steps}
  #endif
  #ifndef HIT_EPSILON
  #define HIT_EPSILON ${C.eps}
  #endif
  #ifndef NORMAL_EPSILON
  #define NORMAL_EPSILON ${C.ndelta}
  #endif
  #ifndef AO_SAMPLES
  #define AO_SAMPLES ${C.ao}
  #endif
  #ifndef SHADOW_STEPS
  #define SHADOW_STEPS ${C.shadow}
  #endif
  #ifndef FAR_PLANE
  #define FAR_PLANE ${C.far}
  #endif
  `;
  const frag = prelude + "\n#line 0\n" + fragUser;
  
  return new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: `in vec3 position;
      out vec2 vNDC;
      void main(){ vNDC = position.xy; gl_Position = vec4(position,1.0); }
    `,
    fragmentShader: frag,
    uniforms,
    depthWrite: false,
    depthTest: false
  });
}

function makeFullscreenTriangle(){
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]);
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  return geo;
}

// ---------- main ----------
async function initialize(C){  
  // Store initial state for home function
  const INITIAL_STATE = {
    view: [...(C.initialView || [0,0,10])],
    pan: C.initialPan || 0,
    tilt: C.initialTilt || 0,
    fov: C.fov || 90
  };

  const renderer = new THREE.WebGLRenderer({ antialias: C.aa, alpha:false, depth:false, stencil:false, powerPreference:'high-performance' });
  renderer.setClearColor(0x000000, 1.0); // Black clear color for sky mode 0
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(C.pr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  if (renderer.xr.setFramebufferScaleFactor) renderer.xr.setFramebufferScaleFactor(C.fbscale);
  document.body.appendChild(VRButton.createButton(renderer));
  document.body.appendChild(renderer.domElement);

  
  const stats = new Stats(); document.body.appendChild(stats.dom);
  // HUD: set navigation mode label once at initialize
  
  // HUD: live navigation mode label (updates whenever C.shaderNavigation changes)
  let __hudMode = null;
  function updateHudMode(){
    try {
      const el = document.getElementById('mode');
      if (!el) return;
      const want = (C.shaderNavigation ? 'shader' : 'world');
      if (want !== __hudMode){ el.textContent = want; __hudMode = want; }
    } catch(_) {}
  }
  
  const scene = new THREE.Scene();
  const stage = new THREE.Group(); scene.add(stage);

  // initial world transform
  const [vx,vy,vz] = C.initialView;
  stage.position.set(-vx,-vy,-vz);
  stage.rotation.set(0,0,0,'YXZ');
  stage.rotation.y -= THREE.MathUtils.degToRad(C.initialPan);
  stage.rotation.x -= THREE.MathUtils.degToRad(C.initialTilt);

  camera = new THREE.PerspectiveCamera((C.fov||90), window.innerWidth/window.innerHeight, 0.05, C.far);
  camera.position.set(0,0,10);
  
  // FOV helpers
  const FOV_MIN = 5, FOV_MAX = (typeof C.fovMax==='number'?C.fovMax:170);
  function applyFov(f){ camera.fov = Math.min(FOV_MAX, Math.max(FOV_MIN, f)); camera.updateProjectionMatrix(); }
  function zoomStepDegrees(dir, spdDegPerSec, dt){
    const dfov = -dir * (spdDegPerSec||30) * dt; // dir:+1=in (smaller FOV), -1=out
    applyFov(camera.fov + dfov);
  }

  // uniforms + sky
  const fragSrc = await fetchText(C.shader);
  const uniforms = makeUniforms(window.innerWidth, window.innerHeight, C);

  console.log('[narrative-sh] uUseOriginalShadingAndColor =', Boolean(C.useOriginalShadingAndColor));
  applySky(C, uniforms, stage, C.far);

  const mat = buildMaterial(fragSrc, C, uniforms);
  //mat.name = '';  //to avoid three.js injected glsl-bad slash tokens
  const quad = new THREE.Mesh(makeFullscreenTriangle(), mat);
  scene.add(quad);

  // navigation matrices
  const navFromWorld = new THREE.Matrix4();
  function updateNavMatrix(){
    // SAFEST: use the full world transform (quaternion-based, hierarchy-aware)
    // Ensures rotation (including quaternion updates) + translation are reflected in uInvViewMatrix.
    stage.updateMatrixWorld(true);
    navFromWorld.copy(stage.matrixWorld).invert();
  }
  updateNavMatrix();

  // shader navigation state
  const shViewTranslate = new THREE.Vector3(0,0,0);
  const shViewQuat = new THREE.Quaternion();
  const shViewMat  = new THREE.Matrix4();

  function updateShViewMat(){
    const T = new THREE.Matrix4().makeTranslation(shViewTranslate.x, shViewTranslate.y, shViewTranslate.z);
    const R = new THREE.Matrix4().makeRotationFromQuaternion(shViewQuat);
    shViewMat.multiplyMatrices(T, R);
  }

  updateShViewMat();

  // orbit rotation state - SEPARATE YAW AND PITCH
  let shOrbitYaw = 0.0;   // Accumulated yaw angle in radians
  let shOrbitPitch = 0.0; // Accumulated pitch angle in radians
  const shOrbitMat = new THREE.Matrix4();
  
  function updateShOrbitMat(){
    // Create separate yaw and pitch rotations, apply in fixed order
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), shOrbitYaw);
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), shOrbitPitch);
    
    // Combine: yaw first, then pitch (Y * X order)
    const combinedQuat = new THREE.Quaternion().multiplyQuaternions(yawQuat, pitchQuat);
    
    const R = new THREE.Matrix4().makeRotationFromQuaternion(combinedQuat);
    const TtoCenter = new THREE.Matrix4().makeTranslation(fractalCenter.x, fractalCenter.y, fractalCenter.z);
    const TfromCenter = new THREE.Matrix4().makeTranslation(-fractalCenter.x, -fractalCenter.y, -fractalCenter.z);
    
    shOrbitMat.multiplyMatrices(TtoCenter, R);
    shOrbitMat.multiply(TfromCenter);
  }

  // Fractal centering
  const fractalCenter = new THREE.Vector3(
    Number(C.uDomeCenter?.[0] ?? 0),
    Number(C.uDomeCenter?.[1] ?? 0),
    Number(C.uDomeCenter?.[2] ?? 0)
  );
  const fractalCenterMat = new THREE.Matrix4();
  function updateFractalCenterMat() {
    fractalCenterMat.makeTranslation(-fractalCenter.x, -fractalCenter.y, -fractalCenter.z);
    if (quad?.material?.uniforms?.uDomeCenter?.value) {
      quad.material.uniforms.uDomeCenter.value.set(fractalCenter.x, fractalCenter.y, fractalCenter.z);
    }
  }
  function setFractalCenter(arr3){
    const x = Number(arr3?.[0] ?? 0), y = Number(arr3?.[1] ?? 0), z = Number(arr3?.[2] ?? 0);
    fractalCenter.set(x,y,z);
    updateFractalCenterMat();
    updateShOrbitMat();
  }
  updateFractalCenterMat();
  if (typeof window!=='undefined') window.setFractalCenter = setFractalCenter;

// Camera-basis helpers
function getCameraBasis(camera){
  camera.updateMatrixWorld(true);
  const e = camera.matrixWorld.elements;
  const right   = new THREE.Vector3(e[0],  e[1],  e[2]).normalize();
  const up      = new THREE.Vector3(e[4],  e[5],  e[6]).normalize();
  const forward = new THREE.Vector3(e[8],  e[9],  e[10]).normalize().negate();
  return { right, up, forward };
}

function navDeltaInWorld(dx, dy, dz, camera){
  camera.updateMatrixWorld(true);
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward).normalize();
  const up = new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion).normalize();
  const right = new THREE.Vector3().crossVectors(forward, up).normalize();
  return new THREE.Vector3()
    .addScaledVector(right,   dx)
    .addScaledVector(up,      dy)
    .addScaledVector(forward, dz);
}

// World navigation functions
const wDollyXLeft   = (v)=>{ const d=navDeltaInWorld(-v,0,0,camera); stage.position.sub(d); updateNavMatrix(); };
const wDollyXRight  = (v)=>{ const d=navDeltaInWorld(+v,0,0,camera); stage.position.sub(d); updateNavMatrix(); };
const wDollyYUp     = (v)=>{ const d=navDeltaInWorld(0,+v,0,camera); stage.position.sub(d); updateNavMatrix(); };
const wDollyYDown   = (v)=>{ const d=navDeltaInWorld(0,-v,0,camera); stage.position.sub(d); updateNavMatrix(); };
const wDollyZFwd    = (v)=>{ const d=navDeltaInWorld(0,0,+v,camera); stage.position.sub(d); updateNavMatrix(); };
const wDollyZBack   = (v)=>{ const d=navDeltaInWorld(0,0,-v,camera); stage.position.sub(d); updateNavMatrix(); };

const wPanLeftHeadc   = (ang)=>{ const pivot=camera.getWorldPosition(new THREE.Vector3()); rotateStageAroundPoint(pivot, new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion), -ang); };
const wPanRightHeadc  = (ang)=>{ const pivot=camera.getWorldPosition(new THREE.Vector3()); rotateStageAroundPoint(pivot, new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion), +ang); };
const wPanLeftOrbit   = (ang)=>{ const pivot=fractalCenter; rotateStageAroundPoint(pivot, new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion), +ang); };
const wPanRightOrbit  = (ang)=>{ const pivot=fractalCenter; rotateStageAroundPoint(pivot, new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion), -ang); };

const wTiltUpHeadc    = (ang)=>{ const pivot=camera.getWorldPosition(new THREE.Vector3()); rotateStageAroundPoint(pivot, new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), -ang); };
const wTiltDownHeadc  = (ang)=>{ const pivot=camera.getWorldPosition(new THREE.Vector3()); rotateStageAroundPoint(pivot, new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), +ang); };
const wTiltUpOrbit    = (ang)=>{ const pivot=fractalCenter; rotateStageAroundPoint(pivot, new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), +ang); };
const wTiltDownOrbit  = (ang)=>{ const pivot=fractalCenter; rotateStageAroundPoint(pivot, new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), -ang); };

// Shader navigation functions - dolly
const shDollyXLeft   = (v)=>{ const right = new THREE.Vector3(1,0,0).applyQuaternion(shViewQuat); shViewTranslate.addScaledVector(right, -v); updateShViewMat(); };
const shDollyXRight  = (v)=>{ const right = new THREE.Vector3(1,0,0).applyQuaternion(shViewQuat); shViewTranslate.addScaledVector(right, +v); updateShViewMat(); };
const shDollyYUp     = (v)=>{ const up = new THREE.Vector3(0,1,0).applyQuaternion(shViewQuat); shViewTranslate.addScaledVector(up, +v); updateShViewMat(); };
const shDollyYDown   = (v)=>{ const up = new THREE.Vector3(0,1,0).applyQuaternion(shViewQuat); shViewTranslate.addScaledVector(up, -v); updateShViewMat(); };
const shDollyZFwd    = (v)=>{ const forward = new THREE.Vector3(0,0,-1).applyQuaternion(shViewQuat); shViewTranslate.addScaledVector(forward, +v); updateShViewMat(); };
const shDollyZBack   = (v)=>{ const forward = new THREE.Vector3(0,0,-1).applyQuaternion(shViewQuat); shViewTranslate.addScaledVector(forward, -v); updateShViewMat(); };

// Shader navigation - head-centric rotation
const shPanLeftHeadc   = (ang)=>{ 
  const currentQuat = camera.quaternion.clone().multiply(shViewQuat);
  const upAxis = new THREE.Vector3(0,1,0).applyQuaternion(currentQuat).normalize();
  const deltaQ = new THREE.Quaternion().setFromAxisAngle(upAxis, ang);
  shViewQuat.premultiply(deltaQ);
  updateShViewMat(); 
};

const shPanRightHeadc  = (ang)=>{ 
  const currentQuat = camera.quaternion.clone().multiply(shViewQuat);
  const upAxis = new THREE.Vector3(0,1,0).applyQuaternion(currentQuat).normalize();
  const deltaQ = new THREE.Quaternion().setFromAxisAngle(upAxis, -ang);
  shViewQuat.premultiply(deltaQ);
  updateShViewMat(); 
};

const shTiltUpHeadc    = (ang)=>{ 
  const currentQuat = camera.quaternion.clone().multiply(shViewQuat);
  const rightAxis = new THREE.Vector3(1,0,0).applyQuaternion(currentQuat).normalize();
  const deltaQ = new THREE.Quaternion().setFromAxisAngle(rightAxis, ang);
  shViewQuat.premultiply(deltaQ);
  updateShViewMat(); 
};

const shTiltDownHeadc  = (ang)=>{ 
  const currentQuat = camera.quaternion.clone().multiply(shViewQuat);
  const rightAxis = new THREE.Vector3(1,0,0).applyQuaternion(currentQuat).normalize();
  const deltaQ = new THREE.Quaternion().setFromAxisAngle(rightAxis, -ang);
  shViewQuat.premultiply(deltaQ);
  updateShViewMat(); 
};

// CORRECTED: Shader navigation - orbit rotation around fractal center using separate angles
const shPanLeftOrbit   = (ang)=>{ 
  // Accumulate yaw angle directly (REVERSED DIRECTION)
  shOrbitYaw -= ang;
  updateShOrbitMat(); 
};

const shPanRightOrbit  = (ang)=>{ 
  shOrbitYaw += ang;
  updateShOrbitMat(); 
};

const shTiltUpOrbit    = (ang)=>{ 
  // Accumulate pitch angle directly
  shOrbitPitch += ang;
  updateShOrbitMat(); 
};

const shTiltDownOrbit  = (ang)=>{ 
  shOrbitPitch -= ang;
  updateShOrbitMat(); 
};

// Home functions
const wHome = ()=> resetToInitial();
const shHome = ()=> resetToInitial();

// FOV zoom functions
const zoomIn  = (dt)=> zoomStepDegrees(+1, C.zoomDegPerSec, dt);
const zoomOut = (dt)=> zoomStepDegrees(-1, C.zoomDegPerSec, dt);

updateShOrbitMat();

const viewport = new THREE.Vector4();
quad.onBeforeRender = (renderer, _scene, cam) => {
    // Ensure navFromWorld reflects latest stage quaternion/position every frame
  stage.updateMatrixWorld(true);
  navFromWorld.copy(stage.matrixWorld).invert();
renderer.getViewport(viewport);
  uniforms.iResolution.value.set(viewport.z, viewport.w, 1);

  // CORRECTED matrix composition order
  const base = cam.matrixWorld;
  uniforms.uInvViewMatrix.value.copy(navFromWorld)
    .multiply(shOrbitMat)        // Apply orbit first (around fractal center)
    .multiply(base)              // Then camera transform
    .multiply(shViewMat)         // Then head-centric view transform
    .multiply(fractalCenterMat); // Finally fractal centering

  const pmi = cam.projectionMatrixInverse || cam.projectionMatrix.clone().invert();
  uniforms.uInvProjMatrix.value.copy(pmi);
};

// Keyboard navigation
const keys = new Set();
const handled = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyZ','Space','ShiftLeft','ShiftRight','ControlLeft','ControlRight']);
window.addEventListener('keydown', (e)=>{ 
  if(handled.has(e.code)) e.preventDefault(); 
  keys.add(e.code); 
  if(e.code==='Space'){ 
    const shift = (keys.has('ShiftLeft') || keys.has('ShiftRight')) || !!e.shiftKey;
    if (shift) {
      resetToInitial();        // full Home (position + orientation + FOV)
    } else {
      levelCamera();           // roll-only level
    }
  } 
});
window.addEventListener('keyup',   (e)=>{ if(handled.has(e.code)) e.preventDefault(); keys.delete(e.code); });
window.addEventListener('blur', ()=> keys.clear());
document.addEventListener('visibilitychange', ()=>{ if (document.hidden) keys.clear(); });

function resetToInitial() {
  console.log('Resetting to initial state...');
  
  // Reset world transform to exact initial values
  const v = INITIAL_STATE.view;
  const vx = Number(v[0]), vy = Number(v[1]), vz = Number(v[2]);
  stage.position.set(-vx, -vy, -vz);
  stage.rotation.set(0, 0, 0, 'YXZ');
  stage.rotation.y = -THREE.MathUtils.degToRad(INITIAL_STATE.pan);
  stage.rotation.x = -THREE.MathUtils.degToRad(INITIAL_STATE.tilt);
  updateNavMatrix();

  // Reset shader navigation state completely
  shViewTranslate.set(0, 0, 0);
  shViewQuat.identity();
  updateShViewMat();
  shOrbitYaw = 0.0;
  shOrbitPitch = 0.0;
  updateShOrbitMat();

  // Reset camera FOV
  camera.fov = INITIAL_STATE.fov;
  camera.updateProjectionMatrix();
  
  console.log('Reset complete');
}

function levelCamera() {
  const worldUp = new THREE.Vector3(0, 1, 0);

  if (C.shaderNavigation) {
    // – Shader-nav path: roll-only level by adjusting shViewQuat (preserve yaw/pitch)
    const Qcam = camera.quaternion.clone();
    const Qeff = Qcam.clone().multiply(shViewQuat);

    const fwdWorld = new THREE.Vector3(0, 0, -1).applyQuaternion(Qeff).normalize();
    const upWorld  = new THREE.Vector3(0, 1, 0).applyQuaternion(Qeff).normalize();

    // If forward ~ +/-Y, roll undefined; skip.
    if (Math.abs(fwdWorld.dot(worldUp)) > 0.9999) return;

    // Desired up direction is projection of worldUp onto plane ⟂ fwdWorld
    const u1 = worldUp.clone().sub(fwdWorld.clone().multiplyScalar(worldUp.dot(fwdWorld)));
    const len = u1.length();
    if (!(len > 1e-9)) return;
    u1.divideScalar(len);
    const u2 = new THREE.Vector3().crossVectors(fwdWorld, u1).normalize();

    // Decompose current upWorld in the (u1,u2) plane and compute roll needed
    const x = upWorld.dot(u1);
    const y = upWorld.dot(u2);
    const phi = Math.atan2(y, x);         // rotate by -phi about forward
    if (Math.abs(phi) < 1e-6) return;

    const D_world = new THREE.Quaternion().setFromAxisAngle(fwdWorld, -phi);
    // Convert world delta to camera-local
    const D_cam = Qcam.clone().invert().multiply(D_world).multiply(Qcam);
    shViewQuat.premultiply(D_cam);
    updateShViewMat();
    return;
  }

  // – World-nav path: adjust stage.quaternion so effective up (after stage^-1 * camera) aligns to world +Y
  // Effective orientation seen by shader (ignoring shader matrices) is Qeff = stage^-1 * camera
  const Qs = stage.getWorldQuaternion(new THREE.Quaternion());   // world rotation of stage
  const Qc = camera.quaternion.clone();                          // world rotation of camera
  const Qeff = Qs.clone().invert().multiply(Qc);                 // effective camera orientation

  const fwdEff = new THREE.Vector3(0, 0, -1).applyQuaternion(Qeff).normalize();
  const upEff  = new THREE.Vector3(0, 1, 0).applyQuaternion(Qeff).normalize();

  // If forward ~ +/-Y, roll undefined; skip
  if (Math.abs(fwdEff.dot(worldUp)) > 0.9999) return;

  // Desired-up in plane ⟂ fwdEff
  const u1 = worldUp.clone().sub(fwdEff.clone().multiplyScalar(worldUp.dot(fwdEff)));
  const len = u1.length();
  if (!(len > 1e-9)) return;
  u1.divideScalar(len);
  const u2 = new THREE.Vector3().crossVectors(fwdEff, u1).normalize();

  // Decompose upEff and compute roll angle
  const x = upEff.dot(u1);
  const y = upEff.dot(u2);
  const phi = Math.atan2(y, x);   // need to rotate effective frame by -phi around fwdEff

  if (Math.abs(phi) < 1e-6) return;

  // We want Qeff' = D_eff * Qeff, where D_eff is rotation about fwdEff by -phi
  const D_eff = new THREE.Quaternion().setFromAxisAngle(fwdEff, -phi);

  // Since Qeff = Qs^{-1} * Qc, applying D_eff to Qeff is achieved by updating stage:
  // (Qs')^{-1} = D_eff * (Qs^{-1})  =>  Qs' = Qs * D_eff^{-1}
  const D_inv = D_eff.clone().invert();
  stage.quaternion.multiply(D_inv);

  stage.updateMatrixWorld(true);
  if (typeof updateNavMatrix === 'function') updateNavMatrix();
}

function levelCameraToWorldAxes() {
  // Make the effective camera orientation world-aligned:
  // Qeff' = Qcam * Qsh' = I  =>  Qsh' = Qcam^{-1}
  const QcamInv = camera.quaternion.clone().invert();
  shViewQuat.copy(QcamInv);
  updateShViewMat();
  // Note: position, FOV, stage/world transforms unchanged.
}

if (typeof window!=='undefined') window.levelCameraToWorldAxes = levelCameraToWorldAxes;

function updateNav(dt){
  const shift = keys.has('ShiftLeft') || keys.has('ShiftRight');
  const ctrl  = keys.has('ControlLeft') || keys.has('ControlRight');
  
  // FOV zoom - ctrl+Z=in, shift+ctrl+Z=out
  if (keys.has('KeyZ') && ctrl) {
    zoomStepDegrees(shift ? -1 : +1, (C.zoomDegPerSec), dt);
    return;
  }

  const v = C.navSpeed * dt;
  const yawStep   = THREE.MathUtils.degToRad(C.yawDegPerSec)   * dt;
  const pitchStep = THREE.MathUtils.degToRad(C.pitchDegPerSec) * dt;

  if (C.shaderNavigation) {
    // Z dolly: Z=fwd, Shift+Z=back
    if (keys.has('KeyZ') && !ctrl) {
      if (shift) { shDollyZBack(v); } else { shDollyZFwd(v); }
      return;
    }

    // Movement (no Shift): translate in shader view space
    if (!shift) {
      if (keys.has('ArrowLeft'))  { shDollyXLeft(v); }
      if (keys.has('ArrowRight')) { shDollyXRight(v); }
      if (keys.has('ArrowUp'))    { shDollyYUp(v); }
      if (keys.has('ArrowDown'))  { shDollyYDown(v); }
      return;
    }
    
    // Rotation (Shift held)
    if (shift && ctrl) {
      // Head-centric rotation
      if (keys.has('ArrowLeft'))  { shPanLeftHeadc(yawStep); }
      if (keys.has('ArrowRight')) { shPanRightHeadc(yawStep); }
      if (keys.has('ArrowUp'))    { shTiltUpHeadc(pitchStep); }
      if (keys.has('ArrowDown'))  { shTiltDownHeadc(pitchStep); }
    } else if (shift && !ctrl) {
      // Orbit rotation around fractal center
      if (keys.has('ArrowLeft'))  { shPanLeftOrbit(yawStep); }
      if (keys.has('ArrowRight')) { shPanRightOrbit(yawStep); }
      if (keys.has('ArrowUp'))    { shTiltUpOrbit(pitchStep); }
      if (keys.has('ArrowDown'))  { shTiltDownOrbit(pitchStep); }
    }
    return;
  }

  // WORLD navigation (when shaderNavigation=false)
  // Z dolly: Z=fwd, Shift+Z=back
  if (keys.has('KeyZ') && !ctrl) {
    if (shift) { wDollyZBack(v); } else { wDollyZFwd(v); }
    return;
  }

  if (!shift) {
    if (keys.has('ArrowLeft'))  { wDollyXLeft(v); }
    if (keys.has('ArrowRight')) { wDollyXRight(v); }
    if (keys.has('ArrowUp'))    { wDollyYUp(v); }
    if (keys.has('ArrowDown'))  { wDollyYDown(v); }
    return;
  }
  
  // World rotation with Shift
  if (ctrl) {
    // Head-centric
    if (keys.has('ArrowLeft'))  { wPanLeftHeadc(yawStep); }
    if (keys.has('ArrowRight')) { wPanRightHeadc(yawStep); }
    if (keys.has('ArrowUp'))    { wTiltUpHeadc(pitchStep); }
    if (keys.has('ArrowDown'))  { wTiltDownHeadc(pitchStep); }
  } else {
    // Orbit
    if (keys.has('ArrowLeft'))  { wPanLeftOrbit(yawStep); }
    if (keys.has('ArrowRight')) { wPanRightOrbit(yawStep); }
    if (keys.has('ArrowUp'))    { wTiltUpOrbit(pitchStep); }
    if (keys.has('ArrowDown'))  { wTiltDownOrbit(pitchStep); }
  }
}

function rotateStageAroundPoint(pivot, axis, angle){
  const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
  stage.position.sub(pivot).applyQuaternion(q).add(pivot);
  stage.quaternion.premultiply(q);
  stage.updateMatrixWorld();

  if (typeof updateNavMatrix==='function') updateNavMatrix();
}

// Scripted Animation
const __Anim = (C.animation && Array.isArray(C.animation.anim))
  ? { list: C.animation.anim, loop: !!C.animation.loop } : null;

const __registry = {
  wDollyXLeft, wDollyXRight, wDollyYUp, wDollyYDown, wDollyZFwd, wDollyZBack,
  wPanLeftHeadc, wPanRightHeadc, wPanLeftOrbit, wPanRightOrbit,
  wTiltUpHeadc, wTiltDownHeadc, wTiltUpOrbit, wTiltDownOrbit,
  shDollyXLeft, shDollyXRight, shDollyYUp, shDollyYDown, shDollyZFwd, shDollyZBack,
  shPanLeftHeadc, shPanRightHeadc, shPanLeftOrbit, shPanRightOrbit,
  shTiltUpHeadc, shTiltDownHeadc, shTiltUpOrbit, shTiltDownOrbit,
  wHome, shHome
};

function __get(name){
  if (__registry && name in __registry && typeof __registry[name]==='function') return __registry[name];
  if (typeof window!=='undefined' && typeof window[name]==='function') return window[name];
  return null;
}

let __act = null, __idx = 0, __tLeft = 0;
let __zt = null;

function __clampFov(f){
  const minF = (typeof C.fovMin==='number')?C.fovMin:5;
  const maxF = (typeof C.fovMax==='number')?C.fovMax:170;
  return Math.max(minF, Math.min(maxF, f));
}
function __applyFov(f){ camera.fov = __clampFov(f); camera.updateProjectionMatrix(); }

function __ease(u, mode){
  if (u <= 0) return 0; if (u >= 1) return 1;
  switch (mode) {
    case 'in':    return u*u;
    case 'out':   { const t = 1-u; return 1 - t*t; }
    case 'inOut': return u*u*(3-2*u);
    default:      return u;
  }
}

function __easeDer(u, mode){
  if (u <= 0) return 0; if (u >= 1) return 0;
  switch (mode) {
    case 'in':    return 2*u;
    case 'out':   return 2*(1-u);
    case 'inOut': return 6*u*(1-u);
    default:      return 1;
  }
}

function __evalBezierRel(p1, p2, p3, u){
  const u1 = (1-u);
  const u1_2 = u1*u1, u2 = u*u;
  const b = new THREE.Vector3(0,0,0);
  const t1 = p1.clone().multiplyScalar(3 * u  * u1_2);
  const t2 = p2.clone().multiplyScalar(3 * u2 * u1);
  const t3 = p3.clone().multiplyScalar(u2 * u);
  b.add(t1).add(t2).add(t3);
  return b;
}

let __bz = null;

function __scriptedHomeOnce(name){
  const fn = __get(name);
  if (fn) { try { fn(); } catch(e) {} }
}

function __next(){
  if (!__Anim) { __act = null; return; }
  if (__idx >= __Anim.list.length){
    if (__Anim.loop){ __idx = 0; } else { __act = null; return; }
  }
  __act = __Anim.list[__idx++] || null;
  if (!__act) return;
  __tLeft = Number(__act.dur ?? 2.0);
  __zt = null;
  __bz = null;
  if (__act.a==='wHome' || __act.a==='shHome'){ __scriptedHomeOnce(__act.a); }
}

function stepAction(dt){
  if (!__act) return;
  const name = __act.a;
  if (!name) return;

  const total = Number(__act.dur ?? 2.0);
  __tLeft -= dt;
  const raw = Math.max(0, Math.min(1, 1 - (__tLeft / total)));
  const easeMode = (__act.ease || 'linear');
  const u = __ease(raw, easeMode);
  const du = __easeDer(raw, easeMode);

  if (name === 'pause' || name === 'wHome' || name === 'shHome') {
    if (__tLeft <= 0) { __next(); }
    return;
  }

  if (name === 'wBezier' || name === 'shBezier') {
    if (!__bz) {
      const isWorld = (name === 'wBezier');
      const P0 = isWorld ? stage.position.clone() : (shViewTranslate ? shViewTranslate.clone() : new THREE.Vector3());
      const arr = Array.isArray(__act.p) ? __act.p : [];
      const toV = (a)=> new THREE.Vector3(Number(a?.[0]||0), Number(a?.[1]||0), Number(a?.[2]||0));
      const p1 = toV(arr[0] || [0,0,0]);
      const p2 = toV(arr[1] || [0,0,0]);
      const p3 = toV(arr[2] || [0,0,0]);
      __bz = { space: (isWorld?'world':'shader'), P0, p1, p2, p3, dur: total };
    }
    const B = __evalBezierRel(__bz.p1, __bz.p2, __bz.p3, u);
    const target = __bz.P0.clone().add(B);
    if (__bz.space === 'world') {
      stage.position.copy(target);
      if (typeof updateNavMatrix==='function') updateNavMatrix();
    } else {
      if (shViewTranslate && shViewTranslate.copy) {
        shViewTranslate.copy(target);
        if (typeof updateShViewMat==='function') updateShViewMat();
      }
    }
    if (__tLeft <= 0) { __next(); }
    return;
  }

  if (name === 'zoomIn')  { zoomStepDegrees(+1, Number(__act.spd ?? C.zoomDegPerSec ?? 60) * du, dt); if (__tLeft <= 0) { __next(); } return; }
  if (name === 'zoomOut') { zoomStepDegrees(-1, Number(__act.spd ?? C.zoomDegPerSec ?? 60) * du, dt); if (__tLeft <= 0) { __next(); } return; }
  if (name === 'zoomTo')  {
    if (!__zt) { __zt = { f0: camera.fov, f1: Number(__act.fov ?? 90) }; }
    __applyFov(__zt.f0 + ( __zt.f1 - __zt.f0 ) * u);
    if (__tLeft <= 0) { __next(); }
    return;
  }

  const isDolly = name.startsWith('wDolly') || name.startsWith('shDolly');
  const isRot   = name.includes('Pan') || name.includes('Tilt');

  const fn = __get(name);
  if (!fn) { if (__tLeft <= 0) { __next(); } return; }

  if (isDolly){
    const spd = Number(__act.spd ?? C.navSpeed ?? 45) * du;
    fn(spd * dt);
    if (name.startsWith('w') && typeof updateNavMatrix==='function') updateNavMatrix();
    if (__tLeft <= 0) { __next(); }
    return;
  }

  if (isRot){
    const degPerSec = Number(__act.spd ?? (name.includes('Tilt') ? (C.pitchDegPerSec ?? 30) : (C.yawDegPerSec ?? 30))) * du;
    fn(THREE.MathUtils.degToRad(degPerSec) * dt);
    if (name.startsWith('w') && typeof updateNavMatrix==='function') updateNavMatrix();
    if (__tLeft <= 0) { __next(); }
    return;
  }
}

// Prime the first action
if (__Anim && __Anim.list.length) __next();

const clock = new THREE.Clock();
renderer.setAnimationLoop(()=>{
  const dt = clock.getDelta();
  try{ stepAction(dt); }catch(e){}
  stats.begin();
  updateNav(dt);
  const t = clock.getElapsedTime();
  quad.material.uniforms.iTime.value = t;
  quad.material.uniforms.iTimeDelta.value = dt;
  quad.material.uniforms.iFrame.value++;
  renderer.render(scene, camera);
  stats.end();
});

window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize AUDIO at the end of initialize()
console.log('[narrative-sh] Calling initializeAudio with config:', C.audio);
initializeAudio(C.audio);

}//end initialize(C)

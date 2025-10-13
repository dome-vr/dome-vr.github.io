// fsh_uPos_eye-px.glsl.ts
//NOTE!! mrtgts=>must use LH-coord system, so swap px and nx
//this shader is constructed for eye-nx and direction px in RHS
//which is eye-px and direction nx in LHS - hence named 'eye-px'
// fragment shader rm-template
// raymarch - sphere(s)
//NOTE!!!! - use this shader as a template ONLY!!!
//NOTE! - number of positions MUST be set in fsh (const N below)
//NOTE! - positions array must be initialized with N THREE.Vector3
//NOTE! - defaults are given below - they must be set by, most likely,
//        an actor.animate(et, renderer, vrscene) function
import * as THREE from '../../../../../../../node_modules/three/build/three.module.js';
// initial positions for N objects
//NOTE: NDC (normalized device coordinates) are left-handed !!! Therefore,
//      must negate the x-coord to get expected RHS 'behavior'
//      exp: sphere at (1,0,0) is to the left of the y-axis
//      Thus to see sphere at expected (1,0,0) make the center (-1,0,0)
const a = [
    //new THREE.Vector3(0, 1, -3),
    //new THREE.Vector3(-2, -1, -2),  //for position animation
    //new THREE.Vector3(0,-1,-3)
    new THREE.Vector3(0, 1, -2),
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(0, -1, -2)
];
const uniforms_px = {
    uTime: { type: 'f', value: 0.0 },
    uPositions: { type: 'v3v', value: a },
    tDiffuse: { type: 't', value: null },
    uAspect: { type: 'f', value: window.innerWidth / window.innerHeight },
    uFovscale: { type: 'f', value: 1.0 },
    uResolution: { type: 'v2', value: null },
};
const fsh_px = `

     #ifdef GL_ES
     precision mediump float;
     #endif

     uniform float uTime;     // scalar for ellapsed time-secs. - for animation
     uniform vec3[3] uPositions;   //LATER N=3
     uniform sampler2D tDiffuse;  //quad-sgTarget texture map 
     uniform vec2 uResolution;   //screen width/height
    uniform float uAspect;      //custom scalar to correct for screen aspect
    uniform float uFovScale;        //custom scalar to correct for lens fov
//     uniform vec3 uCam_up;       //custom up-vector to modify rm objects.xyz
//     uniform vec3 uCam_fwd;     //custom fwd-vector to modify rm objects.xyz
//     uniform vec3 uCam_right;  //custom R-vector to modify rm objects.xyz

     varying vec2 vuv;
   

     //number of positions -
     int N=3;  //LATER: N=3

     //sphere params
     float radius = 0.5;      //1.0;

     //calculate d = minimum{distance to rm-objects at uPositions}
     float minimum = 10000.; //large min guaranteed overwritten by first rm-obj

     // distance - used by march
     //return length(max(abs(p_v)-b, 0.0));  //single-cube
     float _distance(vec3 p){
       float d;
       for(int i=0; i<N; i++){
         d = length(p - uPositions[i]) - radius; 
         d = min(minimum, d);
         minimum = d;
       }
       return d;
     }


     // march(eye, fwd) - uses distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         for (int i=0; i<128; i++) {       // 32 iterations
             // advance along ray fwd which extends through screen uv point
             vec3 p = eye + t*fwd;

             // distance
             float d = max(_distance(p),0.0);  
             t += d*0.5;
         }
         return t;
     }


     // color(march(), fwd) - fwd NOT USED ?!
     vec4 color(float t, vec3 fwd){
         //float fog = 1.0/(0.1*t*t + 1.0);  // 50.0/ +2.0/


         //test - clarify edges
         //float fog = 1.35/(0.1*t*t + 1.0);  // 50.0/ +2.0/
         float fog = 8.0/t;


         vec3 fogc = vec3(fog);
         //return vec4(0.8*fog, 0.5*fog, 2.0*fog, 0.9);
         return vec4(fogc, 1.0);
     }
 

     // blend( color(march(),fwd) )
     vec4 blend(vec4 pixel){
       // blend - alpha + (1-alpha) - best for layering - poor for post!
       //float alpha = 0.1 * pixel.a;  // 0.5
       float alpha = 0.7;
       vec4 blnd = (1.0-alpha)*texture2D(tDiffuse, vuv) + alpha*pixel;

       // color animation
       blnd.r *= 0.5 + 0.5 * sin(0.2*uTime);
       blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }



     // main uses march, color and blend
     void main() {

       //mrtgts: eye-nx
       //eye=vec3(-1,0,0)  fwd=vec3(1,0,0)

       //eye 
       vec3 eye = vec3(-1.0, 0.0, 0.0);       // fov=pi/2 <=> eye.z=1

       //fwd - map texture pixels to [-1,1]x[-1,1] of z=0 plane of fsh
       //fwd - also normalize for aspect asymmetry
       vec2 uv = 2.0*vuv - 1.0;
       uv.s *= uAspect;
       vec3 fwd = normalize(vec3(1.0,uv));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
export { fsh_px, uniforms_px };
//# sourceMappingURL=fsh_uPos_eye-px.glsl.js.map
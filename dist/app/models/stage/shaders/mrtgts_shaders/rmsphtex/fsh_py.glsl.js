// fsh_rm_sphere.glsl.ts
// fragment shader rm-template
// raymarch - sphere(s)
//NOTE: NDC (normalized device coordinates) are left-handed !!! Therefore,
//      must negate the x-coord to get expected RHS 'behavior'
//      exp: sphere at (1,0,0) is to the left of the y-axis
//      Thus to see sphere at expected (1,0,0) make the center (-1,0,0)
const uniforms_py = {
    tDiffuse: { type: 't', value: null },
    //              uVertex: {type: 'v3', value: new THREE.Vector3()}, //rm_point.getWorldPosition(),
    uAspect: { type: 'f', value: window.innerWidth / window.innerHeight },
    uFovscale: { type: 'f', value: 1.0 },
    //              uCam_fwd: {type: 'v3', value: new THREE.Vector3(0,0,-1)}, //cam_fwd,
    //              uCam_up: {type: 'v3', value: new THREE.Vector3(0,1,0)},  //cam_up,
    //              uCam_right: {type: 'v3', value: new THREE.Vector3(1,0,0)}, //cam_right
    uRed: { type: 'f', value: 0.0 },
    uTime: { type: 'f', value: 0.0 },
    //              uResolution:{type: 'v2', value: new THREE.Vector2(960,1080)}
    uResolution: { type: 'v2', value: null }
};
const fsh_py = `
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
     uniform vec2 uResolution;   // screen width and height
     varying vec2 vuv;
   


     //sphere params
     //float radius = 0.25;
     //vec3 center = vec3(0.0,0.0,0.0);
     //vec3 center = vec3(0.0,0.25,0.25);
     //vec3 center = vec3(0.0,0.0,0.75);

     float radius = 0.5;  //1.0
     //vec3 center = vec3(0.0,0.0,-1.0);
     vec3 center = vec3(0.,0.,-1.0);  //see above - displayed at RHS (1,0,-4)



     // distance - used by march
     //return length(max(abs(p_v)-b, 0.0));  //single-cube
     float _distance(vec3 p){
       //float d = length(p) - radius;            //single sphere 

       float d = length(p-center);
       return d - radius;
     }


     // march(eye, fwd) - uses distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         for (int i=0; i<32; i++) {       // 32 iterations
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
         
         
         //test! clarify edge
         //float fog = 1.35/(0.1*t*t + 1.0);  // 50.0/ +2.0/
         float fog = 2.0/t;


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
       // eye 
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 <=> eye.z=1

       // fwd - map texture pixels to [-1,1]x[-1,1] of z=0 plane of fsh
       // fwd - also normalize for aspect asymmetry
       vec2 uv = 2.0*vuv - 1.0;
       uv.s *= uAspect;
       vec3 fwd = normalize(vec3(uv, -1.0));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
//export {fsh:_fsh, 
//        uniforms:_uniforms};
export { fsh_py, uniforms_py };
//# sourceMappingURL=fsh_py.glsl.js.map
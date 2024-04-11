// fsh_rm_minimal.glsl.ts
// fragment shader
// raymarch - rm_minimal
const uniforms = {
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
const fsh = `
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
   


     //sphere params
     //float radius = 0.25;
     //vec3 center = vec3(0.0,0.0,0.0);
     //vec3 center = vec3(0.0,0.25,0.25);
     //vec3 center = vec3(0.0,0.0,0.75);

     float radius = 1.0;
     //vec3 center = vec3(0.0,0.0,0.0);
     vec3 center = vec3(0.0,0.0,-1.0);

     // _distance - used by march
     //return length(max(abs(p_v)-b, 0.0));  //single-cube
     float _distance(vec3 p){
       //return length(p) - radius;            //single sphere 
       float d = length(p - center);   
       return d - radius;
     }


     // march(eye, fwd) - uses _distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         for (int i=0; i<32; i++) {       // 32 iterations
             // advance along ray fwd which extends through screen uv point
             vec3 p = eye + t*fwd;

             // _distance
             float d = max(_distance(p),0.0);  
             t += d*0.5;
         }
         return t;
     }


     // color(march(), fwd) - fwd NOT USED ?!
     vec4 color(float t, vec3 fwd){
         //float fog = 1.0/(0.1*t*t + 1.0);  // 50.0/ +2.0/
         float fog = 1.35/(0.1*t*t + 1.0);  // 50.0/ +2.0/
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
       //blnd.r *= 0.5 + 0.5 * sin(0.2*uTime);
       //blnd.g *= 0.5 + 0.4 * (sin(0.1*uTime)); // 2.0
       //blnd.b *= 0.5 + 0.35 * (cos(0.3*uTime));
       return blnd;
     }


     // main uses march, color and blend
     void main() {
       // eye and fwd
       vec3 eye = vec3(0.0, 0.0, 1.0);       // fov=pi/2 => z=1

       // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
       //vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0, -1.0));
       vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0, -1.0));

       // paint
       gl_FragColor = blend(color(march(eye,fwd), fwd));
     }`;
//export {fsh:_fsh, 
//        uniforms:_uniforms};
export { fsh, uniforms };
//# sourceMappingURL=fsh_rm_minimal.glsl.js.map
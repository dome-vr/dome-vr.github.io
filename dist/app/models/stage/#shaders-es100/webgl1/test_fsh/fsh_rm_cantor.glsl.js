// fsh_rm_spheres.glsl.ts
// fragment shader
// raymarch - sphere(s)
const uniforms = {
    tDiffuse: { type: 't', value: null },
    //              uVertex: {type: 'v3', value: new THREE.Vector3()}, //rm_point.getWorldPosition(),
    uAspect: { type: 'f', value: 1.0 },
    uFovscale: { type: 'f', value: 1.0 },
    //              uCam_fwd: {type: 'v3', value: new THREE.Vector3(0,0,-1)}, //cam_fwd,
    //              uCam_up: {type: 'v3', value: new THREE.Vector3(0,1,0)},  //cam_up,
    //              uCam_right: {type: 'v3', value: new THREE.Vector3(1,0,0)}, //cam_right
    uRed: { type: 'f', value: 0.0 },
    uTime: { type: 'f', value: 0.0 },
    //              uResolution:{type: 'v2', value: new THREE.Vector2(960,1080)}
    uResolution: { type: 'v2', value: null }
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
     uniform vec2 uResolution;   // screen width and height
     varying vec2 vuv;
   


     int iterations=16;  //32
     float scale=4.0;
     float CX=0.1; 
     float CY=0.1; 
     float CZ=0.5; 

     // _distance - used by march
     float _distance(vec3 z0){
        float r = length(z0);
        float t = 0.0;
        int i = 0;
        float ss=1.;
        for (i=0;i<iterations && r<60.0;i++) {
            z0.x=abs( z0.x);
            z0.y=abs( z0.y);
            z0.z=abs( z0.z);
            if ( z0.x- z0.y<0.0) {
              t= z0.y;
              z0.y= z0.x;
              z0.x=t;
            }
            if ( z0.x- z0.z<0.0) {
              t= z0.z;
              z0.z= z0.x;
              z0.x=t;
            }
            if ( z0.y- z0.z<0.0) {
              t= z0.z;
              z0.z= z0.y;
              z0.y=t;
            }
            z0.x=scale* z0.x-CX*(scale-1.0);
            z0.y=scale* z0.y-CY*(scale-1.0);
            z0.z=scale* z0.z;
            if ( z0.z>0.5*CZ*(scale-1.0)){
              z0.z-=CZ*(scale-1.0);
            }
            r=max(z0.x-1.0, max(z0.y-1.0, z0.z-1.0));
            ss*=1.0/scale;
        }
        return r*ss;  //the estimated _distance
     }


     // march(eye, fwd) - uses _distance 
     float march(vec3 eye, vec3 fwd){
         float t=0.0;
         for (int i=0; i<32; i++) {       // 32 iterations
             // advance along ray fwd which extends through screen uv point
             vec3 p = eye + t*fwd;

             // _distance
             float d = _distance(p);  
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
export { fsh, uniforms };
//# sourceMappingURL=fsh_rm_cantor.glsl.js.map
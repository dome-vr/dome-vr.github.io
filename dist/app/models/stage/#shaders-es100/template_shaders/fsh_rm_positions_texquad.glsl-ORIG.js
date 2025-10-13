// fsh_rm_positions_texquad.glsl.ts
// rm-quad NDC [-1,1]x[-1,1] texture map
// Fragment shader program webgl2 - es3.0 
//NOTE!!!! - use this shader as a template ONLY!!!
//NOTE! - number of positions MUST be set in fsh (const N below)
//NOTE! - positions array must be initialized with N THREE.Vector3
//NOTE! - defaults are given below - they must be set by, most likely,
//        an actor.animate(et, renderer, vrscene) function
import * as THREE from '../../../../../../../node_modules/three/build/three.module.js';
// initial positions for N objects
let p1 = new THREE.Vector3(0, 0, 3), p2 = new THREE.Vector3(0, 1, 5), p3 = new THREE.Vector3(0, -1, 3);
const uniforms = {
    tDiffuse: { type: 't', value: null },
    uTime: { type: 'f', value: 0.0 },
    positions: { type: 'v3v', value: [p1, p2, p3] },
    uResolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};
const fsh = `//#version 300 es     //written in by three.js compiler 

#ifdef GL_ES
precision mediump float;
#endif
//#extension GL_OES_standard_derivatives : enable


// !!!!!!!!!!!!!!!!!
int N = 3;   // number of rm-objects - set for each fsh instance
uniform vec3[3] positions;  //positions.length = N 

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
in vec2 vuv;
/* out vec4 pc_fragColor; */    //pre-defined by three.js compiler 
//out vec4 out_FragColor;      //replaced by provided pc_fragColor




// distance of ray-point from sphere surface (negative if inside sphere)
float d(vec3 p, vec3 c){
  return length(p-c) - 0.02;   //radius=0.02/radius=0.01
}


vec3 march(vec3 o, vec3 r){
  float t = 1.0;
  float min_d = 1000.0;
  float dp;

  for(int i=0; i<32; ++i){     // iterations=32
      vec3 p = o + r*t;       // ray p

      // for stage i find min of distances to all N rm-objects
      for(int j=0; j<N; j++){   // sphere center _positions[j]
        if(positions[j].z == 0.0){continue;}  //array value index ignored =>j++

        dp = d(p, positions[j]);   // distance of p to _positions[j] sphere surface
        min_d = min(min_d,dp);     // min_d is min distance over all spheres
      }
      if(min_d < .005){   //.001
        return vec3(0.0,0.5,1.0);   // if intersect sphere surface - return color
      }
      t += min_d*0.5;             // else, march raypoint p by min_d*0.5
  }
  return vec3(0.0,0.0,0.0);   // no intersection - return background
}


void main( void ) {

    vec2 position = ( gl_FragCoord.xy / uResolution.xy );
    position = position*2.0 -1.0; // normalized device coords [-1,1]x[-1,1] 

    // correct for aspect ratio - not needed in rm-stage - corrected in vr-stage
    //position.x *= uResolution.x/uResolution.y;


    vec3 ray = normalize(vec3(position.xy, -1.0));  // ray starts on [-1,1]x[-1,1] z=-1.0
    vec3 eye = vec3(0,0,0);           // eye at (0,0,0)

    vec3 color = march(eye, ray);



    if(color.rgb == vec3(0.0,0.0,0.0)){
          pc_fragColor = texture2D(tDiffuse, vuv);  // needs vertex shader definition !  
    }else{
      pc_fragColor = vec4(color, 1.0);
    }
}`;
export { fsh, uniforms };
//# sourceMappingURL=fsh_rm_positions_texquad.glsl-ORIG.js.map
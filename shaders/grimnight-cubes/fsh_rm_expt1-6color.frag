// REMOVED: #version directive (Three.js handles this)
precision highp float;

// ===== Alignment knobs =====
#ifndef ALIGN_YAW_DEG
#define ALIGN_YAW_DEG   0.0
#endif
#ifndef ALIGN_PITCH_DEG
#define ALIGN_PITCH_DEG 0.0
#endif
#ifndef ALIGN_ROLL_DEG
#define ALIGN_ROLL_DEG  0.0
#endif

#ifndef SHOW_AXIS_PLANES
#define SHOW_AXIS_PLANES 0
#endif

// ===== Pipeline inputs =====
in vec2 vNDC;
out vec4 outColor;
uniform mat4 uInvViewMatrix;
uniform mat4 uInvProjMatrix;
uniform bool uDebugStereo;
uniform float iTime;
uniform vec2 uResolution;

// world translation (meters) supplied by app config
uniform vec3 uAlignTranslate;

// Debug uniforms (from framework)
uniform int uDebugMode;
uniform vec3 uDebugColor;
uniform vec4 uDebugData;

// lighting + control
uniform float uAmbient;
uniform float uHeadlight;
uniform bool  uUseOriginalShadingAndColor;

// fractal positioning and scaling
uniform vec3 uDomeCenter;      // fractal center position
uniform float uDomeSize;       // fractal scale factor

// sky
uniform int uSkyMode;          // 0=black,1=faceColors,2=gradient,3=cube
uniform vec3 uSkyFaceColors[6]; // custom face colors (when provided)
uniform samplerCube uSkyCube;  // bound when uSkyMode==3

// ===== Framework Constants =====
#ifndef MAX_MARCH_STEPS
#define MAX_MARCH_STEPS 256
#endif
#ifndef HIT_EPSILON
#define HIT_EPSILON 0.001
#endif
#ifndef FAR_PLANE
#define FAR_PLANE 200.0
#endif

// ===== Math helpers =====
const float TAU = 6.283185307179586;
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0., s,c,0., 0.,0.,1.); }

vec3 applyCardinalAlign(vec3 p){
  vec3 r = radians(vec3(ALIGN_PITCH_DEG, ALIGN_YAW_DEG, ALIGN_ROLL_DEG));
  // Roll(Z) • Pitch(X) • Yaw(Y)
  mat3 R = rotZ(r.z) * rotX(r.x) * rotY(r.y);
  return R * p;
}

// ===== Debug planes (X=0, Y=0, Z=0) =====
float axisPlanesDE(vec3 p){
#if SHOW_AXIS_PLANES
  float w = 0.003;
  float dx = abs(p.x) - w;
  float dy = abs(p.y) - w;
  float dz = abs(p.z) - w;
  return min(dx, min(dy, dz));
#else
  return 1e9;
#endif
}

// ===== Sky and face colors =====
vec3 skyColor(vec3 rd){
  if(uSkyMode==1){
    int fid = (abs(rd.x)>abs(rd.y) && abs(rd.x)>abs(rd.z)) ? (rd.x>0.0?0:1)
             : (abs(rd.y)>abs(rd.z) ? (rd.y>0.0?2:3) : (rd.z>0.0?4:5));
    return uSkyFaceColors[fid];
  } else if(uSkyMode==2){
    return normalize(rd)*0.5+0.5;
  } else if(uSkyMode==3){
    return texture(uSkyCube, rd).rgb;
  }
  return vec3(0.0);
}

// ===== Ray utilities =====
void makeRay(out vec3 ro, out vec3 rd){
  vec4 pN = uInvProjMatrix * vec4(vNDC, -1.0, 1.0);
  vec4 pF = uInvProjMatrix * vec4(vNDC,  1.0, 1.0);
  pN/=pN.w; pF/=pF.w;
  vec3 worldNear = (uInvViewMatrix*vec4(pN.xyz,1.0)).xyz;
  vec3 worldFar  = (uInvViewMatrix*vec4(pF.xyz,1.0)).xyz;
  ro = worldNear; rd = normalize(worldFar-worldNear);
}

// ===== UV conversion helper =====
#define vuv (vNDC * 0.5 + 0.5)


// ===== Original Shader Code (modified) =====
// REMOVED: uniform mat4 viewMatrix;
// iTime provided by framework

 // precision handled by ES 300 header
// REMOVED: uniform sampler2D tDiffuse;
// REMOVED: uniform vec3 uVertex;
// REMOVED: uniform float uFovscale;
// REMOVED: uniform float uAspect;
// REMOVED: uniform vec3 uCam_up;
// REMOVED: uniform vec3 uCam_fwd;
// REMOVED: uniform vec3 uCam_right;
// REMOVED: uniform float uRed;
 // iTime provided by framework        // scalar for ellapsed iTime - for animation
 // vuv converted to vNDC coordinate system
   


 // distance function _distance() - used by march
 float _distance(vec3 p, vec3 v, vec3 b){
   vec3 p_v = p - v;
   //return length(max(abs(p_v)-b, 0.0));  // single-cube

   //vec3 q = fract(p) * 2.0 -1.0;  // multiple ellipsoids
   //return length(q) - 2.36;
   vec3 q = fract(p - v) * (2.0 + 0.1*sin(iTime)) -1.0;
   //vec3 q = fract(max(abs(p_v)-b, 0.0)) * (2.0 + 0.1*sin(iTime)) -1.0;
   return length(max(abs(q)-b, 0.0)) - 0.25;  // multiple cuboids
   //return length(q) - 0.25;
 }
// REMOVED DEAD CODE: blend() function



 // main uses march, color and blend
 // Original main() replaced by dome-sh framework

// ===== End Original Code =====

// Dome-sh dual rendering paths
vec4 DomeDefaultShading(vec3 ro, vec3 rd, float t, vec3 n, vec3 baseCol){
  vec3 L = normalize(vec3(0.6,0.7,0.5));
  float diff = max(dot(n,L),0.0);
  
  // Make default shading more visible
  vec3 surfaceColor = vec3(0.7, 0.7, 0.8);
  vec3 lit = surfaceColor * (0.3 + 0.7 * diff);
  
  return vec4(lit,1.0);
}

vec4 DomeOriginalShading(vec3 ro, vec3 rd, float t, vec3 n, vec3 baseCol){
  vec3 hitPoint = ro + t * rd;
  
  // Use the original shader's lighting/rendering logic
  // Try to use original shader's rendering approach
  vec3 eye = vec3(0.0, 0.0, 1.0);
  vec3 fwd = normalize(hitPoint - ro);
  
  // Attempt to use original color/blend functions if they exist
  // This is a simplified version - original may need more context
  vec3 baseColor = vec3(0.5) + 0.3 * cos(6.28318 * (vec3(0.1, 0.2, 0.3) + vec3(0.4, 0.3, 0.2) * hitPoint));
  
  vec3 ambient = vec3(0.1, 0.1, 0.15) * baseColor;
  vec3 lightDir = normalize(vec3(0.6, 0.7, 0.5));
  float diff = max(dot(n, lightDir), 0.0);
  vec3 diffuse = diff * baseColor;
  
  vec3 color = ambient + diffuse;
  return vec4(color, 1.0);
}

// Integrated distance function with alignment and scaling
float Dist(vec3 pos) {
  vec3 p = applyCardinalAlign(pos - uAlignTranslate);
  float d = _distance(p, vec3(0.0), vec3(0.1));
  // Only apply scaling if not 1.0
  if (abs(uDomeSize - 1.0) > 0.001) {
    p = p * uDomeSize;
    d = _distance(p, vec3(0.0), vec3(0.1));
    d = d / uDomeSize;
  } 
  d = min(d, axisPlanesDE(p));
  return d;
}

#ifndef HAS_GET_NORMAL
vec3 GetNormal(vec3 pos){
  float e=0.001;
  return normalize(vec3(
    Dist(pos+vec3(e,0,0))-Dist(pos-vec3(e,0,0)),
    Dist(pos+vec3(0,e,0))-Dist(pos-vec3(0,e,0)),
    Dist(pos+vec3(0,0,e))-Dist(pos-vec3(0,0,e))
  ));
}
#endif

// Raymarching function for dome-sh
bool march(vec3 ro, vec3 rd, out float t, out vec3 hp){
  t=0.0;
  float stepSize;
  for(int i=0;i<MAX_MARCH_STEPS;i++){
    vec3 p = ro+rd*t;
    if(length(p)>800.0) return false;
    float d = Dist(p);
    if(abs(d)<float(HIT_EPSILON)){ hp=p; return true; }
    //t += d;
    stepSize = min(d*0.8, 0.8);
    t += stepSize;
    if(t>float(FAR_PLANE)) break;
  }
  return false;
}

void main(){
  vec3 ro, rd;
  makeRay(ro,rd);
  vec3 col;
  if(uDebugMode==1){
    col = skyColor(rd);
  } else if(uDebugMode==2){
    col = normalize(rd)*0.5+0.5;
  } else if(uDebugMode==3){
    float t; 
    vec3 hp; 
    bool hit = march(ro,rd,t,hp);
    col = hit ? uDebugColor : skyColor(rd);
  } else {
    float t; 
    vec3 hp; 
    bool hit = march(ro,rd,t,hp);
    if(hit){
      vec3 n = GetNormal(hp);
      vec3 baseCol = vec3(1.0);
      vec4 _sh;

      if (uUseOriginalShadingAndColor) {
        _sh = DomeOriginalShading(ro,rd,t,n,baseCol);
      } else {
        _sh = DomeDefaultShading(ro,rd,t,n,baseCol);
      }
      col = _sh.rgb;
    } else {
      col = skyColor(rd);
    }
  }
  if(uDebugStereo){
    float eyeId = step(0.0,(uInvViewMatrix*vec4(0,0,0,1)).x);
    col *= mix(vec3(1.0,0.9,0.9), vec3(0.9,0.9,1.0), eyeId);
  }
  outColor = vec4(clamp(col,0.0,1.0),1.0);
}

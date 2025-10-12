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

// world translation (meters) supplied by app config
uniform vec3 uAlignTranslate;

// Debug uniforms (from framework)
uniform int uDebugMode;
uniform vec3 uDebugColor;
uniform vec4 uDebugData;

// ===== Original Menger Constants =====
#define GAMMA 0.8
// AO_SAMPLES provided by framework (from config.ao)
#define RAY_DEPTH 256
#define MAX_DEPTH 200.0
#define SHADOW_RAY_DEPTH 16
#define DISTANCE_MIN 0.001
#define PI 3.14159265

const vec2 delta = vec2(0.001, 0.0);
const vec3 lightDir = vec3(-2.0, 0.8, -1.0);
const vec3 lightColour = vec3(2.0, 1.8, 1.5);
const float specular = 64.0;
const float specularHardness = 512.0;
const vec3 diffuse = vec3(0.25, 0.25, 0.25);
const float ambientFactor = 2.65;
const bool ao = true;
const bool shadows = true;

// ===== Math helpers =====
const float TAU = 6.283185307179586;
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0., s,c,0., 0.,0.,1.); }

vec3 applyCardinalAlign(vec3 p){
  vec3 r = radians(vec3(ALIGN_PITCH_DEG, ALIGN_YAW_DEG, ALIGN_ROLL_DEG));
  // Roll(Z) ° Pitch(X) ° Yaw(Y)
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

// ===== Original Menger Functions (preserved) =====
vec3 RotateY(vec3 p, float a) {
   float c, s;
   vec3 q = p;
   c = cos(a);
   s = sin(a);
   p.x = c * q.x + s * q.z;
   p.z = -s * q.x + c * q.z;
   return p;
}

float Cross(vec3 p) {
   p = abs(p);
   vec3 d = vec3(max(p.x, p.y),
                 max(p.y, p.z),
                 max(p.z, p.x));
   return min(d.x, min(d.y, d.z)) - (1.0 / 3.0);
}

float CrossRep(vec3 p) {
   vec3 q = mod(p + 1.0, 2.0) - 1.0;
   return Cross(q);
}

float CrossRepScale(vec3 p, float s) {
   return CrossRep(p * s) / s;   
}

const int MENGER_ITERATIONS = 4;

// Core Menger DE with dome-sh integration - ROTATION MADE OPTIONAL
float mengerDE(vec3 pos) {
   float scale = 0.05;
   float dist = 0.0;
   for (int i = 0; i < MENGER_ITERATIONS; i++) {
      dist = max(dist, -CrossRepScale(pos, scale));
      scale *= 3.0;
   }
   return dist;
}

// Integrated distance function with alignment
float Dist(vec3 pos) {
  // Apply world alignment
  vec3 p = applyCardinalAlign(pos - uAlignTranslate);
  
  // Combine Menger with debug planes
  float d = mengerDE(p);
  d = min(d, axisPlanesDE(p));
  return d;
}

// Based on original by IQ - optimized to remove a divide
float CalcAO(vec3 p, vec3 n) {
   float r = 0.0;
   float w = 1.0;
   for (int i = 1; i <= AO_SAMPLES; i++) {
      float d0 = float(i) * 0.3;
      r += w * (d0 - Dist(p + n * d0));
      w *= 0.5;
   }
   return 1.0 - clamp(r, 0.0, 1.0);
}

// Based on original code by IQ
float SoftShadow(vec3 ro, vec3 rd, float k) {
   float res = 1.0;
   float t = 0.1;
   for (int i = 0; i < SHADOW_RAY_DEPTH; i++) {
      if (t < 20.0) {
         float h = Dist(ro + rd * t);
         res = min(res, k * h / t);
         t += h;
      }
   }
   return clamp(res, 0.0, 1.0);
}

vec3 GetNormal(vec3 pos) {
   vec3 n;
   n.x = Dist(pos + delta.xyy) - Dist(pos - delta.xyy);
   n.y = Dist(pos + delta.yxy) - Dist(pos - delta.yxy);
   n.z = Dist(pos + delta.yyx) - Dist(pos - delta.yyx);
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO and SoftShadows to original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
   vec3 light = lightColour * max(0.0, dot(norm, lightDir));
   vec3 heading = normalize(-rd + lightDir);
   float spec = pow(max(0.0, dot(heading, norm)), specularHardness);
   
   light = (diffuse * light) + (spec * specular * lightColour);
   if (shadows) light *= SoftShadow(pos, lightDir, 16.0);
   if (ao) light += CalcAO(pos, norm) * ambientFactor;
   return vec4(light, 1.0);
}

// ===== Ray utilities (dome-sh style) =====
void makeRay(out vec3 ro, out vec3 rd){
  vec4 pNear = uInvProjMatrix * vec4(vNDC, -1.0, 1.0);
  vec4 pFar  = uInvProjMatrix * vec4(vNDC,  1.0, 1.0);
  pNear /= pNear.w;
  pFar  /= pFar.w;
  vec3 camNear = pNear.xyz;
  vec3 camFar  = pFar.xyz;
  vec3 worldNear = (uInvViewMatrix * vec4(camNear,1.0)).xyz;
  vec3 worldFar  = (uInvViewMatrix * vec4(camFar, 1.0)).xyz;
  ro = worldNear;
  rd = normalize(worldFar - worldNear);
}

// Raymarch with bounding sphere (R=800)
bool marchInterior(vec3 ro, vec3 rd, out vec3 hp){
  float t = 0.0;
  const float TMAX = 200.0; // Match original MAX_DEPTH
  for(int i=0; i<MAX_MARCH_STEPS; i++){ // Use framework constant
    vec3 p = ro + rd*t;
    float r = length(p);
    if (r > 800.0) return false; // left the fractal world
    float d = Dist(p);
    if (abs(d) < HIT_EPSILON){ // Use framework constant
      hp = p;
      return true;
    }
    t += d;
    if (t > TMAX) break;
  }
  return false;
}

// Face colors for orientation on miss
vec3 faceColor(int fid){
  if (fid==0) return vec3(1.0,0.3,0.3);      // +X
  if (fid==1) return vec3(0.3,1.0,0.3);      // -X
  if (fid==2) return vec3(0.3,0.6,1.0);      // +Y
  if (fid==3) return vec3(1.0,0.6,0.3);      // -Y
  if (fid==4) return vec3(0.9,0.9,0.2);      // +Z
  return vec3(0.6,0.3,1.0);                  // -Z
}

// Test if a ray exits a centered AABB while starting inside; find exit face
bool rayAABBExitInside(vec3 ro, vec3 rd, vec3 H, out float tExit, out int faceId){
  // ro is assumed inside |x|<=Hx etc.
  vec3 t1 = ( H - ro)/rd;
  vec3 t2 = (-H - ro)/rd;
  vec3 tMax = max(min(t1,t2), vec3(0.0));
  tExit = min(min(tMax.x, tMax.y), tMax.z);
  // Determine face
  vec3 p = ro + rd * tExit;
  vec3 a = step(vec3(0.0), vec3(H) - abs(p));
  if (a.x < 0.5) faceId = (p.x>0.0)?0:1;
  else if (a.y < 0.5) faceId = (p.y>0.0)?2:3;
  else faceId = (p.z>0.0)?4:5;
  return true;
}

// ===== Main =====
void main(){
  vec3 ro, rd;
  makeRay(ro, rd);

  vec3 col;
  
  // Handle debug modes
  if (uDebugMode == 1) {
    // Debug mode 1: Show skybox/face colors
    float H = 500.0; 
    float tExit; 
    int fid;
    bool ok = rayAABBExitInside(ro, rd, vec3(H), tExit, fid);
    col = ok ? faceColor(fid) : vec3(1.0, 0.0, 1.0);
  } else if (uDebugMode == 2) {
    // Debug mode 2: Gradient based on ray direction
    col = normalize(rd) * 0.5 + 0.5;
  } else if (uDebugMode == 3) {
    // Debug mode 3: Red on raymarch hit
    vec3 hp;
    bool hit = marchInterior(ro, rd, hp);
    col = hit ? uDebugColor : vec3(0.1, 0.1, 0.2);
  } else {
    // Normal rendering
    vec3 hp;
    bool hit = marchInterior(ro, rd, hp);
    if (hit){
      vec3 norm = GetNormal(hp);
      col = clamp(Shading(hp, rd, norm).xyz, 0.0, 1.0);
    } else {
      // Sky fallback with face colors for orientation
      float H = 500.0; 
      float tExit; 
      int fid;
      bool ok = rayAABBExitInside(ro, rd, vec3(H), tExit, fid);
      col = ok ? faceColor(fid) : vec3(1.0, 0.0, 1.0);
    }
  }

  if (uDebugStereo){
    float eyeId = step(0.0, (uInvViewMatrix * vec4(0.0,0.0,0.0,1.0)).x);
    col *= mix(vec3(1.0,0.9,0.9), vec3(0.9,0.9,1.0), eyeId);
  }
  
  outColor = vec4(col, 1.0);
}

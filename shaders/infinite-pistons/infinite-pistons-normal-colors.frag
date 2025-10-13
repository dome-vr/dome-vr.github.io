// REMOVED: #version directive (Three.js handles this)
precision highp float;

// ======= QUICK TOGGLES =======
#ifndef DEBUG_VIEW     // 0 = raymarch - show fractal3D infinite-pistons-color
#define DEBUG_VIEW 0   // 1 = show ray directions- color gradient (no marching)
#endif
#ifndef TEST_GEOM      // guaranteed hit-sphere off
#define TEST_GEOM 1    // 1 = add a guaranteed-visible test sphere/plane
#endif
#ifndef SHOW_NORMALS   // 0 = no normals
#define SHOW_NORMALS 1 // 1 = visualize normals (color) on hits
#endif

// ======= HOST UNIFORMS / DEFINES =======
in vec2 vNDC;
out vec4 fragColor;

uniform vec3  iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int   iFrame;
uniform mat4  uInvViewMatrix;
uniform mat4  uInvProjMatrix;
uniform bool  uDebugStereo;
uniform int   uMaxSteps;
uniform float uHitEps;
uniform float uNormalDelta;
uniform int   uAoSamples;
uniform int   uShadowSteps;
uniform float uFar;
uniform vec3  uAlignTranslate;

// Sky uniforms
uniform int  uSkyMode; // 0=black, 1=faceColors, 3=cubeTextures
uniform vec3 uSkyFaceColors[6];
uniform samplerCube uSkyCube;

#ifndef MAX_MARCH_STEPS
  #define MAX_MARCH_STEPS 768
#endif
#ifndef HIT_EPSILON
  #define HIT_EPSILON 0.00022
#endif
#ifndef NORMAL_EPSILON
  #define NORMAL_EPSILON 0.00040
#endif
#ifndef AO_SAMPLES
  #define AO_SAMPLES 14
#endif
#ifndef SHADOW_STEPS
  #define SHADOW_STEPS 96
#endif

// ======= OPTIONAL DOME PARAMS (safe defaults if not bound) =======
#ifndef UDOM_DEFAULT_ALPHA
  #define UDOM_DEFAULT_ALPHA 1.0
#endif
#ifndef UDOM_DEFAULT_AMBIENT
  #define UDOM_DEFAULT_AMBIENT 0.80
#endif
#ifndef UDOM_DEFAULT_HEADLIGHT
  #define UDOM_DEFAULT_HEADLIGHT 0.00
#endif
#ifndef UDOM_DEFAULT_SIZE
  #define UDOM_DEFAULT_SIZE 100.0
#endif
#ifndef UDOM_DEFAULT_CENTER
  #define UDOM_DEFAULT_CENTER vec3(0.0)
#endif

uniform float uDomeAlpha;
uniform float uDomeAmbient;
uniform float uDomeHeadlight;
uniform float uDomeFractalSize;
uniform vec3  uDomeFractalCenter;

float domAlpha()     { return (uDomeAlpha     == 0.0 ? UDOM_DEFAULT_ALPHA   : uDomeAlpha); }
float domAmbient()   { return (uDomeAmbient   == 0.0 ? UDOM_DEFAULT_AMBIENT : uDomeAmbient); }
float domHeadlight() { return (uDomeHeadlight == 0.0 ? UDOM_DEFAULT_HEADLIGHT : uDomeHeadlight); }
float domSize()      { return (uDomeFractalSize == 0.0 ? UDOM_DEFAULT_SIZE : uDomeFractalSize); }
vec3  domCenter()    { return (length(uDomeFractalCenter) == 0.0 ? UDOM_DEFAULT_CENTER : uDomeFractalCenter); }

// ======= Helpers / SDFs =======
float sdBox( vec3 p, vec3 b ){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdRoundedBox( vec3 p, vec3 b, float r ){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) - r + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdCappedCylinder(vec3 p, float h, float r){
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}
float sdSphere(vec3 p, float r){ return length(p)-r; }

vec3  opRepeat(vec3 p, vec3 c){ return mod(p + 0.5*c, c) - 0.5*c; }
vec2  opRepeat(vec2 p, vec2 c){ return mod(p + 0.5*c, c) - 0.5*c; }

float opSmoothU(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
  return mix(d2, d1, h) - k*h*(1.0-h);
}

// World-space ray from NDC using far-point unproject
vec3 getWorldRayDir(vec2 ndc){
  vec4 clip  = vec4(ndc, 1.0, 1.0);
  vec4 viewF = uInvProjMatrix * clip;
  viewF /= max(viewF.w, 1e-6);
  vec3 roW   = (uInvViewMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;
  vec3 pfW   = (uInvViewMatrix * vec4(viewF.xyz, 1.0)).xyz;
  return normalize(pfW - roW);
}
vec3 getWorldRayOrigin(){
  return (uInvViewMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;
}

// ======= Scene =======
struct Mat { float d; int id; };

Mat mapScene(vec3 p){
  p -= uAlignTranslate;
  p -= domCenter();

  // FIXED: Limit corridor depth to 25 pistons
  float corridorDepth = 300.0; // 25 segments * 12.0 spacing
  
  // Corridor shell: unsigned distance -> positive inside free space
  float corridor = abs(sdRoundedBox(p, vec3(6.0, 3.5, corridorDepth), 0.25)) - 0.02;

  // FIXED: Limit column repetition to visible range
  vec3 rp = p;
  float repeatLimitZ = 300.0; // 25 segments * 12.0 spacing
  if (abs(p.z) < repeatLimitZ) {
    rp.xz = opRepeat(rp.xz, vec2(4.0, 12.0));
  } else {
    // Beyond limit, fade out columns
    corridor = corridor + smoothstep(repeatLimitZ, repeatLimitZ + 10.0, abs(p.z)) * 10.0;
  }
  
  float colShell = abs(sdCappedCylinder(vec3(rp.x, p.y+1.0, rp.z), 3.0, 0.35)) - 0.02;

  // Simple arch (unsigned)
  float archShell = abs(sdCappedCylinder(vec3(rp.x, p.y-0.5, rp.z), 1.2, 1.8)) - 0.03;

  float d = opSmoothU(corridor, min(colShell, archShell), 0.2);

#if TEST_GEOM
  // Guaranteed visible test target near camera
  float testS = sdSphere(p - vec3(0.0, 0.0, -8.0), 2.5);
  d = min(d, testS);
#endif

  return Mat(d, 1);
}

vec3 calcNormal(vec3 p){
  const vec2 e = vec2(1.0,-1.0) * NORMAL_EPSILON;
  return normalize( e.xyy * mapScene(p + e.xyy).d +
                    e.yyx * mapScene(p + e.yyx).d +
                    e.yxy * mapScene(p + e.yxy).d +
                    e.xxx * mapScene(p + e.xxx).d );
}

float softShadow(vec3 ro, vec3 rd){
  float t = 0.02, res = 1.0;
  for (int i=0;i<SHADOW_STEPS;i++){
    vec3 p = ro + rd*t;
    float h = mapScene(p).d;
    if (h < 0.0005) return 0.0;
    res = min(res, 10.0*h/t);
    t += clamp(h, 0.02, 1.0);
    if (t>uFar) break;
  }
  return clamp(res, 0.0, 1.0);
}

float ao(vec3 p, vec3 n){
  float r = 0.0, occ = 0.0;
  for (int i=0;i<AO_SAMPLES;i++){
    r += 0.12;
    float d = mapScene(p + n * r).d;
    occ += (r - d);
  }
  return clamp(1.0 - occ * 0.5, 0.0, 1.0);
}

// ======= Raymarch / Shade =======
Mat march(vec3 ro, vec3 rd){
  float t = 0.0;
  Mat hit; hit.d = 1e9; hit.id = -1;

  for(int i=0;i<MAX_MARCH_STEPS;i++){
    if (t>uFar) break;
    vec3 p = ro + rd*t;
    Mat m = mapScene(p);
    if (m.d < uHitEps){
      hit = m; break;
    }
    float stepLen = max(m.d * 0.85, 0.003);
    t += stepLen;
  }
  if (hit.id != -1) hit.d = t;
  return hit;
}

vec3 shade(vec3 ro, vec3 rd, Mat hit){
  vec3 p = ro + rd*hit.d;
  vec3 n = calcNormal(p);

#if SHOW_NORMALS
  return 0.5 + 0.5*n;
#endif

  vec3 Ldir = normalize(vec3(0.6, 0.9, -0.3));
  vec3 V    = -rd;
  float NdotL = max(dot(n, Ldir), 0.0);
  float diff  = NdotL;
  float sh    = softShadow(p + n*0.01, Ldir);
  float amb   = domAmbient();
  float hl    = domHeadlight() * max(dot(n, V), 0.0);

  vec3  H     = normalize(Ldir + V);
  float spec  = pow(max(dot(n, H), 0.0), 64.0) * 0.25;

  float aoK   = ao(p, n);
  vec3 base   = vec3(0.75, 0.74, 0.72);
  vec3 col    = base * (amb + diff*sh) * aoK + spec + hl*0.25;

  if (uDebugStereo){
    col *= mix(vec3(1.0,0.97,0.97), vec3(0.97,1.0,0.97), 0.5 + 0.5*sin(iTime*2.0));
  }
  return col;
}

// FIXED: Sky modes - 0=black, 1=faceColors, 3=cubeTextures
vec3 skyColor(vec3 dir) {
  // Mode 3 = cubeTextures
  if (uSkyMode == 3) {
    vec3 cubeDir = normalize(dir);
    // cubeDir.y = -cubeDir.y;  // Uncomment if sky is upside down
    
    vec4 skyTexel = texture(uSkyCube, cubeDir);
    
    // If texture is black/not loaded, fallback to 6-color faceColors
    if (dot(skyTexel.rgb, skyTexel.rgb) < 0.001) {
      vec3 a = abs(dir);
      int idx = 0;
      if (a.x > a.y && a.x > a.z) { idx = (dir.x > 0.0) ? 0 : 1; }      // +X, -X
      else if (a.y > a.x && a.y > a.z) { idx = (dir.y > 0.0) ? 2 : 3; } // +Y, -Y
      else { idx = (dir.z > 0.0) ? 4 : 5; }                             // +Z, -Z
      return uSkyFaceColors[idx];
    }
    
    return skyTexel.rgb;
  } 
  // Mode 1 = faceColors
  else if (uSkyMode == 1) {
    vec3 a = abs(dir);
    int idx = 0;
    if (a.x > a.y && a.x > a.z) { idx = (dir.x > 0.0) ? 0 : 1; }      // +X, -X
    else if (a.y > a.x && a.y > a.z) { idx = (dir.y > 0.0) ? 2 : 3; } // +Y, -Y
    else { idx = (dir.z > 0.0) ? 4 : 5; }                             // +Z, -Z
    return uSkyFaceColors[idx];
  }
  // Mode 0 or anything else = black
  return vec3(0.0);
}

// ======= Main =======
void main(){
#if DEBUG_VIEW
  vec3 rdDbg = getWorldRayDir(vNDC);
  fragColor = vec4(0.5 + 0.5*normalize(rdDbg), 1.0);
  return;
#endif

  vec3 ro  = getWorldRayOrigin();
  vec3 rd  = getWorldRayDir(vNDC);

  Mat h = march(ro, rd);
  vec3 col;
  if (h.id != -1) {
    col = shade(ro, rd, h);
  } else {
    col = skyColor(rd);
  }
  fragColor = vec4(col, domAlpha());
}

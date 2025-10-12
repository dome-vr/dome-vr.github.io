
precision highp float;


// ===== Ultra-slim beam controls =====
#ifndef TUNNEL_RADIUS
#define TUNNEL_RADIUS 0.68     // base tunnel radius (smaller → thinner beams)
#endif
#ifndef TUNNEL_TAPER
#define TUNNEL_TAPER 0.65     // 0..1 amount of vertical taper (thinner higher up)
#endif
#ifndef ANISO_YZ
#define ANISO_YZ 0.60     // squeeze Z in YZ circle (nave ribs)
#endif
#ifndef ANISO_XZ
#define ANISO_XZ 0.60     // squeeze Z in XZ circle (transept ribs)
#endif
#ifndef ANISO_XY
#define ANISO_XY 0.80     // squeeze X in XY circle (vertical shaft feel)
#endif
#ifndef PIER_RADIUS
#define PIER_RADIUS 0.35     // shrink piers further
#endif
#ifndef BEAM_ERODE
#define BEAM_ERODE 0.20     // global erosion of solids
#endif


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

// ===== Math helpers =====
#ifndef COLOR_PERIOD_SEC
#define COLOR_PERIOD_SEC 45.0
#endif
#ifndef COLOR_SPATIAL_FREQ
#ifndef COLOR_TIME_ONLY_WEIGHT

#ifndef PAL_BASE
#define PAL_BASE 1.0           // mean = 1.0 so it doesn't dim overall
#endif
#ifndef PAL_AMPL
#define PAL_AMPL 0.25          // 0.15–0.35 recommended for stronger effect
#endif
#ifndef PAL_BLEND
#define PAL_BLEND 0.60         // 0 = only tint; 1 = only palette
#endif
#define COLOR_TIME_ONLY_WEIGHT 0.25
#endif

#define COLOR_SPATIAL_FREQ 0.5
#endif
#ifndef COLOR_AMPL
#define COLOR_AMPL 0.25
#endif
#ifndef COLOR_BASE
#define COLOR_BASE 0.90
#endif
const float TAU = 6.283185307179586;
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,-s,0., s,c,0., 0.,0.,1.); }

vec3 applyCardinalAlign(vec3 p){
  vec3 r = radians(vec3(ALIGN_PITCH_DEG, ALIGN_YAW_DEG, ALIGN_ROLL_DEG));
  // Roll(Z) ∘ Pitch(X) ∘ Yaw(Y)
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


// ===== Anisotropic cross-tunnel (elliptical cross-sections) =====
float sdCrossTunnelAniso(vec3 p, vec3 an, float r){
  // an = (ayz_for_Z, axz_for_Z, axy_for_X) scaling factors (<=1 squeezes the 2nd coordinate)
  float dx = length(vec2(p.y, p.z*an.x)) - r;   // tunnel along X (YZ circle)
  float dy = length(vec2(p.x, p.z*an.y)) - r;   // tunnel along Y (XZ circle)
  float dz = length(vec2(p.x*an.z, p.y)) - r;   // tunnel along Z (XY circle)
  return min(min(dx,dy),dz);
}
// ===== Simple cathedral-like SDF (orthogonal cross tunnels) =====
float sdCrossTunnel(vec3 p, float r){
  float dx = length(p.yz) - r;
  float dy = length(p.xz) - r;
  float dz = length(p.xy) - r;
  return min(min(dx,dy),dz);
}

// Core DE — apply world translate then alignment so structure is world-aligned
float cathedralDE(vec3 pos){
  // shift world so eye spawns in a clear corridor using app-provided uAlignTranslate
  vec3 p = applyCardinalAlign(pos - uAlignTranslate);

  // Repeat space to emulate nave/aisles (grid of bays)
  const vec3 cell = vec3(8.0, 6.0, 10.0);
  vec3 q = mod(p + 0.5*cell, cell) - 0.5*cell;

  // Tunnels (nave along -Z, transept along X, vertical)
  float heightN = clamp(abs(q.y)/(0.5*cell.y), 0.0, 1.0);
  heightN = pow(heightN, 2.0);
  float rEff = TUNNEL_RADIUS * (1.0 - TUNNEL_TAPER * heightN);
  float d = sdCrossTunnelAniso(q, vec3(ANISO_YZ, ANISO_XZ, ANISO_XY), rEff);

  // Piers (cylinders at grid corners)
  vec2 id = floor((p.xz + 0.5*cell.xz)/cell.xz);
  vec3 pc = vec3(id.x*cell.x, 0.0, id.y*cell.z);
  float pier = length(vec2(p.x - pc.x, p.z - pc.z)) - PIER_RADIUS;
  d = min(d, pier);
  d += BEAM_ERODE;  // global erosion → slimmer everywhere

  // Add debug planes if enabled
  d = min(d, axisPlanesDE(p));
  return d;
}

// ===== Ray utilities =====
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

// Numerical normal
vec3 calcNormal(vec3 p){
  const float e = 0.0015;
  const vec2 k = vec2(1.0,-1.0);
  return normalize( k.xyy*cathedralDE(p + k.xyy*e) +
                    k.yyx*cathedralDE(p + k.yyx*e) +
                    k.yxy*cathedralDE(p + k.yxy*e) +
                    k.xxx*cathedralDE(p + k.xxx*e) );
}

// Raymarch inside bounding sphere (R=800)
bool marchInterior(vec3 ro, vec3 rd, out vec3 hp){
  float t = 0.0;
  const float TMAX = 800.0;
  for(int i=0;i<256;i++){
    vec3 p = ro + rd*t;
    float r = length(p);
    if (r > 800.0) return false; // left the cathedral world
    float d = cathedralDE(p);
    if (d < 0.0008){
      hp = p;
      return true;
    }
    t += clamp(d, 0.001, 2.5);
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
  vec3 hp;
  bool hit = marchInterior(ro, rd, hp);
  if (hit){
    vec3 n = calcNormal(hp);
    vec3 L1 = normalize(vec3(-0.7, 0.6, -0.5));
    vec3 L2 = normalize(vec3( 0.5, 0.3,  0.7));
    float d1 = max(0.0, dot(n, L1));
    float d2 = max(0.0, dot(n, L2))*0.5;
    float ao = 1.0;
    // tiny AO probe
    for (int i=0;i<4;++i){ ao -= 0.08 * smoothstep(0.0, 0.15, cathedralDE(hp + n * (0.04*float(i+1)))); }
    ao = clamp(ao, 0.45, 1.0);
    col = mix(vec3(0.26,0.28,0.32), vec3(0.96,0.97,1.0), d1 + d2) * ao;
// Time-varying position-sine tint (~COLOR_PERIOD_SEC seconds per cycle)
    float phase = TAU * (iTime / COLOR_PERIOD_SEC);
    // Channel phase offsets for gentle hue travel
    vec3 phaseRGB = vec3(phase, phase + 2.094395102, phase + 4.188790205); // 0°, 120°, 240°
    vec3 posTerm = sin(hp * COLOR_SPATIAL_FREQ + phaseRGB);
    vec3 timeTerm = sin(phaseRGB);
    vec3 tint = COLOR_BASE + COLOR_AMPL * mix(posTerm, timeTerm, COLOR_TIME_ONLY_WEIGHT);
    // Stronger cosine palette (phase-only), mean ~1.0 to preserve brightness
    vec3 pal  = PAL_BASE + PAL_AMPL * cos(phaseRGB);
    col *= mix(tint, pal, PAL_BLEND);

} else {
    float H = 500.0; float tExit; int fid;
    bool ok = rayAABBExitInside(ro, rd, vec3(H), tExit, fid);
    col = ok ? faceColor(fid) : vec3(1.0, 0.0, 1.0);
  }

  if (uDebugStereo){
    float eyeId = step(0.0, (uInvViewMatrix * vec4(0.0,0.0,0.0,1.0)).x);
    col *= mix(vec3(1.0,0.9,0.9), vec3(0.9,0.9,1.0), eyeId);
  }
  outColor = vec4(col, 1.0);
}

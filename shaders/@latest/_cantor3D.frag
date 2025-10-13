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

// color cycling uniforms (5 total)
uniform bool uColorCycleActive;
uniform float uColorCycleSpeed;
uniform float uColorCycleAmplitude;
uniform vec3 uColorCycleOffset;
uniform vec3 uColorCyclePhase;

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






// iTime provided by framework

// precision handled by ES 300 header

// iTime provided by framework   //iTime;  
// uResolution provided by framework // GLSL built-in ?
//uniform vec3 uCam_fwd;  //cameraLookat; // 0,0,0

#ifndef GAMMA
#define GAMMA 0.8
#endif
#ifndef AO_SAMPLES
#define AO_SAMPLES 5
#endif
#ifndef RAY_DEPTH
#define RAY_DEPTH 256
#endif
#ifndef MAX_DEPTH
#define MAX_DEPTH 200.0
#endif
#ifndef SHADOW_RAY_DEPTH
#define SHADOW_RAY_DEPTH 16
#endif
#ifndef DISTANCE_MIN
#define DISTANCE_MIN 0.001
#endif
#ifndef PI
#define PI 3.14159265
#endif

const vec2 delta = vec2(0.001, 0.);
const vec3 cameraPos = vec3(0,0,1);  //cameraPos; // 0,0,0
const vec3 cameraLookat = vec3(0,0,-1);  //cameraLookat; // 0,0,0
const vec3 lightDir = vec3(-2.0,0.8,-1.0);
const vec3 lightColour = vec3(2.0,1.8,1.5);
const float specular = 64.0;
const float specularHardness = 512.0;
const vec3 diffuse = vec3(0.25,0.25,0.25);
const float ambientFactor = 2.65;  // 0.65
const bool ao = true;
const bool shadows = true;
//const bool rotateWorld = true;
const bool antialias = false;


vec3 RotateY(vec3 p, float a)
{
   float c,s;
   vec3 q=p;
   c = cos(a);
   s = sin(a);
   p.x = c * q.x + s * q.z;
   p.z = -s * q.x + c * q.z;
   return p;
}

float Cross(vec3 p)
{
   p = abs(p);
   vec3 d = vec3(max(p.x, p.y),
                 max(p.y, p.z),
                 max(p.z, p.x));
   return min(d.x, min(d.y, d.z)) - (1.0 / 3.0);
}

float CrossRep(vec3 p)
{
   vec3 q = mod(p + 1.0, 2.0) - 1.0;
   return Cross(q);
}

float CrossRepScale(vec3 p, float s)
{
   return CrossRep(p * s) / s;   
}

const int MENGER_ITERATIONS = 4;

float OriginalDist(vec3 pos)
{
   //if (rotateWorld) pos = RotateY(pos, sin(iTime*0.025)*PI);
   
   float scale = 0.05;
   float dist = 0.0;
   for (int i = 0; i < MENGER_ITERATIONS; i++)
   {
      dist = max(dist, -CrossRepScale(pos, scale));
      scale *= 3.0;
   }
   return dist;
}

// Based on original by IQ - optimized to remove a divide
float CalcAO(vec3 p, vec3 n)
{
   float r = 0.0;
   float w = 1.0;
   for (int i=1; i<=AO_SAMPLES; i++)
   {
      float d0 = float(i) * 0.3;
      r += w * (d0 - OriginalDist(p + n * d0));
      w *= 0.5;
   }
   return 1.0 - clamp(r,0.0,1.0);
}

// Based on original code by IQ
float SoftShadow(vec3 ro, vec3 rd, float k)
{
   float res = 1.0;
   float t = 0.1;          // min-t see http://www.iquilezles.org/www/articles/rmshadows/rmshadows.htm
   for (int i=0; i<SHADOW_RAY_DEPTH; i++)
   {
      if (t < 20.0)  // max-t
      {
         float h = OriginalDist(ro + rd * t);
         res = min(res, k*h/t);
         t += h;
      }
   }
   return clamp(res, 0.0, 1.0);
}

vec3 GetNormal(vec3 pos)
{
   vec3 n;
   n.x = OriginalDist( pos + delta.xyy ) - OriginalDist( pos - delta.xyy );
   n.y = OriginalDist( pos + delta.yxy ) - OriginalDist( pos - delta.yxy );
   n.z = OriginalDist( pos + delta.yyx ) - OriginalDist( pos - delta.yyx );
   
   return normalize(n);
}

// Based on a shading method by Ben Weston. Added AO and SoftShadows to original.
vec4 Shading(vec3 pos, vec3 rd, vec3 norm)
{
   vec3 light = lightColour * max(0.0, dot(norm, lightDir));
   vec3 heading = normalize(-rd + lightDir);
   float spec = pow(max(0.0, dot(heading, norm)), specularHardness);
   
   light = (diffuse * light) + (spec * specular * lightColour);
   if (shadows) light *= SoftShadow(pos, lightDir, 16.0);
   if (ao) light += CalcAO(pos, norm) * ambientFactor;
   return vec4(light, 1.0);
}

// Original method by David Hoskins
vec3 Sky(in vec3 rd)
{
   float sunAmount = max(dot(rd, lightDir), 0.0);
   float v = pow(1.0 - max(rd.y,0.0),6.);
   vec3 sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
   sky += lightColour * sunAmount * sunAmount * .25 + lightColour * min(pow(sunAmount, 800.0)*1.5, .3);
   
   return clamp(sky, 0.0, 1.0);
}

// Camera function by TekF
// Compute ray from camera parameters
vec3 GetRay(vec3 dir, vec2 pos)
{
   pos = pos - 0.5;
   pos.x *= uResolution.x/uResolution.y;
   
   dir = normalize(dir);
   vec3 right = normalize(cross(vec3(0.,1.,0.),dir));
   vec3 up = normalize(cross(dir,right));
   
   return dir + right*pos.x + up*pos.y;
}

vec4 March(vec3 ro, vec3 rd)
{
   float t = 0.0;
   float d = 1.0;
   for (int i=0; i<RAY_DEPTH; i++)
   {
      vec3 p = ro + rd * t;
      d = OriginalDist(p);
      if (abs(d) < DISTANCE_MIN)
      {
         return vec4(p, 1.0);
      }
      t += d;
      if (t >= MAX_DEPTH) break;
   }
   return vec4(0.0);
}

// Original main() replaced by dome-sh framework


// ===== End Original Code =====

// Dome-sh dual rendering paths with color cycling support
vec4 DomeDefaultShading(vec3 ro, vec3 rd, float t, vec3 n, vec3 baseCol){
  vec3 L = normalize(vec3(0.6,0.7,0.5));
  float diff = max(dot(n,L),0.0);
  
  // Simple solid color approach - no spatial patterns
  vec3 surfaceColor;
  
  if (uColorCycleActive) {
    // Simple animated color cycling - time-based only (no spatial variation)
    float timeShift = iTime * uColorCycleSpeed;
    
    vec3 colorShift = uColorCycleAmplitude * cos(
      6.28318 * (
        uColorCycleOffset +              // User-configurable palette offset
        uColorCyclePhase * timeShift     // Pure time-based cycling (no spatial frequency)
      )
    );
    
    // Simple solid base color
    vec3 staticColor = vec3(0.7, 0.75, 0.8);  // Light blue-gray solid
    surfaceColor = staticColor + colorShift;
  } else {
    // Simple solid color - no patterns
    surfaceColor = vec3(0.7, 0.75, 0.8);  // Light blue-gray
  }
  
  // Basic lighting
  vec3 ambient = vec3(0.2, 0.2, 0.25) * surfaceColor;
  vec3 diffuse = diff * surfaceColor * 0.8;
  
  return vec4(ambient + diffuse, 1.0);
}

vec4 DomeOriginalShading(vec3 ro, vec3 rd, float t, vec3 n, vec3 baseCol){
  vec3 hitPoint = ro + t * rd;
  vec3 baseColor;
  
  if (uColorCycleActive) {
    // Complex animated color cycling with spatial variation
    float timeShift = iTime * uColorCycleSpeed;
    
    // Use spatial frequency for complex patterns
    vec3 fixedFrequency = vec3(1.0, 1.2, 0.8);  // Original palette frequency
    
    vec3 colorShift = uColorCycleAmplitude * cos(
      6.28318 * (
        uColorCycleOffset +              // User-configurable palette offset
        fixedFrequency * hitPoint +      // Spatial frequency for complex patterns
        uColorCyclePhase * timeShift     // User-configurable rainbow cycling
      )
    );
    
    // Complex procedural base with spatial patterns
    vec3 staticColor = vec3(0.5) + 0.3 * cos(6.28318 * (vec3(0.1, 0.2, 0.3) + vec3(0.4, 0.3, 0.2) * hitPoint));
    baseColor = staticColor + colorShift;
  } else {
    // Complex static version with procedural patterns
    baseColor = vec3(0.5) + 0.3 * cos(6.28318 * (vec3(0.1, 0.2, 0.3) + vec3(0.4, 0.3, 0.2) * hitPoint));
  }
  
  // Enhanced lighting calculation
  vec3 ambient = vec3(0.1, 0.1, 0.15) * baseColor;
  vec3 lightDir = normalize(vec3(0.6, 0.7, 0.5));
  float diff = max(dot(n, lightDir), 0.0);
  vec3 diffuse = diff * baseColor;
  
  // Add subtle specular highlight
  vec3 viewDir = normalize(-rd);
  vec3 reflectDir = reflect(-lightDir, n);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
  vec3 specular = spec * vec3(0.2) * baseColor;
  
  vec3 color = ambient + diffuse + specular;
  return vec4(color, 1.0);
}

// Integrated distance function with alignment and scaling
float Dist(vec3 pos) {
  vec3 p = applyCardinalAlign(pos - uAlignTranslate);
  float d = OriginalDist(p);
  // Only apply scaling if not 1.0
  if (abs(uDomeSize - 1.0) > 0.001) {
    p = p * uDomeSize;
    d = OriginalDist(p);
    d = d / uDomeSize;
  } 
  d = min(d, axisPlanesDE(p));
  return d;
}

// Raymarching function for dome-sh
bool march(vec3 ro, vec3 rd, out float t, out vec3 hp){
  t=0.0;
  for(int i=0;i<MAX_MARCH_STEPS;i++){
    vec3 p = ro+rd*t;
    if(length(p)>800.0) return false;
    float d = Dist(p);
    if(abs(d)<float(HIT_EPSILON)){ hp=p; return true; }
    t += d;
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

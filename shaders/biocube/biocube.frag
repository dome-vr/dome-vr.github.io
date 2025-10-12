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
uniform vec2 uResolution;  // Add uResolution for compatibility

// world translation (meters) supplied by app config
uniform vec3 uAlignTranslate;

// Debug uniforms (from framework)
uniform int uDebugMode;
uniform vec3 uDebugColor;
uniform vec4 uDebugData;

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


// ===== Original Shader Code (modified) =====



// uResolution provided by framework
// iTime provided by framework



// Rotation matrix around axis
mat3 rotationMatrix3(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

// BioCube Distance Estimator (simplified)
float DE(vec3 z) {
    vec3 z0 = z;
    z = abs(z);
    
    // Simplified parameters
    float scale = 2.0;
    int iterations = 8;
    vec3 offset = vec3(0.8, 0.8, 0.8);
    vec3 offset2 = vec3(0.3, 0.3, 0.3);
    float qube = 1.0;
    
    // Initial icosahedral fold
    if (z.y > z.x) z.xy = z.yx;
    if (z.z > z.x) z.xz = z.zx;
    if (z.y > z.x) z.xy = z.yx;
    
    float DE1 = 1.0 - z.x;
    z = z0;
    
    // Animated rotation
    vec3 rotAxis = normalize(vec3(1.0, 1.0, 0.5));
    float rotAngle = iTime * 0.1;
    mat3 fracRotation1 = scale * rotationMatrix3(rotAxis, rotAngle);
    
    float scalep = 1.0;
    
    // Main iteration loop
    for (int n = 0; n < iterations; n++) {
        z *= fracRotation1;
        z = abs(z);
        z -= offset;
        
        // Icosahedral fold sequence
        if (z.y > z.x) z.xy = z.yx;
        if (z.z > z.x) z.xz = z.zx;
        if (z.y > z.x) z.xy = z.yx;
        
        z -= offset2;
        
        // Second icosahedral fold sequence
        if (z.y > z.x) z.xy = z.yx;
        if (z.z > z.x) z.xz = z.zx;
        if (z.y > z.x) z.xy = z.yx;
        
        scalep *= scale;
        DE1 = abs(min(qube / float(n + 1) - DE1, z.x / scalep));
        
        if (length(z) > 4.0) break;
    }
    
    return DE1;
}

// Calculate surface normal
vec3 calcNormal(vec3 p) {
    const float h = 0.001;
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * DE(p + k.xyy * h) +
                     k.yyx * DE(p + k.yyx * h) +
                     k.yxy * DE(p + k.yxy * h) +
                     k.xxx * DE(p + k.xxx * h));
}

// Raymarching
float rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < 80; i++) {
        vec3 p = ro + t * rd;
        float d = DE(p);
        if (d < 0.001) return t;
        if (t > 20.0) break;
        t += d;
    }
    return -1.0;
}

// Lighting
vec3 lighting(vec3 p, vec3 n, vec3 rd) {
    vec3 lightPos = vec3(3.0, 4.0, 5.0);
    vec3 lightDir = normalize(lightPos - p);
    vec3 viewDir = -rd;
    
    // Material color based on position
    vec3 baseColor = vec3(0.5) + 0.5 * cos(6.28318 * (vec3(0.1, 0.2, 0.3) + vec3(0.4, 0.3, 0.2) * p));
    
    // Add fractal iteration coloring
    float de = DE(p);
    baseColor *= (1.0 + 0.3 * sin(de * 30.0 + iTime));
    
    // Ambient
    vec3 ambient = vec3(0.1, 0.1, 0.15) * baseColor;
    
    // Diffuse
    float diff = max(dot(n, lightDir), 0.0);
    vec3 diffuse = diff * baseColor;
    
    // Specular
    vec3 reflectDir = reflect(-lightDir, n);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = spec * vec3(0.8);
    
    return ambient + diffuse + specular;
}

// Original main() replaced by dome-sh framework

// ===== End Original Code =====

// Integrated distance function with alignment
float Dist(vec3 pos) {
  // Apply world alignment
  vec3 p = applyCardinalAlign(pos - uAlignTranslate);
  
  // Combine original distance function with debug planes
  float d = DE(p);
  d = min(d, axisPlanesDE(p));
  return d;
}

// Normal estimation using finite differences
vec3 GetNormal(vec3 pos) {
  float eps = 0.001;
  vec3 n;
  n.x = Dist(pos + vec3(eps,0.0,0.0)) - Dist(pos - vec3(eps,0.0,0.0));
  n.y = Dist(pos + vec3(0.0,eps,0.0)) - Dist(pos - vec3(0.0,eps,0.0));
  n.z = Dist(pos + vec3(0.0,0.0,eps)) - Dist(pos - vec3(0.0,0.0,eps));
  return normalize(n);
}

// Simple shading function (fallback when source had no Shading())
vec4 Shading(vec3 pos, vec3 rd, vec3 norm) {
  const vec3 lightDir = vec3(-0.5, 0.8, -0.6);
  const vec3 lightColour = vec3(1.0, 0.9, 0.8);
  vec3 light = lightColour * max(0.0, dot(norm, lightDir));
  vec3 heading = normalize(-rd + lightDir);
  float spec = pow(max(0.0, dot(heading, norm)), 64.0);
  //light = light * 0.5 + spec * 0.3;
  light = light * 0.9 + spec * 0.3;
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

// Raymarch with bounding sphere
bool marchInterior(vec3 ro, vec3 rd, out vec3 hp){
  float t = 0.0;
  float TMAX = float(FAR_PLANE);
  for(int i=0; i<MAX_MARCH_STEPS; i++){
    vec3 p = ro + rd*t;
    float r = length(p);
    if (r > 800.0) return false; // left the fractal world
    float d = Dist(p);
    if (abs(d) < float(HIT_EPSILON)){
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

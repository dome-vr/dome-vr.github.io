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
// rayMarch() removed - replaced by dome-sh framework

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
  
  // USE UNIFORMS: Basic lighting with uAmbient and uHeadlight
  vec3 ambient = uAmbient * surfaceColor;
  vec3 diffuse = uHeadlight * diff * surfaceColor;
  
  // TEST: Add debug visualization of uniform values
  // Uncomment this line to see uniform values as colors:
  // return vec4(uAmbient * 10.0, uHeadlight, 0.0, 1.0);
  
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
  
  // USE UNIFORMS: Enhanced lighting calculation with uAmbient and uHeadlight
  vec3 ambient = uAmbient * baseColor;
  vec3 lightDir = normalize(vec3(0.6, 0.7, 0.5));
  float diff = max(dot(n, lightDir), 0.0);
  vec3 diffuse = uHeadlight * diff * baseColor;
  
  // Add subtle specular highlight (fixed intensity)
  vec3 viewDir = normalize(-rd);
  vec3 reflectDir = reflect(-lightDir, n);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
  vec3 specular = spec * vec3(0.1) * baseColor; // Reduced specular
  
  // TEST: Add debug visualization of uniform values
  // Uncomment this line to see uniform values as colors:
  // return vec4(uAmbient * 10.0, uHeadlight, 0.0, 1.0);
  
  vec3 color = ambient + diffuse + specular;
  return vec4(color, 1.0);
}

// Integrated distance function with alignment and scaling
float Dist(vec3 pos) {
  vec3 p = applyCardinalAlign(pos - uAlignTranslate);
  float d = DE(p);
  // Only apply scaling if not 1.0
  if (abs(uDomeSize - 1.0) > 0.001) {
    p = p * uDomeSize;
    d = DE(p);
    d = d / uDomeSize;
  } 
  d = min(d, axisPlanesDE(p));
  return d;
}

vec3 GetNormal(vec3 pos) {
  return calcNormal(pos);
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

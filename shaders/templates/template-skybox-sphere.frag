// REMOVED: #version directive (Three.js handles this)
precision highp float;

// Inputs from vertex shader
in vec2 vNDC;
out vec4 fragColor;

// Camera + navigation
uniform mat4 uInvViewMatrix;
uniform mat4 uInvProjMatrix;

// Raymarch controls (populated via #defines from JS)
uniform float uFar;
uniform float uHitEps;
uniform int   uMaxSteps;

// Sky uniforms
uniform int uSkyMode;    // 0=black,1=faceColors,2=gradient,3=cube
uniform vec3 uSkyFaceColors[6];
uniform samplerCube uSkyCube;

// ----------------- math helpers -----------------
vec3 camPos() {
  return (uInvViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
}

vec3 rayDirFromNDC(vec2 ndc) {
  // clip -> view
  vec4 pClip = vec4(ndc, -1.0, 1.0);
  vec4 pView = uInvProjMatrix * pClip;
  pView /= max(1e-6, pView.w);
  // view -> world (treat as direction)
  vec3 dirWorld = (uInvViewMatrix * vec4(pView.xyz, 0.0)).xyz;
  return normalize(dirWorld);
}

// ----------------- scene SDF -----------------
float sdf(vec3 p) {
  return length(p) - 1.0; // unit sphere
}

vec3 calcNormal(vec3 p) {
  const float e = 1e-3;
  vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * sdf(p + k.xyy*e) +
                   k.yyx * sdf(p + k.yyx*e) +
                   k.yxy * sdf(p + k.yxy*e) +
                   k.xxx * sdf(p + k.xxx*e));
}

// ----------------- sky -----------------

// FIXED: Now uses the uSkyFaceColors uniform instead of hardcoded colors
vec3 faceColor(int fid){
  // Clamp face ID to valid range and return the uniform color
  int clampedFid = clamp(fid, 0, 5);
  return uSkyFaceColors[clampedFid];
}

vec3 skyColor(vec3 rd){
  if(uSkyMode==1){
    int fid = (abs(rd.x)>abs(rd.y) && abs(rd.x)>abs(rd.z)) ? (rd.x>0.0?0:1)
             : (abs(rd.y)>abs(rd.z) ? (rd.y>0.0?2:3) : (rd.z>0.0?4:5));
    return faceColor(fid);
  } else if(uSkyMode==2){
    return normalize(rd)*0.5+0.5;
  } else if(uSkyMode==3){
    return texture(uSkyCube, rd).rgb;
  }
  return vec3(0.0);        //uSkyMode NOT 1,2,3
}

// ----------------- raymarch -----------------
bool march(vec3 ro, vec3 rd, out vec3 hitPos, out vec3 hitN) {
  float t = 0.0;
  for (int i = 0; i < 1024; ++i) {
    if (i >= uMaxSteps) break;
    vec3 p = ro + t * rd;
    float d = sdf(p);
    if (d < uHitEps) {
      hitPos = p;
      hitN = calcNormal(p);
      return true;
    }
    t += d;
    if (t > uFar) break;
  }
  return false;
}

void main() {
  vec3 ro = camPos();
  vec3 rd = rayDirFromNDC(vNDC);

  vec3 hitPos, hitN;
  bool hit = march(ro, rd, hitPos, hitN);

  if (!hit) {
    vec3 c = skyColor(rd);
    fragColor = vec4(c, 1.0);
    return;
  }

  // Simple shading
  vec3 L = normalize(vec3(0.577, 0.577, 0.577)); // light dir
  float NdotL = max(0.0, dot(hitN, L));
  vec3 base = vec3(0.85, 0.85, 0.92);
  vec3 col = base * (0.2 + 0.8 * NdotL);
  fragColor = vec4(col, 1.0);
}

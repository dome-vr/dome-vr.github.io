
in vec2 vNDC;
out vec4 outColor;
uniform mat4 uInvViewMatrix;
uniform mat4 uInvProjMatrix;
uniform bool uDebugStereo;


// ===== Thinning controls (moire variant) =====
#ifndef TUNNEL_RADIUS
#define TUNNEL_RADIUS 1.65   // > 1.25 → bigger tunnels → thinner beams
#endif
#ifndef TUNNEL_TAPER
#define TUNNEL_TAPER  0.55   // 0..1, tunnels widen higher up
#endif
#ifndef ANISO_YZ
#define ANISO_YZ      0.75   // YZ squeeze (nave ribs)
#endif
#ifndef ANISO_XZ
#define ANISO_XZ      0.75   // XZ squeeze (transept ribs)
#endif
#ifndef ANISO_XY
#define ANISO_XY      0.90   // XY squeeze (vertical feel)
#endif
#ifndef DILATE_FIELD
#define DILATE_FIELD  0.10   // subtract from SDF → dilate tunnels globally
#endif


// ===== Helpers =====
float sdCrossTunnel(vec3 p, float r){
  float dx = length(p.yz) - r;
  float dy = length(p.xz) - r;
  float dz = length(p.xy) - r;
  return min(min(dx,dy),dz);
}
vec3 repeat3(vec3 p, vec3 c){ return mod(p + 0.5*c, c) - 0.5*c; }

// Anisotropic cross-tunnel (elliptical cross-sections)
float sdCrossTunnelAniso(vec3 p, vec3 an, float r){
  float dx = length(vec2(p.y, p.z*an.x)) - r;   // along X (YZ circle)
  float dy = length(vec2(p.x, p.z*an.y)) - r;   // along Y (XZ circle)
  float dz = length(vec2(p.x*an.z, p.y)) - r;   // along Z (XY circle)
  return min(min(dx,dy),dz);
}

// Signed "tunnel" field (negative inside tunnels, positive in solid)
float tunnelSDF(vec3 pos){
  // Optional slight fixed rotation to avoid perfect axis alignment
  float ca = 0.18, sa = 0.984; // cos/sin ~ rotate around Y by ~0.18 rad
  vec3 p = vec3(ca*pos.x + sa*pos.z, pos.y, -sa*pos.x + ca*pos.z);
  // Repeat cells
  vec3 cell = vec3(6.0);
  vec3 q = repeat3(p, cell);
  // Height-based widening (thinner beams higher up), quadratic taper
  float heightN = clamp(abs(q.y)/(0.5*cell.y), 0.0, 1.0);
  heightN = pow(heightN, 2.0);
  float rEff = TUNNEL_RADIUS * (1.0 + TUNNEL_TAPER * heightN);
  // Anisotropic cross-sections for a more delicate feel
  float d = sdCrossTunnelAniso(q, vec3(ANISO_YZ, ANISO_XZ, ANISO_XY), rEff);
  // Global dilation (subtract) -> tunnels larger, beams thinner
  d -= DILATE_FIELD;
  return d;
}

vec3 calcNormal(vec3 p){
  float e = 0.003;
  return normalize(vec3(
    tunnelSDF(p + vec3(e,0,0)) - tunnelSDF(p - vec3(e,0,0)),
    tunnelSDF(p + vec3(0,e,0)) - tunnelSDF(p - vec3(0,e,0)),
    tunnelSDF(p + vec3(0,0,e)) - tunnelSDF(p - vec3(0,0,e))
  ));
}

// March ONLY inside bounding sphere of R=800; if we leave it, report miss.
bool marchInterior(vec3 ro, vec3 rd, out vec3 hp){
  float t = 0.0;
  const float R = 800.0;
  for (int i=0; i<120; ++i){
    vec3 p = ro + rd * t;
    if (length(p) > R) { return false; }           // left the interior bound
    float dSigned = tunnelSDF(p);
    float d = abs(dSigned);                         // inside-safe step
    if (d < 0.0025) { hp = p; return true; }
    t += max(d, 0.01);
  }
  return false;
}

vec3 faceColor(int fid){
  if (fid == 0) return vec3(1.0, 0.1, 0.1);   // +X red
  if (fid == 1) return vec3(1.0, 0.9, 0.1);   // -X yellow
  if (fid == 2) return vec3(0.1, 1.0, 0.1);   // +Y green
  if (fid == 3) return vec3(0.1, 1.0, 1.0);   // -Y cyan
  if (fid == 4) return vec3(0.1, 0.3, 1.0);   // +Z blue
  return vec3(1.0, 0.1, 1.0);                 // -Z magenta
}
bool rayAABBExitInside(in vec3 ro, in vec3 rd, in vec3 b, out float tExit, out int faceId){
  vec3 inv = 1.0 / max(abs(rd), vec3(1e-6)) * sign(rd);
  vec3 t1 = (-b - ro) * inv;
  vec3 t2 = ( b - ro) * inv;
  vec3 tmax = max(t1, t2);
  float tx=tmax.x, ty=tmax.y, tz=tmax.z;
  float tFar = min(tx, min(ty, tz));
  if (tFar <= 0.0) return false;
  if (tx <= ty && tx <= tz) faceId = (rd.x > 0.0) ? 0 : 1;
  else if (ty <= tx && ty <= tz) faceId = (rd.y > 0.0) ? 2 : 3;
  else faceId = (rd.z > 0.0) ? 4 : 5;
  tExit = tFar; return true;
}

void main(){
  // Per-eye ray from clip-space
  vec4 vpos = uInvProjMatrix * vec4(vNDC, 1.0, 1.0); vpos /= vpos.w;
  vec4 wpos = uInvViewMatrix * vec4(vpos.xyz, 1.0);
  vec3 ro  = (uInvViewMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;
  vec3 rd  = normalize(wpos.xyz - ro);

  vec3 col;
  vec3 hp;
  bool hit = marchInterior(ro, rd, hp);
  if (hit){
    vec3 n = calcNormal(hp);
    // two lights for depth
    vec3 L1 = normalize(vec3(-0.7, 0.6, -0.5));
    vec3 L2 = normalize(vec3( 0.5, 0.3,  0.7));
    float d1 = max(0.0, dot(n, L1));
    float d2 = max(0.0, dot(n, L2))*0.5;
    // simple AO probe along normal
    float ao = 1.0;
    {
      float s = 0.0;
      for (int i=0;i<4;++i){ s += tunnelSDF(hp + n * (0.04*float(i+1))); }
      ao = clamp(0.85 - 0.4*abs(s)*0.5, 0.45, 1.0);
    }
    col = mix(vec3(0.26,0.28,0.32), vec3(0.96,0.97,1.0), d1 + d2) * ao;
  } else {
    // Miss => render 6-color inside cube for orientation
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
// shadertoy_raymarch sphere
const fsh = `//#version 300 es     //written in by three.js compiler 
// simple sphere
float _distance(vec3 p){
    return length(p) - 0.25;      // sphere r=0.25 at origin
}

// multiple copies
float multi_distance_(vec3 p){
    vec3 q = fract(p)*2.0 - 1.0;  // multiple copies
                                 // sphere r=1.0 at origin
    //return length(q) - 0.61;     
    //return length(q) - 0.51;      
    //return length(q) - 0.31; 
    //return length(q) - 1.3;  
    //return length(q) - 0.21;
    return length(q) - 0.1;
}

float march(vec3 eye, vec3 fwd){
    float t=0.0;
    for (int i=0; i<32; ++i) {
        vec3 p = eye + t*fwd;
        float d = _distance(p);
        t += d*0.1;
        //t += d*fract(0.001*iTime);
    }
    return t;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	vec2 uv = fragCoord.xy / iResolution.xy;  // [0,1]x[0,1]
    uv = uv*2.0 - 1.0;                       // [-1,1]x[-1,1]
    uv.x *= iResolution.x/iResolution.y;    // correct for aspect ratio
    
    vec3 eye = vec3(0.0, 0.0, -1.0);
    //vec3 eye = vec3(0.0, 0.0, 0.001*iTime);
    //vec3 eye = vec3(0.0, 0.0, -0.1*iTime);
    vec3 fwd = normalize(vec3(uv, 1.0));
                              
    // rotate - yaw
    //float yaw = iTime*0.001;
    //fwd.xz *= mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw));
    //float pitch = iTime*0.005;
    //fwd.yz *= mat2(cos(pitch), sin(pitch), -sin(pitch), cos(pitch)); 
    
    // march to determine distance - darken by distance via fog                              
    float t = march(eye, fwd);
    float fog = 2.0/(1.0 + t*t*0.5);
    vec3 fogc = vec3(fog);
    fragColor = vec4(0.8*fogc.r, 0.8*fogc.g, 1.2*fogc.b, 1.0);
    //fragColor = vec4(0.8*fog, 0.5*fog, 2.0*fog, 1.0);
    //fragColor = vec4(1.0,0.0,0.0,1.0);
}`;
export { fsh };
//# sourceMappingURL=shadertoy_raymarch.glsl.js.map
// vsh_default.glsl.ts 
// texture map
// Vertex shader program 
export const vsh = `
      varying vec2 vuv;
      void main() {
        gl_Position = vec4(position.xy, 1.0, 1.0);
        //gl_Position = vec4(0.0,0.0,1.0,1.0);
        //gl_PointSize = 64.0;
        vuv = uv;
      }
      `;
//# sourceMappingURL=vsh_point.glsl.js.map
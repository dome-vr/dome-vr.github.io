// vsh_template.glsl.ts 
// differs from vsh_rm_template in which gl_Position.z = 0
// Vertex shader program 
export const vsh = `
      varying vec2 vuv;
      void main() {
        gl_Position = vec4(position.xyz, 1.0);
        vuv = uv;
      }
      `;
//# sourceMappingURL=vsh_template.glsl.js.map
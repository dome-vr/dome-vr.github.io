// vsh_rm_template.glsl.ts 
// gl_Position.z = 0.0 NOT position.z
// Vertex shader program 
export const vsh = `
      varying vec2 vuv;
      void main() {
        gl_Position = vec4(position.xy, 1.0, 1.0);
        vuv = uv;
      }
      `;
//# sourceMappingURL=vsh_rm_template.glsl.js.map
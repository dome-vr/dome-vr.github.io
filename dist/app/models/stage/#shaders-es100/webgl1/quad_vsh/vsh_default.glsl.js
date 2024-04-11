// vsh_default.glsl.ts 
// ray-march default
// identical to es300 webgl2/vsh_rm_texquad
// Vertex shader program 
export const vsh = `
      varying vec2 vuv;
      void main() {
        gl_Position = vec4(position.xy, 1.0, 1.0);
        vuv = uv;
      }
      `;
//# sourceMappingURL=vsh_default.glsl.js.map
// vsh_rm_texquad.glsl.ts 
// texture map at z=1.0
// webGL2 Vertex shader program 
export const vsh = `
#version 300 es
  out vec2 vuv;

  void main() {
    gl_Position = vec4(position.xy, 1.0, 1.0);
    vuv = uv;
  }
  `;
//# sourceMappingURL=vsh_rm_texquad.glsl.js.map
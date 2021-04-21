// vsh_default.glsl.ts 
// model coords to perspective-view coords - allows model sharing
// webGL2 Vertex shader program 
export const vsh = `#version 300 es

  in vec4 position;

  void main(){
    gl_Position = position;
  }
`;
//# sourceMappingURL=vsh_basic.glsl.js.map
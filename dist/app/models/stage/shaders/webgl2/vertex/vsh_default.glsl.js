// vsh_default.glsl.ts 
// model coords to perspective-view coords - allows model sharing
// webGL2 Vertex shader program 
export const vsh = `#version 300 es

  in vec3 position;
  
  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
//# sourceMappingURL=vsh_default.glsl.js.map
// vsh_default.glsl.ts 
// model coords to perspective-view coords - allows model sharing
// webGL2 Vertex shader program 
export const vsh = `//#version 300 e    //written in by three.js compiler 

  //in vec4 position;  //prev defined by three.js as - in vec3 position
  out vec2 vuv;
  
  void main(){
    vuv = uv;
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = modelViewMatrix * vec4(position, 1.0);
  }
`;
//# sourceMappingURL=vsh_default.glsl.js.map
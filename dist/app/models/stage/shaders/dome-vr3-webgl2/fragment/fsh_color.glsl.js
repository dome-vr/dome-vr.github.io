// fsh_color.glsl.ts
// single semi-transparent color
// Fragment shader program 
export const fsh = `
      #version 300 es

      precision highp float;
      precision highp int;
      out vec4 out_FragColor;

      void main(){
        out_FragColor = vec4(1.0, 0.0, 0.0, 0.7);  //NOTE: must enable transp.
                                                  //and alpha-blend 
      }
  `;
//# sourceMappingURL=fsh_color.glsl.js.map
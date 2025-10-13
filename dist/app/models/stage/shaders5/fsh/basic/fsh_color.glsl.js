// fsh_color.glsl.ts
// single semi-transparent color
// Fragment shader program 
export const fsh = `//#version 300 es

      precision highp float;
      precision highp int;

      /* out vec4 pc_fragColor; */    //pre-defined by three.js compiler 
      //out vec4 out_FragColor;      //replaced by provided pc_fragColor


      void main(){
        pc_fragColor = vec4(1.0, 0.0, 0.0, 0.7);  //NOTE: must enable transp.
                                                  //and alpha-blend 
      }
  `;
//# sourceMappingURL=fsh_color.glsl.js.map
// morphtarget generators
// helix3
export var helix3 = (state:object) => {
  const TWOPI = 2*Math.PI;
  var radius:number = 0.6 * state['cloudRadius'],  // 600
      vertices:number[] = [],
      particles:number = state['particles'],
      j:number,
      p:number;

  for (j = 0; j < particles; j++ ) {
         if(j%2 === 0){
          p = (j+particles/2.0 - particles)/particles;
        }else{
          p = j/particles;
        }
        vertices.push(
          radius * Math.cos(3*p * TWOPI),
          2*p*radius - 600,
          radius * Math.sin(3*p * TWOPI)
        );
  }
  return vertices;
};

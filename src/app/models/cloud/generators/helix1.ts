// morphtarget generators
// helix1
export var helix1 = (state:object) => {
  const TWOPI = 2*Math.PI;
  var radius:number = 0.3 * state['cloudRadius'],  // 750
      vertices:number[] = [],
      particles:number = state['particles'];

  for ( var i = 0; i < particles; i ++ ) {
        var p = i/particles;
        vertices.push(
          radius * Math.cos(p * TWOPI),
          2*p*radius - 300,
          radius * Math.sin(p * TWOPI)
        );
  }
  return vertices;
};

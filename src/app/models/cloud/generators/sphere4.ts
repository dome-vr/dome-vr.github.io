// morphtarget generators
// sphere4
export var sphere4 = (state:object) => {
  var radius:number = 0.3 * state['cloudRadius'],  // 750
      vertices:number[] = [],
      particles:number = state['particles'],
      i:number;

  for ( var i = 0; i < particles; i ++ ) {
    let phi = Math.acos( -1 + ( 2 * i ) / particles ),
        theta = 0.5 * Math.sqrt( particles * Math.PI ) * phi;

    vertices.push(
      0.5 * radius * Math.cos( theta ) * Math.sin( phi ),
      4*radius * Math.sin( theta ) * Math.sin( phi ),
      radius * Math.cos( phi )
    );
  }
  return vertices;
};

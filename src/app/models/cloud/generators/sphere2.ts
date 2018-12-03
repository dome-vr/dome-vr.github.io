// morphtarget generators
// sphere2
export var sphere2 = (state:object) => {
  var radius:number = 0.75 * state['cloudRadius'],  // 750
      vertices:number[] = [],
      particles:number = state['particles'];

  for ( var i = 0; i < particles; i ++ ) {
        let phi = 3*Math.acos( -1 + ( 2 * i ) / particles ),
            theta = 0.5 * Math.sqrt( particles * Math.PI ) * phi;

        vertices.push(
          radius * Math.cos( theta ) * Math.sin( phi ),
          radius * Math.sin( theta ) * Math.sin( phi ),
          radius * Math.cos( phi )
        );
  }
  return vertices;
};

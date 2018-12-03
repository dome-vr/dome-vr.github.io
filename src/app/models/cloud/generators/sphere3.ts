// morphtarget generators
// sphere3
export var sphere3 = (state:object) => {
  var radius:number = 0.3 * state['cloudRadius'],  // 750
      vertices:number[] = [],
      particles:number = state['particles'],
      i:number;

      for ( var i = 0; i < particles; i ++ ) {
        let phi = Math.acos( -1 + ( 2 * i ) / particles ),
            theta = Math.sqrt( particles * Math.PI ) * phi;

        vertices.push(
          radius * Math.cos( theta ) * Math.sin( phi ),
          radius * Math.sin( theta ) * Math.sin( phi ),
          2*radius * Math.cos( phi )
        );
      }

  return vertices;
};

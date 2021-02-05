// morphtarget generators
// cube
export var cube = (state:object) => {
  var vertices:number[] = [],
      amount:number = 8,
      separation:number = 0.15 * state['cloudRadius'],  //150 
      offset = ( ( amount - 1 ) * separation ) / 2;

  for ( var i = 0; i < state['particles']; i ++ ) {
    var x = ( i % amount ) * separation;
    var y = Math.floor( ( i / amount ) % amount ) * separation;
    var z = Math.floor( i / ( amount * amount ) ) * separation;
    vertices.push( x - offset, y - offset, z - offset );
  }
  return vertices;
};
  


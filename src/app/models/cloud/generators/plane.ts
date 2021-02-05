// morphtarget generators
// plane
export var plane = (state:object) => {
  var vertices:number[] = [],
      amountX:number = 12,
      amountZ:number = 16,
      separation:number = 0.15 * state['cloudRadius'],  //150 
      offsetX = ( ( amountX - 1 ) * separation ) / 2,
      offsetZ = ( ( amountZ - 1 ) * separation ) / 2;

  for ( var i = 0; i < state['particles']; i ++ ) {
    var x = ( i % amountX ) * separation;
    var z = Math.floor( i / amountX ) * separation;
    var y = ( Math.sin( x * 0.5 ) + Math.sin( z * 0.5 ) ) * 200;
    vertices.push( x - offsetX, y, z - offsetZ );
  }
  return vertices;
};

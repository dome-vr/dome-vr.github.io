// actor: pointcloud-lines


// closure vars
var effectController:object,
    particlesData = [],
    positions, 
    colors,
    pointCloud,
    particlePositions,
    linesMesh;
    //flag:boolean = true;   // TEMP !!!!
  
  
// create
export var create = (options:object = {}) => {

    // options
    var maxParticleCount = 1000,
        particleCount = options['particleCount'] || 500,  // no effect ?!
        showDots = options['showDots'] || true,  // no effect ?!
        showLines = options['showLines'] || true,     // no effect ?!
        maxConnections = options['maxConnections'] || 20,  //1,  
        minDistance = options['minDistance'] || 250, //90,  //150,    
        limitConnections = options['limitConnections'] || true,  //false,

        particles,
        r = 800,
        rHalf = r / 2,
        group = new THREE.Group(),
        helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) ) );

    return new Promise((resolve, reject) => {

      //effectController = options;  //might be missing properties not supplied!
      effectController = {
          maxParticleCount: maxParticleCount,
          particleCount: particleCount,
          showDots: showDots,
          showLines: showLines,
          maxConnections: maxConnections,
          minDistance: minDistance,    
          limitConnections: limitConnections
      }

  
      helper.material.color.setHex( 0x080808 );
      helper.material.blending = THREE.AdditiveBlending;
      helper.material.transparent = true;
      group.add( helper );
     
      var segments = maxParticleCount * maxParticleCount;
      positions = new Float32Array( segments * 3 );
      colors = new Float32Array( segments * 3 );
     
      var pMaterial = new THREE.PointsMaterial( {
        color: 0xFFFFFF,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
      } );
     
      particles = new THREE.BufferGeometry();
      particlePositions = new Float32Array( maxParticleCount * 3 );
     
      for ( var i = 0; i < maxParticleCount; i++ ) {
        var x = Math.random() * r - r / 2;
        var y = Math.random() * r - r / 2;
        var z = Math.random() * r - r / 2;
     
        particlePositions[ i * 3     ] = x;
        particlePositions[ i * 3 + 1 ] = y;
        particlePositions[ i * 3 + 2 ] = z;
     
        // add it to the geometry
        particlesData.push( {
          velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
          numConnections: 0
        } );
      }
     
      particles.setDrawRange( 0, particleCount );
      particles.addAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setDynamic( true ) );
     
      // create the particle system
      pointCloud = new THREE.Points( particles, pMaterial );
      group.add( pointCloud );
     
      var geometry = new THREE.BufferGeometry();
      geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setDynamic( true ) );
      geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );
     
      geometry.computeBoundingSphere();
      geometry.setDrawRange( 0, 0 );
     
      var material = new THREE.LineBasicMaterial( {
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        transparent: true
      } );
     
      linesMesh = new THREE.LineSegments( geometry, material );
      group.add( linesMesh );
  //    console.log(`group.children = ${group.children}`);
  //    for(let c of group.children){
  //      console.dir(c);
  //    }
  
  
  
      // render method
      group['render'] = (et:number=0, options:object={}) => {
        var vertexpos = 0,
            colorpos = 0,
            numConnected = 0;
  
     
        for ( var i = 0; i < particleCount; i++ ){
          particlesData[ i ].numConnections = 0;
        }     
        for ( var i = 0; i < particleCount; i++ ) {
          // get the particle
          var particleData = particlesData[i];
          particlePositions[ i * 3     ] += particleData.velocity.x;
          particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
          particlePositions[ i * 3 + 2 ] += particleData.velocity.z;
     
          if ( particlePositions[ i * 3 + 1 ] < -rHalf || particlePositions[ i * 3 + 1 ] > rHalf ){
            particleData.velocity.y = -particleData.velocity.y;
          }
          if ( particlePositions[ i * 3 ] < -rHalf || particlePositions[ i * 3 ] > rHalf ){
            particleData.velocity.x = -particleData.velocity.x;
          }
          if ( particlePositions[ i * 3 + 2 ] < -rHalf || particlePositions[ i * 3 + 2 ] > rHalf ){
            particleData.velocity.z = -particleData.velocity.z;
          }     
          if ( effectController['limitConnections'] && particleData.numConnections >= effectController['maxConnections'] ){
            continue;
          }

          // Check collision
          for ( var j = i + 1; j < particleCount; j++ ) {
     
            var particleDataB = particlesData[ j ];
            if ( effectController['limitConnections'] && particleDataB.numConnections >= effectController['maxConnections'] ){
              continue;
            }
            var dx = particlePositions[ i * 3     ] - particlePositions[ j * 3     ];
            var dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
            var dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
            var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );
     
            if ( dist < effectController['minDistance'] ) {
     
              particleData.numConnections++;
              particleDataB.numConnections++;
     
              var alpha = 1.0 - dist / effectController['minDistance'];
     
              positions[ vertexpos++ ] = particlePositions[ i * 3     ];
              positions[ vertexpos++ ] = particlePositions[ i * 3 + 1 ];
              positions[ vertexpos++ ] = particlePositions[ i * 3 + 2 ];
     
              positions[ vertexpos++ ] = particlePositions[ j * 3     ];
              positions[ vertexpos++ ] = particlePositions[ j * 3 + 1 ];
              positions[ vertexpos++ ] = particlePositions[ j * 3 + 2 ];
     
              colors[ colorpos++ ] = alpha;
              colors[ colorpos++ ] = alpha;
              colors[ colorpos++ ] = alpha;
     
              colors[ colorpos++ ] = alpha;
              colors[ colorpos++ ] = alpha;
              colors[ colorpos++ ] = alpha;
     
              numConnected++;
            }
          }
        }//for i<particlecount
     
        // TEMP !!!!!
        //console.log(`numConnected = ${numConnected} linesMeash = ${linesMesh}`);
  //      if(flag){
  //        console.log(`linesMesh.geometry.attributes:`);
  //        console.dir(linesMesh.geometry.attributes);
  //        console.log(`pointCloud.geometry.attributes:`);
  //        console.dir(pointCloud.geometry.attributes);
  //        flag = false;
  //      }
  
     
        linesMesh.geometry.setDrawRange( 0, 1000); //numConnected * 2 );
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
     
        pointCloud.geometry.attributes.position.needsUpdate = true;
  
      };//render
  
      resolve(group);
    });//return new Promise 
};//create


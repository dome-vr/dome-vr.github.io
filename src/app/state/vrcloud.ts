// vrcloud.ts 
import {mediator} from '../services/mediator';
import {morphTargets} from '../services/morphtargets';



// singleton closure-instance variable, vrcloud param defaults
var vrcloud:VrCloud,
    TWEEN:any,
    N:number = 4,
    urls:string[] = ["./assets/images/sprite_redlight.png",
         "./assets/images/moon_256.png" ,
         "./assets/images/lotus_64.png" ,
         "./assets/images/sprites/ball.png" ],
    transparent:boolean = true,
    opacity:number = 1.0,
    lights:boolean = false,
    fog:boolean = false,
    particles:number = 128,  // 128,  // 256
    particlesByN:number = particles/N,
    duration:number = 1000,  // 2000
    targets:number,
    cloudRadius:number = 500,
    translateZ:number = 1000,
    objects:THREE.Object3D[] = [],
    object:THREE.Object3D,
    positions:number[] = [],
    state_positions:number[] = [],
    current:number = 0,
    group:THREE.Group = new THREE.Group(),


    // animations
    transition = () => {
      var offset = current * particles * 3,
          i:number, 
          j:number;
          //tween1,
          //tween2,
          //o:object={x:0};
  
      mediator.log(`current target = ${current} offset=${offset}`);
      for (i = 0, j = offset; i < particles; i++, j += 3 ) {
        object = objects[ i ];

        // TWEEN
        new TWEEN.Tween( object.position )
          .to( {
            x: positions[ j ],
            y: positions[ j + 1 ],
            z: positions[ j + 2 ] 
          }, Math.random() * duration + duration )
          .easing( TWEEN.Easing.Exponential.InOut )
          .start();

        // GSAP
//        tween1 = TweenLite.to(object.position,
//                    Math.random()*duration + duration,
//                    {x:positions[j],
//                     y:positions[j+1],
//                     z:positions[j+2],
//                     ease:Power1.easeInOut});

      }      

      // TWEEN  
      new TWEEN.Tween({x:0, y:0, z:0})          // z=0
        .to( {x:0, y:0, z:0}, duration * 3 )    // z=0
        .onComplete(transition )
        .start();

      // GSAP
//      tween2 = TweenLite.to(o,
//                    duration*3,
//                    {x:0,
//                     onComplete:transition});
      current = ( current + 1 ) % targets; // modulo total morph-targets
    };



class VrCloud {

  constructor(){
    vrcloud = this;
  } //ctor

  delta(state:object, TWEEN_:any, callback:Function){
    mediator.log(`delta: state = ${state} TWEEN_ = ${TWEEN_}`);
    var _vrcloud:boolean = state['_vrcloud'],
        loaded:number = 0,
        mat:THREE.Material,
        spr:THREE.Object3D,
        textureLoader:THREE.TextureLoader = new THREE.TextureLoader(),
        o:object = {};

    // globals
    TWEEN = TWEEN_;

    // _vrcloud=undefined => modify/create _vrcloud=true => create
    mediator.logc(`vrcloud.delta: state['_vrcloud'] = ${state['_vrcloud']}`);
    if(_vrcloud === undefined || _vrcloud === true){  // undefined/true
      o['_vrcloud'] = state['_vrcloud'];
      particles = state['particles'] || particles;
      targets = state['targets'] || targets;
      N = state['N'] || N;
      particlesByN = particles/N;
      current = 0;
      urls = state['urls'] || urls;
      duration =state['duration'] || duration;
      state_positions = state['positions'] || [];
      cloudRadius = state['cloudRadius'] || cloudRadius;
      translateZ = state['translateZ'] || translateZ;

      if(state['options']){
        transparent = state['options']['transparent'] || transparent;
        opacity = state['options']['opacity'] || opacity;
        lights = state['options']['lights'] || lights;
        fog = state['options']['fog'] || fog;
      }


      try {
        // delta sprites and morph-targets
        for(let i=0; i<N; i++){
          textureLoader.load(urls[i],
            // load
            (texture) => {
              loaded += 1;
              mat = new THREE.SpriteMaterial( { map: texture, color: 'white', fog: true } );
              for (let j=0; j<particlesByN; j++ ) {
                spr = new THREE.Sprite( mat);
                let x = Math.random() - 0.5;
                let y = Math.random() - 0.5;
                let z = Math.random() - 0.5;
                spr.position.set( x, y, z );
                spr.position.normalize();
                spr.position.multiplyScalar(cloudRadius);
                x = spr.position.x;
                y = spr.position.y;
                z = spr.position.z;
                positions.push(x,y,z);
                objects.push(spr);
                group.add(spr);
                mediator.log(`spritevrcloud positions i=${i} j=${j}`);
              }
              if(loaded === N){
                mediator.log(`cld texture loading complete - ${loaded} images`);
                mediator.log(`textures complete - objs.l = ${objects.length}`);

                // if state_positions = [] or undefined generate morph positions
                if(state_positions.length === 0){ 
                  positions = morphTargets.generate(state);
                  //console.log(`positions.length = ${positions.length}`);
                  //for(let i=0; i<positions.length; i++){
                  //  console.log(`positions[${i}] = ${positions[i]}`);
                  //}
                }else{
                  positions = state_position;
                }

                // calculate number of targets
                // NOTE: positions is array of (x,y,z) (3) for each vertex 
                // (particles) for each target
                targets = positions.length/(particles * 3);

                // start animation cycle
                console.log(`######## at vrcloud.transition: pos.l=${positions.length}`);
                mediator.log(`######## at vrcloud.transition: pos.l=${positions.length}`);
                transition();

                // create vrcloud
                callback(null, {_vrcloud:_vrcloud, group:group});
              }
            },
            // progress
            (xhr) => {
              mediator.log(`vrcloud loading textures...`);
            },
            // error
            (xhr) => {
              mediator.loge(`error loading url ${urls[i]}`);
            }
          );
        }
      } catch(e) {
        mediator.loge(`error in spritevrcloud_init: ${e.message}`);
        callback(null, null);
      }
    }else{  // _vrcloud-false so remove
      callback(null, {_vrcloud: _vrcloud, group:null} );
    }//if(state['_vrcloud'])

  }//delta()


}//VrCloud


// enforce singleton export
if(vrcloud === undefined){
  vrcloud = new VrCloud();
}
export {vrcloud};

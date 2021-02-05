// space.ts 
import {mediator} from '../services/mediator';

// shaders
import {vsh as _vsh} from '../models/space/quad_vsh/vsh_default.glsl';
import {fsh as _fsh} from '../models/space/quad_fsh/fsh_default.glsl';
import {uniforms as _uniforms} from '../models/space/quad_fsh/fsh_default.glsl';



// singleton closure-instance variable
var space:Space,
    vsh:string = _vsh,
    fsh:string = _fsh,
    uniforms:object = _uniforms;


class Space {

  // ctor
  constructor(){
    space = this;
  } //ctor

 
  delta(state:object, sgTarget:THREE.WebGLRenderTarget, callback:Function){
    mediator.log(`space delta: state = ${state}`);
    
    // function builds ShaderMaterial to return in callback
    var _shMat = () => {
      //console.log(`_shMat() called`);
      try{
        callback(null, {rm_shMat: new THREE.ShaderMaterial({
            uniforms:uniforms,            
            vertexShader: vsh,
            fragmentShader: fsh,
            transparent:true,
            depthWrite: false
          })
        });
      }catch(e){
        callback(e, null);
      }
    };

    mediator.log(`^^^^ space: state['_space'] = ${state['_space']}`);
    if(state['_space'] !== undefined){  
      if(state['_space']){  // true => replace fsh & ShaderMaterial 
        if(state['fsh']){
          console.log(`importing fsh ${state['fsh']}`);
          System.import(state['fsh'])
            .then((Shader) => {
              fsh = Shader.fsh || fsh;  // export
              uniforms = Shader.uniforms || uniforms;  // export
              //mediator.log(`imported fsh = ${Shader.fsh}`);
              //for(let p of Object.keys(uniforms)){
              //  mediator.logc(`uniforms contains = ${p}`);
              //}
              _shMat();
            }).catch((e) => {
              console.error(`space:import ${state['fsh']} caused error: ${e}`);
              callback(e, null);
          });
        }else{                   // no fsh provided - use present shaders
          _shMat();
        }
      }else{                   // false => revert to defaults
        vsh = vsh;
        fsh = fsh;
        uniforms = uniforms;
        _shMat();
      }
    }else{   // modify rm-quad-shader uniforms TBD!!
      mediator.logc(` modify rm-quad-shader uniforms TBD!!`);
      callback(null,{});
    }
  }//delta
}//Space


// enforce singleton export
if(space === undefined){
  space = new Space();
}
export {space};



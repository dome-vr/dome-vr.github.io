// stage.ts

// services
import {mediator} from '../services/mediator';
import {actors} from '../services/actors';


// singleton closure-instance variables 
// defaults for ambient_light, fog, skycube and skydome
var stage:Stage,
    axes:THREE.AxesHelper,
    ambient_light:THREE.AmbientLight,
    ambient_color:string = 'white',
    ambient_intensity:number = 1.0,
    fog:THREE.Fog,
    fog_color:string = 'white',
    fog_near:number = 0.5,
    fog_far:number = 5.0,
    cube:THREE.Mesh,                // skycube-skybox
    cube_urls:string[] = ['','','','','',''],       
    cube_opacity:number = 1.0,
    cubeLoader = new THREE.CubeTextureLoader(),
    dome:THREE.Mesh,               // skydome-ellisoid
    dome_url:string = '',         
    dome_opacity:number = 1.0,
    textureLoader = new THREE.TextureLoader(),

    // generative functions
    // RECALL: _p = t => create, _p = f => remove, _p undefined => modify
    environment = (state, callback) => {
      try {
        // axes
        if(state['axes']){
          let _axes = state['axes']['_axes'];                   // t/f
          axes = (_axes ? new THREE.AxesHelper(100000) : null);
        }

        // ambient_light
        if(state['ambient_light']){
          let _ambient_light = state['ambient_light']['_ambient_light']; // t/f/undefined
          ambient_color = state['ambient_light']['color'] || ambient_color;
          ambient_intensity = state['ambient_light']['intensity'] || ambient_intensity;
          if(_ambient_light !== undefined){
            ambient_light = (_ambient_light ? new THREE.AmbientLight( ambient_color, ambient_intensity) : null);
          }else{
            ambient_light.color = ambient_color;
            ambient_light.intensity = ambient_intensity;
          }
        }

        // fog
        if(state['fog']){
          let _fog = state['fog']['_fog'];                     // t/f/undefined
          fog_color = state['fog']['color'] || fog_color;
          fog_near = state['fog']['near'] || fog_near;
          fog_far = state['fog']['far'] || fog_far;
          if(_fog !== undefined){
            fog = (_fog ? fog = new THREE.Fog(fog_color, fog_near, fog_far) : null);
          }else{
            fog.color = fog_color;
            fog.near = fog_near;
            fog.far = fog_far;
            callback(null, {});
          }
        }
      } catch(e) {
        mediator.loge(`error in environment_init: ${e.message}`);
        callback(null, {});
      }
      callback(null, {axes:axes, ambient_light:ambient_light, fog:fog});
    },
    // environment


    skycube = (state, callback) => {
      var cube_g:THREE.Geometry,
          cube_m:THREE.Material,
          cube_shader:THREE.ShaderLib;

      if(Object.keys(state).length === 0){
        callback(null,{});
      }
      try{
        let _skycube = state['_skycube'];
        if(_skycube !== undefined){
          if(_skycube){                        // true =>create
            cube_opacity = state['opacity'] || cube_opacity;
            cube_urls = state['cube_urls'] || cube_urls;
            cube_g = new THREE.BoxBufferGeometry(10000, 10000, 10000, 1,1,1);
            // load
            cubeLoader.load(cube_urls, (t) => {
              console.log(`\n\n&&&&&&& skycube textures t:`);
              console.dir(t);
              cube_shader = THREE.ShaderLib['cube'];
              cube_shader.uniforms['tCube'].value = t;
              cube_m = new THREE.ShaderMaterial({
                vertexShader: cube_shader.vertexShader,
                fragmentShader: cube_shader.fragmentShader,
                uniforms: cube_shader.uniforms,
                depthWrite: false,
                opacity: cube_opacity,
                side: THREE.BackSide
              });
              //cube_m.blendDst = THREE.DstAlphaFactor;
              //cube_m.depthTest = false;
              //cube_m.blending = THREE.AdditiveBlending;
              cube_m.blending = THREE.CustomBlending;
              cube_m.blendSrc = THREE.SrcAlphaFactor; // default
              //cube_m.blendDst = THREE.DstAlphaFactor;
              cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
              cube_m.blendEquation = THREE.AddEquation; // default

              cube = new THREE.Mesh(cube_g, cube_m);
              cube.renderOrder = 8.5; // larger rO is rendered first ?!
                                      // cube rendered 'behind' dome & actors

              mediator.log(`@@@skycube() cube = ${cube}`);
              if(state['visible'] !== undefined){     // render or not
                cube.visible = state['visible']; 
              }
              callback(null, {skycube: cube});
            });
          }else{
            callback(null, {skycube: null});   // false => remove
          }
        }else{                                // undefined => modify
          if(state['visible'] !== undefined){     // render or not
            cube.visible = state['visible']; 
          }
        }
      } catch(e) {
        mediator.loge(`error in skycube_init: ${e.message}`);
        callback(null, {});
      }
    },
    // skycube


    skydome = (state, callback) => {
      var dome_g:THREE.Geometry,
          dome_m:THREE.Material;

      try {
        if(Object.keys(state).length === 0){
          callback(null,{});
        }
        let _skydome = state['_skydome'];
        if(_skydome !== undefined){
          if(_skydome){                         // true =>create
            dome_opacity = state['opacity'] || dome_opacity;
            dome_url = state['dome_url'] || dome_url;
            dome_g = new THREE.SphereBufferGeometry(2000, 16, 12);
            dome_g.applyMatrix(new THREE.Matrix4().makeScale(1.0, 2.4, 1.0));
    
            textureLoader.load(dome_url, (texture) => {
              dome_m = new THREE.MeshBasicMaterial({
                  map: texture,
                  transparent: true,
                  opacity: dome_opacity
              });
              dome_m.side = THREE.BackSide;
              //dome_m.blendDst = THREE.DstAlphaFactor;
              //dome_m.depthTest = false;
              //dome_m.blending = THREE.CustomBlending;
              dome_m.blendSrc = THREE.SrcAlphaFactor; // default
              //dome_m.blendDst = THREE.DstAlphaFactor;
              dome_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
              //dome_m.blendEquation = THREE.AddEquation; // default

              dome = new THREE.Mesh(dome_g, dome_m);
              dome.position.z = -1.01;
              dome.renderOrder = 9; // larger rO is rendered first ?!
              
              mediator.log(`@@@skydome() dome = ${dome}`);
              if(_skydome['visible'] !== undefined){   // render or not
                dome.visible = state['visible']; 
              }
              callback(null, {skydome:dome});
            });
          }else{                               
            callback(null, {skydome:null});   // false => remove
          }
        }else{                                  // undefined => modify
          if(state['visible'] !== undefined){   // render or not
            dome.visible = state['visible']; 
          }
        }
      }catch(e){
        mediator.loge(`error in skydome_init: ${e.message}`);
        callback(null, {});
      }
    };
    // skydome



class Stage {

  // ctor
  constructor(){
    stage = this;
  } //ctor

  delta(state:object={}, narrative:Narrative, callback:Function){
    mediator.log(`Stage.delta: state = ${state}`);

    async.parallel({
      frame: function(callback){
        try{
          if(state['frame']){
            callback(null, {_stats:state['frame']['_stats']});
          }else{
            callback(null, {});
          }
        }
        catch(e) {
          mediator.loge(`stage.delta caused error: ${e}`);
          callback(null, {});
        }
      },

      environment: function(callback){
        try{
          if(state['environment']){
            environment(state['environment'], callback);
          }else{
            callback(null, {});
          }
        }
        catch(e) {
          mediator.loge(`stage.delta caused error: ${e}`);
          callback(null, {});
        }
      },

      actors: function(callback){
        try{
          if(state['actors']){
            actors.create(state['actors'], narrative, callback);
          }else{
            callback(null, {});
          }
        }
        catch(e) {
          mediator.loge(`stage.delta caused error: ${e}`);
          callback(e, {});
        }
      },

      skycube: function(callback){
        try{
          if(state['skycube']){
            skycube(state['skycube'], callback);
          }else{
            callback(null, {});
          }
        }
        catch(e) {
          mediator.loge(`stage.delta caused error: ${e}`);
          callback(null, {});
        }
      },

      skydome: function(callback){
        try{
          if(state['skydome']){
            skydome(state['skydome'], callback);
          }else{
            callback(null, {});
          }
        }
        catch(e) {
          mediator.loge(`stage.delta caused error: ${e}`);
          callback(null, {});
        }
      }
      },//first arg
      (err, o) => {
        if(err){
          mediator.loge("error: " + err);
          return;
        }

        mediator.log(`stage: o['environemt']['axes'] = ${o['environment']['axes']}`);
        mediator.log(`stage: o['environemt']['ambient_light'] = ${o['environment']['ambient_light']}`);
        mediator.log(`stage: o['environemt']['fog'] = ${o['environment']['fog']}`);
        mediator.log(`stage: o['skycube']['skycube'] = ${o['skycube']['skycube']}`);
        mediator.log(`stage: o['skydome']['skydome'] = ${o['skydome']['skydome']}`);
        callback(null, {
          actors: o['actors']['actors'],
          axes: o['environment']['axes'],           
          ambient_light: o['environment']['ambient_light'],           
          fog: o['environment']['fog'],           
          skycube: o['skycube']['skycube'],           
          skydome: o['skydome']['skydome'],           
          frame:o['frame']
        });
      }//2nd arg
    );//async.parallel
  }//delta

}//Stage


// enforce singleton export
if(stage === undefined){
  stage = new Stage();
}
export {stage};

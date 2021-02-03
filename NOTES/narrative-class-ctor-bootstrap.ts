//narrative-class-ctor-bootstrap

class Narrative {
  // properties needed by animation service
  quad:THREE.Mesh;
  hud:THREE.Mesh;
   

  // narrative.exec targets 't' in actions 
  targets:Object = {};
  // named management(add, remove, properties, animation) of objects in scene
  actors:Object = {};
  vractors:Object = {};


  // ctor
  constructor(){
    narrative = this;
  } //ctor


  bootstrap(injection:Object){
    mediator.logc(`\n\n*** narrative-three.js-expswebvr.bootstrap`);
    _webvr = config.webvr;
    _vive = config.vive;
    console.log(`*** _webvr is ${_webvr} !!!!!!!!`);
    console.log(`*** WEBVR is ${WEBVR} !!!!!!!!`);

    for(var p in injection){
      mediator.logc(`injection component ${p} = ${injection[p]}`);
    }
    console.dir(injection);
    state = injection['state'];
    TWEEN = injection['TWEEN'];
    stats = injection['stats'];

    if(config.test){
      System.import(config._testTarget)   
        .then((TestTarget) => {
          narrative['targets']['testTarget'] = TestTarget.testTarget; // export
          narrative.initialize();
      })
      .catch((e) => {
        mediator.loge(`narrative: import of testTarget caused error: ${e}`);
        console.trace();
      });
    }else{
      narrative.initialize();
    }
  }//bootstrap


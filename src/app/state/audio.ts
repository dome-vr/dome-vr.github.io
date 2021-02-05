// audio.ts 
import {mediator} from '../services/mediator';
import {listener} from '../services/audio_listener_delay';


// singleton closure-instance variable
var audio:Audio,
    loader:THREE.AudioLoader,
    sound:THREE.PositionalAudio,
    parent:THREE.Object3D,
    // defaults
    _refDistance:number = 1000,
    _maxDistance:number = 1000,
    _volume:number = 0.5,
    _playbackRate:number = 1.0,
    _loop:boolean = true,
    _actor:string = 'lens',
    // dynamic
    url:string = '',
    refDistance:number = 1000,
    maxDistance:number = 1000,
    volume:number = 1.0,
    playbackRate:number = 1.0,
    delay:number = 0.0,
    loop:boolean = true,
    panner:object,
    coneInnerAngle:number = 360,   // webAudio default 
    coneOuterAngle:number = 360,   // webAudio default 
    coneOuterGain:number = 0,   // webAudio default 
    actor:string = 'lens';



class Audio {

  // ctor
  constructor(){
    audio = this;
    //console.log(`listener = ${listener}`);
  } //ctor
  

  // initialization
  initialize(lens){
    lens.add(listener);
    loader = new THREE.AudioLoader();
  }


  delta(state:object, narrative:Narrative, callback:Function){
    mediator.log(`Audio.delta: state = ${state} _audio = ${state['_audio']}`);
    //for(let p of Object.keys(state)){
    //  console.log(`audio: state has property ${p} val ${state[p]}`);
    //}


    // _audio
    if(state['_audio'] !== undefined){
      if(state['_audio']){  // _audio=true
        sound = new THREE.PositionalAudio(listener);
        panner = sound.getOutput();

        // delay
        delay = state['delay'] || delay;
        listener.setDelay(delay);

        // properties
        // panner
        panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
        panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
        if(state['coneOuterGain'] === 0.0){
          panner.coneOuterGain = 0.0;
        }else{
          panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
        }

        refDistance = state['refDistance'] || _refDistance;
        maxDistance = state['maxDistance'] || _maxDistance;
        if(state['volume'] !== undefined && (state['volume'] === 0.0)){
          volume = 0.0;
        }else{
          volume = state['volume'] || _volume;
        }
        playbackRate = state['playbackRate'] || _playbackRate;

        if(state['loop'] !== undefined && (state['loop'] === false)){
          loop = false;
        }else{
          loop = state['loop'] || _loop;
        }
        actor = state['actor'] || _actor;
        if(state['url']){
          url = state['url'];
          loader.load(url, (buffer) => {
            sound.setBuffer(buffer);
            sound.setRefDistance(refDistance);
            sound.setMaxDistance(maxDistance);
            sound.setVolume(volume);
            sound.setLoop(_loop);
            sound.playbackRate = playbackRate;
            parent = narrative.actors[actor];
            if(parent){
              //mediator.logc(`adding sound ${url} to ${state['actor']}`);
              //mediator.logc(`sound vol = ${volume} playbackRate = ${playbackRate}`);
              parent.add(sound);
              sound.play();
            }else{
              mediator.loge(`audio: actor ${actor} not found!`);
            }
            //mediator.logc(`sound ${url} is playing is ${sound.isPlaying}`);
          });
        }
      }else{     // _audio=false
        if(sound){
          sound.stop();
          parent.remove(sound);
          sound = null;
          mediator.logc(`soundnode removed`);
        }
      }
    }else{       // _audio=undefined => modify properties
      if(sound){
        // properties
        // panner
        panner = sound.getOutput();
        panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
        panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
        if(state['coneOuterGain'] === 0.0){
          panner.coneOuterGain = 0.0;
        }else{
          panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
        }

        sound.setRefDistance(state['refDistance'] || refDistance);
        sound.setMaxDistance(state['maxDistance'] || maxDistance);
        if(state['volume']){
          sound.setVolume(state['volume']);
        }
        sound.playbackRate = state['playbackRate'] || playbackRate;
  
  
        if(state['loop'] !== undefined && (state['loop'] === false)){
          sound.setLoop(false);
        }else{
          sound.setLoop(state['loop'] || loop);
        }
        if(state['actor']){
          parent.remove(sound);
          parent = narrative.actors(state['actor']);
          if(parent){
            parent.add(sound);
          }
        }
        
        // play
        if(state['play']){
          audio.play();
        }
        // pause
        if(state['pause']){
          audio.pause();
        }
        // stop
        if(state['stop']){
          audio.stop();
        }
      }
    }
    callback(null, {});
  }//delta

  play(){
    if(sound){sound.play();}
  }

  pause(){
    if(sound){sound.pause();}
  }

  stop(){
    if(sound){sound.stop();}
  }
  
  setVolume(level:number){
    if(sound){sound.setVolume(level);}
  }

}//Audio


// enforce singleton export
if(audio === undefined){
  audio = new Audio();
}
export {audio};

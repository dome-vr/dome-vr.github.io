// audio.ts 
import { listener } from '../services/audio_listener_delay.js';
// singleton closure-instance variable
let audio;
// defaults
const _refDistance = 1000, _maxDistance = 1000, _volume = 0.5, _playbackRate = 1.0, _loop = true, _actor = 'lens', coneInnerAngle = 360, // webAudio default 
coneOuterAngle = 360, // webAudio default 
coneOuterGain = 0; // webAudio default 
// dynamic
const url = '', refDistance = 1000, maxDistance = 1000, volume = 1.0, playbackRate = 1.0, delay = 0.0, loop = true, panner = {}, actor = 'lens';
class Audio {
    // ctor
    constructor() {
        audio = this;
        //console.log(`listener = ${listener}`);
    } //ctor
    // initialization  
    initialize(lens) {
        lens.add(listener);
    }
    delta(state, narrative) {
        console.log(`Audio.delta: state = ${state} _audio = ${state['_audio']}`);
        //for(let p of Object.keys(state)){
        //  console.log(`audio: state has property ${p} val ${state[p]}`);
        //}
        return new Promise((resolve, reject) => {
            resolve(narrative['devclock'].getElapsedTime());
        }); //return new Promise
    } //delta
} //Audio
// enforce singleton export
if (audio === undefined) {
    audio = new Audio();
}
export { audio };
//# sourceMappingURL=audio.js.map
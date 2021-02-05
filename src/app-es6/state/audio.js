System.register(['../services/mediator', '../services/audio_listener_delay'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1, audio_listener_delay_1;
    var audio, loader, sound, parent, _refDistance, _maxDistance, _volume, _playbackRate, _loop, _actor, url, refDistance, maxDistance, volume, playbackRate, delay, loop, panner, coneInnerAngle, coneOuterAngle, coneOuterGain, actor, Audio;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            },
            function (audio_listener_delay_1_1) {
                audio_listener_delay_1 = audio_listener_delay_1_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            // defaults
            _refDistance = 1000, _maxDistance = 1000, _volume = 0.5, _playbackRate = 1.0, _loop = true, _actor = 'lens', 
            // dynamic
            url = '', refDistance = 1000, maxDistance = 1000, volume = 1.0, playbackRate = 1.0, delay = 0.0, loop = true, coneInnerAngle = 360, coneOuterAngle = 360, coneOuterGain = 0, actor = 'lens';
            class Audio {
                // ctor
                constructor() {
                    audio = this;
                    //console.log(`listener = ${listener}`);
                } //ctor
                // initialization
                initialize(lens) {
                    lens.add(audio_listener_delay_1.listener);
                    loader = new THREE.AudioLoader();
                }
                delta(state, narrative, callback) {
                    mediator_1.mediator.log(`Audio.delta: state = ${state} _audio = ${state['_audio']}`);
                    //for(let p of Object.keys(state)){
                    //  console.log(`audio: state has property ${p} val ${state[p]}`);
                    //}
                    // _audio
                    if (state['_audio'] !== undefined) {
                        if (state['_audio']) {
                            sound = new THREE.PositionalAudio(audio_listener_delay_1.listener);
                            panner = sound.getOutput();
                            // delay
                            delay = state['delay'] || delay;
                            audio_listener_delay_1.listener.setDelay(delay);
                            // properties
                            // panner
                            panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
                            panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
                            if (state['coneOuterGain'] === 0.0) {
                                panner.coneOuterGain = 0.0;
                            }
                            else {
                                panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
                            }
                            refDistance = state['refDistance'] || _refDistance;
                            maxDistance = state['maxDistance'] || _maxDistance;
                            if (state['volume'] !== undefined && (state['volume'] === 0.0)) {
                                volume = 0.0;
                            }
                            else {
                                volume = state['volume'] || _volume;
                            }
                            playbackRate = state['playbackRate'] || _playbackRate;
                            if (state['loop'] !== undefined && (state['loop'] === false)) {
                                loop = false;
                            }
                            else {
                                loop = state['loop'] || _loop;
                            }
                            actor = state['actor'] || _actor;
                            if (state['url']) {
                                url = state['url'];
                                loader.load(url, (buffer) => {
                                    sound.setBuffer(buffer);
                                    sound.setRefDistance(refDistance);
                                    sound.setMaxDistance(maxDistance);
                                    sound.setVolume(volume);
                                    sound.setLoop(_loop);
                                    sound.playbackRate = playbackRate;
                                    parent = narrative.actors[actor];
                                    if (parent) {
                                        //mediator.logc(`adding sound ${url} to ${state['actor']}`);
                                        //mediator.logc(`sound vol = ${volume} playbackRate = ${playbackRate}`);
                                        parent.add(sound);
                                        sound.play();
                                    }
                                    else {
                                        mediator_1.mediator.loge(`audio: actor ${actor} not found!`);
                                    }
                                    //mediator.logc(`sound ${url} is playing is ${sound.isPlaying}`);
                                });
                            }
                        }
                        else {
                            if (sound) {
                                sound.stop();
                                parent.remove(sound);
                                sound = null;
                                mediator_1.mediator.logc(`soundnode removed`);
                            }
                        }
                    }
                    else {
                        if (sound) {
                            // properties
                            // panner
                            panner = sound.getOutput();
                            panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
                            panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
                            if (state['coneOuterGain'] === 0.0) {
                                panner.coneOuterGain = 0.0;
                            }
                            else {
                                panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
                            }
                            sound.setRefDistance(state['refDistance'] || refDistance);
                            sound.setMaxDistance(state['maxDistance'] || maxDistance);
                            if (state['volume']) {
                                sound.setVolume(state['volume']);
                            }
                            sound.playbackRate = state['playbackRate'] || playbackRate;
                            if (state['loop'] !== undefined && (state['loop'] === false)) {
                                sound.setLoop(false);
                            }
                            else {
                                sound.setLoop(state['loop'] || loop);
                            }
                            if (state['actor']) {
                                parent.remove(sound);
                                parent = narrative.actors(state['actor']);
                                if (parent) {
                                    parent.add(sound);
                                }
                            }
                            // play
                            if (state['play']) {
                                audio.play();
                            }
                            // pause
                            if (state['pause']) {
                                audio.pause();
                            }
                            // stop
                            if (state['stop']) {
                                audio.stop();
                            }
                        }
                    }
                    callback(null, {});
                } //delta
                play() {
                    if (sound) {
                        sound.play();
                    }
                }
                pause() {
                    if (sound) {
                        sound.pause();
                    }
                }
                stop() {
                    if (sound) {
                        sound.stop();
                    }
                }
                setVolume(level) {
                    if (sound) {
                        sound.setVolume(level);
                    }
                }
            }
             //Audio
            // enforce singleton export
            if (audio === undefined) {
                audio = new Audio();
            }
            exports_1("audio", audio);
        }
    }
});
//# sourceMappingURL=audio.js.map
import { narrative } from '../../../../narrative.js';
// class PointAudio - Factory
export const PointAudio = class {
    static create(options = {}) {
        return new Promise((resolve, reject) => {
            // return actor ready to be added to scene
            // pointAudio
            const audioLoader = new THREE.AudioLoader(), actorname = options['actorname'], autoplay = options['autoplay'] || true, url = options['url'], play = false, pause = false, stop = true;
            let refDistance = options['refDistance'] || 1.0, maxDistance = options['maxDistance'] || 10000.0, volume = options['volume'] || 1.0, playbackRate = options['playbackRate'] || 1.0, loop = options['loop'] || false, actor, audiobutton;
            // create sound and extract AudioContext
            const sound = new THREE.PositionalAudio(narrative['audioListener']), context = sound.context;
            console.log(`\n\n&&& PointAudio: url=${url} sound=${sound}`);
            audioLoader.load(url, (buffer) => {
                console.log(`\n\n\n\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
                console.log(`fetching audio buffer=${buffer}`);
                sound.setBuffer(buffer);
                sound.setRefDistance(refDistance);
                sound.setMaxDistance(maxDistance);
                sound.setVolume(volume);
                sound.setPlaybackRate(playbackRate);
                sound.setLoop(loop);
                sound.isPlaying = false; //probably redundant
                console.log(`sound=${sound}`);
                console.dir(sound);
                // attach sound to nominated actor or if error, the displayed_scene,
                // so if error, sound is a pointSound at an origin, not an actor.position
                actor = narrative.findActor(actorname);
                console.log(`\n\npointaudio: actor ${actorname} = ${actor}`);
                if (actor) {
                    actor.add(sound);
                    console.log(`\n\n\n!!!!!!!!!! actor.add(sound) !!!!!!!!!!!!!!!`);
                    console.log(`actor.name=${actor.name} actor=${actor}`);
                }
                else {
                    console.error(`trying to add sound to actor ${actorname} - NOT FOUND`);
                    if (narrative['displayed_scene'] === 'vr') {
                        narrative['vrscene'].add(sound);
                    }
                    else {
                        narrative['sgscene'].add(sound);
                    }
                }
                // start sound.play by 'enable audio' button click
                if (document.getElementById('audio')) {
                    audiobutton = document.getElementById('audio');
                    audiobutton.addEventListener('click', function () {
                        console.log(`!!!!!!!!!! click !!!!!!!!!!!!!!!`);
                        console.log(`entering eventL sound.isPlaying=${sound.isPlaying}`);
                        if (autoplay) {
                            console.log('PLAY');
                            audiobutton.innerHTML = 'audio active';
                            sound.play();
                            //console.log(`sound.isPlaying is ${sound.isPlaying}:`);
                            //console.dir(sound);
                        }
                    });
                }
            });
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            sound['delta'] = (options) => {
                //console.log(`pointAudio.delta: options = ${options}:`);
                //console.dir(options);
                const url = options['url'];
                let play = options['play'], pause = options['pause'], stop = options['stop'];
                // create or modify sound
                if (url) { // new sound source
                    audioLoader.load(url, function (buffer) {
                        sound.setBuffer(buffer);
                        if (options['refDistance']) {
                            refDistance = options['refDistance'];
                        }
                        if (options['maxDistance']) {
                            maxDistance = options['maxDistance'];
                        }
                        if (options['volume']) {
                            volume = options['volume'];
                        }
                        if (options['playbackRate']) {
                            playbackRate = options['playbackRate'];
                        }
                        if (options['loop']) {
                            loop = options['loop'];
                        }
                        if (play) {
                            console.log('PLAY');
                            audiobutton.innerHTML = 'audio active'; //redundant
                            pause = false;
                            stop = false;
                            sound.play();
                            console.log(`sound.isPlaying is ${sound.isPlaying}:`);
                            console.dir(sound);
                        }
                    });
                }
                else { // same sound source
                    if (stop) {
                        console.log('STOP');
                        play = false;
                        pause = false;
                        sound.stop();
                        console.log(`sound.isPlaying is ${sound.isPlaying}:`);
                        console.dir(sound);
                    }
                    if (pause) {
                        console.log('PAUSE');
                        play = false;
                        stop = false;
                        sound.pause();
                        console.log(`sound.isPlaying is ${sound.isPlaying}:`);
                        console.dir(sound);
                    }
                    if (options['refDistance']) {
                        refDistance = options['refDistance'];
                    }
                    if (options['maxDistance']) {
                        maxDistance = options['maxDistance'];
                    }
                    if (options['volume']) {
                        volume = options['volume'];
                    }
                    if (options['playbackRate']) {
                        playbackRate = options['playbackRate'];
                    }
                    if (options['loop']) {
                        loop = options['loop'];
                    }
                    if (play) {
                        console.log('PLAY');
                        audiobutton.innerHTML = 'audio active'; //redundant
                        sound.play();
                        console.log(`sound.isPlaying is ${sound.isPlaying}:`);
                        console.dir(sound);
                    }
                }
            }; //delta
            resolve(sound);
        }); //return new Promise<Actor>
    } // create
}; //PointAudio;
//# sourceMappingURL=pointaudio-orig.js.map
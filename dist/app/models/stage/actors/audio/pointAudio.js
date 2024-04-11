// class PointAudio - Factory
export const Pointaudio = class {
    static create(options = {}, narrative) {
        console.log(`\n\n&&& Pointaudio.create() pointaudio: ${options['url']}`);
        return new Promise((resolve, reject) => {
            // return Promise<Actor> ready to be added to scene
            // pointaudio
            const url = options['url'], actorname = options['actorname'], 
            // d at which attenuation begins (?)  0.0 => no sound!
            refd = options['refd'] || 0.0, 
            // d at which audibility ends
            maxd = options['maxd'] || 1000.0, playbackRate = options['playbackRate'] || 1.0, volume = options['volume'] || 1.0, loop = options['loop'] || false, play = false, pause = false, stop = true, audioLoader = new THREE.AudioLoader(), sound = new THREE.PositionalAudio(narrative['audioListener']), actor = narrative.findActor(actorname);
            console.log(`\n\n&&& pointaudio: sound=${sound} refd=${refd} maxd=${maxd}`);
            console.dir(sound);
            sound.setRefDistance(refd);
            sound.setMaxDistance(maxd);
            sound.setVolume(volume);
            sound.setPlaybackRate(playbackRate);
            sound.setLoop(loop);
            if (actor) {
                console.log(`adding pointaudio to actor ${actorname}`);
                console.log(`refd = ${refd}  maxd = ${maxd} volume = ${volume}`);
                actor.add(sound);
            }
            else {
                console.log(`actor ${actorname} NOT found! pointaudio can't be placed`);
            }
            console.log(`sound=${sound}:`);
            console.dir(sound);
            // called in startAudio button click-event handler
            sound['startAudio'] = () => {
                console.log(`\n *** sound.startAudio`);
                audioLoader.load(url, (buffer) => {
                    console.log(`audioLoader loaded ${buffer} from url=${url}`);
                    sound.setBuffer(buffer);
                    sound.setRefDistance(refd);
                    sound.setMaxDistance(maxd);
                    sound.setVolume(volume);
                    sound.setPlaybackRate(playbackRate);
                    sound.setLoop(loop);
                    if (actor) {
                        console.log(`adding pointaudio to actor ${actorname}`);
                        console.log(`refd = ${refd}  maxd = ${maxd} volume = ${volume}`);
                        actor.add(sound);
                    }
                    else {
                        console.log(`actor ${actorname} NOT found! pointaudio can't be placed`);
                    }
                    console.log(`sound=${sound}:`);
                    console.dir(sound);
                    console.log(`audioLoader: playing sound=${sound}`);
                    sound.play();
                }, (progress) => {
                    console.log();
                }, (err) => {
                    console.log(`error loading url:${err}`);
                });
            }; //startAudio
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            sound['delta'] = (options) => {
                //console.log(`pointaudio.delta: options = ${options}:`);
                //console.dir(options);
                if (options['volume']) {
                    sound.volume = options['volume'];
                }
                if (options['playbackRate']) {
                    sound.playbackRate = options['playbackRate'];
                }
                if (options['loop']) {
                    sound.loop = options['loop'];
                }
                if (options['play']) {
                    sound.play = options['play'];
                }
                if (options['pause']) {
                    sound.pause = options['pause'];
                }
                if (options['stop']) {
                    sound.stop = options['stop'];
                }
            }; //delta
            resolve(sound);
        }); //return new Promise<Actor>
    } // create
}; //PointAudio;
//# sourceMappingURL=pointaudio.js.map
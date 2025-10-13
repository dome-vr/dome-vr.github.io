// class GlobalAudio - Factory
export const Globalaudio = class {
    static create(options = {}, narrative) {
        console.log(`\n\n&&& globalaudio: url=${options['url']}`);
        //    console.log(`narrative['audioListener'] = ${narrative['audioListener']}`);
        //    for(const p in options){
        //      console.log(`options[${p}] = ${options[p]}`);
        //    }
        return new Promise((resolve, reject) => {
            // return Promise<Actor> ready to be added to scene
            // globalaudio
            //const urls = <string[]>options['urls'],
            const url = options['url'], autoplay = options['autoplay'] || true, playbackRate = options['playbackRate'] || 1.0, volume = options['volume'] || 1.0, loop = options['loop'] || false, play = false, pause = false, stop = true, audioLoader = new THREE.AudioLoader(), sound = new THREE.Audio(narrative['audioListener']);
            //console.log(`\n\n&&& globalaudio: urls=${urls} sound=${sound}`);
            sound.setVolume(volume);
            sound.setPlaybackRate(playbackRate);
            sound.setLoop(loop);
            console.log(`sound=${sound}:`);
            console.dir(sound);
            // called in startAudio button click-event handler
            sound['startAudio'] = () => {
                console.log(`\n *** sound.startAudio`);
                audioLoader.load(url, (buffer) => {
                    console.log(`audioLoader loaded ${buffer} from url=${url}`);
                    sound.setBuffer(buffer);
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
                //console.log(`globalaudio.delta: options = ${options}:`);
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
}; //GlobalAudio;
//# sourceMappingURL=globalaudio-simple.js.map
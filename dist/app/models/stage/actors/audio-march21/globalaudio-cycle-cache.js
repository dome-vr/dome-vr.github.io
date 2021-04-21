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
            const urls = options['urls'], autoplay = options['autoplay'] || true, playbackRate = options['playbackRate'] || 1.0, volume = options['volume'] || 1.0, play = false, pause = false, stop = true, audioLoader = new THREE.AudioLoader(), sound = new THREE.Audio(narrative['audioListener']);
            //console.log(`\n\n&&& globalaudio: urls=${urls} sound=${sound}`);
            sound.setVolume(volume);
            sound.setPlaybackRate(playbackRate);
            console.log(`sound=${sound}:`);
            console.dir(sound);
            // called in startAudio button click-event handler
            sound['startAudio'] = () => {
                console.log(`\n *** sound.startAudio`);
                const buffers = [];
                let j, N;
                async function* asyncloop(urls) {
                    N = urls.length;
                    for (let i = 0;; i++) {
                        j = i % N;
                        yield new Promise((resolve, reject) => {
                            // sf.play onEnded resolves Promise
                            sound['onEnded'] = () => {
                                resolve(j);
                            };
                            if (buffers[j]) {
                                console.log(`buffers[${j}] exists!`);
                                sound.setBuffer(buffers[j]);
                                if (!sound.isPlaying) {
                                    sound.play();
                                }
                            }
                            else {
                                console.log(`buffers[${j}] does NOT exist! => load buffer`);
                                // load url f(buffer)
                                audioLoader.load(urls[j], (buffer) => {
                                    console.log(`audioLoader loaded ${buffer} from url=${urls[j]}`);
                                    buffers[j] = buffer;
                                    sound.setBuffer(buffer);
                                    console.log(`audioLoader: playing sound=${sound}`);
                                    if (!sound.isPlaying) {
                                        sound.play();
                                    }
                                }, (progress) => {
                                    console.log();
                                }, (err) => {
                                    console.log(`error loading url:${err}`);
                                });
                            }
                        });
                    }
                } //async generator asyncloop
                (async () => {
                    const loop = asyncloop(urls);
                    for await (const k of loop) {
                        // Prints sf-url index just played
                        console.log(`await - sf ${k} complete.`);
                        sound.stop();
                    }
                })();
                //        (async () => {
                //          await asyncloop(urls);
                //          sound.stop();
                //          console.log(`await - sf complete.`);
                //        })();
            }; //sound['startAudio']
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
//# sourceMappingURL=globalaudio-cycle-cache.js.map
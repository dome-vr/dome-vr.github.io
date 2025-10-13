// globalaudio-cycle.ts
// Actor is a Factory interface - so GlobalAudio 'creates' instances using the
// options Object as variations, i.e. GlobalAudio is a factory and NOT a singleton
//
// GlobalAudio implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> GlobalAudio.create(options)
// GlobalAudio instances implement Actor interface:
// export interface Actor {
//   delta(Object):void;   
//
//
// declarative specification in context of the stage:actors Object:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
// NOTE: requires narrative, and narrative.audioListener
//
// NOTE!: audio MUST be enable by user click on 'enable audio' button - this
//   is due to a BINARY browser policy requiring user gesture to play media ?!
//   Due to this restriction play, pause and stop are only usable in delta
//   actions such as:
//
//   modify sound - pause, play, stop
//
//   {t:'globalaudio',    // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{pause:true}}     // arg-object
//
//    OR - replace sound
//
//   {t:'globalaudio',    // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{                 // arg-object
//      urls:string[],
//      volume:[0.7],     // default=1.0 NOTE:if 1 value - use for all urls
//      playbackRate:[1.2],    // default=1.0 (>1=> faster, <1=>slower)
//      play:true,         // (delta only - starts or resumes audio)
//    }}
//
//    OR - replace sound as an actor-group modification
//
//   {t:'narrative',      // target
//    f:'changeState',    // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{ 
//      stage:{
//        vrscene:{
//          _actors:undefined,     // undefined => modify
//          actors:{
//            'globalaudio':{      // audio actorname
//              options:{
//                urls:[
//                  ./app/media/audio/music/test1.mp3',
//                  ./app/media/audio/music/test2.mp3'],
//                volume:0.7,           // default=1.0
//                playbackRate:1.2,    // default=1.0 (>1=> faster, <1=>slower)
//                loop:true,          // def=f  (true=>infinite loop)
//                play:true,         // (delta only - starts or resumes audio)
//              }
//            },
//            //...               // other actor modifications
//          }//actors
//        }//vrscene
//      }//stage
//    }//o
//
//
//    create sound in sgscene or vrscene:
//
//    _actors:true,   // true=>create; false=>remove; undefined=>modify
//    actors:{
//      'globalaudio':{ 
//        factory:'GlobalAudio',
//        url:'./app/models/stage/actors/audio/globalaudio-cycle.js',
//        options:{
//           urls:string[],
//           cache:boolean,  //cache=t => cache sfs upon (single) load - def=f
//           *volume:number[],         // default=1.0
//           *playbackRate:number[],  // default=1.0 (>1=> faster, <1=>slower)
//                                // effects only globalaudio.delta function!
//                               // NOTE:autoplay NOT used in globalaudio.delta
//           *play:boolean,     // (delta only - starts or resumes audio)
//           *pause:boolean,   // (delta only - pauses sound)
//           *stop:boolean    // (delta only - pauses and sets time to start)
//        }
//      }
//    }//actors
// class GlobalAudio - Factory
export const Globalaudio = class {
    static create(options = {}, narrative) {
        console.log(`\n\n&&& Globalaudio.create() globalaudio-cycle:}`);
        // return Promise<Actor> ready to be added to scene
        // globalaudio
        return new Promise((resolve, reject) => {
            const urls = options['urls'], cache = options['cache'] || false, play = false, pause = false, stop = true, audioLoader = new THREE.AudioLoader(), sound = new THREE.Audio(narrative['audioListener']);
            let volume = options['volume'] || [], playbackRate = options['playbackRate'] || [];
            // prepare volume and playbackRate if necessary [] -> [1.0,...]
            if (volume.length === 0) {
                volume = new Array(urls.length).fill(1.0);
            }
            else {
                if (volume.length < urls.length) {
                    const n = urls.length - volume.length;
                    for (let k = 0; k < n; k++) {
                        volume[volume.length + k] = 1.0;
                    }
                }
            }
            if (playbackRate.length === 0) {
                playbackRate = new Array(urls.length).fill(1.0);
            }
            else {
                if (playbackRate.length < urls.length) {
                    const n = urls.length - playbackRate.length;
                    for (let k = 0; k < n; k++) {
                        playbackRate[playbackRate.length + k] = 1.0;
                    }
                }
            }
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
                            if (cache && buffers[j]) {
                                console.log(`cache=t AND buffers[${j}] exists! => use cached buffer`);
                                sound.setBuffer(buffers[j]);
                                sound.setVolume(volume[j]);
                                sound.setPlaybackRate(playbackRate[j]);
                                if (!sound.isPlaying) {
                                    sound.play();
                                }
                            }
                            else {
                                console.log(`cache=f or buffers[${j}] does NOT exist! => load buffer`);
                                // load url f(buffer)
                                audioLoader.load(urls[j], (buffer) => {
                                    console.log(`audioLoader loaded ${buffer} from url=${urls[j]}`);
                                    buffers[j] = buffer;
                                    sound.setBuffer(buffer);
                                    sound.setVolume(volume[j]);
                                    sound.setPlaybackRate(playbackRate[j]);
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
//# sourceMappingURL=globalaudio-cycle.js.map
import { transform3d } from '../../../../services/transform3d.js';
import { morphTargets } from '../../../../services/morphtargets.js';
// closure vars and default values
//eleven options 
let current = 0, N = 4, urls = ["./app/assets/images/cloud/sprite_redlight.png",
    "./app/assets/images/cloud/moon_256.png",
    "./app/assets/images/cloud/lotus_64.png",
    "./app/assets/images/cloud/sprites/ball.png"], transparent = true, opacity = 1.0, fog = false, lights = false, translateZ = 1000, cloudRadius = 1000, particles = 128, // 128,  // 256    //options
duration = 20000, // 2000           //options
particlesByN = particles / N, state_positions = [], positions = [], //positions.len = particles*mTargets.len*3
object_, targets;
const objects = [], group = new THREE.Group(), 
// animations
transition = () => {
    const offset = current * particles * 3;
    //console.log(`current target = ${current} offset=${offset}`);
    for (let i = 0, j = offset; i < particles; i++, j += 3) {
        object_ = objects[i];
        // TWEEN
        new TWEEN.Tween(object_.position)
            .to({
            x: positions[j],
            y: positions[j + 1],
            z: positions[j + 2]
        }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        //console.log(`tween ${i} ${j} starting`);
    }
    // TWEEN  
    new TWEEN.Tween({ x: 0, y: 0, z: 0 }) // z=0
        .to({ x: 0, y: 0, z: 0 }, duration * 3) // z=0
        .onComplete(transition)
        .start();
    current = (current + 1) % targets;
}; //transition()
export const Spritecloud = class {
    static create(state = {}) {
        const textureLoader = new THREE.TextureLoader(), transform = state['transform'];
        let mat, spr, loaded = 0;
        //console.log(`\n\n\n **************** state = ${state}:`);
        //console.dir(state);
        particles = state['particles'] || particles;
        targets = state['targets'] || targets;
        N = state['N'] || N;
        particlesByN = particles / N;
        current = 0;
        urls = state['urls'] || urls;
        transparent = state['transparent'] || transparent;
        opacity = state['opacity'] || opacity;
        duration = state['duration'] || duration;
        state_positions = state['positions'] || [];
        cloudRadius = state['cloudRadius'] || cloudRadius;
        translateZ = state['translateZ'] || translateZ;
        fog = state['fog'] || fog;
        lights = state['lights'] || lights;
        //console.log(`targets = ${targets}`);
        return new Promise((resolve, reject) => {
            try {
                // delta sprites and morph-morphtargets
                for (let i = 0; i < N; i++) {
                    textureLoader.load(urls[i], 
                    // load
                    (texture) => {
                        loaded += 1;
                        mat = new THREE.SpriteMaterial({ map: texture, color: 'white', fog: true });
                        for (let j = 0; j < particlesByN; j++) {
                            spr = new THREE.Sprite(mat);
                            let x = Math.random() - 0.5;
                            let y = Math.random() - 0.5;
                            let z = Math.random() - 0.5;
                            spr.position.set(x, y, z);
                            spr.position.normalize();
                            spr.position.multiplyScalar(cloudRadius);
                            x = spr.position.x;
                            y = spr.position.y;
                            z = spr.position.z;
                            positions.push(x, y, z);
                            objects.push(spr);
                            group.add(spr);
                            //console.log(`spritecloud positions i=${i} j=${j}`);
                        }
                        if (loaded === N) {
                            console.log(`cld texture loading complete - ${loaded} images`);
                            //console.log(`textures complete - objs.l = ${objects.length}`);
                            // if state_positions = [] or undefined generate morph positions
                            if (state_positions.length === 0) {
                                //console.log(`initially positions.length = ${positions.length}`);
                                positions = morphTargets.generate(state);
                                //console.log(`after positions.length = ${positions.length}`);
                                //for(let i=0; i<positions.length; i++){
                                //  console.log(`positions[${i}] = ${positions[i]}`);
                                //}
                            }
                            else {
                                //console.log(`initially positions.length = ${positions.length}`);
                                positions = state_positions;
                                console.log(`after positions.length = ${positions.length}`);
                            }
                            // calculate number of morphtargets
                            // NOTE: positions is array of (x,y,z) (3) for each vertex 
                            // (particles) for each target
                            targets = positions.length / (particles * 3);
                            // start animation cycle
                            //console.log(`at cld.transition: pos.l=${positions.length}`);
                            //console.log(`targets=${targets}`);
                            transition();
                        }
                    }, 
                    // progress
                    (xhr) => {
                        console.log(`cloud loading textures...`);
                    }, 
                    // error
                    (xhr) => {
                        console.log(`error loading url ${urls[i]}`);
                    });
                }
            }
            catch (e) {
                console.log(`error in spritecloud_init: ${e.message}`);
            }
            //transform
            if (transform) {
                transform3d.apply(transform, group);
            }
            resolve(group);
        }); //return new Promise
    } //create()
}; //Cloud
//# sourceMappingURL=spritecloud-nar-anim.js.map
System.register(['../services/mediator', '../services/morphtargets'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1, morphtargets_1;
    var cloud, TWEEN, N, urls, transparent, opacity, lights, fog, particles, particlesByN, duration, targets, cloudRadius, translateZ, objects, object, positions, state_positions, current, group, transition, Cloud;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            },
            function (morphtargets_1_1) {
                morphtargets_1 = morphtargets_1_1;
            }],
        execute: function() {
            // singleton closure-instance variable, cloud param defaults
            N = 4, urls = ["./assets/images/sprite_redlight.png",
                "./assets/images/moon_256.png",
                "./assets/images/lotus_64.png",
                "./assets/images/sprites/ball.png"], transparent = true, opacity = 1.0, lights = false, fog = false, particles = 128, particlesByN = particles / N, duration = 1000, cloudRadius = 500, translateZ = 1000, objects = [], positions = [], state_positions = [], current = 0, group = new THREE.Group(), 
            // animations
            transition = () => {
                var offset = current * particles * 3, i, j;
                //tween1,
                //tween2,
                //o:object={x:0};
                mediator_1.mediator.log(`current target = ${current} offset=${offset}`);
                for (i = 0, j = offset; i < particles; i++, j += 3) {
                    object = objects[i];
                    // TWEEN
                    new TWEEN.Tween(object.position)
                        .to({
                        x: positions[j],
                        y: positions[j + 1],
                        z: positions[j + 2]
                    }, Math.random() * duration + duration)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .start();
                }
                // TWEEN  
                new TWEEN.Tween({ x: 0, y: 0, z: 0 }) // z=0
                    .to({ x: 0, y: 0, z: 0 }, duration * 3) // z=0
                    .onComplete(transition)
                    .start();
                // GSAP
                //      tween2 = TweenLite.to(o,
                //                    duration*3,
                //                    {x:0,
                //                     onComplete:transition});
                current = (current + 1) % targets; // modulo total morph-targets
            };
            class Cloud {
                constructor() {
                    cloud = this;
                } //ctor
                delta(state, TWEEN_, callback) {
                    mediator_1.mediator.log(`delta: state = ${state} TWEEN_ = ${TWEEN_}`);
                    var _cloud = state['_cloud'], loaded = 0, mat, spr, textureLoader = new THREE.TextureLoader(), o = {};
                    // globals
                    TWEEN = TWEEN_;
                    // _cloud=undefined => modify/create _cloud=true => create
                    mediator_1.mediator.logc(`cloud.delta: state['_cloud'] = ${state['_cloud']}`);
                    if (_cloud === undefined || _cloud === true) {
                        o['_cloud'] = state['_cloud'];
                        particles = state['particles'] || particles;
                        targets = state['targets'] || targets;
                        N = state['N'] || N;
                        particlesByN = particles / N;
                        current = 0;
                        urls = state['urls'] || urls;
                        duration = state['duration'] || duration;
                        state_positions = state['positions'] || [];
                        cloudRadius = state['cloudRadius'] || cloudRadius;
                        translateZ = state['translateZ'] || translateZ;
                        if (state['options']) {
                            transparent = state['options']['transparent'] || transparent;
                            opacity = state['options']['opacity'] || opacity;
                            lights = state['options']['lights'] || lights;
                            fog = state['options']['fog'] || fog;
                        }
                        try {
                            // delta sprites and morph-targets
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
                                        mediator_1.mediator.log(`spritecloud positions i=${i} j=${j}`);
                                    }
                                    if (loaded === N) {
                                        mediator_1.mediator.log(`cld texture loading complete - ${loaded} images`);
                                        mediator_1.mediator.log(`textures complete - objs.l = ${objects.length}`);
                                        // if state_positions = [] or undefined generate morph positions
                                        if (state_positions.length === 0) {
                                            positions = morphtargets_1.morphTargets.generate(state);
                                        }
                                        else {
                                            positions = state_position;
                                        }
                                        // calculate number of targets
                                        // NOTE: positions is array of (x,y,z) (3) for each vertex 
                                        // (particles) for each target
                                        targets = positions.length / (particles * 3);
                                        // start animation cycle
                                        mediator_1.mediator.log(`at cld.transition: pos.l=${positions.length}`);
                                        transition();
                                        // create cloud
                                        callback(null, { _cloud: _cloud, group: group });
                                    }
                                }, 
                                // progress
                                    (xhr) => {
                                    mediator_1.mediator.log(`cloud loading textures...`);
                                }, 
                                // error
                                    (xhr) => {
                                    mediator_1.mediator.loge(`error loading url ${urls[i]}`);
                                });
                            }
                        }
                        catch (e) {
                            mediator_1.mediator.loge(`error in spritecloud_init: ${e.message}`);
                            callback(null, null);
                        }
                    }
                    else {
                        callback(null, { _cloud: _cloud, group: null });
                    } //if(state['_cloud'])
                } //delta()
            }
             //Cloud
            // enforce singleton export
            if (cloud === undefined) {
                cloud = new Cloud();
            }
            exports_1("cloud", cloud);
        }
    }
});
//# sourceMappingURL=cloud.js.map
// animation.ts
// NOTE!: need TweenMax, TimelineMax Quad
System.register(['./mediator'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1;
    var animation, narrative, timeline, Animation;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            }],
        execute: function() {
            // singleton instance - exported
             // source for actors and callbacks narrative.exec({})
            timeline = (shot) => {
                var _timeline = shot['timeline'] || {}, tlp = _timeline['p'] || {}, actors = _timeline['actors'] || {}, ntuple, target, // target obj for property to be tweened - animated
                tweens, quad_m, hud_m;
                // timeline ctor params - tlp
                tlp.timeScale = tlp['timeScale'] || 1.0;
                tlp.repeat = tlp['repeat'] || 0;
                tlp.repeatDelay = tlp['repeatDelay'] || 0;
                tlp.yoyo = tlp['yoyo'] || true;
                tlp.ease = tlp['ease'] || Quad.easeInOut;
                tlp.paused = tlp['paused'] || false; // default
                tlp.immediateRender = tlp['immediateRender'] || false; // default
                // callbacks & params
                tlp.onStart = tlp['onStart'];
                tlp.onStartParams = tlp['onStartParams'] || [];
                // TEMP !!!!
                tlp.onUpdate = tlp['onUpdate'];
                tlp.onUpdateParams = tlp['onUpdateParams'] || [];
                //tlp.onUpdate = console.log;      
                //tlp.onUpdateParams = [`timeline-update`];
                tlp.onComplete = tlp['onComplete'];
                tlp.onCompleteParams = tlp['onCompleteParams'] || [];
                tlp.onReverseComplete = tlp['onReverseComplete'];
                tlp.onReverseCompleteParams = tlp['onReverseCompleteParams'] || [];
                // iterate through actors on which one or more tweens are defined
                for (let a of Object.keys(actors)) {
                    mediator_1.mediator.log(`actor = ${a}`);
                    ntuple = a.split('~');
                    mediator_1.mediator.log(`ntuple = ${ntuple.join('~')}`);
                    if (!ntuple[0]) {
                        continue; // bail if first slot is empty
                    }
                    // determine target of property animation
                    target = undefined;
                    if (ntuple[0].match(/target/)) {
                        target = narrative.targets[ntuple[0]];
                        if (ntuple[1]) {
                            target = target[ntuple[1]];
                        }
                        if (ntuple[2]) {
                            target = target[ntuple[2]];
                        }
                    }
                    else {
                        if (ntuple[0].match(/uniform/)) {
                            //console.log(`ntuple[0] matches /uniform/`);
                            //console.log(`ntuple[1] = ${ntuple[1]}`);
                            if (ntuple[1].match(/quad/)) {
                                quad_m = narrative.quad.material;
                                //console.log(`ntuple[1] matches /quad/`);
                                //for(let p of Object.keys(quad_m.uniforms)){
                                //  console.log(`quad_m has uniform ${p}`);
                                //}
                                //console.log(`ntuple[2] = ${ntuple[2]}`);
                                target = quad_m.uniforms[ntuple[2]];
                            }
                            if (ntuple[1].match(/hud/)) {
                                hud_m = narrative.quad.material;
                                //console.log(`ntuple[1] matches /hud/`);
                                //for(let p of Object.keys(hud_m.uniforms)){
                                //  console.log(`hud_m has uniform ${p}`);
                                //}
                                target = hud_m.uniforms[ntuple[2]];
                            }
                        }
                        else {
                            target = narrative.actors[ntuple[0]];
                            if (ntuple[1]) {
                                target = target[ntuple[1]];
                            }
                            if (ntuple[2]) {
                                target = target[ntuple[2]];
                            }
                        }
                    }
                    //mediator.logc(`target = ${target}`);
                    //if(target && target['value']){
                    //  mediator.logc(`target['value'] = ${target['value']}`);
                    //}
                    if (!target) {
                        continue; // bail if target is undefined/unknown
                    }
                    // insert tween defaults if not specified
                    // add actor tween array(s) to tlp.tweens array
                    tlp.tweens = tlp['tweens'] || [];
                    tweens = actors[a];
                    for (let tween of tweens) {
                        // dur - duration of the tween animation
                        if (tween.dur === undefined) {
                            tween.dur = 10;
                        }
                        // property to animate - tween['p'] = {{name:value}, ...}
                        tween.p = tween['p'] || {};
                        // other tween.p properties - nearly identical to timeline-tlp properties
                        tween.p.timeScale = tween.p['timeScale'] || 1.0;
                        tween.p.repeat = tween.p['repeat'] || 0;
                        tween.p.repeatDelay = tween.p['repeatDelay'] || 0;
                        tween.p.yoyo = tween.p['yoyo'] || true;
                        tween.p.ease = tween.p['ease'] || Quad.easeInOut;
                        //      tween.p.paused = tween.p['paused'] || true; // default DO NOT USE!!!!
                        tween.p.immediateRender = tween.p['immediateRender'] || false; // default
                        tween.p.delay = tween['delay'] || '0';
                        // callbacks & params
                        tween.p.onStart = tween.p['onStart'];
                        tween.p.onStartParams = tween.p['onStartParams'] || [];
                        // update - if target is uniform target.needsUpdate=true
                        //quad.material.uniforms.uCam_up.needsUpdate = true;
                        if (ntuple[0].match(/uniform/)) {
                            if (ntuple[1].match(/quad/)) {
                                //console.log(`tween:ntuple[1] matches /quad/`);
                                tween.p.onUpdate = () => {
                                    quad_m.uniforms[ntuple[2]]['needsUpdate'] = true;
                                    //console.log(`u.value = ${quad_m.uniforms[ntuple[2]]['value']}`);
                                };
                                quad_m.uniforms[ntuple[2]]['needsUpdate'] = true;
                            }
                            else {
                                console.log(`tween:ntuple[1] matches /hud/`);
                                tween.p.onUpdate = () => { hud_m.uniforms[ntuple[2]]['needsUpdate'] = true; };
                                hud.uniforms[ntuple[2]]['needsUpdate'] = true;
                            }
                        }
                        else {
                            tween.p.onUpdate = tween.p['onUpdate'];
                        }
                        tween.p.onUpdateParams = tween.p['onUpdateParams'] || [];
                        // onComplete
                        tween.p.onComplete = tween.p['onComplete'];
                        tween.p.onCompleteParams = tween.p['onCompleteParams'] || [];
                        tween.p.onReverseComplete = tween.p['onReverseComplete'];
                        tween.p.onReverseCompleteParams = tween.p['onReverseCompleteParams'] || [];
                        // add tween to tlp.tweens array
                        tlp.tweens.push(TweenMax.to(target, tween.dur, tween.p));
                    }
                } //actors
                // return primed timeline
                return new TimelineMax(tlp);
            }; //timeline() 
            class Animation {
                constructor() {
                    mediator_1.mediator.log(`Animation ctor`);
                }
                initialize(_narrative) {
                    narrative = _narrative;
                    //console.log(`&&& quad = ${narrative.quad} hud = ${narrative.hud}`);
                }
                // NOTE: reverse=true if back-button, but also if choosing scene sequence
                // such as: (1) sceneA, (2) sceneB, (3) sceneA => reverse=true
                perform(shot = {}, reverse = false) {
                    var tl;
                    // diagnostics
                    mediator_1.mediator.logc(`Animation.perform: shot = ${shot}`);
                    //mediator.logc(`Animation.perform: reverse = ${reverse}`);
                    // prepare timeline for shot
                    tl = timeline(shot);
                    //console.log(`tl = ${tl}`);
                    //console.dir(tl);
                    // timeline - if back - run anim in reverse, else forward
                    //mediator.logc(`Animation.perform: playing tl = ${tl}`);
                    if (reverse === true) {
                        tl.seek(tl.duration());
                        tl.reverse();
                    }
                    else {
                        tl.play();
                    }
                } //perform
            }
             //class Animation
            // enforce singleton export
            if (animation === undefined) {
                animation = new Animation();
            }
            exports_1("animation", animation);
        }
    }
});
//# sourceMappingURL=animation.js.map
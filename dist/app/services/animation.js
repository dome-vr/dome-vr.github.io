// animation.ts
// NOTE!: need TweenMax, TimelineMax Quad
// gsap
import { TweenMax, TimelineMax, Quad, Power1 } from '../../../node_modules/gsap/all.js';
//import {gsap, TweenMax, TimelineMax, Quad, Power1} from '../../external/gsap/all.js';
// singleton instance - exported
let animation, actionsTargets, narrative; // source for actor methods
const timeline = (anim) => {
    //was const tlp = <Record<string, unknown>>anim['timeline'] || {},
    const tlp = anim['timeline'] || {}, actors = anim['actors'] || {}, startf = () => { console.log('start!!'); }, emptyf = () => { return; }, completef = () => { console.log('complete!!'); };
    let ntuple, target, // target obj for property to be tweened - animated
    tweens;
    // timeline ctor params - tlp
    tlp['duration'] = tlp['duration'] || 10;
    //tlp.timeScale = <number>tlp['timeScale'] || 1.0;
    tlp['repeat'] = tlp['repeat'] || 0;
    tlp['repeatDelay'] = tlp['repeatDelay'] || 0;
    tlp['yoyo'] = tlp['yoyo'] || true;
    tlp['ease'] = tlp['ease'] || Power1.InOut;
    tlp['paused'] = tlp['paused'] || false; // default
    tlp['immediateRender'] = tlp['immediateRender'] || false; // default
    // callbacks & params
    tlp['onStart'] = tlp['onStart'] || startf;
    tlp['onStartParams'] = tlp['onStartParams'] || [];
    // TEMP !!!!
    //tlp.onUpdate = tlp['onUpdate'] || emptyf;      
    //tlp.onUpdateParams = tlp['onUpdateParams'] || [];
    //tlp.onUpdate = console.log;      
    //tlp.onUpdateParams = [`timeline-update`];
    tlp['onComplete'] = tlp['onComplete'] || completef;
    tlp['onCompleteParams'] = tlp['onCompleteParams'] || [];
    tlp['onReverseComplete'] = tlp['onReverseComplete'] || completef;
    tlp['onReverseCompleteParams'] = tlp['onReverseCompleteParams'] || [];
    // iterate through actors on which one or more tweens are defined
    tlp['tweens'] = [];
    for (const a of Object.keys(actors)) {
        console.log(`\n\n @@@@animation target = ${a}`);
        console.dir(a);
        //tween
        const ntuple = a.split('~'), tweenp = actors[a], duration = a['duration'] || 10.0;
        //console.log(`ntuple = ${ntuple}`);
        //console.log(`ntuple[0] = ${ntuple[0]}`);
        const actor = narrative.findActor(ntuple[0]);
        let target = actor;
        //narrative.reportActors(true);
        //console.log(`actor.name = ${actor.name}`);
        for (let i = 1; i < ntuple.length; i++) {
            //console.log(`initial target = ${target}`);
            target = target[ntuple[i]];
            console.log(`extended target = ${target}:`);
            console.dir(target);
        }
        //console.log(`tweenp = actors[a] w. type = ${typeof actors[a]}:`);
        //console.dir(actors[a]);
        // other tweenp properties - nearly identical to timeline-tlp properties
        //tweenp['timeScale'] = <number>(tweenp['timeScale']) || 1.0;
        tweenp['repeat'] = (tweenp['repeat']) || 0;
        tweenp['repeatDelay'] = (tweenp['repeatDelay']) || 0;
        tweenp['yoyo'] = (tweenp['yoyo']) || true;
        tweenp['ease'] = tweenp['ease'] || Quad.InOut;
        //      tweenp.paused = tweenp['paused'] || true; // default DO NOT USE!!!!
        tweenp['immediateRender'] = (tweenp['immediateRender']) || false; // default
        tweenp['delay'] = (tweenp['delay']) || '0';
        // callbacks & params
        tweenp['onStart'] = tweenp['onStart'] || startf;
        tweenp['onStartParams'] = tweenp['onStartParams'] || [];
        //tweenp['onUpdate'] = tweenp['onUpdate'] || emptyf;      
        //tweenp['onUpdateParams'] = tweenp['onUpdateParams'] || [];
        tweenp['onComplete'] = tweenp['onComplete'] || completef;
        tweenp['onCompleteParams'] = tweenp['onCompleteParams'] || [];
        tweenp['onReverseComplete'] = tweenp['onReverseComplete'] || completef;
        tweenp['onReverseCompleteParams'] = tweenp['onReverseCompleteParams'] || [];
        // add tween to tlp.tweens array
        //    console.log(`target = ${target}:`);
        //    console.dir(target);
        //    console.log(`duration = ${duration}`);
        console.log(`tweenp = ${tweenp}:`);
        console.dir(tweenp);
        tlp['tweens'].push(TweenMax.to(target, duration, tweenp));
    } //actors
    // return primed timeline
    return new TimelineMax(tlp);
}; //timeline() 
class Animation {
    constructor() {
        //console.log(`Animation ctor`);
    }
    // actionsTargets are the first name determing the action exec 'signature'
    // narrative reference is needed to fetch actors if action-target (a.t)
    // is not in actionsTargets name-keys
    initialize(config) {
        //console.log(`services/animation initializing`);
        actionsTargets = config['actionsTargets'] || {};
        narrative = config['actionsTargets']['narrative'];
    }
    // NOTE: reverse=true if back-button, but also if choosing scene sequence
    // such as: (1) sceneA, (2) sceneB, (3) sceneA => reverse=true
    perform(anim = {}) {
        // diagnostics
        console.log(`Animation.perform: anim = ${anim}:`);
        console.dir(anim);
        // prepare timeline for anim
        const tl = timeline(anim);
        console.log(`tl = ${tl}`);
        console.dir(tl);
        // timeline - if back - run anim in reverse, else forward
        console.log(`Animation.perform: playing tl = ${tl}`);
        tl.play();
    } //perform
    perform_reverse(anim = {}) {
        // diagnostics
        console.log(`Animation.perform: anim = ${anim}`);
        //console.log(`Animation.perform: reverse = ${reverse}`);
        // prepare timeline for anim
        const tl = timeline(anim);
        //console.log(`tl = ${tl}`);
        //console.dir(tl);
        // timeline - if back - run anim in reverse, else forward
        //console.log(`Animation.perform: playing tl = ${tl}`);
        tl.seek(tl.duration());
        tl.reverse();
    } //perform
} //class Animation
// enforce singleton export
if (animation === undefined) {
    animation = new Animation();
}
export { animation };
//# sourceMappingURL=animation.js.map
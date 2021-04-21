// seq-rmbezier.ts
// test sequence for services/animation.ts 
// 
// NOTE:for rmBezier actions o.values is an Object[3] which are the
// three defining vec3 points of a Quadratic bezier curve:
// start
// control
// end
// z=-4.0 is the 'ground' level for the rmquad which is the raymarch background
// z=-1.0 is the 'upper sky' limit for positions
// z=0.0 removes the position from consideration for being rendered since
//   the raymarch algorithm will skip any position j with z=0.0 in the iteration
//   to find the min-distance ray-position[j] over all j.
export const actions = [
    { t: 'narrative',
        f: 'foo',
        a: 'o',
        o: { a: 2, b: 3 },
        ms: 1000 },
    { t: 'animation',
        f: 'addrmBezier',
        a: 'o',
        o: {
            rm_index: 5,
            duration: 6,
            values: [
                { x: -1.5, y: 0.0, z: -4.0 },
                { x: 0.0, y: 1.5, z: -1.0 },
                { x: 1.5, y: 3.0, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 2000 },
    { t: 'animation',
        f: 'addrmBezier',
        a: 'o',
        o: {
            rm_index: 4,
            duration: 6,
            values: [
                { x: -1.9, y: 1.0, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: 1.6, y: 1.0, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 2000 },
    { t: 'animation',
        f: 'addrmBezier',
        a: 'o',
        o: {
            rm_index: 7,
            duration: 6,
            values: [
                { x: 2.5, y: -1.0, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: -1.5, y: -1.0, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 2000 },
    { t: 'animation',
        f: 'addrmBezier',
        a: 'o',
        o: {
            rm_index: 10,
            duration: 6,
            values: [
                { x: 3.2, y: -1.7, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: 3.1, y: 1.7, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 4000 },
    { t: 'animation',
        f: 'addrmBezier',
        a: 'o',
        o: {
            rm_index: 99,
            duration: 6,
            values: [
                { x: -2.9, y: -2.9, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: 2.9, y: 2.9, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 4000 },
    { t: 'animation',
        f: 'removermBezier',
        a: 'o',
        o: {
            rm_index: 10 //target rm_positions[j]
        },
        ms: 18000 },
    { t: 'animation',
        f: 'modifyrmBezier',
        a: 'o',
        o: {
            rm_index: 99,
            duration: 6,
            values: [
                { x: 2.9, y: 2.9, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: -2.9, y: -2.9, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 25000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            pause: true
        },
        ms: 30000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            seek: 3.0
        },
        ms: 40000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            restart: true
        },
        ms: 50000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            timescale: 1.5
        },
        ms: 60000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            yoyo: true
        },
        ms: 70000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            yoyo: false
        },
        ms: 90000 },
    { t: 'animation',
        f: 'controlTimeline',
        a: 'o',
        o: {
            duration: 20
        },
        ms: 100000 },
    { t: 'animation',
        f: 'addActorBezier',
        a: 'o', o: {
            actors: {
                'unitcube.position': {
                    duration: 10,
                    type: 'quadratic',
                    yoyo: true,
                    delay: 1,
                    values: [
                        { x: 0.0, y: 0.0, z: -0.5 },
                        { x: 0.15, y: 0.5, z: -0.5 },
                        { x: 0.35, y: 0.0, z: -0.5 }
                    ],
                    start_time: 0,
                    onStart: function () {
                        console.log(`***add: onStart`);
                    },
                    onRepeat: function () {
                        console.log(`***add: onRepeat`);
                    },
                    onComplete: function () {
                        console.log(`***add: onComplete`);
                    }
                }
            } //actors
        }, //o
        ms: 110000 },
    { t: 'animation',
        f: 'modifyActorBezier',
        a: 'o', o: {
            actors: {
                'unitcube.position': {
                    //yoyo:true,   
                    onStart: function () {
                        console.log(`***modified: onStart`);
                    },
                    onRepeat: function () {
                        console.log(`***modified: onRepeat`);
                    },
                    onComplete: function () {
                        console.log(`***modified: onComplete`);
                    },
                    delay: 0,
                    values: [
                        { x: 0.0, y: 0.0, z: -0.5 },
                        { x: -.15, y: 0.5, z: -0.5 },
                        { x: -.35, y: 0.0, z: -0.5 }
                    ]
                }
            } //actors
        }, //o
        ms: 140000 },
    { t: 'animation',
        f: 'removeActorBezier',
        a: 'o',
        o: {
            actors: {
                'unitcube.position': {
                    timeline_name: 'vr_timeline'
                }
            }
        },
        ms: 200000 }
];
//# sourceMappingURL=rmbezier-actorbezier.js.map
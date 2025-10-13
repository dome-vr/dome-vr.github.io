// seq-rmbezier-alt.ts
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
            type: 'cubic',
            values: [
                { x: -1.5, y: 0.0, z: -4.0 },
                { x: 0.0, y: 1.5, z: -1.0 },
                { x: 0.0, y: 2.0, z: -1.0 },
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
            type: 'thru',
            curviness: 2,
            autoRotate: true,
            values: [
                { x: -1.9, y: 1.0, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: 1.6, y: 1.0, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: -1.9, y: 1.0, z: -4.0 }
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
            type: 'soft',
            values: [
                { x: 2.5, y: -1.0, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: -1.5, y: -1.0, z: -4.0 },
                { x: 0.0, y: 0.0, z: -1.0 },
                { x: 2.5, y: -1.0, z: -4.0 }
            ],
            start_time: 0 //time position in timeline duration cycle
        },
        ms: 2000 }
];
//# sourceMappingURL=rmbezier-circles.js.map
export const actions = [
    { t: 'narrative',
        f: 'foo',
        a: 'o',
        o: { a: 1, b: 2 },
        ms: 5000 },
    // pause each audio sound one by one
    { t: 'globalaudio',
        f: 'delta',
        a: 'o',
        o: { pause: true
        },
        ms: 10000 },
    { t: 'globalaudio2',
        f: 'delta',
        a: 'o',
        o: { pause: true
        },
        ms: 15000 },
    { t: 'globalaudio3',
        f: 'delta',
        a: 'o',
        o: { pause: true
        },
        ms: 20000 },
    // restart each audio sound one by one
    { t: 'globalaudio',
        f: 'delta',
        a: 'o',
        o: { play: true,
            volume: 0.5
        },
        ms: 30000 },
    { t: 'globalaudio2',
        f: 'delta',
        a: 'o',
        o: { play: true,
            volume: 0.6
        },
        ms: 35000 },
    { t: 'globalaudio3',
        f: 'delta',
        a: 'o',
        o: { play: true,
            volume: 5.0,
            playbackRate: 0.3
        },
        ms: 40000 } // timestamp
];
//# sourceMappingURL=changes-to-existing.js.map
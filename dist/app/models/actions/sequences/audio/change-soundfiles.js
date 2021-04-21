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
        o: { url: './app/assets/audio/ebirds.ogg',
            play: true,
            playbackRate: 0.5,
            volume: 1.5
        },
        ms: 30000 },
    { t: 'globalaudio2',
        f: 'delta',
        a: 'o',
        o: { url: './app/assets/audio/ebirds.ogg',
            play: true,
            playbackRate: 1.5,
            volume: 0.5
        },
        ms: 35000 },
    { t: 'globalaudio3',
        f: 'delta',
        a: 'o',
        o: { play: true,
            volume: 1.0,
            playbackRate: 1.0
        },
        ms: 40000 } // timestamp
];
//# sourceMappingURL=change-soundfiles.js.map
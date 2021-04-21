// seq-loop.ts
export const actions = [
    { t: 'unitcube',
        f: 'rotateY',
        a: 'n',
        o: { 'arg': 1.0 },
        ms: 5000 },
    { t: 'unitcube',
        f: 'rotateY',
        a: 'n',
        o: { 'arg': -1.0 },
        ms: 10000 },
    { t: 'narrative',
        f: 'sequence',
        a: 'n',
        o: { 'arg': './app/models/actions/sequences/loop/seq_loop' },
        ms: 15000 }
];
//# sourceMappingURL=seq_loop.js.map
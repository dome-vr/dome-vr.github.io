// n_exec.ts -  test of narrative.exec
System.register([], function (exports_1, context_1) {
    "use strict";
    var n_exec, N_exec;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {// n_exec.ts -  test of narrative.exec
            N_exec = class N_exec {
                constructor() {
                    exports_1("n_exec", n_exec = this);
                }
                // n.exec
                f_s(s) {
                    console.assert(s === 'test', `${s} !== 'test`);
                }
                f_n(n) {
                    console.assert(n === 2017, `${n} !== 2017`);
                }
                f_o(o) {
                    console.assert(o['a'] === 1, `${o['a']} !== 1`);
                    console.assert(o['b'] === 'foo', `${o['b']} !== 'foo'`);
                }
                f_as(as) {
                    console.assert(as[0] === 'test0', `${as[0]} !== 'test0'`);
                    console.assert(as[1] === 'test1', `${as[1]} !== 'test1'`);
                }
                f_an(an) {
                    console.assert(an[0] === 1, `${an[0]} !== 1`);
                    console.assert(an[1] === 2, `${an[1]} !== 2`);
                    console.assert(an[2] === 3, `${an[2]} !== 3`);
                }
                f_ao(ao) {
                    console.assert(ao[0]['a'] === 0, `${ao[0]['a']} !== 0`);
                    console.assert(ao[0]['b'] === 'foo', `${ao[0]['b']} !== 'foo'`);
                    console.assert(ao[1]['c'] === 1, `${ao[1]['c']} !== 1`);
                    console.assert(ao[1]['d'] === 'coco', `${ao[0]['d']} !== 'coco'`);
                }
                f_a(a, b, c, d) {
                    console.assert(a === 1, `${a} !== 1`);
                    console.assert(b === 2, `${b} !== 2`);
                    console.assert(c === 3, `${c} !== 3`);
                    console.assert(d === 'foo', `${d} !== 'foo'`);
                }
                f_a_empty() {
                    console.log(`all 8 n_exec tests passed`);
                }
            };
            // enforce singleton export
            if (n_exec === undefined) {
                exports_1("n_exec", n_exec = new N_exec());
            }
        }
    };
});
//# sourceMappingURL=n_exec.js.map
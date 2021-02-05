// testTarget.ts - mock narrative.targets member
// represents narrative, camera, animation, etc...
System.register(["./modules/n_exec", "./modules/n_changeState"], function (exports_1, context_1) {
    "use strict";
    var n_exec_1, n_changeState_1, testTarget, TestTarget;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (n_exec_1_1) {
                n_exec_1 = n_exec_1_1;
            },
            function (n_changeState_1_1) {
                n_changeState_1 = n_changeState_1_1;
            }
        ],
        execute: function () {// testTarget.ts - mock narrative.targets member
            // represents narrative, camera, animation, etc...
            TestTarget = class TestTarget {
                constructor() {
                    exports_1("testTarget", testTarget = this);
                    console.log(`n_exec = ${n_exec_1.n_exec}`);
                    console.log(`n_changeState = ${n_changeState_1.n_changeState}`);
                }
                // n.exec
                f_s(s) { n_exec_1.n_exec.f_s(s); }
                f_n(n) { n_exec_1.n_exec.f_n(n); }
                f_o(o) { n_exec_1.n_exec.f_o(o); }
                f_as(as) { n_exec_1.n_exec.f_as(as); }
                f_an(an) { n_exec_1.n_exec.f_an(an); }
                f_ao(ao) { n_exec_1.n_exec.f_ao(ao); }
                f_a(a, b, c, d) { n_exec_1.n_exec.f_a(a, b, c, d); }
                f_a_empty() { n_exec_1.n_exec.f_a_empty(); }
            };
            // enforce singleton export
            if (testTarget === undefined) {
                exports_1("testTarget", testTarget = new TestTarget());
            }
        }
    };
});
//# sourceMappingURL=testTarget.js.map
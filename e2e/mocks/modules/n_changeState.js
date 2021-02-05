// n_changeState.ts -  test of narrative.changeState
System.register([], function (exports_1, context_1) {
    "use strict";
    var n_changeState, N_changeState;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {// n_changeState.ts -  test of narrative.changeState
            N_changeState = class N_changeState {
                constructor() {
                    exports_1("n_changeState", n_changeState = this);
                    //console.log(`n.changeState: narrative = ${narrative}`);
                }
            };
            // enforce singleton export
            if (n_changeState === undefined) {
                exports_1("n_changeState", n_changeState = new N_changeState());
            }
        }
    };
});
//# sourceMappingURL=n_changeState.js.map
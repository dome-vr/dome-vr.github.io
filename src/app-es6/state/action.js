System.register(['../services/mediator'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1;
    var action, Action;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            }],
        execute: function() {
            // singleton closure-instance variable
            class Action {
                // ctor
                constructor() {
                    action = this;
                } //ctor
                delta(state, callback) {
                    mediator_1.mediator.log(`Action.delta: state = ${state}`);
                    // return Queue of timed actions - future: may need additions?
                    callback(null, state);
                }
            }
             //Action
            // enforce singleton export
            if (action === undefined) {
                action = new Action();
            }
            exports_1("action", action);
        }
    }
});
//# sourceMappingURL=action.js.map
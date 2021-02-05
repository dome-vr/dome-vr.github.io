System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var queue, Queue;
    return {
        setters:[],
        execute: function() {
            // queue.ts - holds timed actions 
            class Queue {
                constructor() {
                    this.fifo = [];
                    this.ready = true;
                }
                load(actions = []) {
                    this.fifo = actions;
                }
                push(s) {
                    this.fifo.push(s);
                }
                pop() {
                    return (this.fifo.length > 0 ? this.fifo.shift() : undefined);
                }
                peek() {
                    return (this.fifo.length > 0 ? this.fifo[0] : undefined);
                }
            }
            // enforce singleton export
            if (queue === undefined) {
                queue = new Queue();
            }
            exports_1("queue", queue);
        }
    }
});
//# sourceMappingURL=queue.js.map
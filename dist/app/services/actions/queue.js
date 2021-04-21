// queue.ts - holds timed actions 
// singleton closure-instance variable
let queue;
class Queue {
    constructor() {
        queue = this;
        queue.fifo = [];
    }
    static create() {
        if (queue === undefined) {
            queue = new Queue();
        }
    }
    initialize(config) {
        //console.log(`services/actions/queue initializing config=${config}`);
    }
    load(actions = []) {
        //deep clone actions
        //queue.fifo = actions;
        queue.fifo = JSON.parse(JSON.stringify(actions));
    }
    append(actions = []) {
        //deep clone actions
        //queue.fifo.concat(actions);
        queue.fifo.concat(JSON.parse(JSON.stringify(actions)));
    }
    push(a) {
        queue.fifo.push(a);
    }
    pop() {
        return (queue.fifo.length > 0 ? queue.fifo.shift() : null);
    }
    peek() {
        return new Promise((resolve, reject) => {
            if (queue.fifo.length > 0) {
                resolve(queue.fifo[0]);
            }
            else {
                reject('queue is empty');
            }
        });
    }
}
// enforce singleton export
Queue.create();
export { queue };
//# sourceMappingURL=queue.js.map
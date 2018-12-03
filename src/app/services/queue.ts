// queue.ts - holds timed actions 
var queue:Queue;

class Queue {
  fifo:Object[];
  ready:boolean;

  constructor() {
    this.fifo = [];  
    this.ready = true;
  }

  load(actions:Object[] = []){
    this.fifo = actions;
  }

  push(s){
    this.fifo.push(s);
  }

  pop(){
    return (this.fifo.length > 0 ? this.fifo.shift() : undefined);
  }

  peek(){
    return (this.fifo.length > 0 ? this.fifo[0] : undefined);
  }
}


// enforce singleton export
if(queue === undefined){
  queue = new Queue();
}
export {queue};


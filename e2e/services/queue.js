// constructor Queue for queue.js - holds timed actions
module.exports = function(){

  // closure var
  var fifo = [];


  return {
    load: (actions) => {      // actions array
      fifo = actions;
    },

    append: (actions) => {    // actions array
      fifo.concat(actions);
    },

    push: (s) => {            // s object
      fifo.push(s);
    },
  
    pop: () => {
      return (fifo.length > 0 ? fifo.shift() : undefined);
    },
  
    peek: () => {
      return (fifo.length > 0 ? fifo[0] : undefined);
    }
  }
}



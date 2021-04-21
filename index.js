// * index.js 
// * minimal Express Socket.io websocket server 
// * run basic receiving server:
// ```$ node index```
// * run basic receiving server and a trivial e2e-broadcast simulation:
// ```$ node index e2e``` <br>
// index cmdline arg can be any char or string
// * Socket.io websocket channels use default port 8081
// * present channels are [1] a bi-directional 'actions' channel 
//   and [2] an in-only 'log' channel


// Setup basic Nodejs server
// Express is not required - commented out
const PERIOD = 5000;  // queue msg-sampling period (ms)
var fs = require('fs'),
    path = require('path'),
    //express = require('express'),
    //app = express(),
    //router = express.Router(),
    //server = require('http').createServer(app),
    //io = require('socket.io')(server),
    io = require('socket.io')(),
    Queue = require(`./services/queue`),       // constructor
    argv = process.argv,
    scorefile = argv[2] || './scores/default.score', //cmdline or default 
    port = argv[3] || 8081;                      //cmdline or default
    today = (new Date().toJSON()).replace(/T.*/, ''),
    index = 0;                                  // client indices


// Routing - serve static files from port 8080 - choose documentroot
// NOTE: to really run Express as application http server, move index.js
//   to domeN (i.e. ./..) and install Express in the domeN/node_modules.
//   Change all paths in index.js to reflect the new location.
//   Then use __dirname/src as the documentroot - this corresponds to the
//   base-href='domeN/src/' directive in index.html
//   (below are useful lines for possible setups)
//
//app.use(express.static(path.join(__dirname, 'public_html')));
//app.use(express.static(__dirname));
//app.use(express.static(path.join(__dirname, 'src')));
//app.listen(8080);
//console.log("Express serving static files on localhost:8080/public_html");
//console.log("Express serving static files on localhost:8080/");
//console.log("Express serving static files on localhost:8080/src");



// write GMT-today directory (if needed)
try {
  fs.mkdirSync('./actions/' + today);
} catch(e) {
  if ( e.code != 'EEXIST' ) throw e;
}
try {
  fs.mkdirSync('./logs/' + today);
} catch(e) {
  if ( e.code != 'EEXIST' ) throw e;
}


// make connection - handle channel events<br>
// create timestamp-named actions-file and log-file per client
io.on('connection', function (socket) {
  var _index = index,      // this client index
      q,
      p = function(){
        return (new Date().toJSON()).replace(/^.*T/, '').replace(/Z/,
        '').replace(/\..+$/, '').replace(/:/g,'-');
      },
      t = function(){
        return (new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '');
      },
      now = p(), 
      logfile = './logs/' + today + '/' + now + '-client' + _index + '.log',
      actionsfile = './actions/' + today + '/' + now + '-client' + _index + '.actions',
      logfile0 = './logs/' + today + '/' + now + '-client' + _index + '.log0',
      actionsfile0 = './actions/' + today + '/' + now + '-client' + _index + '.actions0',
      start,
      dt,
      action = {},
      actions = [],
      queue = new Queue();


  console.log(`\nclient ${index++} makes connection `);

  // diagnostics
  console.log("\nconnection diagnostics:");
  console.log(`scorefile = ${scorefile}`);
  console.log(`logfile = ${logfile}`);
  console.log(`actionsfile = ${actionsfile}`);
  console.log(`logfile0 = ${logfile0}`);          // no timestamp
  console.log(`actionsfile0 = ${actionsfile0}`);   // no timestamp
  console.log(`today = ${today}`);
  console.log(`GMT timestamp = ${t()}`);
  console.log(`GMT time for filename = ${p()}`);
  argv.forEach(function(a, i){
    console.log(`argv[${i}] = ${argv[i]}`);
  });
  console.log(`queue = ${queue}`);
//  console.log(`queue.load = ${queue.load}`);
//  console.log(`queue.append = ${queue.append}`);
//  console.log(`queue.push = ${queue.push}`);
//  console.log(`queue.pop = ${queue.pop}`);
//  console.log(`queue.peek = ${queue.peek}`);



  // broadcast a trivial simulation of a studio streamed performance
  console.log("\nserver: reading scorefile and loading actions to queue");
  fs.readFile(scorefile, 'utf8', function (err, data) {
    if (err) {
      console.error(err);
      exit(-1);
    }else{
      actions = JSON.parse(data);
      console.log(`actions is an array is ${Array.isArray(actions)}`);
      console.log(`actions.length = ${actions.length}`);
//      if(Array.isArray(actions)){
//        let i=0;
//        console.log(`actions.length = ${actions.length}`);
//        for(let a of actions){
//          for(let p in a){
//            console.log(`actions[${i}][${p}] = ${a[p]}`);
//          }
//          i++;
//        }
//      }
      queue.load(actions);
    }
  });

  console.log("server: reading queue");
  start = Date.now();
  setInterval(function(){
    dt = Date.now() - start;
    if(action = queue.peek()){
      console.log(`dt = ${dt} action.ms = ${action.ms}`);
      if(!action.ms || action.ms <= dt){
        console.log(`server sending client ${_index} action = ${action}`);
        socket.emit("actions", queue.pop());
      }
    }
  }, PERIOD);



  // handler to record actions (in)
  socket.on("actions", function(action){
    fs.appendFile(actionsfile0, JSON.stringify(action) + ",\n", function(err) {
      if(err) {
        return console.log(err);
      }
    });
    fs.appendFile(actionsfile, "[" + t() + "] " + JSON.stringify(action) + ",\n", function(err) {
      if(err) {
        return console.log(err);
      }
      console.log(`appended action ${action.f} to csv actionsfile`);
    }); 
  });


  // handler to log diagnostics and errors (in)
  socket.on("log", function(s){
    fs.appendFile(logfile0, s + ",\n", function(err) {
      if(err) {
        return console.log(err);
      }
    });
    fs.appendFile(logfile, "[" + t() + "] " + s + ",\n", function(err) {
      if(err) {
        return console.log(err);
      }
      console.log(`appended to csv logfile: ${s}`);
    }); 
  });

});


// start listening for client connection requests
io.listen(port);
console.log("Socket.io channels Server listening at port %d", port);
console.log("sio-server opens publishing channel 'actions'");
console.log("sio-server opens subscribing channels 'actions', 'log'");


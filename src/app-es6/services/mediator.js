// mediator.ts 
System.register(['./queue'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var queue_1;
    var mediator, Mediator;
    return {
        setters:[
            function (queue_1_1) {
                queue_1 = queue_1_1;
            }],
        execute: function() {
            // singleton instance - exported
            class Mediator {
                constructor() {
                    mediator = this;
                    if (config.server_connect) {
                        this.connect();
                    }
                    else {
                        console.log(`*** mediator: running without server`);
                    }
                }
                // connect to index.js server = config.server_host 
                // on port config.channels_port (default is 8081)
                // set up channels with names specified in config.channels
                connect() {
                    var host = config.server_host, port = config.server_port;
                    console.log(`*** mediator: ${config['_state']} connecting to server ${host}:${port}`);
                    this.socket = io.connect("http://" + host + ":" + port);
                    for (let channel of config.channels) {
                        this.log(`Mediator created channel with name = ${channel}`);
                        this.socket.on(channel, (o) => {
                            queue_1.queue.push(o);
                        });
                    }
                }
                // broadcast usable by external services
                emit(channel, msg) {
                    // guard
                    if (config.channels.indexOf(channel) !== -1) {
                        this.socket.emit(channel, msg);
                    }
                    else {
                        return false;
                    }
                }
                // quick method for emit('actions', action)
                // record to server - used to record application actions to actions-files
                record(action) {
                    this.socket.emit('actions', action);
                }
                // quick method for emit('log', s)
                // record to server - used to record application log strings to log-files
                log(s) {
                    if (config.log) {
                        s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
                        s = `[${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${s}`;
                        this.socket.emit('log', s);
                    }
                }
                // quick method for emit('log', s) AND console.log
                // record to server - used to record application log strings to log-files
                logc(s) {
                    console.log(s);
                    // for temp locating ts lineno of m.logc call and stacktrace
                    //console.log(`\n${s}`); 
                    //console.trace('from mediator.logc');
                    if (config.log) {
                        s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
                        s = `[${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${s}`;
                        this.socket.emit('log', s);
                    }
                }
                // quick method for emit('log', s) AND console.error
                // record to server - used to record application log strings to log-files
                loge(s) {
                    console.trace();
                    console.error(s);
                    if (config.log) {
                        s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
                        s = `!!![${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${console.error(s)}`;
                        this.socket.emit('log', s);
                    }
                }
            }
            exports_1("Mediator", Mediator); //class Mediator
            // enforce singleton export
            if (mediator === undefined) {
                mediator = new Mediator();
            }
            exports_1("mediator", mediator);
        }
    }
});
//# sourceMappingURL=mediator.js.map
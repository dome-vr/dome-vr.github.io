// mediator.ts 
// socket.io.js
import * as io from '../../../../node_modules/socket.io-client/dist/socket.io.js';
import { queue } from './queue.js';
// singleton instance - exported
let mediator, config;
export class Mediator {
    constructor() {
        mediator = this;
    }
    static create() {
        if (mediator === undefined) {
            mediator = new Mediator();
        }
    }
    initialize(_config) {
        //console.log(`services/actions/mediator initializing`);
        config = _config;
        if (config.server.server_connect) {
            console.log(`\n*** mediator: connecting to server`);
            mediator.connect();
        }
        else {
            console.log(`\n*** mediator: running without server`);
        }
    }
    // connect to index.js server = config.server_host 
    // on port config.channels_port (default is 8081)
    // set up channels with names specified in config.channels
    connect() {
        const host = config.server.server_host, port = config.server.server_port;
        console.log(`*** mediator: ${config['_state']} connecting to server ${host}:${port}`);
        mediator['socket'] = io("https://" + host + ":" + port);
        for (const channel of config.server.channels) {
            mediator.log(`Mediator created channel with name = ${channel}`);
            mediator['socket']['on'](channel, (o) => {
                queue.push(o);
            });
        }
    }
    // broadcast usable by external services
    emit(channel, msg) {
        // guard
        if (config.server.channels.indexOf(channel) !== -1) {
            mediator['socket']['emit'](channel, msg);
            return true;
        }
        else {
            return false;
        }
    }
    // quick method for emit('actions', action)
    // record to server - used to record application actions to actions-files
    record(action) {
        mediator['socket']['emit']('actions', action);
    }
    // quick method for emit('log', s)
    // record to server - used to record application log strings to log-files
    log(s) {
        if (config.server.log) {
            s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
            s = `[${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${s}`;
            mediator['socket']['emit']('log', s);
        }
    }
    // quick method for emit('log', s) AND console.log
    // record to server - used to record application log strings to log-files
    logc(s) {
        console.log(s);
        // for temp locating ts lineno of m.logc call and stacktrace
        //console.log(`\n${s}`); 
        //console.trace('from mediator.logc');
        if (config['log']) {
            s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
            s = `[${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${s}`;
            mediator['socket']['emit']('log', s);
        }
    }
    // quick method for emit('log', s) AND console.error
    // record to server - used to record application log strings to log-files
    loge(s) {
        console.trace();
        console.error(s);
        if (config['log']) {
            s = s.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
            s = `!!![${(new Date().toJSON()).replace(/^.*T/, '').replace(/Z/, '')}]:${console.error(s)}`;
            mediator['socket']['emit']('log', s);
        }
    }
} //class Mediator
// enforce singleton export
Mediator.create();
export { mediator };
//# sourceMappingURL=mediator.js.map
System.config({
  transpiler: "typescript",
  typescriptOptions: {
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "removeComments": false,
    "noImplicitAny": true,
    "suppressImplicitAnyIndexErrors": true
  },

  // for systemjs to correctly substitute for truncated paths
  // for correct remote dome-vr.gihub.io server behavior must
  // substitute ../node_modules/*.*  by ./libs/*.* (and of course
  // copy (exp) node_modules/typescript/*.* to libs/typescript/*.*
  map: {
    'app' : './',
    //'@angular' : '../node_modules/@angular',
    //'typescript' : '../node_modules/typescript/lib/typescript'
    'typescript' : './libs/typescript/lib/typescript.js',
    //'socket.io-client' : '../node_modules/socket.io-client/socket.io.js',
    'socket.io-client' : './libs/socket.io-client/dist/socket.io.js'
  },

  // for systemjs to correctly substitute for implied files and/or ts/js
  packages: {
    'app'  : {main: 'narrative', defaultExtension: 'ts'},
    'app/scenes'  : {main: 'scene', defaultExtension: 'ts'},
    'socket.io-client' : {defaultExtension: 'js'}, // doesn't work ?!
    'jasmine' : {defaultExtension: 'js'}, // doesn't work ?!
    'typescript' : {defaultExtension: 'js'}, // doesn't work ?!
    'Tween' : {defaultExtension: 'js'}, // doesn't work ?!
    '@angular/core'                    : {main: 'index.js'},
    '@angular/common'                  : {main: 'index.js'},
    '@angular/compiler'                : {main: 'index.js'},
    '@angular/router'                  : {main: 'index.js'},
    '@angular/platform-browser'        : {main: 'index.js'},
    '@angular/platform-browser-dynamic': {main: 'index.js'}
  }
});

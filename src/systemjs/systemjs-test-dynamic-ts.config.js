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
    //'@angular' : '../node_modules/@angular'
    //'typescript' : '../node_modules/typescript/lib/typescript.js'
    'typescript' : './libs/typescript/lib/typescript.js'
  },

  // for systemjs to correctly substitute for implied files and/or ts/js
  packages: {
    'app'  : {main: 'narrative.spec.ts', defaultExtension: 'ts'},
    'app/scenes'  : {main: 'scene', defaultExtension: 'ts'},
    'typescript' : {defaultExtension: 'js'}, // doesn't work ?!
    '@angular/core'                    : {main: 'index.js'},
    '@angular/common'                  : {main: 'index.js'},
    '@angular/compiler'                : {main: 'index.js'},
    '@angular/router'                  : {main: 'index.js'},
    '@angular/platform-browser'        : {main: 'index.js'},
    '@angular/platform-browser-dynamic': {main: 'index.js'}
  }
});


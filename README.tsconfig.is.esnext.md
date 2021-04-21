**NOTE**: esnext refers to the latest implemented version of javascript

**NOTE**: In order to populate a different ES-version distribution
(es2021, es2020, es2019, es2018, etc) simply substitute all refs to 
esnext in tsconfig.json and webpack.config.js by one of esXXXX above. 



**NOTE**: Some versions of ESXXXX allow tsc to produce a bundle 
and sourcemap obviating the need for webpack:
In tsconfig TRY: 

``` 
    "out": "./dist/index.js"
    "outDir": "./dist",
    "sourceMap": true,
```

**NOTE** ES2020 using es2020 modules DOES NOT ?!
'error' msg given by tsc:

```
tsconfig.json(6,5): error TS6082: Only 'amd' and 'system' modules are supported alongside --out.
tsconfig.json(7,5): error TS6082: Only 'amd' and 'system' modules are supported alongside --out.
```



**NOTE**: In the case tsc cannot produce a bundle and sourcemap 
use webpack instead:

```
>npm run webpack
```

**NOTE**: if webpack.config.js contains a conditional for 'mode'
(production vs. development) then create two npm scripts

```
>npm run webpack => "webpack --mode=development" 
>npm run webpackp => "webpack --mode=production"
```




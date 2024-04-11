# dome-vr5
Note: v1.0.0

## NOTE on three.js versions
three.js 0.125.2 lacks WebGLMultipleRenderTargets
three.js 0.134.0 has WebGLMultipleRenderTargets
(node_modules/three/build/three.module.js)
three.js 0.146.0 has WebGLMultipleRenderTargets
three.js 0.147.0 has WebGLMultipleRenderTargets
(@resources/three.js github repository)



## install

To install first clone the repository, and then install dependencies
```sh
git clone github/josefK128/dome-vr5.git
```

```sh
npm install
```


## usage

run server:
```
npm run live-server
```  
(runs on port 8081).

Choose a scene from one of the topologies 1-7.
Enter its URL into the browser.

If VR, click 'enable VR' within the scene.
If the scene has audio click 'enable audio' to hear.



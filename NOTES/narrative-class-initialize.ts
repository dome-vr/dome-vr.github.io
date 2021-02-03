// narrative-class-initialize.ts

  initialize(){
    mediator.logc(`*** narrative.initialize()`);
    mediator.log(`scene is ${config['_state']}`);

    // stats - create and append stats to body but initially hide
    document.body.appendChild(stats.dom);
    stats.dom.style.display = 'none';

    // bg - clearColor
    clearColor = config['clearColor'] || clearColor;
    alpha = config['alpha'] || alpha;
    antialias = config['antialias'] || antialias;

    // scene - written to sgTarget, rm_scene - written to output
    // sgTarget is the result renderer.render(scene, camera, sgTarget)
    // which renders the three.js scenegraph to a WebGLRenderTarget sent
    // to the space fragmentshader as sgTarget.texture uniform 'tDiffuse'
    scene = new THREE.Scene();
    rm_scene = new THREE.Scene();
    sgTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {minFilter:THREE.LinearFilter, maxFilter:THREE.NearestFilter});


    // initialize rm_scene output 'screen' quad
    // quad must be bi-unit to fill NDC-cube near plane [-1,1]x[-1,1]
    // NOTE: quad is centered at origin
    // NOTE: size of quad is CRITICAL! raymarch assumes a virtual camera
    //   with fov=90 positioned one unit in positive z direction relative
    //   to the quad, orthogonal, and looking at the center of the quad.
    //   The quad is textured with the renderTarget scenegraph 'scene',
    //   blended with the raymarch projection
    //   Thus the textured-quad (2x2) perfectly fills the camera view.
    //   A larger quad would move the outer texture regions outside the
    //   camera view creating a 'zoom-in' effect. A smaller size would
    //   prevent the texture from filling the camera view so the quad
    //   would be seen as a rectangle within the background of the frame
    quad_g = new THREE.PlaneBufferGeometry(2,2);
    quad_m = new THREE.ShaderMaterial({   // initial default material 
      uniforms:uniforms,
      vertexShader: vsh,
      fragmentShader: fsh,
      transparent:true,
      depthWrite: false
    });
    quad = new THREE.Mesh(quad_g, quad_m);
    rm_scene.add(quad);


    // initialize hud
    hud_scaleX = config.initial_camera.hud['scaleX'] || hud_scaleX;
    hud_scaleY = config.initial_camera.hud['scaleY'] || hud_scaleY;
    hud_g = new THREE.PlaneBufferGeometry(2*hud_scaleX, 2*hud_scaleY);
    hud_m = new THREE.ShaderMaterial({   // initial default material 
      uniforms:uniforms,
      vertexShader: vsh,
      fragmentShader: fsh,
      transparent:true,
      depthWrite: false,
      opacity: config.initial_camera.hud['opacity'] || 0.5
    });
    // alpha-blend
    hud_m.depthTest = false;
    hud_m.blendSrc = THREE.SrcAlphaFactor; // default
    hud_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
    // hud
    hud = new THREE.Mesh(hud_g, hud_m);
    // post and visible
    hud._post = config.initial_camera.hud['_post'] || false;
    hud.visible = config.initial_camera['_hud_rendered'] || true;
    // scale hud to aspect ratio
    aspect = window.innerWidth/window.innerHeight;
    //hud.scale.set(aspect, 1.0, 1.0);     // one-half width, height
    hud.scale.set(2.0*aspect, 2.0, 1.0);  // full-screeen
    // renderOrder
    hud.renderOrder = 10;  //rendered after dome rO=9, skybox,objects rO=0



    // WebGLRenderTarget for post-process feedback
    postTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {minFilter:THREE.LinearFilter, maxFilter:THREE.NearestFilter});


    // renderer
    canvas = document.getElementById(config['canvas_id']);
    renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:antialias, alpha:true});
    //renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true, alpha:true});  // slower!
    renderer.setClearColor(clearColor, alpha);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.autoClear = false; // To allow render overlay on top of sprited sphere

    // webvr
    // disable vr for sgTarget and postTarget passes - set true in render
    renderer.vr.enabled = false; 
    if(_webvr){
      console.log(`\n\n!!!!!!!!!!!!!!!!!!!! _webvr true!`);

      // initialize WebVR and create 'enter VR' button
      document.body.appendChild(WEBVR.createButton(renderer, {}));
      console.log(`!!!!!!!!!!!!!!!!!!!! VR display set and button added!`);


      // create vr_scene
      vr_scene = new THREE.Scene();
            
      // vive controllers - RECALL - two! Add to vr_scene
      if(_vive){
        vive_controller1 = new THREE.ViveController(0);
        vive_controller1.standingMatrix = renderer.vr.getStandingMatrix();
        vr_scene.add(vive_controller1);
        vive_controller2 = new THREE.ViveController(1);
        vive_controller2.standingMatrix = renderer.vr.getStandingMatrix();
        vr_scene.add(vive_controller1);
      }

      // create vrspace
      _webvr_skybox = config.webvr_skybox || false;
      _webvr_skycube = config.webvr_skycube || false;
      _webvr_skycube_faces = config.webvr_skycube_faces || false;
      _webvr_skydome = config.webvr_skydome || false;
      console.log(`_webvr_skybox is ${_webvr_skybox}`);
      console.log(`_webvr_skycube is ${_webvr_skycube}`);
      console.log(`_webvr_skycube_faces is ${_webvr_skycube_faces}`);
      console.log(`_webvr_skydome is ${_webvr_skydome}`);
      if(_webvr_skybox){
        vrspace.createSkyBox(config.webvr_radius, config.webvr_cube_urls).then((cube) => {
          vr_cube = cube;
          vr_scene.add(vr_cube);
          console.log(`vr_cube is ${vr_cube}`);
          console.dir(vr_cube);
        });
      }
      if(_webvr_skycube){
        vrspace.createCube(config.webvr_radius).then((cube) => {
          vr_cube = cube;
          vr_scene.add(vr_cube);
          console.log(`vr_cube is ${vr_cube}`);
          //console.dir(vr_cube);
        });
      }
      if(_webvr_skycube_faces){
        vr_group = vrspace.createPolyhedra(config.webvr_radius);

        console.log(`vr_group is ${vr_group}`);
        console.dir(vr_group);
        //vr_scene.add(vr_group);
        let i:number = 0;
        ['bottom','top','left','right','back','front'].map((n) => {
          vr_face[i] = vr_group.getObjectByName(n);
          //console.log(`test_texture is ${test_texture}`);
          //vr_face[i].material.map = test_texture;
          //vr_face[i].material.needsUpdate = true;
          console.log(`$$$$$$$$$$$$$$$ vr_face[${n}] = ${vr_face[i]}`);
          i++;
        });
        console.log(`vr_face[0] = ${vr_face[0]}`);
        console.log(`vr_face[0].material.color.r = ${vr_face[0].material.color.r}`);
        console.log(`vr_face[0].material.color.g = ${vr_face[0].material.color.g}`);
        console.log(`vr_face[0].material.color.b = ${vr_face[0].material.color.b}`);
      }
      if(_webvr_skydome){
        vr_dome = vrspace.createDome(config.webvr_radius); // 5000
        vr_scene.add(vr_dome);
        console.log(`vr_dome is ${vr_dome}`);
      }
    }

    // initialize camera instrument components
    camera.initialize().then((o) => {
      console.dir(o);
      csphere = o['csphere'];
      controls = o['controls'];
      lens = o['lens'];
      key = o['key'];
      fill = o['fill'];
      back = o['back'];
      fovp = lens.fov;   // used to detect need for HUD quad re-size
      fov_initial = lens.fov;
      lens.lookAt(csphere.position);   // origin
  
      // construct csphere 
      lens.add(hud);
      csphere.add(lens);
      csphere.add(key);
      csphere.add(fill);
      csphere.add(back);
  
      // initialize rm_point and rm_pivot for use in space-fsh
      rm_point.translateZ(-0.5);
      rm_pivot.add(rm_point);
  
      // add camera actors
      narrative.addActor('csphere', csphere);
      narrative.addActor('rm_pivot', rm_pivot);
      narrative.addActor('rm_point', rm_point, false);
      narrative.addActor('lens', lens, false);
      narrative.addActor('hud', hud, false);
      narrative.addActor('key', key, false);
      narrative.addActor('fill', fill, false);
      narrative.addActor('back', back, false);
  
      // scalar for all non csphere-child actors
      csph_r = csphere.geometry.parameters.radius;

      // put lens at (0,0,csph_r)
      lens.translateZ(csph_r);
      // put hud at world origin - RECALL:hud is child of lens at (0,0,csph_r)
      hud.translateZ(-1.0 * csph_r);
      mediator.log(`csph_r = ${csph_r}`);
      mediator.logc(`lens world pos = ${lens.getWorldPosition(vcopy).toArray()}`);
      mediator.logc(`hud world pos = ${hud.getWorldPosition(vcopy).toArray()}`);
      mediator.logc(`*** narrative initialized scenegraph phase`);
  
  
      // set n.quad a.hud - initialize animation and camera3d - 'c3d'
      narrative.quad = quad;
      narrative.hud = hud;
      animation.initialize(narrative);
      c3d.initialize(lens, csphere, animation);  


      // initialize audio
      audio.initialize(lens);

      // resolution
      quad.material.uniforms.uResolution.value = new THREE.Vector2(width,height);
      quad.material.uniforms.uResolution.needsUpdate = true;
 
  
      // set narrative.exec target objects
      narrative['targets']['narrative'] = narrative;
      narrative['targets']['mediator'] = mediator;
      narrative['targets']['camera3d'] = c3d;
      narrative['targets']['controls'] = controls;
      narrative['targets']['animation'] = animation;
      mediator.log(`narrative.targets = ${Object.keys(this.targets)}`);
  
  
      // resize - why 3rd arg non-default 'true' in 2nd listener ???
      window.addEventListener( 'resize', onWindowResize, false );

      // diagnostic
      if(controls){
        console.log(`controls:`);
        console.dir(controls.report());
      }
      narrative.reportActorsInScene();
   
      // initial scene 
      narrative.changeState(state);
      
    });//camera.initialize
  }//initialize()

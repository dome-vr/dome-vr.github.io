// Config.interface.ts

export interface Config {
  // urls for System.import in index
  _three:string;
  _stats:string;
  _tween:string;
  _narrative:string;


  //webVR?
  webvr:boolean;
  vive:boolean;
  sg3D:boolean;



  // @@@ move 6 vr_<name> to vrstage (?)
  webvr_skybox:boolean;
  webvr_skycube:boolean;
  webvr_skycube_faces:boolean;
  webvr_skydome:boolean;
  webvr_radius:number;
  webvr_cube_urls:string[]; 

  // @@@ move 3 to initial_camera 
  // keymap
  _map:string;
  // camera controls
  _controls:string;
  controlOptions:object;



  // initialization of canvas
  canvas_id:string;
  clearColor:string;
  alpha:number;
  antialias:boolean;

  // test - work out e2e tests with testTarget later
  test: boolean;
  _testTarget:string;

  // server/log
  server_host:string;
  server_port:number;
  server_connect:boolean;
  record_actions:boolean;
  record_shots:boolean;
  log:boolean;
  channels:string[];

  // textures
  preload_textures:object;

  // initial_camera
  initial_camera:object;
};


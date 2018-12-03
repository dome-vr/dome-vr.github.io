// Config.interface.ts

export interface Config {
  // system
  _three:string;
  _stats:string;
  _tween:string;
  _narrative:string;

  //webVR?
  webvr:boolean;
  webvr_skybox:boolean;
  webvr_skycube:boolean;
  webvr_skycube_faces:boolean;
  webvr_skydome:boolean;
  webvr_radius:number;
  webvr_cube_urls:string[]; 

  // keymap
  _map:string;

  // camera controls
  _controls:string;
  controlOptions:Object;

  canvas_id:string;
  clearColor:string;
  alpha:number;
  antialias:boolean;

  test: boolean;
  _testTarget:string;

  server_host:string;
  server_port:number;
  server_connect:boolean;
  record_actions:boolean;
  record_shots:boolean;
  log:boolean;
  channels:string[];

  // textures
  preload_textures:Object;

  // initial_camera
  initial_camera:Object;
};


export {config:Config};


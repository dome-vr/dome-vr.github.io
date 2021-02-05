* __dome-vr-dev (~dome-vr-dev) README__

* [1] clone the repo - cd to '~dome-vr-dev'

  [2] install application modules
  npm install

* [3] run included lite http-server
  npm run live-server              => runs live-server at dome-vr-dev

* [4] run URL in browser - preferably webVR/webXR enabled such as
  Firefox nightly.
  NOTE: run using Firefox, or if using Chrome, 
  use <hostname> instead of localhost.
  Chrome (v73 and earlier?) using localhost has a bug causing an error
  (TypeError: navigator.xr.requestDevice is not a function).
  For example, if hostname = 'tosca' run as in following exps:
  http://tosca:8080/               => ~dome-vr origin-page - follow links
  http://tosca:8080/src/*.html     => specific /src scenes

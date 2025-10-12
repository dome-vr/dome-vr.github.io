function initializeAudio(audio){
  // Early exit if no audio config or empty URL
  if (!audio || typeof audio !== 'object' || !audio.url || audio.url.trim() === '') {
    console.log('[narrative-sh] No valid audio configuration - skipping audio initialization');
    return;
  }

  console.log('[narrative-sh] Initializing audio with config:', audio);
  
  // ? NEW: Create the audio button dynamically
  let startAudio = document.getElementById('startAudio');
  
  if (!startAudio) {
    console.log('[narrative-sh] Creating audio button dynamically');
    startAudio = document.createElement('button');
    startAudio.id = 'startAudio';
    startAudio.textContent = 'enable audio';
    
    // Apply the specified styles
//    Object.assign(startAudio.style, {
//      position: 'absolute',
//      zIndex: '10',
//      left: '2%',
//      top: '93.5%',
//      padding: '0',
//      margin: '0',
//      borderRadius: '0em',
//      boxSizing: 'border-box',
//      textDecoration: 'none',
//      fontFamily: "'Roboto',sans-serif",
//      fontWeight: '300',
//      color: 'gray',
//      backgroundColor: 'black',
//      textAlign: 'center',
//      transition: 'all 0.2s'
//    });

     Object.assign(startAudio.style, {
      position: 'absolute',
      zIndex: '10',

      //left: '0%',       //under stats
      //top: '9.25%',      
      //left: '13.25%',       //under Mode:world
      //top: '9.25%',      
      top: '90.5%',              // ? Changed: lower-left corner of page
      left: '1%',      

      padding: '8px 16px',    // ? Changed: added padding for better visibility
      margin: '0',
      borderRadius: '4px',    // ? Changed: slightly rounded corners
      boxSizing: 'border-box',
      textDecoration: 'none',
      fontFamily: "'Roboto',sans-serif",
      fontWeight: '400',      // ? Changed: slightly bolder
      color: '#FFFFFF',       // ? Changed: bright white text
      backgroundColor: '#1a1a1a', // ? Changed: dark but not pure black
      //border: '1px solid #444',   // ? Added: subtle border for definition
      border: '2px solid #bbb',   // ? Added: subtle border for definition
      textAlign: 'center',
      transition: 'all 0.2s',
      cursor: 'pointer'       // ? Added: shows it's clickable
    });   

    document.body.appendChild(startAudio);
    console.log('[narrative-sh] Audio button created and added to DOM');
  }

  
  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  const audioLoader = new THREE.AudioLoader();
  const _audio = new THREE.Audio(audioListener);

  if(startAudio){
    startAudio.addEventListener('click', function(){
      console.log(`[narrative-sh] Loading audio from: ${audio.url}`);
      console.log(`  loop: ${audio.loop}`);
      console.log(`  volume: ${audio.volume}`);
      console.log(`  playbackRate: ${audio.playbackRate}`);
      startAudio.remove();
      
      audioLoader.load(audio.url, function(buffer){
        _audio.setBuffer(buffer);
        _audio.setLoop(audio.loop);
        _audio.setVolume(audio.volume);
        _audio.setPlaybackRate(audio.playbackRate);
        _audio.play();
        console.log('[narrative-sh] Audio playback started');
      }, undefined, function(err){
        console.error('[narrative-sh] Audio loading failed:', err);
      });
    });
  } else {
    console.warn('[narrative-sh] startAudio button not found in DOM - audio will not be available');
  }
}


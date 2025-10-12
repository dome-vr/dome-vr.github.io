Perfect! The file is now complete. Here's a summary of the key changes made to narrative-sh.js:
Summary of Changes
Modified initializeAudio() function (lines ~237-285):

Before:
function initializeAudio(audio){
  // Early exit if no audio config
  if (!audio || typeof audio !== 'object' || !audio.url) {
    console.log('[narrative-sh] No audio configuration - skipping audio initialization');
    return;
  }

  console.log('[narrative-sh] Initializing audio with config:', audio);
  
  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  const audioLoader = new THREE.AudioLoader();
  const _audio = new THREE.Audio(audioListener);
  const startAudio = document.getElementById('startAudio'); // ? Expected to exist in HTML

  if(startAudio){
    // ... event listener setup
  }
}



After:
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
    Object.assign(startAudio.style, {
      position: 'absolute',
      zIndex: '10',
      left: '2%',
      top: '93.5%',
      padding: '0',
      margin: '0',
      borderRadius: '0em',
      boxSizing: 'border-box',
      textDecoration: 'none',
      fontFamily: "'Roboto',sans-serif",
      fontWeight: '300',
      color: 'gray',
      backgroundColor: 'black',
      textAlign: 'center',
      transition: 'all 0.2s'
    });
    
    document.body.appendChild(startAudio);
    console.log('[narrative-sh] Audio button created and added to DOM');
  }
  
  const audioListener = new THREE.AudioListener();
  // ... rest of the function unchanged
}
What This Does:

Checks for valid audio config: Verifies config.audio.url exists and is not empty
Creates button dynamically: If no #startAudio button exists in the HTML, it creates one
Applies your exact styling: Uses the styles you specified
Adds to DOM: Appends the button to document.body
Self-removes on click: The existing code already removes the button after it's clicked

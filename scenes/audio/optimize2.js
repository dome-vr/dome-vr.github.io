Based on the code analysis, here are the most effective optimizations ranked by impact:
?? Highest Impact (Do These First)
1. Reduce Raymarch Steps - ~30-50% FPS gain
javascriptsteps: 256,  // Down from 384 (or even 192 for complex scenes)
Why it works: Each pixel traces a ray through the scene. Fewer steps = dramatically fewer shader calculations. This is the single biggest performance lever.
2. Disable/Reduce Ambient Occlusion - ~20-40% FPS gain
javascriptao: 0,  // Disable completely (down from 6)
// OR
ao: 2,  // Minimal if you must have it
Why it works: AO requires multiple additional raymarches per pixel. With ao: 6, that's 6x more raymarch work.
3. Reduce Shadow Steps - ~15-25% FPS gain
javascriptshadow: 32,  // Down from 64 (or 0 to disable)
Why it works: Shadows require separate raymarch passes. Fewer steps = less work.
? High Impact (Do These Next)
4. Increase Hit Epsilon - ~10-20% FPS gain
javascripteps: 0.001,  // Up from 0.00022 (2x-5x larger)
Why it works: Larger epsilon means rays detect surfaces sooner, reducing iterations per raymarch. Be careful not to go too high or you'll get artifacts.
5. Lock Pixel Ratio to 1.0 - ~15-30% FPS gain on high-DPI displays
javascriptpr: 1.0,  // Instead of devicePixelRatio (which can be 2.0-3.0)
Why it works: On retina/4K displays, devicePixelRatio can be 2-3, meaning 4-9x more pixels to render!
?? Combined "Performance Mode" Config
javascriptconst config = {
  // MAXIMUM PERFORMANCE settings:
  steps: 192,        // ??? Huge impact
  ao: 0,             // ??? Huge impact
  shadow: 0,         // ?? High impact
  eps: 0.001,        // ?? High impact
  pr: 1.0,           // ?? High impact (especially on retina)
  
  // These help but are secondary:
  ndelta: 0.001,     // ? Medium impact
  fbscale: 0.75,     // ? Medium impact (VR only)
  
  // Keep disabled:
  aa: false,
  
  // Your other settings unchanged...
  shader: '../../shaders/grimnight-cubes/_fsh_rm_expt1.frag',
  initialView: [0, 0, 5],
  // etc...
};
?? Expected Results
With all top 5 optimizations:

Simple scenes: 60 FPS ? 120+ FPS
Complex fractals: 15 FPS ? 40-60 FPS
Heavy scenes: 5 FPS ? 15-25 FPS

?? Balanced "Quality Mode" Config
If you need better visuals but still want performance:
javascriptconst config = {
  steps: 256,        // Good balance
  ao: 2,             // Minimal AO for depth
  shadow: 32,        // Some shadows
  eps: 0.0005,       // Still faster than default
  pr: 1.0,           // Always cap this
  // ... rest of config
};
?? Pro Tip: Adaptive Quality
Add this to your scene file for automatic performance scaling:
javascript// After config definition:
const urlParams = new URLSearchParams(window.location.search);
const quality = urlParams.get('quality') || 'medium';

if (quality === 'low') {
  config.steps = 128;
  config.ao = 0;
  config.shadow = 0;
  config.eps = 0.002;
} else if (quality === 'high') {
  config.steps = 512;
  config.ao = 8;
  config.shadow = 96;
}

// Then use: ?quality=low or ?quality=high in URL
Bottom Line
The magic trio for maximum FPS:

steps: 192-256
ao: 0-2
pr: 1.0

These three alone can double or triple your frame rate on complex scenes. Start here and adjust based on visual quality needs.


# dome-vr6 3D/VR framework (GLSL3)
This is a framework for rendering 3D/VR scenes consisting of  **3D fractals seen from the inside** within an environmental skybox having  **distinct textures on all six faces**.
It uses **per-eye clip-space rays** and an **analytic AABB exit** (no marching), so there’s no “miss” case when the camera starts inside.
NOTE:Creating a new scene requires only to create a [scenename].html file in ./scenes which defines a 'config' object. For example,
```
config = { scenename:'cathedral',
           shader:'./shaders/cathedral_interior.frag',
           initial-viewpoint: (0,0,10) //default#
           initial-pan: 0 //default (ccw rotation looking down +Y axis)*
           initial-tilt: 0 //default (ccw rotation looking down +X axis)*
           //...
}
#unit-less (generally scenes are thousands of units in all directions)
*degrees
```

## Procedure
From the root directory 'dome-vr6' run   'live-server  --port=N'

This will bring up a browser - enter the url 'http://localhost:N/scenes/{scenename}.html'


## Navigation
The system uses a right-hand coordinate system, so the default camera position is on the positive z-axis (+Z) looking down the -Z axis. Up is +Y, down is -Y, right is +X, and left is -X.

Navigation is by very simple keyboard controls, usable by touch, even in VR. All navigation descriptions are from the relative perspective of the camera. For example 'dolly +X' means the camera translates to the left (so the scene appears to move right), 'pan left' means the camera pans left so rotates counter-clockwise looking down the +Y axis, so the scene appears to shift to the right, and 'tilt up' means the camera tilts up so rotates in a counter-clockwise direction looking down the +X axis. 'dolly in' dollies the camera in the -Z direction (or forward) and 'dollyout' dollies the camera in the -Z direction (or backward). Zoom is change in the camera field-of-view (fov).  Zooming in makes the scene seem to approach, and zooming out makes the scene seen to recede.

#####Arrow keys
L-R  correspond to dolly the camera in the +X direction, and dolly in the -X direction, respectively.
UP-DOWN  correspond to dolly the camera in the +Y direction, and dolly in the -Y direction, respectively.

Shift L-R correspond to panning the camera 'left' (CCW looking down the +Y axis), and panning the camera 'right' (CW looking down the +Y axis), respectively

Shift UP-DOWN correspond to titing the camera 'up' (CCW looking down the +X axis), and tilting the camera 'down' (CCW loking down the +X axis), respectively.


#####z/Z
z-Z (Shift-z)  correspond to 'dolly in' (dollying the camera in the -Z direction, i.e forward) and 'dollying out' (dolying in the +Z direction, i.e backward), respectively

Control-z zooms the camera in (via fov) while Shift-control-z zooms the camera 'out'.

#####Spacebar
Spacebar removes any accumulated camera 'roll' (rotation around the z-axis). Shift-spacebar returns the position and orientation of the camera to the initial position and orientation in the scene.

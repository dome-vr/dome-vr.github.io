System.register(['../../../services/mediator'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mediator_1;
    var map, c3d, csphere, camera, record_shots, a, Keymap;
    return {
        setters:[
            function (mediator_1_1) {
                mediator_1 = mediator_1_1;
            }],
        execute: function() {
            // singleton instance and param object
            class Keymap {
                constructor() {
                    map = this;
                }
                initialize(_c3d, _csphere, _camera, _record_shots) {
                    c3d = _c3d;
                    csphere = _csphere;
                    camera = _camera;
                    record_shots = _record_shots;
                }
                keys(e) {
                    mediator_1.mediator.log(`keyup: key = ${e.keyCode}`);
                    switch (e.keyCode) {
                        // CENTER/HOME - normalize camera and csphere<br>
                        // m - center
                        case 77:
                            a = { d: 3 };
                            if (e.shiftKey) {
                                c3d.home(a);
                                //log({t:'camera3d', f:'home', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'home', a: a });
                                }
                            }
                            else {
                                c3d.center(a);
                                //log({t:'camera3d', f:'center', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'center', a: a });
                                }
                            }
                            break;
                        // ZOOM<br>
                        // a - zoom in          
                        case 65:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 60 }; // 90/120
                                    c3d.zoomcutTo(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9 };
                                    c3d.zoomcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { s: 60, d: 5 };
                                    c3d.zoomflyTo(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9, d: 5 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // s - zoom out          
                        case 83:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 120 };
                                    c3d.zoomcutTo(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.111 };
                                    c3d.zoomcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { s: 120, d: 5 };
                                    c3d.zoomflyTo(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.111, d: 5 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // ROLL<br>
                        // b - roll neg => ccw         
                        case 66:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.rollcutTo(a);
                                    //log({t:'camera3d', f:'rollcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'rollcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    c3d.rollflyTo(a);
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // n - roll pos => cw         
                        case 78:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollcutTo', a: a });
                                    }
                                    c3d.rollcutTo(a);
                                }
                                else {
                                    a = { r: 0.3927 };
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollcutBy', a: a });
                                    }
                                    c3d.rollcutBy(a); // 1.0/0.9 = 1.1111
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.rollflyTo(a);
                                    //log({t:'camera3d', f:'rollflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollflyTo', a: a });
                                    }
                                }
                                else {
                                    c3d.rollflyBy(a);
                                    //log({t:'camera3d', f:'rollflyBy', a:a});
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'rollflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // PAN/TILT<br>
                        // left arrow - pan (look) left          
                        case 37:
                            console.log(`\n[[[[[ left arrow - 37`);
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // right arrow - pan (look) right          
                        case 39:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.panflyTo(a);
                                //log({t:'camera3d', f:'panflyTo', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'panflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.panflyBy(a);
                                //log({t:'camera3d', f:'panflyBy', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'panflyBy', a: a });
                                }
                            }
                            break;
                        // up arrow - tilt (look) up          
                        case 38:
                            if (e.shiftKey) {
                                a = { r: 0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: 0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // down arrow - tilt (look) down          
                        case 40:
                            if (e.shiftKey) {
                                a = { r: -0.7854, d: 3 };
                                c3d.tiltflyTo(a);
                                //log({t:'camera3d', f:'tiltflyTo', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'tiltflyTo', a: a });
                                }
                            }
                            else {
                                a = { r: -0.19635, d: 3 };
                                c3d.tiltflyBy(a);
                                //log({t:'camera3d', f:'tiltflyBy', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'tiltflyBy', a: a });
                                }
                            }
                            break;
                        // EXAMINE - longitudinal - 'yaw' - rotate csphere around y-axis<br>  
                        // g => yaw neg => ccw         
                        case 71:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.1 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // h - yaw pos => cw         
                        case 72:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.yawcutTo(a);
                                    //log({t:'camera3d', f:'yawcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.yawcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'yawcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.yawflyTo(a);
                                    //log({t:'camera3d', f:'yawflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.yawflyBy(a);
                                    //log({t:'camera3d', f:'yawflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'yawflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // EXAMINE - latitudinal - 'pitch' - rotate csphere around x-axis<br>
                        // j => pitch neg => ccw         
                        case 74:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: -1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // k - pitch pos => cw          
                        case 75:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { r: 1.57 };
                                    c3d.pitchcutTo(a);
                                    //log({t:'camera3d', f:'pitchcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927 };
                                    c3d.pitchcutBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'pitchcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 1.57, d: 3 }; // PI/8
                                    c3d.pitchflyTo(a);
                                    //log({t:'camera3d', f:'pitchflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // DOLLY - translation along axes and more generally<br>
                        // 1 => dollyx+        
                        case 49:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { x: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { x: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            } //dollyx+
                            break;
                        // 2 - dollyx-        
                        case 50:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { x: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { x: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { x: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            } //50-dollyx-
                            break;
                        // 6 => dollyy+        
                        case 54:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { y: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { y: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 7 - dollyy-        
                        case 55:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { y: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { y: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { y: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // O => dollyz+        
                        case 79:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { z: 0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: 0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { z: 0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: 0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // P - dollyz-        
                        case 80:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { z: -0.1 };
                                    c3d.dollycutTo(a);
                                    //log({t:'camera3d', f:'dollycutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: -0.1 };
                                    c3d.dollycutBy(a);
                                    //log({t:'camera3d', f:'dollycutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollycutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { z: -0.1, d: 3 };
                                    c3d.dollyflyTo(a);
                                    //log({t:'camera3d', f:'dollyflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { z: -0.1, d: 3 };
                                    c3d.dollyflyBy(a);
                                    //log({t:'camera3d', f:'dollyflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                                    }
                                }
                            }
                            break;
                        // 0 - bezier 'through' curve          
                        // * NOTE: bezier() will always fail e2e-spec test because at each run
                        //   the vertices and control points are chosen by Math.random() so
                        //   one run will never match another.
                        case 48:
                            // uses default dur=10 npoints=6
                            if (e.altKey) {
                                a = { d: 20, n: 6, z: false };
                            }
                            else {
                                a = { d: 20, n: 6, z: true };
                            }
                            c3d.bezier(a);
                            //log({t:'camera3d', f:'bezier', a:a});
                            if (record_shots) {
                                mediator_1.mediator.record({ t: 'camera3d', f: 'bezier', a: a });
                            }
                            break;
                        default:
                            mediator_1.mediator.log(`key '${e.keyCode}' not associated with c3d function`);
                    }
                } //keys()
            }
            ;
            // enforce singleton
            if (!map) {
                map = new Keymap();
            }
            exports_1("map", map);
        }
    }
});
//# sourceMappingURL=dome2-alt-cut.js.map
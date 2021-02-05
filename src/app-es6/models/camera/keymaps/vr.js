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
                        // a - center
                        case 65:
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
                        // ZOOM - EXAMINE
                        // z - zoom in/clockwise examine          
                        case 90:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 0.9 };
                                    c3d.zoomcutBy(a);
                                    //log({t:'camera3d', f:'zoomflyTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomflyTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 0.9, d: 3 };
                                    c3d.zoomflyBy(a);
                                    //log({t:'camera3d', f:'zoomflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomflyBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: -0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
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
                        // x - zoom out          
                        case 88:
                            if (e.altKey) {
                                if (e.shiftKey) {
                                    a = { s: 1.111 };
                                    c3d.zoomcutBy(a);
                                    //log({t:'camera3d', f:'zoomcutTo', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomcutTo', a: a });
                                    }
                                }
                                else {
                                    a = { s: 1.1111, d: 3 };
                                    c3d.zoomflyBy(a); // 1.0/0.9 = 1.1111
                                    //log({t:'camera3d', f:'zoomcutBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'zoomcutBy', a: a });
                                    }
                                }
                            }
                            else {
                                if (e.shiftKey) {
                                    a = { r: 0.3927, d: 3 }; // PI/4 
                                    c3d.pitchflyBy(a);
                                    //log({t:'camera3d', f:'pitchflyBy', a:a});
                                    if (record_shots) {
                                        mediator_1.mediator.record({ t: 'camera3d', f: 'pitchflyBy', a: a });
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
                        // DOLLY - arrows
                        // left arrow - LEFT X-         
                        case 37:
                            a = { x: -0.1, d: 3 };
                            c3d.dollyflyBy(a);
                            //log({t:'camera3d', f:'dollyflyBy', a:a});
                            if (record_shots) {
                                mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                            }
                            break;
                        // right arrow - RIGHT X+
                        case 39:
                            a = { x: 0.1, d: 3 };
                            c3d.dollyflyBy(a);
                            //log({t:'camera3d', f:'dollyflyBy', a:a});
                            if (record_shots) {
                                mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
                            }
                            break;
                        // up arrow - FWD Z-/UP Y+          
                        case 38:
                            if (e.shiftKey) {
                                a = { y: 0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
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
                            break;
                        // down arrow - BACK Z+/DOWN Y-          
                        case 40:
                            if (e.shiftKey) {
                                a = { y: -0.1, d: 3 };
                                c3d.dollyflyBy(a);
                                //log({t:'camera3d', f:'dollyflyBy', a:a});
                                if (record_shots) {
                                    mediator_1.mediator.record({ t: 'camera3d', f: 'dollyflyBy', a: a });
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
//# sourceMappingURL=vr.js.map
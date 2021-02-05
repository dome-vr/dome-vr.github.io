/*
 * Leap Eye Look Controls
 * Author: @Nashira
 *
 * http://github.com/leapmotion/Leap-Three-Camera-Controls/
 *
 * Copyright 2014 LeapMotion, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var LowPassFilter, PI_2, X_AXIS, Y_AXIS, Z_AXIS, controls, object, anchorDelta, invert, translationSpeed, rotationSpeed, transSmoothing, rotationSmoothing, translationDecay, scaleDecay, rotationSlerp, pinchThreshold, vector, quaternion, rotationMomentum, translationMomentum, scaleMomentum, transLP, rotLP, LeapTwoHandControls;
    return {
        setters:[],
        execute: function() {
            // modified by Rudolph - singleton class instance with closure vars
            // and initialization function
            // aux class
            class LowPassFilter {
                constructor(_cutoff) {
                    this.accumulator = 0;
                    this.cutoff = _cutoff;
                }
                ;
                sample(_sample) {
                    this.accumulator += (_sample - this.accumulator) * this.cutoff;
                    return this.accumulator;
                }
            }
            ;
            // constants  
            PI_2 = Math.PI * 2, X_AXIS = new THREE.Vector3(1, 0, 0), Y_AXIS = new THREE.Vector3(0, 1, 0), Z_AXIS = new THREE.Vector3(0, 0, 1);
            // singleton instance controls and closure vars
            anchorDelta = 1, invert = true, 
            // rudolph: speed is also range of movement
            // rudolph: decreased smooting coef. ESSENTIAL
            translationSpeed = .01, rotationSpeed = 1.0, transSmoothing = 0.000025, rotationSmoothing = 0.001, translationDecay = 0.3, scaleDecay = 0.5, rotationSlerp = 0.8, pinchThreshold = 0.5, vector = new THREE.Vector3(), quaternion = new THREE.Quaternion(), rotationMomentum = new THREE.Quaternion(), translationMomentum = new THREE.Vector3(), scaleMomentum = new THREE.Vector3(1, 1, 1), transLP = [
                new LowPassFilter(transSmoothing),
                new LowPassFilter(transSmoothing),
                new LowPassFilter(transSmoothing)], rotLP = [
                new LowPassFilter(rotationSmoothing),
                new LowPassFilter(rotationSmoothing),
                new LowPassFilter(rotationSmoothing)];
            class LeapTwoHandControls {
                constructor() {
                    controls = this;
                    controls.controller = new Leap.Controller();
                }
                initialize(csph, options = {}) {
                    object = csph;
                    rotationMomentum = object.quaternion.clone(),
                        // rudolph: speed is also range of movement
                        // rudolph: decreased smooting coef. ESSENTIAL
                        invert = (options['invert'] === undefined ? true : options['invert']);
                    translationSpeed = options['translationSpeed'] || translationSpeed;
                    rotationSpeed = options['rotationSpeed'] || rotationSpeed;
                    transSmoothing = options['transSmoothing'] || transSmoothing;
                    rotationSmoothing = options['rotationSmoothing'] || rotationSmoothing;
                    translationDecay = options['translationDecay'] || translationDecay;
                    scaleDecay = options['scaleDecay'] || scaleDecay;
                    rotationSlerp = options['rotationSlerp'] || rotationSlerp;
                    pinchThreshold = options['pinchThreshold'] || pinchThreshold;
                }
                report() {
                    return { tspeed: translationSpeed,
                        rspeed: rotationSpeed,
                        tsmooth: transSmoothing,
                        rsmooth: rotationSmoothing,
                        tdecay: translationDecay,
                        scaledecay: scaleDecay,
                        rslerp: rotationSlerp,
                        pinchthresh: pinchThreshold
                    };
                }
                update() {
                    var frame = controls.controller.frame();
                    var anchorFrame = controls.controller.frame(anchorDelta);
                    // do we have a frame
                    if (!frame || !frame.valid || !anchorFrame || !anchorFrame.valid) {
                        return;
                    }
                    // match hands to anchors
                    // remove hands that have disappeared
                    // add hands that have appeared
                    var rawHands = frame.hands;
                    var hands = [];
                    var anchorHands = [];
                    rawHands.forEach(function (hand, hIdx) {
                        var anchorHand = anchorFrame.hand(hand.id);
                        if (anchorHand.valid) {
                            hands.push(hand);
                            anchorHands.push(anchorHand);
                        }
                    });
                    if (hands.length) {
                        // translation
                        if (controls.shouldTranslate(anchorHands, hands)) {
                            controls.applyTranslation(anchorHands, hands);
                        }
                        // rotation
                        //      if (controls.shouldRotate(anchorHands, hands)) {
                        //        controls.applyRotation(anchorHands, hands);
                        //      }
                        // scale
                        if (controls.shouldScale(anchorHands, hands)) {
                            controls.applyScale(anchorHands, hands);
                        }
                    }
                    object.position.add(translationMomentum);
                    translationMomentum.multiplyScalar(translationDecay);
                    //    object.quaternion.slerp(rotationMomentum, rotationSlerp);
                    //    object.quaternion.normalize();
                    object.scale.lerp(scaleMomentum, scaleDecay);
                }
                shouldTranslate(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return hands.some(isEngaged);
                }
                shouldScale(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return anchorHands.every(isEngaged) && hands.every(isEngaged);
                }
                shouldRotate(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    return anchorHands.length > 1
                        && hands.length > 1
                        && anchorHands.every(isEngaged)
                        && hands.every(isEngaged);
                }
                applyTranslation(anchorHands, hands) {
                    var isEngaged = controls.isEngaged.bind(this);
                    var translation = controls.getTranslation(anchorHands.filter(isEngaged), hands.filter(isEngaged));
                    translation[0] = transLP[0].sample(translation[0]);
                    translation[1] = 0.5 * transLP[1].sample(translation[1]);
                    translation[2] = transLP[2].sample(translation[2]);
                    vector.fromArray(translation);
                    if (invert) {
                        vector.negate();
                    }
                    vector.multiplyScalar(translationSpeed);
                    vector.applyQuaternion(object.quaternion);
                    translationMomentum.add(vector);
                }
                applyRotation(anchorHands, hands) {
                    var rotation = controls.getRotation(anchorHands, hands);
                    rotation[0] = rotLP[0].sample(rotation[0]);
                    rotation[1] = rotLP[1].sample(rotation[1]);
                    //rotation[2] = rotLP[2].sample(rotation[2]);
                    vector.fromArray(rotation);
                    vector.multiplyScalar(rotationSpeed);
                    if (invert) {
                        vector.negate();
                    }
                    quaternion.setFromAxisAngle(X_AXIS, vector.x);
                    rotationMomentum.multiply(quaternion);
                    quaternion.setFromAxisAngle(Y_AXIS, vector.y);
                    rotationMomentum.multiply(quaternion);
                    quaternion.setFromAxisAngle(Z_AXIS, vector.z);
                    //rotationMomentum.multiply(quaternion);
                    rotationMomentum.normalize();
                }
                applyScale(anchorHands, hands) {
                    var scale = controls.getScale(anchorHands, hands);
                    scaleMomentum.multiplyScalar(scale[3]);
                }
                getTranslation(anchorHands, hands) {
                    if (anchorHands.length !== hands.length) {
                        return [0, 0, 0];
                    }
                    var centerAnchor = controls.getCenter(anchorHands);
                    var centerCurrent = controls.getCenter(hands);
                    return [
                        centerCurrent[0] - centerAnchor[0],
                        centerCurrent[1] - centerAnchor[1],
                        centerCurrent[2] - centerAnchor[2]
                    ];
                }
                getScale(anchorHands, hands) {
                    if (hands.length < 2 || anchorHands.length < 2) {
                        return [1, 1, 1, 1];
                    }
                    var centerAnchor = controls.getCenter(anchorHands);
                    var centerCurrent = controls.getCenter(hands);
                    var aveRadiusAnchor = controls.aveDistance(centerAnchor, anchorHands);
                    var aveRadiusCurrent = controls.aveDistance(centerCurrent, hands);
                    // scale of current over previous
                    return [
                        aveRadiusCurrent[0] / aveRadiusAnchor[0],
                        aveRadiusCurrent[1] / aveRadiusAnchor[1],
                        aveRadiusCurrent[2] / aveRadiusAnchor[2],
                        controls.length(aveRadiusCurrent) / controls.length(aveRadiusAnchor)
                    ];
                }
                getRotation(anchorHands, hands) {
                    if (hands.length < 1 || anchorHands.length < 1
                        || hands.length !== anchorHands.length) {
                        return [0, 0, 0];
                    }
                    var am = controls.getAxisMag(hands);
                    if (am[3] < 6000) {
                        return [0, 0, 0];
                    }
                    var mi = 1 / am[3];
                    am[0] *= mi;
                    am[1] *= mi;
                    am[2] *= mi;
                    var anchorAngles = controls.getAngles(anchorHands);
                    var angles = controls.getAngles(hands);
                    var dx = angles[0] - anchorAngles[0];
                    var dy = angles[1] - anchorAngles[1];
                    var dz = angles[2] - anchorAngles[2];
                    //@@@@@
                    dz = 0;
                    if (dx > Math.PI) {
                        dx = dx - PI_2;
                    }
                    else {
                        if (dx < -Math.PI) {
                            dx = dx + PI_2;
                        }
                    }
                    if (dy > Math.PI) {
                        dy = dy - PI_2;
                    }
                    else {
                        if (dy < -Math.PI) {
                            dy = dy + PI_2;
                        }
                    }
                    if (dz > Math.PI) {
                        dz = dz - PI_2;
                    }
                    else {
                        if (dz < -Math.PI) {
                            dz = dz + PI_2;
                        }
                    }
                    return [dx * am[0], dy * am[1], dz * am[2]];
                }
                isEngaged(h) {
                    return h && (h.pinchStrength > pinchThreshold);
                }
                getCenter(hands) {
                    var l = hands.length;
                    if (l === 0) {
                        return [0, 0, 0];
                    }
                    else if (l === 1) {
                        return hands[0].palmPosition;
                    }
                    var x = 0, y = 0, z = 0;
                    hands.forEach(function (hand, i) {
                        x += hand.palmPosition[0];
                        y += hand.palmPosition[1];
                        z += hand.palmPosition[2];
                    });
                    return [x / l, y / l, z / l];
                }
                getAngles(hands) {
                    if (hands.length === 0) {
                        return [0, 0, 0];
                    }
                    var pos1;
                    var hand = hands[0];
                    if (hands.length > 1) {
                        pos1 = hands[1].palmPosition;
                    }
                    else {
                        pos1 = hand.frame.interactionBox.center;
                    }
                    var pos2 = hand.palmPosition;
                    var dx = pos2[0] - pos1[0];
                    var dy = pos2[1] - pos1[1];
                    var dz = pos2[2] - pos1[2];
                    var ax = Math.atan2(dy, dz);
                    var ay = Math.atan2(dx, dz);
                    var az = Math.atan2(dy, dx);
                    return [ax, ay, az];
                }
                getAxisMag(hands) {
                    if (hands.length === 0) {
                        return [0, 0, 0, 0];
                    }
                    var pos1;
                    var hand = hands[0];
                    if (hands.length > 1) {
                        pos1 = hands[1].palmPosition;
                    }
                    else {
                        pos1 = hand.frame.interactionBox.center;
                    }
                    var pos2 = hand.palmPosition;
                    var dx = pos2[0] - pos1[0];
                    var dy = pos2[1] - pos1[1];
                    var dz = pos2[2] - pos1[2];
                    var mag = dx * dx + dy * dy + dz * dz;
                    var ax = dy * dy + dz * dz;
                    var ay = dx * dx + dz * dz;
                    var az = dy * dy + dx * dx;
                    return [ax, ay, az, mag];
                }
                aveDistance(center, hands) {
                    var aveDistance = [0, 0, 0];
                    hands.forEach(function (hand) {
                        var p = hand.palmPosition;
                        aveDistance[0] += Math.abs(p[0] - center[0]);
                        aveDistance[1] += Math.abs(p[1] - center[1]);
                        aveDistance[2] += Math.abs(p[2] - center[2]);
                    });
                    aveDistance[0] /= hands.length;
                    aveDistance[1] /= hands.length;
                    aveDistance[2] /= hands.length;
                    return aveDistance;
                }
                length(arr) {
                    var sum = 0;
                    arr.forEach(function (v) {
                        sum += v * v;
                    });
                    return Math.sqrt(sum);
                }
                dist(arr1, arr2) {
                    var sum = 0;
                    arr1.forEach(function (v, i) {
                        var d = v - arr2[i];
                        sum += d * d;
                    });
                    return Math.sqrt(sum);
                }
            }
             //class LeapTwoHandControls  
            // enforce singleton export
            if (!controls) {
                controls = new LeapTwoHandControls();
            }
            exports_1("controls", controls);
        }
    }
});
//# sourceMappingURL=controls-onehand.js.map
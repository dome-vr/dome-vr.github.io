// camera.ts 
import { transform3d } from '../services/transform3d.js';
import { vrcontrols } from '../models/camera/controls/vrcontrols.js';
import { vrkeymap } from '../models/camera/keymaps/vrkeymap.js';
import { rmkeymap } from '../models/camera/keymaps/rmkeymap.js';
// singleton closure-instance variable
let camera, sglens, vrlens, sgcsphere, vrcsphere;
class Camera {
    // ctor
    constructor() {
        camera = this;
    } //ctor
    static create() {
        if (camera === undefined) {
            camera = new Camera();
        }
    }
    // l = state['sg'|'vr']['lens']  - return THREE.PerspectiveCamera if created
    create_lens(l, scene, narrative, scenename) {
        //console.log(`camera.create_lens(): creating lens camera component`);
        let lens;
        // lens 
        // NOTE: l['_lens'] is only true or undefined (create or modify)
        //console.log(`l['_lens'] = ${l['_lens']}`);
        if (l['_lens']) { //t=>create
            const aspect = window.innerWidth / window.innerHeight, fov = l['fov'] || 90, near = l['near'] || .01, far = l['far'] || 10000;
            // create lens
            lens = new THREE.PerspectiveCamera(fov, aspect, near, far);
            //console.log(`camera.create_lens(): created lens = ${lens}:`);
            //console.dir(lens);
            //transform lens - need to move lens from origin if OrbitControls effects
            //are to be seen
            //console.log(`l['transform'] = ${l['transform']}`);
            if (l['transform']) {
                transform3d.apply(l['transform'], lens);
                lens.updateWorldMatrix();
            }
        }
        else { //l['_lens'] undefined => modify lens
            //console.log(`\ncamera.create_lens(): modifying lens`);
            if (lens) {
                if (l['fov']) {
                    lens.fov = l['fov'];
                }
                if (l['near']) {
                    lens.near = l['near'];
                }
                if (l['far']) {
                    lens.far = l['far'];
                }
                if (l['transform']) {
                    transform3d.apply(l['transform'], lens);
                }
            }
        }
        if (scenename === 'sg') {
            sglens = lens;
            narrative.addActor(scene, 'sglens', sglens);
        }
        else {
            vrlens = lens;
            narrative.addActor(scene, 'vrlens', vrlens);
        }
        return (lens);
    } //create_lens
    // l = state['sg'|'vr']['fog']  - no return
    create_fog(f, scene) {
        //console.log(`camera.create_fog(f,scene) camera component`);
        if (f && Object.keys(f).length > 0) {
            const _fog = f['_fog']; //_fog is boolean - inferred 
            if (_fog) { //t=>create
                //console.log('\ncamera.create_fog() - creating scene.fog');
                const color = f['color'] || 'white', near = f['near'] || .01, far = f['far'] || 1000;
                scene.fog = new THREE.Fog(color, near, far);
            }
            else {
                if (_fog === false) { //f=>delete
                    //console.log('\ncamera.create_fog() - deleting scene.fog');
                    scene.fog = undefined;
                }
                else { //undefined=>modify
                    //console.log('\ncamera.create_fog() - modifying scene.fog');
                    if (f['color']) {
                        scene.fog.color = f['color'];
                    }
                    if (f['near']) {
                        scene.fog.near = f['near'];
                    }
                    if (f['far']) {
                        scene.fog.far = f['far'];
                    }
                }
            }
        } //f
    } //create_fog
    create_csphere(ss, scene, narrative, scenename) {
        //console.log('camera.create_csphere(ss,scene,csphere) camera component');
        let lens_, key = ss['key'] || {}, fill = ss['fill'] || {}, back = ss['back'] || {};
        if (scenename === 'vr') {
            lens_ = vrlens;
        }
        else {
            lens_ = sglens;
        }
        if (ss['key'] === undefined) {
            ss['key'] = {};
        }
        if (ss['fill'] === undefined) {
            ss['fill'] = {};
        }
        if (ss['back'] === undefined) {
            ss['back'] = {};
        }
        const opacity = ss['opacity'] || 1.0, color = ss['color'] || 'green', key_color = (key['color']) || 'white', key_intensity = key['intensity'] || 1.0, key_distance = key['distance'] || 0.0, key_position = key['position'] || lens_.position, fill_color = fill['color'], fill_intensity = fill['intensity'] || 1.0, fill_distance = fill['distance'] || 0.0, fill_position = fill['position'] || lens_.position, back_color = back['color'], back_intensity = back['intensity'], back_distance = back['distance'], back_position = back['position'] || lens_.position;
        let _visible = false, _wireframe = false, radius = ss['radius'];
        if ((ss['_visible'] !== undefined) && (ss['_visible'] !== false)) {
            _visible = ss['_visible'];
        }
        if ((ss['_wireframe'] !== undefined) && (ss['_wireframe'] !== false)) {
            _wireframe = ss['_wireframe'];
        }
        if (radius === undefined) {
            const p = lens_['position'];
            radius = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        }
        //console.log(`radius of csphere is ${radius}`);
        // avoid radius=0
        if (radius < .1) {
            radius = 10.0;
        }
        //csphere
        const csphere_g = new THREE.SphereBufferGeometry(radius), csphere_m = new THREE.MeshBasicMaterial({
            visible: _visible,
            color: color,
            transparent: true,
            opacity: opacity,
            wireframe: _wireframe
        }), csphere = new THREE.Mesh(csphere_g, csphere_m);
        // lights
        [key, fill, back] = ['key', 'fill', 'map'].map((name) => {
            const o = ss[name] || {}, l = new THREE.PointLight(), pos_a = o['position'] || lens_.position.toArray();
            l.color = o['color'] || 'white'; // default white
            l.intensity = o['intensity'] || 1.0; // default 1.0
            l.distance = o['distance'] || 0.0, // default is infinite extent
                l.position.fromArray(pos_a); // default lens 'headlight'
            return l;
        });
        //add components to csphere to create camera apparatus
        csphere.add(lens_);
        csphere.add(key);
        csphere.add(fill);
        csphere.add(back);
        //console.log(`csphere = ${csphere}:`);
        //console.dir(csphere);
        //add actors with canonical names - they are also added to scene
        narrative.addActor(scene, `${scenename}csphere`, csphere);
        narrative.addActor(scene, `${scenename}key`, key);
        narrative.addActor(scene, `${scenename}fill`, fill);
        narrative.addActor(scene, `${scenename}back`, back);
        //write
        if (scenename === 'vr') {
            vrcsphere = csphere;
            //console.log(`camera.create_csphere: vrcsphere = ${vrcsphere}:`);
            //console.dir(vrcsphere);
        }
        else {
            sgcsphere = csphere;
            //console.log(`camera.create_csphere: sgcsphere = ${sgcsphere}:`);
            //console.dir(sgcsphere);
        }
    } //create_csphere
    create_controls(cs, scene, narrative, scenename) {
        console.log('camera.create_controls(cs,scene,narrative,scenename) ');
        //console.log(`scenename = ${scenename}`);
        //console.log(`scene = ${scene}`);
        let controlTarget = scene; //vrscene - default
        //NOTE:controls/keymap used only in output scene (given by scenename)
        //     exp. vrscene
        if (scenename === 'vr') {
            if (cs['controlTarget'] === 'vrcsphere') {
                controlTarget = vrcsphere;
            }
            else {
                cs['controlTarget'] = 'vrscene';
                controlTarget = scene; //redundant
            }
            if (cs['_controls']) {
                //remove vrlens from vrcsphere if  _controls is true and ctgt='vrscene'
                //vrcontrols and vkeymap move vrscene to animate vrlens 'relatively'
                if (cs['controlTarget'] === 'vrscene') {
                    if (vrcsphere) {
                        vrcsphere.remove(vrlens);
                        //console.log('^^^^^^^^^^^^^^^ removing vrlens from vrcsphere');
                    }
                }
                const controls_speed = cs['controls_speed'] || 0.1;
                const canvas = narrative['canvas'];
                vrcontrols.start(controlTarget, canvas, controls_speed);
            }
            if (cs['_keymap']) {
                if (cs['_keymap'] === 'rm') {
                    const keymap_speed = cs['keymap_speed'] || 0.1;
                    //console.log(`\n\n!!!! _keymap='rm' speed=${keymap_speed} !!!!\n\n`);
                    rmkeymap.start(narrative, keymap_speed);
                }
                if (cs['_keymap'] === 'vr') {
                    const keymap_speed = cs['keymap_speed'] || 0.1;
                    const canvas = narrative['canvas'];
                    vrkeymap.start(controlTarget, keymap_speed);
                }
            }
        }
    } //create_controls
    // create objects specified in arg camera-state === state['camera']
    // returns new Promise<object>((resolve, reject) => {});
    delta(state, narrative) {
        //console.log(`@@ camera.delta(state, scenes) state:`);
        //console.dir(state);
        return new Promise((resolve, reject) => {
            // process state
            // sg
            const state_sg = state['sg'];
            if (state_sg && Object.keys(state_sg).length > 0) {
                const scene = narrative['sg']['scene'];
                //console.log(`camera.delta: creating camera components for sg`);
                // lens
                const sgl = state_sg['lens'];
                if (sgl && Object.keys(sgl).length > 0) {
                    narrative['sg']['lens'] = camera.create_lens(sgl, scene, narrative, 'sg');
                }
                // fog
                const sgf = (state_sg['fog']);
                if (sgf && Object.keys(sgf).length > 0) {
                    camera.create_fog(sgf, scene);
                }
                else {
                    //console.log(`state['sg']['fog'] is undefined or empty`);
                }
                // csphere
                const sgs = (state_sg['csphere']);
                if (sgs && Object.keys(sgs).length > 0) {
                    camera.create_csphere(sgs, scene, narrative, 'sg');
                }
                else {
                    //console.log(`state['sg']['csphere'] is undefined or empty`);
                }
            }
            else {
                //console.log(`state['sg'] is undefined or empty`);
            }
            // vr
            const state_vr = state['vr'];
            if (state_vr && Object.keys(state_vr).length > 0) {
                const scene = narrative['vr']['scene'];
                //console.log(`camera.delta: creating camera components for vr`);
                // lens
                const vrl = state_vr['lens'];
                if (vrl) {
                    narrative['vr']['lens'] = camera.create_lens(vrl, scene, narrative, 'vr');
                }
                // fog
                const vrf = (state_vr['fog']);
                if (vrf && Object.keys(vrf).length > 0) {
                    camera.create_fog(vrf, scene);
                }
                else {
                    //console.log(`state['vr']['fog'] is undefined or empty`);
                }
                // csphere
                const vrs = (state_vr['csphere']);
                if (vrs && Object.keys(vrs).length > 0) {
                    camera.create_csphere(vrs, scene, narrative, 'vr');
                }
                else {
                    //console.log(`state['vr']['csphere'] is undefined or empty`);
                }
                // controls
                const vrc = (state_vr['controls']);
                if (vrc && Object.keys(vrc).length > 0) {
                    camera.create_controls(vrc, scene, narrative, 'vr');
                }
                else {
                    //console.log(`state['vr']['controls'] is undefined or empty`);
                }
                //HACK!!! attach audioListener to lens from displayed scene
                const dslens = narrative[narrative['displayed_scene']]['lens'];
                //console.log(`\n\n ### camera: dslens = ${dslens}`);
                //console.dir(dslens);
                //console.log(`before dslens.children.length = ${dslens.children.length}`);
                //console.log(`attaching audioListener to ${narrative['displayed_scene']}lens`);
                dslens.add(narrative['audioListener']);
                //console.log(`after dslens.children.length = ${dslens.children.length}`);
                //console.log(`dslens.children[0]:`);
                //console.dir(dslens.children[0]);
                resolve(narrative['devclock'].getElapsedTime());
            }
            else {
                //console.log(`state['vr'] is undefined or empty`);
                //HACK!!! attach audioListener to lens from displayed scene
                const dslens = narrative[narrative['displayed_scene']]['lens'];
                //console.log(`attaching audioListener to ${narrative['displayed_scene']}lens`);
                dslens.add(narrative['audioListener']);
                resolve(narrative['devclock'].getElapsedTime());
            }
        });
    } //camera.delta
} //Camera
Camera.create();
export { camera };
//# sourceMappingURL=camera.js.map
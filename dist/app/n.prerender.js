// prepare actors and components for render()
prerender(state, State);
Promise < number > {
    //console.log(`\n@@@ narrative.prerender() _sgpost = ${_sgpost}`);
    return: new Promise((resolve, reject) => {
        if (sgscene) {
            //console.log(`prerender(): sgscene is defined!`);
            sglens = narrative['sg']['lens'];
            if (state['camera']['sg']['lens'] && state['camera']['sg']['lens']['_orbit']) {
                console.log(`*** enabling orbit controls for sglens:`);
                sgorbit = new OrbitControls(sglens, renderer.domElement);
                sgorbit.update();
                sgorbit.enableDamping = true;
                sgorbit.dampingFactor = 0.25;
                sgorbit.enableZoom = true;
                //sgorbit.autoRotate = true;
            }
            // build rendering components, actors
            sghud = narrative.findActor('sghud');
            //console.log(`_sgpost = ${_sgpost}`);
            if (sghud) {
                sghud_tDiffuse = sghud.material.uniforms.tDiffuse;
                sghud_tDiffuse['value'] = dTexture;
                sghud_tDiffuse['needsUpdate'] = true;
                //console.log(`sghud_tDiffuse = ${sghud_tDiffuse}`);
            }
            else {
                _sgpost = false;
            }
            sgskybox = narrative.findActor('sgskybox');
            if (sgskybox) {
                //console.log(`sgskybox actor found`);
                //console.log(`Array.isArray(sgskybox.material) = ${Array.isArray(sgskybox.material)}`);
                //console.log(`sgskybox.material.length = ${sgskybox.material.length}`);
                sgskybox_materials = [];
                for (let i = 0; i < sgskybox.material.length; i++) {
                    sgskybox_materials[i] = sgskybox.material[i];
                }
            }
            sgskydome = narrative.findActor('sgskydome');
            if (sgskydome) {
                console.log(`sgskydome actor found`);
                sgskydome_map = sgskydome.material.map;
            }
            sgcloud = narrative.findActor('sgcloud');
        } //if(sgscene)
        if (rmscene) {
            //console.log(`prerender(): rmscene is defined!`);
            // build rendering components, actors
            rmquad = narrative.findActor('rmquad');
            rmhud = narrative.findActor('rmhud');
            //console.log(`n.prerender(): rmquad = ${rmquad}`);
            //console.log(`n.prerender(): rmhud = ${rmhud}`);
            //console.dir(rmquad);
            if (rmquad) {
                rmquad_tDiffuse = rmquad.material.uniforms.tDiffuse;
            }
            if (rmhud) {
                rmhud_tDiffuse = rmhud.material.uniforms.tDiffuse;
                if (rmhud_tDiffuse === undefined) {
                    rmhud_tDiffuse = rmhud.material.uniforms.tDiffusePost;
                }
                transform3d.apply({ s: [initial_width, initial_height, 1.0] }, rmhud);
                //console.log(`rmhud_tDiffuse = ${rmhud_tDiffuse}`);
            }
            if (!rmquad && !rmhud) {
                _rm = false;
                _rmpost = false;
            }
            //TEMP - test
            rmplane = narrative.findActor('rmplane');
        }
        if (vrscene) {
            //console.log(`prerender(): vrscene is defined!`);
            vrlens = narrative['vr']['lens'];
            if (state['camera']['vr']['lens'] && state['camera']['vr']['lens']['_orbit']) {
                console.log(`*** enabling orbit controls for vrlens:`);
                vrorbit = new OrbitControls(vrlens, renderer.domElement);
                vrorbit.update();
                vrorbit.enableDamping = true;
                vrorbit.dampingFactor = 0.25;
                vrorbit.enableZoom = true;
                //vrorbit.autoRotate = true;
            }
            vrskybox = narrative.findActor('vrskybox');
            if (vrskybox) {
                //console.log(`vrskybox actor found`);
                //console.log(`Array.isArray(vrskybox.material) = ${Array.isArray(vrskybox.material)}`);
                //console.log(`vrskybox.material.length = ${vrskybox.material.length}`);
                if (Array.isArray(vrskybox.material)) {
                    vrskybox_materials = [];
                    for (let i = 0; i < 6; i++) {
                        //console.log(`\n________________setting vrskybox_materials[${i}]`);
                        //(<THREE.Materials[]>vrskybox.material)[i].map = sgTarget.texture;
                        vrskybox_materials[i] = vrskybox.material[i] || new THREE.Material();
                    }
                }
                else { // not array
                    vrskybox_materials = [];
                }
            }
            vrskydome = narrative.findActor('vrskydome');
            if (vrskydome) {
                //console.log(`vrskydome actor found`);
                vrskydome_map = vrskydome.material.map;
            }
            vrcloud = narrative.findActor('vrcloud');
        } //if(vrscene)
        resolve(devclock.getElapsedTime()); //secs
    })
}; //prerender()
//# sourceMappingURL=n.prerender.js.map
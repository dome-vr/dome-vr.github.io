// closure function
function getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {
    const textures = [];
    for (let i = 0; i < tilesNum; i++) {
        textures[i] = new THREE.Texture();
    }
    const loader = new THREE.ImageLoader();
    loader.load(atlasImgUrl, function (imageObj) {
        let canvas, context;
        const tileWidth = imageObj.height;
        for (let i = 0; i < textures.length; i++) {
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.height = tileWidth;
            canvas.width = tileWidth;
            context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);
            textures[i].image = canvas;
            textures[i].needsUpdate = true;
        }
    });
    return textures;
}
// class Panorama - Factory
export const Panorama = class {
    static create(options = {}) {
        //console.log(`@Panorama.create(options:)`);
        //console.dir(options);
        return new Promise((resolve, reject) => {
            const panorama = { delta: (options = {}) => { console.log(`panorama.delta(): options=${options}`); } }, texture_url = options['texture_url'] ||
                '../../../../media/images/cube/sun_temple_stripe_stereo.jpg', ntextures = options['ntextures'] || 12, lens = options['lens'], layers = [], color = options['color'] || 'white';
            try {
                // layerL === layer
                // prepare camera for two layers of panorama
                lens['layers'].enable(1);
                // geometry
                const geometry = new THREE.BoxGeometry(100, 100, 100);
                geometry.scale(1, 1, -1);
                //const textures = getTexturesFromAtlasFile( "../../../../media/images/cube/sun_temple_stripe_stereo.jpg", 12 );
                const textures = getTexturesFromAtlasFile(texture_url, ntextures);
                //        console.log(`panorama: textures = ${textures}:`);
                //        console.dir(textures);
                //        console.log(`textures[0]:`);
                //        console.dir(textures[0]);
                // skyBoxL - geometry to be SHARED with skyBoxR
                const materialsL = [];
                for (let i = 0; i < 6; i++) {
                    materialsL.push(new THREE.MeshBasicMaterial({ map: textures[i],
                        color: color
                    }));
                }
                const skyBoxL = new THREE.Mesh(geometry, materialsL);
                skyBoxL.layers.set(1);
                layers[0] = skyBoxL;
                // skyBoxR - geometry shared; material NOT shared - distinct materialsR
                const materialsR = [];
                for (let i = 6; i < 12; i++) {
                    materialsR.push(new THREE.MeshBasicMaterial({ map: textures[i],
                        color: color
                    }));
                }
                const skyBoxR = new THREE.Mesh(geometry, materialsR);
                skyBoxR.layers.set(2);
                layers[1] = skyBoxR;
                // attach layers[2] to panorama
                panorama['layers'] = layers;
                // return created panorama instance of Actor - contains
                // delta() and layers:THREE.Mesh[]
                resolve(panorama);
            }
            catch (e) {
                const err = `error in panorama.create: ${e.message}`;
                console.error(err);
                reject(err);
            }
        }); //return Promise<Actor>
    } //create
}; //class Panorama
//# sourceMappingURL=panorama.js.map
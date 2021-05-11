import { transform3d } from '../../../../services/transform3d.js';
// class GridXZ - Factory
export const GridXZ = class {
    static create(options = {}) {
        //console.log(`\n&&& GridXZ.create - options:`);
        //console.dir(options);
        // options
        const size = options['size'] || 1000, divisions = options['divisions'] || 100, colorGrid = options['colorGrid'] || 'white', colorCenterLine = options['colorCenterLine'] || colorGrid, opacity = options['opacity'] || 1.0, transform = options['transform'] || {};
        //diagnostics
        //console.log(`size = ${size}`);
        //console.log(`colorGrid = ${colorGrid}`);
        //console.log(`divisions = ${divisions}`);
        //console.log(`colorCenterLine = ${colorCenterLine}`);
        //console.log(`opacity = ${opacity}`);
        //console.log(`transform = ${transform}:`);
        //console.dir(transform);
        return new Promise((resolve, reject) => {
            const grid_m = new THREE.LineBasicMaterial({
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            }), grid = new THREE.GridHelper(size, divisions, new THREE.Color(colorGrid), new THREE.Color(colorCenterLine));
            //console.log(`grid_m = ${grid_m}`);
            //console.log(`grid = ${grid}:`);
            //console.dir(grid);
            // blending
            // check: need gl.enable(gl.BLEND)
            //console.log(`blending of grid`);
            grid.material = grid_m;
            grid_m.blending = THREE.CustomBlending;
            grid_m.blendSrc = THREE.SrcAlphaFactor; // default
            grid_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
            //grid_m.depthTest = false;  //default
            // transform
            //console.log(`transform of grid`);
            if (transform && Object.keys(transform).length > 0) {
                transform3d.apply(transform, grid);
            }
            // ACTOR.INTERFACE method
            // delta method for modifying properties
            grid['delta'] = (options = {}) => {
                //console.log(`gridXZ.delta: options = ${options}:`);
                //console.dir(options);
                const t = (options['transform'] || {});
                grid_m.color = options['color'] || grid_m.color;
                grid_m.opacity = options['opacity'] || grid_m.opacity;
                // transform
                if (Object.keys(t).length > 0) {
                    transform3d.apply(t, grid);
                }
            };
            // render method - not needed in this case
            //grid['render'] = (et:number=0, options:object={}) => {}
            // return actor ready to be added to scene
            resolve(grid);
        }); //return new Promise
    } //create
}; //GridXZ;
//# sourceMappingURL=gridXZ.js.map
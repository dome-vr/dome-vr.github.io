// actor: pointcloud-sine
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var pointcloud, geometry, material, image_url, n_vertices, i, j, create;
    return {
        setters:[],
        execute: function() {
            //import {camera} from "../../../state/camera";
            // closure vars
            // create
            exports_1("create", create = (options = {}) => {
                // options
                image_url = options['image_url'] || './assets/images/sprites/disc.png';
                n_vertices = options['n_vertices'] || 121; //|| 121;
                console.log(`@@@@ creating ${image_url} for material of pointcloud`);
                console.log(`@@@@ creating ${n_vertices} vertices for Geometry of pointcloud`);
                return new Promise((resolve, reject) => {
                    geometry = new THREE.Geometry();
                    for (i = -5; i < 6; i++) {
                        for (j = -5; j < 6; j++) {
                            //geometry.vertices.push(new THREE.Vector3(0.1*i, 0.1*j, -0.1));
                            //geometry.vertices.push(new THREE.Vector3(0.2*i, 0.0, 0.2*j));
                            geometry.vertices.push(new THREE.Vector3(0.5 * i, 0.0, 0.5 * j));
                        }
                    }
                    material = new THREE.PointsMaterial({ color: 0xff0000, size: 1.2 }); // size:1.0
                    pointcloud = new THREE.Points(geometry, material);
                    // pointcloud.render()
                    pointcloud['render'] = (et = 0, options = {}) => {
                        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
                            //geometry.vertices[ i ].y = 35 * Math.sin( i / 5 + ( et + i ) / 7 );
                            geometry.vertices[i].y = 100 * Math.sin(i / 5 + (0.5 * et + i) / 7);
                        }
                        pointcloud.geometry.verticesNeedUpdate = true;
                        pointcloud.material.map = options['texture'];
                        pointcloud.material.needsUpdate = true;
                    };
                    console.log(`Pointcloud-sine exporting actor ${pointcloud}:`);
                    console.dir(pointcloud);
                    resolve(pointcloud);
                }); //return new Promise
            }); //create
        }
    }
});
//# sourceMappingURL=pointcloud-sine.js.map
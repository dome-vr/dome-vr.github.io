var _a;
// closure vars
let pcloudlines, effectController, positions, colors, particles, particlePositions, linesMesh;
//flag:boolean = true;   // TEMP !!!!
const particlesData = [];
export const Pointcloudlines = (_a = class {
    },
    // create
    _a.create = (options = {}) => {
        // options
        const maxParticleCount = 1000, particleCount = options['particleCount'] || 500, // no effect ?!
        showDots = options['showDots'] || true, // no effect ?!
        showLines = options['showLines'] || true, // no effect ?!
        maxConnections = options['maxConnections'] || 20, //1,  
        minDistance = options['minDistance'] || 250, //90,  //150,    
        limitConnections = options['limitConnections'] || true; //false,
        let r = 800, rHalf = r / 2, group = new THREE.Group(), helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(r, r, r)));
        return new Promise((resolve, reject) => {
            //effectController = options;  //might be missing properties not supplied!
            effectController = {
                maxParticleCount: maxParticleCount,
                particleCount: particleCount,
                showDots: showDots,
                showLines: showLines,
                maxConnections: maxConnections,
                minDistance: minDistance,
                limitConnections: limitConnections
            };
            helper.material.color.setHex(0x080808);
            helper.material.blending = THREE.AdditiveBlending;
            helper.material.transparent = true;
            group.add(helper);
            const segments = maxParticleCount * maxParticleCount;
            positions = new Float32Array(segments * 3);
            colors = new Float32Array(segments * 3);
            const pMaterial = new THREE.PointsMaterial({
                color: 0xFFFFFF,
                size: 3,
                blending: THREE.AdditiveBlending,
                transparent: true,
                sizeAttenuation: false
            });
            particles = new THREE.BufferGeometry();
            particlePositions = new Float32Array(maxParticleCount * 3);
            for (let i = 0; i < maxParticleCount; i++) {
                const x = Math.random() * r - r / 2;
                const y = Math.random() * r - r / 2;
                const z = Math.random() * r - r / 2;
                particlePositions[i * 3] = x;
                particlePositions[i * 3 + 1] = y;
                particlePositions[i * 3 + 2] = z;
                // add it to the geometry
                particlesData.push({
                    velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
                    numConnections: 0
                });
            }
            particles.setDrawRange(0, particleCount);
            particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setDynamic(true));
            // create the particle system
            pcloudlines = new THREE.Points(particles, pMaterial);
            group.add(pcloudlines);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true));
            geometry.computeBoundingSphere();
            geometry.setDrawRange(0, 0);
            const material = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            linesMesh = new THREE.LineSegments(geometry, material);
            group.add(linesMesh);
            //    console.log(`group.children = ${group.children}`);
            //    for(const c of group.children){
            //      console.dir(c);
            //    }
            // render method
            group['animate'] = (et) => {
                let vertexpos = 0, colorpos = 0, numConnected = 0;
                for (let i = 0; i < particleCount; i++) {
                    particlesData[i].numConnections = 0;
                }
                for (let i = 0; i < particleCount; i++) {
                    // get the particle
                    const particleData = particlesData[i];
                    particlePositions[i * 3] += particleData.velocity.x;
                    particlePositions[i * 3 + 1] += particleData.velocity.y;
                    particlePositions[i * 3 + 2] += particleData.velocity.z;
                    if (particlePositions[i * 3 + 1] < -rHalf || particlePositions[i * 3 + 1] > rHalf) {
                        particleData.velocity.y = -particleData.velocity.y;
                    }
                    if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf) {
                        particleData.velocity.x = -particleData.velocity.x;
                    }
                    if (particlePositions[i * 3 + 2] < -rHalf || particlePositions[i * 3 + 2] > rHalf) {
                        particleData.velocity.z = -particleData.velocity.z;
                    }
                    if (effectController['limitConnections'] && particleData.numConnections >= effectController['maxConnections']) {
                        continue;
                    }
                    // Check collision
                    for (let j = i + 1; j < particleCount; j++) {
                        const particleDataB = particlesData[j];
                        if (effectController['limitConnections'] && particleDataB.numConnections >= effectController['maxConnections']) {
                            continue;
                        }
                        const dx = particlePositions[i * 3] - particlePositions[j * 3];
                        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
                        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (dist < effectController['minDistance']) {
                            particleData.numConnections++;
                            particleDataB.numConnections++;
                            const alpha = 1.0 - dist / effectController['minDistance'];
                            positions[vertexpos++] = particlePositions[i * 3];
                            positions[vertexpos++] = particlePositions[i * 3 + 1];
                            positions[vertexpos++] = particlePositions[i * 3 + 2];
                            positions[vertexpos++] = particlePositions[j * 3];
                            positions[vertexpos++] = particlePositions[j * 3 + 1];
                            positions[vertexpos++] = particlePositions[j * 3 + 2];
                            colors[colorpos++] = alpha;
                            colors[colorpos++] = alpha;
                            colors[colorpos++] = alpha;
                            colors[colorpos++] = alpha;
                            colors[colorpos++] = alpha;
                            colors[colorpos++] = alpha;
                            numConnected++;
                        }
                    }
                } //for i<particlecount
                // TEMP !!!!!
                //console.log(`numConnected = ${numConnected} linesMeash = ${linesMesh}`);
                //      if(flag){
                //        console.log(`linesMesh.geometry.attributes:`);
                //        console.dir(linesMesh.geometry.attributes);
                //        console.log(`pcloudlines.geometry.attributes:`);
                //        console.dir(pcloudlines.geometry.attributes);
                //        flag = false;
                //      }
                linesMesh.geometry.setDrawRange(0, 1000); //numConnected * 2 );
                linesMesh.geometry.attributes.position.needsUpdate = true;
                linesMesh.geometry.attributes.color.needsUpdate = true;
                pcloudlines.geometry.attributes.position.needsUpdate = true;
            }; //render
            resolve(group);
        }); //return new Promise
    } //create
,
    _a); //Pointcloudlines
//# sourceMappingURL=pointcloud-lines-works.js.map
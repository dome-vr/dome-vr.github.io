export const actions = [
    { t: 'narrative',
        f: 'foo',
        a: 'o',
        o: { a: 1, b: 2 },
        ms: 1000
    },
    { t: 'vrlens',
        a: 'n',
        o: { 'fov': 120.0 },
        ms: 4000
    },
    { t: 'vrlens',
        f: 'updateProjectionMatrix',
        a: 'v',
        ms: 5000
    },
    //       {t:'vrcsphere.material',   //set wireframe property - works! 
    //        a:'n',
    //        o: {'wireframe':false},  
    //        ms:7000
    //       },
    { t: 'vrcsphere',
        f: 'translateOnAxis',
        a: 'm',
        o: { arg: [new THREE.Vector3(0, 1, 0), 1.0] },
        ms: 7000
    },
    //       {t:'vrcsphere.material',   //set color property - FAILS 
    //        a:'n',
    //        o: {'color':new THREE.Color(255,0,0)},   //0xff0000, 'red'
    //        ms:7000
    //       },
    //       {t:'vrcsphere',   //function - works!
    //        f:'rotateZ',
    //        a:'n',
    //        o: {'arg':0.785},
    //        ms:7000
    //       },
    //
    //       {t:'vrcsphere',  //function - works!
    //        f:'translateX',
    //        a:'n',
    //        o: {'arg':0.785},
    //        ms:4000
    //       },
    { t: 'animation',
        f: 'perform',
        ms: 10000,
        a: 'o',
        o: {
            timeline: {},
            actors: {
                'vrcsphere~material': {
                    'opacity': 0.0,
                    duration: 5,
                    repeat: -1,
                    yoyo: true
                },
                'vrlens': {
                    'fov': 60.0,
                    duration: 5,
                    repeat: -1,
                    yoyo: true
                    //onUpdate:()=>{vrlens.updateProjectionMatrix();}
                    //onUpdate: () => {console.log('update');}   // not run ?!
                    //onUpdate: () => {gsap.getProperty(this.targets()[0]).updateProjectionMatrix();}  // fails or not run ?!
                }
            }
        } //anim
    } //animation.perform
];
//# sourceMappingURL=anim1.js.map
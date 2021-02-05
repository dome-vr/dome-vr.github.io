// _generators.ts
// imports specific generator functions from models/cloud/generators/*.ts


import {cube} from './cube';
import {helix1} from './helix1';
import {helix2} from './helix2';
import {helix3} from './helix3';
import {plane} from './plane';
import {sphere1} from './sphere1';
import {sphere2} from './sphere2';
import {sphere3} from './sphere3';
import {sphere4} from './sphere4';


var generators = { cube,
                   helix1,
                   helix2,
                   helix3,
                   plane,
                   sphere1,
                   sphere2,
                   sphere3,
                   sphere4 };


export {generators};

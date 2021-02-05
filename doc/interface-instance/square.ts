// square.ts

import {Shape} from './shape';

export interface Square extends Shape{
  length:number
}


let sq = <Square>{};
sq.color = 'red';
sq.length = 1;

console.log(`sq = ${sq}`);
console.log(`sq.color = ${sq.color}`);
console.log(`sq = ${sq.length}`);


  

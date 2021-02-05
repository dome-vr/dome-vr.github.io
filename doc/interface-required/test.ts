// test whether strict interface implementation is required
// usage> tsc test

interface Config {
  b:boolean;
  n:number;
  s:string;
};

const config1:Config = {
  b:true,
  n:0,
  s:"s",
};

const config2:Config = {
  b:true,
  n:0,
};

const config3:Config = {
  b:true,
  n:0,
  s:undefined,
  f : (s1:string, s2:string) => {
    return s1 + s2;
  }
};

class C1 implements Config {
  constructor(){};
  b:true;
  n:0;
  s:"s";
  f(s1:string, s2:string): string {
    return s1 + s2;
  }
}

class C2 implements Config {
  constructor(){};
  b:true;
  n:0;
  f(s1:string, s2:string): string {
    return s1 + s2;
  }
}


// generates output:
// =>  test.ts(16,11): error TS2741: Property 's' is missing in type '{ b: true; n: number; }' but required in type 'Config'.
 
// => test.ts(25,7): error TS2322: Type '{ b: true; n: number; s: string; f: (s1: string, s2: string) => string; }' is not assignable to type 'Config'.
//  Object literal may only specify known properties, and 'f' does not exist in type 'Config'.

// test.ts(40,7): error TS2420: Class 'C2' incorrectly implements interface 'Config'.
//  Property 's' is missing in type 'C2' but required in type 'Config'.


// **** Therefore if an object is type interface it must declare all the 
// interface properties (and methods) and NO others

// However if a class implements an interface it must declare all the 
// interface properties (and methods) BUT may also declare and implement others


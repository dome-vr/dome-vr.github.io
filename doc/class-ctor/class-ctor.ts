// class-ctor.ts
// [1] test access modified ctor arg to create, (a) say private, and
// (b) private readonly property.  AND
// [2] check if args can take default value 
//
// output:
// c1.speak returns foo1
// c2.speak returns foo2
// c3.speak returns sfoo,tfoo,ufoo

export class C1{
  constructor(private s:string){};

  speak(){
    return this.s;
  }
}

export class C2{
  constructor(private readonly s:string){};

  speak(){
    return this.s;
  }
}

export class C3{
  constructor(private readonly s:string = 'sfoo',
              private readonly t:string = 'tfoo',
              private readonly u:string = 'ufoo'){};

  speak(){
    return [this.s, this.t, this.u];
  }
}


let c1:C1 = new C1('foo1');
console.log(`c1.speak returns ${c1.speak()}`);

let c2:C2 = new C2('foo2');
console.log(`c2.speak returns ${c2.speak()}`);

let c3:C3 = new C3();
console.log(`c3.speak returns ${c3.speak()}`);


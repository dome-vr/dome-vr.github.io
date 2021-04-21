// Actorfactory.interface.ts
// defines a Factory interface - i.e. factory and NOT a singleton
// The factory creates instances of a particular THREE.Object3D, each of which
// implements the Actor interface 'delta(Record<string,unknown>):void'. 
// Therefore, each module 'models/stage/actors/*.ts implements the ActorFactory // interface 'create(Record<string,unknown>):Promise<Actor>' where in
// each instance the Promise resolves to an object which implements the
// Actor interface 'delta(Record<string,unknown>):void'
//# sourceMappingURL=actorfactory.interface.js.map
"use strict";
// class-ctor.ts
// [1] test access modified ctor arg to create, (a) say private, and
// (b) private readonly property.  AND
// [2] check if this arg can take a default value 
//
// output:
// c1.speak returns foo1
// c2.speak returns foo2
// c3.speak returns foo
exports.__esModule = true;
var C1 = /** @class */ (function () {
    function C1(s) {
        this.s = s;
    }
    ;
    C1.prototype.speak = function () {
        return this.s;
    };
    return C1;
}());
exports.C1 = C1;
var C2 = /** @class */ (function () {
    function C2(s) {
        this.s = s;
    }
    ;
    C2.prototype.speak = function () {
        return this.s;
    };
    return C2;
}());
exports.C2 = C2;
var C3 = /** @class */ (function () {
    function C3(s, t, u) {
        if (s === void 0) { s = 'sfoo'; }
        if (t === void 0) { t = 'tfoo'; }
        if (u === void 0) { u = 'ufoo'; }
        this.s = s;
        this.t = t;
        this.u = u;
    }
    ;
    C3.prototype.speak = function () {
        return [this.s, this.t, this.u];
    };
    return C3;
}());
exports.C3 = C3;
var c1 = new C1('foo1');
console.log("c1.speak returns " + c1.speak());
var c2 = new C2('foo2');
console.log("c2.speak returns " + c2.speak());
var c3 = new C3();
console.log("c3.speak returns " + c3.speak());
